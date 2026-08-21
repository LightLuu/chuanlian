# 川链

> 面向四川大学师生的常用链接导航与共建目录。

川链把分散的校务、教学、学习、就业与校园服务入口整理为可浏览、可搜索、可持续维护的链接目录。项目是一个可直接部署到 GitHub Pages 的静态前端，使用 Supabase 提供提交审核、管理员权限与访问统计能力。

项目通过 GitHub Pages 自动发布；每次更新 `main` 分支后会重新部署。

## 功能

- 按分类浏览，支持名称、描述和标签搜索
- 访客可推荐网站，内容进入待审核队列
- 管理员登录后可审核、发布、编辑、下架链接和维护分类
- 记录链接点击量与页面访问趋势
- 支持 GitHub Pages 自动发布；前端仅使用 Supabase Publishable Key

## 已整理的川大入口

| 分类 | 入口 |
| --- | --- |
| 校务服务 | 四川大学网上办事大厅、统一身份认证 |
| 教学学习 | 教务管理系统、教务处、大川学堂 |
| 学习科研 | 四川大学图书馆 |
| 就业发展 | 四川大学就业指导中心 |
| 校园生活 | 四川大学心理健康教育中心 |

上述内容通过前台提交进入审核队列。管理员创建相应分类后，审核发布即可在首页展示。

## 本地预览

```bash
npm run serve
```

打开 `http://localhost:4173`。项目没有构建依赖，站点文件位于 `site/`。

## Supabase 配置

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 在 Authentication → Users 中创建管理员登录账号。
3. 在 SQL Editor 执行：

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = '你的管理员邮箱'
on conflict (user_id) do update set email = excluded.email;
```

4. 在 `site/assets/config.js` 填入 Project URL 与 Publishable Key，并确保 `demoMode: false`。
5. 执行 `supabase/verify.sql`，确认分类、链接和管理员数量正常。

数据库密码不是管理员登录密码，也不应写入前端文件或 GitHub。管理员登录使用 Supabase Authentication 中创建的邮箱和密码。

## 发布到 GitHub Pages

推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动发布 `site/` 目录。

在 GitHub 仓库的 Settings → Pages 中，将 Source 设为 **GitHub Actions**。完成后，站点通常可通过：

```text
https://你的 GitHub 用户名.github.io/仓库名/
```

访问。

## 开发检查

```bash
npm test
npm run test:live
```

`npm test` 检查静态资源、界面结构与安全配置；`npm run test:live` 会用公开 Key 验证 Supabase 的公开分类和链接接口。

## 安全说明

- 只把 Supabase Publishable Key 放在前端；绝不提交 `service_role`、`sb_secret_` 或数据库密码。
- 数据库表已启用 RLS：访客只能读取公开链接和提交待审核内容，管理员权限由 Supabase Auth 与 `admin_users` 共同控制。
- 链接跳转仅允许 `http`、`https` 地址，并使用 `noopener noreferrer` 打开外部站点。
