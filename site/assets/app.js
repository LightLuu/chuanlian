const config = window.LINK_ATLAS_CONFIG || {};
const isDemo = config.demoMode || !config.supabaseUrl || !config.supabasePublishableKey;

const demoData = {
  views: 12847,
  dailyStats: [
    { day: "2026-08-13", views: 1260 }, { day: "2026-08-14", views: 1480 },
    { day: "2026-08-15", views: 1725 }, { day: "2026-08-16", views: 1538 },
    { day: "2026-08-17", views: 2086 }, { day: "2026-08-18", views: 2314 },
    { day: "2026-08-19", views: 2444 }
  ],
  auditLogs: [
    { id: "audit-1", action: "publish", entity_type: "link", entity_name: "MDN Web Docs", details: { message: "审核通过并发布" }, created_at: "2026-08-18T16:12:00Z" },
    { id: "audit-2", action: "update", entity_type: "category", entity_name: "学习成长", details: { message: "更新分类信息" }, created_at: "2026-08-18T11:30:00Z" }
  ],
  categories: [
    { id: "cat-ai", name: "AI 工具", slug: "ai", color: "#536df2", sort_order: 1 },
    { id: "cat-dev", name: "开发工具", slug: "development", color: "#173a2b", sort_order: 2 },
    { id: "cat-design", name: "设计资源", slug: "design", color: "#f07e42", sort_order: 3 },
    { id: "cat-productivity", name: "效率办公", slug: "productivity", color: "#9268c9", sort_order: 4 },
    { id: "cat-learning", name: "学习成长", slug: "learning", color: "#377e72", sort_order: 5 }
  ],
  links: [
    { id: "link-1", name: "ChatGPT", url: "https://chatgpt.com", description: "用于写作、分析、编程和创意协作的通用 AI 助手。", category_id: "cat-ai", tags: ["AI", "对话", "效率"], click_count: 3842, status: "published" },
    { id: "link-2", name: "Perplexity", url: "https://www.perplexity.ai", description: "带有来源引用的 AI 搜索与研究工具。", category_id: "cat-ai", tags: ["AI", "搜索", "研究"], click_count: 2215, status: "published" },
    { id: "link-3", name: "GitHub", url: "https://github.com", description: "面向开发者的代码托管、协作与开源社区。", category_id: "cat-dev", tags: ["代码", "开源", "协作"], click_count: 4931, status: "published" },
    { id: "link-4", name: "CodePen", url: "https://codepen.io", description: "即时编写和分享前端代码片段的在线社区。", category_id: "cat-dev", tags: ["前端", "灵感", "代码"], click_count: 986, status: "published" },
    { id: "link-5", name: "Figma", url: "https://www.figma.com", description: "从界面设计到原型协作的一体化设计平台。", category_id: "cat-design", tags: ["UI", "原型", "协作"], click_count: 3047, status: "published" },
    { id: "link-6", name: "Mobbin", url: "https://mobbin.com", description: "收集真实产品界面与交互流程的设计参考库。", category_id: "cat-design", tags: ["UI", "灵感", "产品"], click_count: 1418, status: "published" },
    { id: "link-7", name: "Notion", url: "https://www.notion.so", description: "融合文档、知识库与项目管理的协作空间。", category_id: "cat-productivity", tags: ["笔记", "协作", "效率"], click_count: 2716, status: "published" },
    { id: "link-8", name: "Raycast", url: "https://www.raycast.com", description: "通过命令和扩展提升 macOS 日常操作效率。", category_id: "cat-productivity", tags: ["macOS", "效率", "工具"], click_count: 1263, status: "published" },
    { id: "link-9", name: "MDN Web Docs", url: "https://developer.mozilla.org", description: "权威、系统的开放 Web 技术学习与参考文档。", category_id: "cat-learning", tags: ["Web", "文档", "学习"], click_count: 3550, status: "published" }
  ],
  submissions: [
    { id: "sub-1", name: "Excalidraw", url: "https://excalidraw.com", description: "手绘风格的在线白板，适合快速绘制流程和架构图。", suggested_category: "设计资源", tags: ["白板", "绘图", "协作"], submitter_name: "Lin", submitter_contact: "lin@example.com", note: "开源，而且支持多人协作。", status: "pending", created_at: "2026-08-18T09:30:00Z" },
    { id: "sub-2", name: "Linear", url: "https://linear.app", description: "为产品团队打造的快速、克制的项目与问题追踪工具。", suggested_category: "效率办公", tags: ["项目管理", "团队"], submitter_name: "Jasper", submitter_contact: "", note: "界面和快捷键体验很好。", status: "pending", created_at: "2026-08-18T14:12:00Z" },
    { id: "sub-3", name: "The Odin Project", url: "https://www.theodinproject.com", description: "免费、开源且强调实践的全栈 Web 开发课程。", suggested_category: "学习成长", tags: ["编程", "课程", "开源"], submitter_name: "一川", submitter_contact: "", note: "适合希望系统学习前端和后端的初学者。", status: "pending", created_at: "2026-08-19T02:08:00Z" }
  ]
};

