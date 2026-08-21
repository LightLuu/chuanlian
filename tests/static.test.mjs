import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("static entry references existing assets", async () => {
  const [html, css, js, config] = await Promise.all([
    read("site/index.html"), read("site/assets/styles.css"), read("site/assets/app.js"), read("site/assets/config.js")
  ]);
  assert.match(html, /assets\/styles\.css/);
  assert.match(html, /assets\/app\.js/);
  assert.match(html, /assets\/config\.js/);
  assert.ok(css.length > 10000);
  assert.ok(js.length > 10000);
  assert.match(config, /demoMode:\s*false/);
});

test("all requested product surfaces are present", async () => {
  const html = await read("site/index.html");
  for (const id of ["homeView", "searchInput", "categoryTabs", "submitForm", "adminView", "loginForm", "reviewForm", "publishedPanel", "categoriesPanel", "analyticsPanel", "auditPanel", "linkEditorDialog"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test("database schema includes persistence, RLS, auth and metrics", async () => {
  const [sql, verification] = await Promise.all([read("supabase/schema.sql"), read("supabase/verify.sql")]);
  for (const fragment of ["create table public.links", "create table public.submissions", "create table public.audit_logs", "enable row level security", "public.is_admin", "record_link_click", "record_page_view", "check_url_exists", "rejection_reason"]) {
    assert.ok(sql.toLowerCase().includes(fragment.toLowerCase()), `missing ${fragment}`);
  }
  assert.match(verification, /admin_count/);
  assert.match(verification, /rowsecurity/);
});

test("browser configuration contains no privileged key", async () => {
  const config = await read("site/assets/config.js");
  assert.doesNotMatch(config, /sb_secret_|service_role/i);
  assert.match(config, /supabasePublishableKey/);
});

test("GitHub Pages workflow publishes only the static site", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /path:\s*site/);
});
