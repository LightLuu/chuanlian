-- LinkAtlas Supabase schema
-- 在一个全新的 Supabase 项目的 SQL Editor 中执行。

create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text not null default '#536df2',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  url text not null unique check (url ~* '^https?://'),
  description text not null check (char_length(description) between 1 and 240),
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'published' check (status in ('published', 'archived')),
  click_count bigint not null default 0 check (click_count >= 0),
  submitted_from uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.link_tags (
  link_id uuid not null references public.links(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (link_id, tag_id)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  url text not null check (url ~* '^https?://'),
  description text not null check (char_length(description) between 1 and 240),
  suggested_category text not null,
  tags text[] not null default '{}',
  submitter_name text not null default '',
  submitter_contact text not null default '',
  note text not null default '',
  rejection_reason text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.site_daily_stats (
  day date not null default current_date,
  path text not null default '/',
  views bigint not null default 0 check (views >= 0),
  primary key (day, path)
);

alter table public.links add constraint links_submitted_from_fkey
foreign key (submitted_from) references public.submissions(id) on delete set null;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  action text not null check (action in ('publish', 'reject', 'update', 'archive', 'create', 'delete')),
  entity_type text not null,
  entity_id uuid,
  entity_name text not null default '',
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_links_public_category on public.links(status, category_id);
create index idx_submissions_review_queue on public.submissions(status, created_at);
create index idx_site_daily_stats_day on public.site_daily_stats(day desc);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger links_set_updated_at before update on public.links
for each row execute function public.set_updated_at();
create trigger submissions_set_updated_at before update on public.submissions
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create or replace function public.record_page_view(p_path text default '/')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_path text := left(coalesce(nullif(trim(p_path), ''), '/'), 160);
begin
  insert into public.site_daily_stats(day, path, views)
  values (current_date, safe_path, 1)
  on conflict (day, path)
  do update set views = public.site_daily_stats.views + 1;
end;
$$;

create or replace function public.record_link_click(p_link_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.links
  set click_count = click_count + 1
  where id = p_link_id and status = 'published';
end;
$$;

create or replace function public.check_url_exists(p_url text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.links
    where regexp_replace(lower(trim(url)), '/$', '') = regexp_replace(lower(trim(p_url)), '/$', '')
  ) or exists (
    select 1 from public.submissions
    where status in ('pending', 'approved')
      and regexp_replace(lower(trim(url)), '/$', '') = regexp_replace(lower(trim(p_url)), '/$', '')
  );
$$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.links enable row level security;
alter table public.tags enable row level security;
alter table public.link_tags enable row level security;
alter table public.submissions enable row level security;
alter table public.site_daily_stats enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public can read categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published links" on public.links for select to anon, authenticated using (status = 'published');
create policy "Admins manage links" on public.links for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read tags" on public.tags for select to anon, authenticated using (true);
create policy "Admins manage tags" on public.tags for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published link tags" on public.link_tags for select to anon, authenticated
using (exists (select 1 from public.links where links.id = link_tags.link_id and links.status = 'published'));
create policy "Admins manage link tags" on public.link_tags for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can submit pending links" on public.submissions for insert to anon, authenticated
with check (status = 'pending' and reviewed_at is null);
create policy "Admins review submissions" on public.submissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read aggregate views" on public.site_daily_stats for select to anon, authenticated using (true);
create policy "Admins manage aggregate views" on public.site_daily_stats for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins read audit logs" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "Admins create audit logs" on public.audit_logs for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.links, public.tags, public.link_tags, public.site_daily_stats to anon, authenticated;
grant insert on public.submissions to anon, authenticated;
grant select, insert, update, delete on public.categories, public.links, public.tags, public.link_tags, public.submissions, public.site_daily_stats to authenticated;
grant select, insert on public.audit_logs to authenticated;
revoke all on function public.is_admin() from public;
revoke all on function public.record_page_view(text) from public;
revoke all on function public.record_link_click(uuid) from public;
revoke all on function public.check_url_exists(text) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.record_page_view(text) to anon, authenticated;
grant execute on function public.record_link_click(uuid) to anon, authenticated;
grant execute on function public.check_url_exists(text) to anon, authenticated;

insert into public.categories (name, slug, color, sort_order) values
  ('AI 工具', 'ai', '#536df2', 1),
  ('开发工具', 'development', '#173a2b', 2),
  ('设计资源', 'design', '#f07e42', 3),
  ('效率办公', 'productivity', '#9268c9', 4),
  ('学习成长', 'learning', '#377e72', 5)
on conflict (slug) do nothing;

insert into public.links (name, url, description, category_id, click_count)
select 'ChatGPT', 'https://chatgpt.com', '用于写作、分析、编程和创意协作的通用 AI 助手。', id, 3842 from public.categories where slug = 'ai'
on conflict (url) do nothing;
insert into public.links (name, url, description, category_id, click_count)
select 'GitHub', 'https://github.com', '面向开发者的代码托管、协作与开源社区。', id, 4931 from public.categories where slug = 'development'
on conflict (url) do nothing;
insert into public.links (name, url, description, category_id, click_count)
select 'Figma', 'https://www.figma.com', '从界面设计到原型协作的一体化设计平台。', id, 3047 from public.categories where slug = 'design'
on conflict (url) do nothing;
insert into public.links (name, url, description, category_id, click_count)
select 'Notion', 'https://www.notion.so', '融合文档、知识库与项目管理的协作空间。', id, 2716 from public.categories where slug = 'productivity'
on conflict (url) do nothing;
insert into public.links (name, url, description, category_id, click_count)
select 'MDN Web Docs', 'https://developer.mozilla.org', '权威、系统的开放 Web 技术学习与参考文档。', id, 3550 from public.categories where slug = 'learning'
on conflict (url) do nothing;

insert into public.tags (name, slug) values
  ('AI', 'ai'), ('效率', '效率'), ('代码', '代码'), ('开源', '开源'), ('UI', 'ui'), ('协作', '协作'), ('学习', '学习'), ('文档', '文档')
on conflict (slug) do nothing;

insert into public.link_tags (link_id, tag_id)
select links.id, tags.id from public.links links join public.tags tags on
  (links.name = 'ChatGPT' and tags.slug in ('ai', '效率')) or
  (links.name = 'GitHub' and tags.slug in ('代码', '开源')) or
  (links.name = 'Figma' and tags.slug in ('ui', '协作')) or
  (links.name = 'Notion' and tags.slug in ('效率', '协作')) or
  (links.name = 'MDN Web Docs' and tags.slug in ('学习', '文档'))
on conflict do nothing;

analyze public.links;
analyze public.submissions;