const state = {
  categories: [],
  links: [],
  submissions: [],
  views: 0,
  query: "",
  category: "all",
  adminToken: sessionStorage.getItem("linkatlas_admin_token") || "",
  adminRefreshToken: sessionStorage.getItem("linkatlas_admin_refresh_token") || "",
  adminEmail: sessionStorage.getItem("linkatlas_admin_email") || "",
  selectedSubmission: null,
  adminTab: "pending",
  dailyStats: [],
  auditLogs: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const numberFormatter = new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 });

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function slugify(value) {
  return String(value).trim().toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function parseTags(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(/[,，]/);
  return [...new Set(source.map((item) => String(item).trim()).filter(Boolean))].slice(0, 8);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `form-status ${type}`.trim();
}

async function refreshAdminSession() {
  if (!state.adminRefreshToken) throw new Error("管理员会话已过期，请重新登录");
  const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: config.supabasePublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: state.adminRefreshToken })
  });
  const data = await response.json();
  if (!response.ok) throw new Error("管理员会话已过期，请重新登录");
  state.adminToken = data.access_token;
  state.adminRefreshToken = data.refresh_token;
  sessionStorage.setItem("linkatlas_admin_token", state.adminToken);
  sessionStorage.setItem("linkatlas_admin_refresh_token", state.adminRefreshToken);
  return state.adminToken;
}

async function supabaseRequest(path, options = {}, token = "", allowRefresh = true) {
  const url = `${config.supabaseUrl}/rest/v1/${path}`;
  const headers = {
    apikey: config.supabasePublishableKey,
    Authorization: `Bearer ${token || config.supabasePublishableKey}`,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && token && allowRefresh && state.adminRefreshToken) {
    const refreshedToken = await refreshAdminSession();
    return supabaseRequest(path, options, refreshedToken, false);
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `请求失败（${response.status}）`);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function authRequest(email, password) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: config.supabasePublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.msg || "登录失败");
  return data;
}

function categoryFor(link) {
  return link.category || state.categories.find((category) => category.id === link.category_id) || { name: "未分类", color: "#536df2" };
}

function normalizeLink(link) {
  return {
    ...link,
    tags: link.tags || (link.link_tags || []).map((entry) => entry.tag?.name).filter(Boolean)
  };
}

async function loadPublicData() {
  if (isDemo) {
    state.categories = demoData.categories.map((item) => ({ ...item }));
    state.links = demoData.links.map((item) => ({ ...item, tags: [...item.tags] }));
    state.submissions = demoData.submissions.map((item) => ({ ...item, tags: [...item.tags] }));
    state.dailyStats = demoData.dailyStats.map((item) => ({ ...item }));
    state.auditLogs = demoData.auditLogs.map((item) => ({ ...item, details: { ...item.details } }));
    state.views = demoData.views;
    return;
  }

  const select = "id,name,url,description,click_count,status,category_id,category:categories(id,name,slug,color),link_tags(tag:tags(id,name,slug))";
  const [categories, links, dailyStats] = await Promise.all([
    supabaseRequest("categories?select=*&order=sort_order.asc"),
    supabaseRequest(`links?status=eq.published&select=${encodeURIComponent(select)}&order=created_at.desc`),
    supabaseRequest("site_daily_stats?select=day,path,views&order=day.asc")
  ]);
  state.categories = categories || [];
  state.links = (links || []).map(normalizeLink);
  state.dailyStats = dailyStats || [];
  state.views = state.dailyStats.reduce((total, row) => total + Number(row.views || 0), 0);
}

