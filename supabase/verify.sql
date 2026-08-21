-- LinkAtlas 上线前只读检查
-- 执行 schema.sql 后在 Supabase SQL Editor 中运行。

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('admin_users', 'categories', 'links', 'tags', 'link_tags', 'submissions', 'site_daily_stats', 'audit_logs')
order by tablename;

select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('is_admin', 'record_page_view', 'record_link_click', 'check_url_exists')
order by routine_name;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in ('idx_links_public_category', 'idx_submissions_review_queue', 'idx_site_daily_stats_day', 'idx_audit_logs_created_at')
order by indexname;

select
  (select count(*) from public.categories) as category_count,
  (select count(*) from public.links where status = 'published') as published_link_count,
  (select count(*) from public.admin_users) as admin_count;
