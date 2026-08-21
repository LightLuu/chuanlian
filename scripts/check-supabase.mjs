import { readFile } from "node:fs/promises";

const configText = await readFile(new URL("../site/assets/config.js", import.meta.url), "utf8");
const projectUrl = configText.match(/supabaseUrl:\s*"([^"]+)/)?.[1];
const publishableKey = configText.match(/supabasePublishableKey:\s*"([^"]+)/)?.[1];

if (!projectUrl || !publishableKey) throw new Error("Supabase URL 或 Publishable Key 尚未配置");

const headers = { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` };
const select = "id,name,url,description,click_count,status,category_id,category:categories(id,name,slug,color),link_tags(tag:tags(id,name,slug))";
const endpoints = [
  ["分类", "categories?select=id,name&order=sort_order.asc"],
  ["链接", `links?status=eq.published&select=${encodeURIComponent(select)}&order=created_at.desc`]
];

for (const [label, endpoint] of endpoints) {
  const response = await fetch(`${projectUrl}/rest/v1/${endpoint}`, { headers });
  const body = await response.json();
  if (!response.ok) throw new Error(`${label}接口失败（${response.status}）：${JSON.stringify(body)}`);
  if (!Array.isArray(body)) throw new Error(`${label}接口未返回列表`);
  console.log(`${label}接口正常：${body.length} 条记录`);
}