function renderCategories() {
  const tabs = $("#categoryTabs");
  tabs.innerHTML = [
    `<button class="category-tab ${state.category === "all" ? "active" : ""}" role="tab" aria-selected="${state.category === "all"}" data-category="all">全部 <span>${state.links.length}</span></button>`,
    ...state.categories.map((category) => {
      const count = state.links.filter((link) => link.category_id === category.id).length;
      return `<button class="category-tab ${state.category === category.id ? "active" : ""}" role="tab" aria-selected="${state.category === category.id}" data-category="${escapeHtml(category.id)}">${escapeHtml(category.name)} <span>${count}</span></button>`;
    })
  ].join("");

  const options = `<option value="">请选择</option>${state.categories.map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join("")}`;
  $("#submitCategory").innerHTML = `<option value="">请选择</option>${state.categories.map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`).join("")}`;
  $("#reviewCategory").innerHTML = options;
  $("#linkEditorCategory").innerHTML = options;
}

function renderLinks() {
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  const filtered = state.links.filter((link) => {
    const matchesCategory = state.category === "all" || link.category_id === state.category;
    const haystack = [link.name, link.description, ...(link.tags || []), categoryFor(link).name].join(" ").toLocaleLowerCase("zh-CN");
    return matchesCategory && (!query || haystack.includes(query));
  });

  $("#linkGrid").innerHTML = filtered.map((link, index) => {
    const category = categoryFor(link);
    const initial = [...link.name][0]?.toUpperCase() || "L";
    return `<article class="link-card" style="--card-accent:${escapeHtml(category.color || "#536df2")}">
      <div class="card-top"><span class="site-avatar">${escapeHtml(initial)}</span><span class="card-index">${String(index + 1).padStart(2, "0")}</span></div>
      <span class="card-views">${numberFormatter.format(Number(link.click_count || 0))} 次访问</span>
      <h3>${escapeHtml(link.name)}</h3><p>${escapeHtml(link.description)}</p>
      <div class="card-bottom"><div class="tag-list"><span class="tag">${escapeHtml(category.name)}</span>${(link.tags || []).slice(0, 2).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      <a class="visit-link" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer" data-link-id="${escapeHtml(link.id)}" aria-label="访问 ${escapeHtml(link.name)}">↗</a></div>
    </article>`;
  }).join("");

  $("#emptyState").hidden = filtered.length > 0;
  $("#linkGrid").hidden = filtered.length === 0;
  $("#searchResultText").textContent = query || state.category !== "all" ? `找到 ${filtered.length} 个结果` : `浏览全部 ${state.links.length} 个收录`;
}

function renderMetrics() {
  const clicks = state.links.reduce((total, link) => total + Number(link.click_count || 0), 0);
  $("#metricLinks").textContent = numberFormatter.format(state.links.length);
  $("#metricClicks").textContent = numberFormatter.format(clicks);
  $("#metricViews").textContent = numberFormatter.format(state.views);
}

function renderHome() {
  renderCategories();
  renderLinks();
  renderMetrics();
}

function recordPageView(path) {
  state.views += 1;
  if (isDemo) {
    const today = new Date().toISOString().slice(0, 10);
    let row = state.dailyStats.find((item) => item.day === today && (!item.path || item.path === path));
    if (!row) { row = { day: today, path, views: 0 }; state.dailyStats.push(row); }
    row.views += 1;
  } else {
    supabaseRequest("rpc/record_page_view", { method: "POST", body: JSON.stringify({ p_path: `#/${path === "home" ? "" : path}` }) }).catch(() => {});
  }
  renderMetrics();
  if (state.adminToken) renderAnalytics();
}

function route() {
  const path = location.hash.replace(/^#\/?/, "") || "home";
  const active = path.startsWith("submit") ? "submit" : path.startsWith("admin") ? "admin" : "home";
  $$('[data-view]').forEach((view) => { view.hidden = view.dataset.view !== active; });
  $$('[data-nav]').forEach((nav) => nav.classList.toggle("active", nav.dataset.nav === active));
  $(".main-nav").classList.remove("open");
  $("#mobileMenu").setAttribute("aria-expanded", "false");
  if (active === "admin" && (state.adminToken || isDemo && state.adminEmail)) showDashboard();
  window.scrollTo({ top: 0, behavior: "auto" });
  recordPageView(active);
}

async function recordClick(linkId) {
  const link = state.links.find((item) => item.id === linkId);
  if (!link) return;
  link.click_count = Number(link.click_count || 0) + 1;
  renderMetrics();
  if (isDemo) return;
  supabaseRequest("rpc/record_link_click", { method: "POST", body: JSON.stringify({ p_link_id: linkId }) }).catch(() => {});
}

async function urlExists(url) {
  const normalized = safeUrl(url).replace(/\/$/, "").toLowerCase();
  if (isDemo) {
    return [...state.links, ...state.submissions].some((item) => safeUrl(item.url).replace(/\/$/, "").toLowerCase() === normalized && item.status !== "rejected");
  }
  return Boolean(await supabaseRequest("rpc/check_url_exists", { method: "POST", body: JSON.stringify({ p_url: url }) }));
}

async function submitWebsite(form) {
  const status = $("#submitStatus");
  const button = $("button[type=submit]", form);
  const values = Object.fromEntries(new FormData(form).entries());
  if (safeUrl(values.url) === "#") {
    setStatus(status, "请输入以 http:// 或 https:// 开头的有效网址。", "error");
    return;
  }
  const submission = {
    name: values.name.trim(), url: safeUrl(values.url), description: values.description.trim(),
    suggested_category: values.suggested_category, tags: parseTags(values.tags),
    submitter_name: values.submitter_name.trim(), submitter_contact: values.submitter_contact.trim(), note: values.note.trim()
  };
  button.disabled = true;
  setStatus(status, "正在检查链接…");
  try {
    if (await urlExists(submission.url)) throw new Error("这个网址已经收录或正在审核，请勿重复提交");
    setStatus(status, "正在提交…");
    if (isDemo) {
      state.submissions.unshift({ ...submission, id: `demo-${Date.now()}`, status: "pending", created_at: new Date().toISOString() });
      await new Promise((resolve) => setTimeout(resolve, 450));
    } else {
      await supabaseRequest("submissions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(submission) });
    }
    form.reset();
    $("#descriptionCount").textContent = "0";
    setStatus(status, "提交成功！感谢你的推荐，我们会尽快审核。", "success");
    showToast("网站已进入审核队列");
  } catch (error) {
    setStatus(status, `提交失败：${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
}

async function loginAdmin(form) {
  const status = $("#loginStatus");
  const button = $("button[type=submit]", form);
  const { email, password } = Object.fromEntries(new FormData(form).entries());
  button.disabled = true;
  setStatus(status, "正在验证身份…");
  try {
    if (isDemo) {
      if (email !== "admin@chuanlian.demo" || password !== "chuanlian") throw new Error("演示账号或密码不正确");
      state.adminToken = "demo-token";
      state.adminEmail = email;
    } else {
      const auth = await authRequest(email, password);
      const allowed = await supabaseRequest("rpc/is_admin", { method: "POST", body: "{}" }, auth.access_token);
      if (!allowed) throw new Error("此账号没有管理员权限");
      state.adminToken = auth.access_token;
      state.adminRefreshToken = auth.refresh_token;
      state.adminEmail = auth.user.email;
    }
    sessionStorage.setItem("linkatlas_admin_token", state.adminToken);
    if (state.adminRefreshToken) sessionStorage.setItem("linkatlas_admin_refresh_token", state.adminRefreshToken);
    sessionStorage.setItem("linkatlas_admin_email", state.adminEmail);
    setStatus(status, "登录成功", "success");
    await loadAdminData();
    showDashboard();
  } catch (error) {
    setStatus(status, error.message, "error");
  } finally {
    button.disabled = false;
  }
}

async function loadAdminData() {
  if (!state.adminToken) return;
  if (!isDemo) {
    const [submissions, auditLogs] = await Promise.all([
      supabaseRequest("submissions?status=eq.pending&select=*&order=created_at.asc", {}, state.adminToken),
      supabaseRequest("audit_logs?select=*&order=created_at.desc&limit=100", {}, state.adminToken)
    ]);
    state.submissions = submissions || [];
    state.auditLogs = auditLogs || [];
  }
  renderAdmin();
}

function showDashboard() {
  $("#adminLogin").hidden = true;
  $("#adminDashboard").hidden = false;
  $("#adminEmail").textContent = state.adminEmail || "管理员";
  $("#adminAvatar").textContent = (state.adminEmail || "A")[0].toUpperCase();
  renderAdmin();
}

function renderAdmin() {
  const pending = state.submissions.filter((item) => item.status === "pending");
  const published = state.links.filter((item) => item.status === "published");
  $("#pendingBadge").textContent = String(pending.length);
  $("#publishedBadge").textContent = String(published.length);
  $("#categoryBadge").textContent = String(state.categories.length);
  $("#submissionList").innerHTML = pending.length ? pending.map((submission) => `<button class="submission-item ${state.selectedSubmission?.id === submission.id ? "active" : ""}" data-submission-id="${escapeHtml(submission.id)}">
    <small><span>${escapeHtml(submission.suggested_category || "待分类")}</span><time>${new Date(submission.created_at).toLocaleDateString("zh-CN")}</time></small>
    <h4>${escapeHtml(submission.name)}</h4><p>${escapeHtml(submission.description)}</p></button>`).join("") : `<div class="editor-placeholder"><span>✓</span><p>审核队列已经清空</p></div>`;

  $("#publishedTable").innerHTML = published.map((link) => `<tr><td><strong>${escapeHtml(link.name)}</strong><small>${escapeHtml(new URL(safeUrl(link.url)).hostname)}</small></td><td>${escapeHtml(categoryFor(link).name)}</td><td>${(link.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join(" ")}</td><td>${numberFormatter.format(link.click_count || 0)}</td><td><button class="table-action primary" data-edit-link-id="${escapeHtml(link.id)}">编辑</button><button class="table-action" data-archive-id="${escapeHtml(link.id)}">下架</button></td></tr>`).join("");
  renderCategoryManager();
  renderAnalytics();
  renderAuditLogs();
}

function renderCategoryManager() {
  $("#categoryAdminList").innerHTML = state.categories.map((category) => {
    const linkCount = state.links.filter((link) => link.category_id === category.id && link.status === "published").length;
    return `<div class="category-row" data-category-row="${escapeHtml(category.id)}">
      <span class="category-color" style="background:${escapeHtml(category.color)}"></span>
      <input data-category-name value="${escapeHtml(category.name)}" maxlength="30" aria-label="分类名称" />
      <input data-category-color type="color" value="${escapeHtml(category.color)}" aria-label="分类颜色" />
      <small>${linkCount} 个链接</small>
      <div><button class="table-action primary" data-save-category="${escapeHtml(category.id)}">保存</button><button class="table-action" data-delete-category="${escapeHtml(category.id)}">删除</button></div>
    </div>`;
  }).join("");
}

function renderAuditLogs() {
  const actionNames = { publish: "发布", reject: "拒绝", update: "修改", archive: "下架", create: "创建", delete: "删除" };
  $("#auditTable").innerHTML = state.auditLogs.length ? state.auditLogs.map((log) => `<tr>
    <td>${new Date(log.created_at).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
    <td><span class="tag">${escapeHtml(actionNames[log.action] || log.action)}</span></td>
    <td><strong>${escapeHtml(log.entity_name || log.entity_type)}</strong><small>${escapeHtml(log.entity_type)}</small></td>
    <td>${escapeHtml(log.details?.message || "—")}</td></tr>`).join("") : `<tr><td colspan="4">暂无操作记录</td></tr>`;
}

async function logAudit(action, entityType, entityId, entityName, message) {
  const localLog = { id: `audit-${Date.now()}`, action, entity_type: entityType, entity_id: entityId, entity_name: entityName, details: { message }, created_at: new Date().toISOString() };
  if (isDemo) {
    state.auditLogs.unshift(localLog);
  } else {
    const saved = await supabaseRequest("audit_logs", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ action, entity_type: entityType, entity_id: entityId, entity_name: entityName, details: { message } })
    }, state.adminToken);
    state.auditLogs.unshift(saved?.[0] || localLog);
  }
  renderAuditLogs();
}

async function syncLinkTags(linkId, tags) {
  await supabaseRequest(`link_tags?link_id=eq.${encodeURIComponent(linkId)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, state.adminToken);
  if (!tags.length) return;
  const tagRows = tags.map((name) => ({ name, slug: slugify(name) }));
  const savedTags = await supabaseRequest("tags?on_conflict=slug", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(tagRows) }, state.adminToken);
  await supabaseRequest("link_tags", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(savedTags.map((tag) => ({ link_id: linkId, tag_id: tag.id }))) }, state.adminToken);
}

function openLinkEditor(id) {
  const link = state.links.find((item) => item.id === id);
  if (!link) return;
  const form = $("#linkEditorForm");
  form.elements.id.value = link.id;
  form.elements.name.value = link.name;
  form.elements.url.value = link.url;
  form.elements.description.value = link.description;
  form.elements.category_id.value = link.category_id || "";
  form.elements.tags.value = (link.tags || []).join(", ");
  setStatus($("#linkEditorStatus"), "");
  $("#linkEditorDialog").showModal();
}

async function savePublishedLink(form) {
  const status = $("#linkEditorStatus");
  const button = $("button[type=submit]", form);
  const values = Object.fromEntries(new FormData(form).entries());
  const tags = parseTags(values.tags);
  if (safeUrl(values.url) === "#") return setStatus(status, "请输入有效的网址。", "error");
  button.disabled = true;
  setStatus(status, "正在保存…");
  try {
    const link = state.links.find((item) => item.id === values.id);
    if (isDemo) {
      Object.assign(link, { name: values.name.trim(), url: safeUrl(values.url), description: values.description.trim(), category_id: values.category_id, tags });
    } else {
      await supabaseRequest(`links?id=eq.${encodeURIComponent(values.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name: values.name.trim(), url: safeUrl(values.url), description: values.description.trim(), category_id: values.category_id }) }, state.adminToken);
      await syncLinkTags(values.id, tags);
      await loadPublicData();
    }
    await logAudit("update", "link", values.id, values.name.trim(), "更新已发布链接内容与标签");
    renderHome(); renderAdmin();
    setStatus(status, "保存成功。", "success");
    window.setTimeout(() => $("#linkEditorDialog").close(), 350);
    showToast("链接信息已更新");
  } catch (error) {
    setStatus(status, `保存失败：${error.message}`, "error");
  } finally { button.disabled = false; }
}

async function createCategory(form) {
  const button = $("button[type=submit]", form);
  const values = Object.fromEntries(new FormData(form).entries());
  const category = { id: `cat-${Date.now()}`, name: values.name.trim(), slug: slugify(values.name), color: values.color, sort_order: state.categories.length + 1 };
  if (state.categories.some((item) => item.name.toLowerCase() === category.name.toLowerCase())) return showToast("该分类已经存在");
  button.disabled = true;
  try {
    if (isDemo) state.categories.push(category);
    else {
      const saved = await supabaseRequest("categories", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ name: category.name, slug: category.slug, color: category.color, sort_order: category.sort_order }) }, state.adminToken);
      state.categories.push(saved[0]);
    }
    await logAudit("create", "category", isDemo ? category.id : state.categories.at(-1).id, category.name, "创建新分类");
    form.reset(); form.elements.color.value = "#536df2";
    renderHome(); renderAdmin(); showToast("分类已创建");
  } catch (error) { showToast(`创建失败：${error.message}`); }
  finally { button.disabled = false; }
}

async function saveCategory(id) {
  const row = $(`[data-category-row="${CSS.escape(id)}"]`);
  const name = $("[data-category-name]", row).value.trim();
  const color = $("[data-category-color]", row).value;
  if (!name) return showToast("分类名称不能为空");
  try {
    const category = state.categories.find((item) => item.id === id);
    if (isDemo) Object.assign(category, { name, color, slug: slugify(name) });
    else {
      await supabaseRequest(`categories?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name, color, slug: slugify(name) }) }, state.adminToken);
      await loadPublicData();
    }
    await logAudit("update", "category", id, name, "更新分类名称或标识色");
    renderHome(); renderAdmin(); showToast("分类已保存");
  } catch (error) { showToast(`保存失败：${error.message}`); }
}

async function deleteCategory(id) {
  const category = state.categories.find((item) => item.id === id);
  const count = state.links.filter((item) => item.category_id === id && item.status === "published").length;
  if (!category || !window.confirm(`确认删除“${category.name}”吗？${count ? `其中 ${count} 个链接将变为未分类。` : ""}`)) return;
  try {
    if (isDemo) {
      state.categories = state.categories.filter((item) => item.id !== id);
      state.links.forEach((link) => { if (link.category_id === id) link.category_id = null; });
    } else {
      await supabaseRequest(`categories?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, state.adminToken);
      await loadPublicData();
    }
    await logAudit("delete", "category", id, category.name, "删除分类，关联链接转为未分类");
    renderHome(); renderAdmin(); showToast("分类已删除");
  } catch (error) { showToast(`删除失败：${error.message}`); }
}

function selectSubmission(id) {
  const submission = state.submissions.find((item) => item.id === id);
  if (!submission) return;
  state.selectedSubmission = submission;
  const form = $("#reviewForm");
  form.elements.submission_id.value = submission.id;
  form.elements.name.value = submission.name;
  form.elements.url.value = submission.url;
  form.elements.description.value = submission.description;
  form.elements.tags.value = (submission.tags || []).join(", ");
  form.elements.note.value = submission.note || "";
  form.elements.review_note.value = "";
  const suggested = state.categories.find((category) => category.name === submission.suggested_category);
  form.elements.category_id.value = suggested?.id || state.categories[0]?.id || "";
  $("#submissionDate").textContent = `提交于 ${new Date(submission.created_at).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
  $("#editorPlaceholder").hidden = true;
  $("#editorFields").hidden = false;
  renderAdmin();
}

async function approveSubmission(form) {
  const status = $("#reviewStatus");
  const button = $("button[type=submit]", form);
  const values = Object.fromEntries(new FormData(form).entries());
  const tags = parseTags(values.tags);
  button.disabled = true;
  setStatus(status, "正在发布…");
  try {
    let publishedId;
    if (isDemo) {
      publishedId = `link-${Date.now()}`;
      state.links.unshift({ id: publishedId, name: values.name, url: safeUrl(values.url), description: values.description, category_id: values.category_id, tags, click_count: 0, status: "published" });
      const submission = state.submissions.find((item) => item.id === values.submission_id);
      if (submission) submission.status = "approved";
      await new Promise((resolve) => setTimeout(resolve, 400));
    } else {
      const created = await supabaseRequest("links", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name: values.name.trim(), url: safeUrl(values.url), description: values.description.trim(), category_id: values.category_id, status: "published", submitted_from: values.submission_id })
      }, state.adminToken);
      publishedId = created[0].id;
      await syncLinkTags(publishedId, tags);
      await supabaseRequest(`submissions?id=eq.${encodeURIComponent(values.submission_id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "approved", reviewed_at: new Date().toISOString() }) }, state.adminToken);
      await loadPublicData();
      await loadAdminData();
    }
    await logAudit("publish", "link", publishedId, values.name.trim(), "审核通过并发布用户提交");
    state.selectedSubmission = null;
    $("#editorPlaceholder").hidden = false;
    $("#editorFields").hidden = true;
    renderHome();
    renderAdmin();
    showToast("链接已审核通过并公开发布");
  } catch (error) {
    setStatus(status, `发布失败：${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
}

async function rejectSubmission() {
  const submission = state.selectedSubmission;
  if (!submission) return;
  const reason = $("#reviewForm").elements.review_note.value.trim();
  if (!reason) return setStatus($("#reviewStatus"), "请先填写拒绝原因。", "error");
  if (!window.confirm(`确认拒绝“${submission.name}”吗？`)) return;
  try {
    if (isDemo) Object.assign(submission, { status: "rejected", rejection_reason: reason });
    else await supabaseRequest(`submissions?id=eq.${encodeURIComponent(submission.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "rejected", rejection_reason: reason, reviewed_at: new Date().toISOString() }) }, state.adminToken);
    await logAudit("reject", "submission", submission.id, submission.name, `拒绝提交：${reason}`);
    state.selectedSubmission = null;
    $("#editorPlaceholder").hidden = false;
    $("#editorFields").hidden = true;
    await loadAdminData();
    showToast("该提交已拒绝");
  } catch (error) {
    setStatus($("#reviewStatus"), `操作失败：${error.message}`, "error");
  }
}

async function archiveLink(id) {
  const link = state.links.find((item) => item.id === id);
  if (!link || !window.confirm(`确认下架“${link.name}”吗？`)) return;
  try {
    if (isDemo) link.status = "archived";
    else {
      await supabaseRequest(`links?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "archived" }) }, state.adminToken);
      await loadPublicData();
    }
    await logAudit("archive", "link", id, link.name, "下架已发布链接");
    renderHome();
    renderAdmin();
    showToast("链接已下架");
  } catch (error) {
    showToast(`下架失败：${error.message}`);
  }
}

function renderAnalytics() {
  const clicks = state.links.filter((item) => item.status === "published").reduce((sum, item) => sum + Number(item.click_count || 0), 0);
  $("#analyticsCards").innerHTML = [
    ["页面浏览量", state.views, "全站累计 PV"], ["链接点击量", clicks, "所有公开链接"], ["已收录链接", state.links.filter((item) => item.status === "published").length, `${state.categories.length} 个分类`]
  ].map(([label, value, note]) => `<div class="analytics-card"><span>${label}</span><strong>${numberFormatter.format(value)}</strong><small>${note}</small></div>`).join("");
  const ranked = [...state.links].filter((item) => item.status === "published").sort((a, b) => b.click_count - a.click_count).slice(0, 6);
  const maximum = ranked[0]?.click_count || 1;
  $("#linkRanking").innerHTML = ranked.map((link, index) => `<div class="ranking-row"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(link.name)}</strong><i style="width:${Math.max(4, Math.round(link.click_count / maximum * 100))}%"></i><b>${numberFormatter.format(link.click_count)}</b></div>`).join("");
  const byDay = new Map();
  state.dailyStats.forEach((row) => byDay.set(row.day, (byDay.get(row.day) || 0) + Number(row.views || 0)));
  const trend = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7);
  const maxViews = Math.max(...trend.map(([, views]) => views), 1);
  $("#viewTrend").innerHTML = trend.map(([day, views]) => `<div class="trend-column"><b>${numberFormatter.format(views)}</b><i style="height:${Math.max(4, Math.round(views / maxViews * 145))}px"></i><span>${day.slice(5).replace("-", "/")}</span></div>`).join("");
}

function switchAdminTab(tab) {
  state.adminTab = tab;
  const titles = { pending: "待审核提交", published: "已发布链接", categories: "分类管理", analytics: "数据统计", audit: "操作记录" };
  $("#adminTitle").textContent = titles[tab];
  $$(".admin-nav").forEach((button) => button.classList.toggle("active", button.dataset.adminTab === tab));
  ["pending", "published", "categories", "analytics", "audit"].forEach((name) => { $(`#${name}Panel`).hidden = name !== tab; });
}

function logout() {
  state.adminToken = ""; state.adminRefreshToken = ""; state.adminEmail = ""; state.selectedSubmission = null;
  sessionStorage.removeItem("linkatlas_admin_token"); sessionStorage.removeItem("linkatlas_admin_refresh_token"); sessionStorage.removeItem("linkatlas_admin_email");
  $("#adminDashboard").hidden = true; $("#adminLogin").hidden = false; $("#loginForm").reset();
  showToast("已退出管理员账号");
}

function bindEvents() {
  window.addEventListener("hashchange", route);
  $("#searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderLinks(); });
  $("#descriptionCount").parentElement.parentElement.querySelector("textarea").addEventListener("input", (event) => { $("#descriptionCount").textContent = String(event.target.value.length); });
  $("#submitForm").addEventListener("submit", (event) => { event.preventDefault(); submitWebsite(event.currentTarget); });
  $("#loginForm").addEventListener("submit", (event) => { event.preventDefault(); loginAdmin(event.currentTarget); });
  $("#reviewForm").addEventListener("submit", (event) => { event.preventDefault(); approveSubmission(event.currentTarget); });
  $("#linkEditorForm").addEventListener("submit", (event) => { event.preventDefault(); savePublishedLink(event.currentTarget); });
  $("#categoryForm").addEventListener("submit", (event) => { event.preventDefault(); createCategory(event.currentTarget); });
  $("#rejectButton").addEventListener("click", rejectSubmission);
  $("#logoutButton").addEventListener("click", logout);
  $("#mobileMenu").addEventListener("click", () => {
    const nav = $(".main-nav"); nav.classList.toggle("open"); $("#mobileMenu").setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });
  document.addEventListener("click", (event) => {
    const category = event.target.closest("[data-category]");
    if (category) { state.category = category.dataset.category; renderCategories(); renderLinks(); }
    const query = event.target.closest("[data-query]");
    if (query) { state.query = query.dataset.query; $("#searchInput").value = state.query; renderLinks(); }
    const link = event.target.closest("[data-link-id]");
    if (link) recordClick(link.dataset.linkId);
    const submission = event.target.closest("[data-submission-id]");
    if (submission) selectSubmission(submission.dataset.submissionId);
    const adminTab = event.target.closest("[data-admin-tab]");
    if (adminTab) switchAdminTab(adminTab.dataset.adminTab);
    const archive = event.target.closest("[data-archive-id]");
    if (archive) archiveLink(archive.dataset.archiveId);
    const editLink = event.target.closest("[data-edit-link-id]");
    if (editLink) openLinkEditor(editLink.dataset.editLinkId);
    const saveCategoryButton = event.target.closest("[data-save-category]");
    if (saveCategoryButton) saveCategory(saveCategoryButton.dataset.saveCategory);
    const deleteCategoryButton = event.target.closest("[data-delete-category]");
    if (deleteCategoryButton) deleteCategory(deleteCategoryButton.dataset.deleteCategory);
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); location.hash = "#/"; window.setTimeout(() => $("#searchInput").focus(), 0);
    }
  });
}

async function init() {
  if (isDemo) { $("#modeBanner").hidden = false; $("#demoCredentials").hidden = false; }
  bindEvents();
  try {
    await loadPublicData();
    renderHome();
    if (state.adminToken && !isDemo) await loadAdminData();
  } catch (error) {
    showToast(`数据加载失败：${error.message}`);
  }
  route();
}

init();
