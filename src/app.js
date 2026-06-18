import { navItems, roles, employees, taskTypes, initialData, reportCatalog, marketAnalogs } from "./data.js";

const app = document.getElementById("app");

const clone = (value) => JSON.parse(JSON.stringify(value));
const state = {
  data: clone(initialData),
  roleId: new URLSearchParams(window.location.search).get("role") || localStorage.getItem("pledgeRole") || "specialist",
  collateralTab: "overview",
  taskRegistryTab: "mine",
  filters: {
    tasks: { number: "", clientId: "", clientName: "", collateralId: "", type: "", status: "", assignee: "" },
    contracts: { clientId: "", clientName: "", gsz: "", number: "", periodFrom: "", periodTo: "", collateralId: "", status: "Активен" },
    collaterals: { clientId: "", clientName: "", gsz: "", number: "", collateralId: "", address: "", type: "" }
  },
  visualFilters: {
    tasks: { type: "", urgency: "", status: "", priority: "" },
    contracts: { coverage: "", quality: "", kpi: "" },
    collaterals: { type: "", gsz: "", kpi: "" }
  },
  sort: { scope: "", field: "", dir: "asc" },
  taskActiveCollateral: {},
  newTask: {
    key: "",
    type: "Плановый мониторинг",
    selectedCollateralIds: [],
    documents: []
  },
  mobile: { employeePhotos: {}, clientPhotos: {} },
  modal: null,
  pendingRegistryFocus: "",
  pendingScrollRestore: null,
  toasts: []
};

const documentRules = [
  { title: "Заявление клиента", collateralType: "any", clientType: "any", taskType: "any", required: true },
  { title: "Правоустанавливающий документ", collateralType: "any", clientType: "any", taskType: "Постановка в залог", required: true },
  { title: "Акт осмотра", collateralType: "any", clientType: "any", taskType: "Первичный осмотр", required: true },
  { title: "Акт повторного осмотра", collateralType: "any", clientType: "any", taskType: "Повторный осмотр", required: true },
  { title: "Фотофиксация объекта", collateralType: "any", clientType: "any", taskType: "Первичный осмотр", required: true },
  { title: "Фотофиксация объекта", collateralType: "any", clientType: "any", taskType: "Повторный осмотр", required: true },
  { title: "Отчет об оценке", collateralType: "any", clientType: "any", taskType: "Единичная переоценка", required: true },
  { title: "Страховой полис", collateralType: "any", clientType: "ЮЛ", taskType: "Плановый мониторинг", required: true },
  { title: "Страховой полис", collateralType: "any", clientType: "ЮЛ", taskType: "Внеплановый мониторинг", required: true },
  { title: "Кадастровая выписка", collateralType: "Недвижимость", clientType: "any", taskType: "any", required: true },
  { title: "СТС / техпаспорт", collateralType: "Автотранспорт", clientType: "any", taskType: "any", required: true },
  { title: "Инвентаризационная ведомость", collateralType: "Товары в обороте", clientType: "ЮЛ", taskType: "any", required: true },
  { title: "Дополнительный документ", collateralType: "any", clientType: "any", taskType: "any", required: false }
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value, currency = "UZS") {
  const amount = Number(value || 0).toLocaleString("ru-RU");
  return `${amount} ${currency}`;
}

function badge(text, tone = "") {
  const value = String(text ?? "-");
  const inferred = tone || badgeTone(value);
  return `<span class="badge badge-${inferred}">${escapeHtml(value)}</span>`;
}

function badgeTone(value) {
  const text = String(value).toLowerCase();
  if (/(крит|проср|ошиб|не обеспеч|возврат|доработ)/i.test(text)) return "danger";
  if (/(истека|частич|предуп|отлож|в работе|высок)/i.test(text)) return "warn";
  if (/(действ|оплачен|заверш|успеш|полное|хорош)/i.test(text)) return "ok";
  if (/(назнач|сегодня|средн|норма|инфо)/i.test(text)) return "info";
  return "neutral";
}

function getRole() {
  return roles.find((item) => item.id === state.roleId) || roles[0];
}

function getRoute() {
  return window.location.hash.replace(/^#/, "") || "/app/tasks";
}

function parseRoute() {
  const [path, query = ""] = getRoute().split("?");
  return { path, query: new URLSearchParams(query) };
}

function getTask(id) {
  return state.data.tasks.find((item) => item.id === id);
}

function getCollateral(id) {
  return state.data.collaterals.find((item) => item.id === id);
}

function getContract(id) {
  return state.data.contracts.find((item) => item.id === id);
}

function getContractByNumber(number) {
  return state.data.contracts.find((item) => item.number === number || item.id === number);
}

function getTaskCollaterals(task) {
  const ids = task?.collateralIds?.length ? task.collateralIds : [task?.collateralId].filter(Boolean);
  return ids.map(getCollateral).filter(Boolean);
}

function getTaskActiveCollateral(task, collaterals) {
  const activeId = state.taskActiveCollateral[task.id] || task.collateralId || collaterals[0]?.id;
  return collaterals.find((item) => item.id === activeId) || collaterals[0] || null;
}

function isInspectionTaskType(type) {
  return ["Первичный осмотр", "Повторный осмотр"].includes(type);
}

function isMobileInspectionTaskType(type) {
  return ["Выездной осмотр", "Клиентский осмотр"].includes(type);
}

function isMonitoringTaskType(type) {
  return ["Плановый мониторинг", "Внеплановый мониторинг"].includes(type);
}

function isRevaluationTaskType(type) {
  return type === "Единичная переоценка";
}

function isPledgeOperationTaskType(type) {
  return ["Постановка в залог", "Снятие обременения", "Замена залога"].includes(type);
}

function render() {
  const role = getRole();
  const { path, query } = parseRoute();
  const content = renderRoute(path, query);
  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar(role, path)}
      <main class="main">${content}</main>
      ${renderModal()}
      ${renderToasts()}
    </div>
  `;
  restorePendingScrollPosition();
  focusPendingRegistryTable();
}

function renderTopbar(role, path) {
  const menu = navItems.filter((item) => role.menu.includes(item.id) && ["tasks", "contracts", "collaterals"].includes(item.id));
  const mobileMenu = navItems.filter((item) => role.menu.includes(item.id) && ["mobileEmployee", "mobileClient"].includes(item.id));
  const items = menu.length ? menu : mobileMenu;
  return `
    <header class="app-header">
      <div class="header-left">
        <button class="brand" data-route="/app/tasks" aria-label="Залоговый модуль">
          <span class="brand-mark">
            <i class="logo-orbit"></i>
            <i class="logo-gem"></i>
            <i class="logo-lock"></i>
          </span>
          <span class="brand-title">Залоговый модуль</span>
        </button>
        <nav class="top-nav">
          ${items.map((item) => `<button class="${path.startsWith(item.path) ? "active" : ""}" data-route="${item.path}">${escapeHtml(item.label)}</button>`).join("")}
        </nav>
      </div>
      <div class="role-box">
        <span class="role-user" title="${escapeHtml(role.user)}">${escapeHtml(role.user)}</span>
        <select data-action="change-role">
          ${roles.map((item) => `<option value="${item.id}" ${item.id === role.id ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
        </select>
      </div>
    </header>
  `;
}

function renderRoute(path, query) {
  if (path === "/" || path === "/app") return renderTasksRegistry();
  if (path === "/app/tasks") return renderTasksRegistry();
  if (path === "/app/tasks/new") return renderTaskCreate(query);
  if (path.startsWith("/app/tasks/")) return renderTaskCard(path.split("/").pop());
  if (path === "/app/contracts") return renderContractsRegistry();
  if (path.startsWith("/app/contracts/")) return renderContractCard(path.split("/").pop());
  if (path === "/app/collaterals") return renderCollateralsRegistry();
  if (path.startsWith("/app/collaterals/")) return renderCollateralCard(path.split("/").pop(), query);
  if (path === "/app/reports") return renderReports();
  if (path.startsWith("/app/print/")) return renderPrintPreview(path.split("/").pop());
  if (path === "/mobile/employee/tasks") return renderMobileEmployeeTasks();
  if (path.startsWith("/mobile/employee/tasks/") && path.endsWith("/photos")) return renderMobilePhotos("employee", path.split("/")[4]);
  if (path === "/mobile/client/request") return renderMobileClientRequest();
  if (path.startsWith("/mobile/client/tasks/") && path.endsWith("/photos")) return renderMobilePhotos("client", path.split("/")[4]);
  if (path === "/mobile/client/photos") return renderMobilePhotos("client", "TSK-2026-1104");
  return renderNotFound("Раздел не найден", "/app/tasks");
}

function renderPageHeader(title, text, actions = "") {
  return `
    <div class="breadcrumbs"><button class="link" data-route="/app/tasks">Главная</button><span>/</span><span>${escapeHtml(title)}</span></div>
    <section class="page-header">
      <div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p></div>
      <div class="header-actions">${actions}</div>
    </section>
  `;
}

function renderNotFound(title, route) {
  return `<section class="error-state"><h2>${escapeHtml(title)}</h2><button class="btn btn-primary" data-route="${route}">Вернуться</button></section>`;
}

function renderInfoGrid(items) {
  return `
    <dl class="info-grid">
      ${Object.entries(items).map(([key, value]) => `
        <div><dt>${escapeHtml(key)}</dt><dd>${typeof value === "string" && value.startsWith("<") ? value : escapeHtml(value ?? "-")}</dd></div>
      `).join("")}
    </dl>
  `;
}

const chartPalette = ["#0f766e", "#2563eb", "#b45309", "#b91c1c", "#6d28d9", "#0e7490", "#15803d"];
const contractCurrencyRates = { UZS: 1, USD: 12650 };

function sumBy(items, getter) {
  return items.reduce((sum, item) => sum + Number(getter(item) || 0), 0);
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "Не указано";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function toSegments(counter, options = {}) {
  const entries = Array.isArray(counter) ? counter : Object.entries(counter).map(([label, value]) => ({ label, value }));
  return entries
    .filter((item) => Number(item.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, options.limit || entries.length)
    .map((item, index) => ({ ...item, color: item.color || chartPalette[index % chartPalette.length] }));
}

function formatShortMoney(value) {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1).replace(".", ",")} млрд UZS`;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000).toLocaleString("ru-RU")} млн UZS`;
  return formatMoney(amount);
}

function getContractDebtUzs(contract) {
  const rate = contractCurrencyRates[contract?.currency] || 1;
  return Math.round(Number(contract?.debt || 0) * rate);
}

function renderContractDebtCell(contract) {
  const original = contract.currency && contract.currency !== "UZS"
    ? `<br><small>${formatMoney(contract.debt, contract.currency)}</small>`
    : "";
  return `${formatMoney(getContractDebtUzs(contract))}${original}`;
}

function getTaskUrgency(task) {
  if (task.sla === "Просрочена") return "Просрочены";
  if (task.sla === "Сегодня") return "Сегодня";
  if (task.sla === "Неделя") return "На неделе";
  return "В срок";
}

function matchesTaskRegistryTab(task, tabId, role = getRole()) {
  if (tabId === "completed") return task.status === "Завершена";
  if (tabId === "all") return task.status !== "Завершена";
  return task.assignee === role.user && task.status !== "Завершена";
}

function renderTaskRegistryTabs(rows, activeTab, role) {
  const tabs = [
    { id: "mine", label: "Мои задачи", hint: "в работе у текущего пользователя" },
    { id: "all", label: "Все задачи", hint: "задачи подразделения" },
    { id: "completed", label: "Завершенные задачи", hint: "архив" }
  ];
  return `
    <div class="tabs registry-tabs" role="tablist" aria-label="Срез задач">
      ${tabs.map((tab) => {
        const count = rows.filter((task) => matchesTaskRegistryTab(task, tab.id, role)).length;
        return `
          <button type="button" role="tab" class="${activeTab === tab.id ? "active" : ""}" data-action="task-registry-tab" data-tab="${tab.id}">
            <span>${escapeHtml(tab.label)}</span>
            <small>${escapeHtml(tab.hint)}</small>
            <strong>${count}</strong>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderKpiGrid(cards) {
  return `
    <section class="kpi-grid registry-kpi-grid">
      ${cards.map((card) => `
        <button type="button" class="kpi-card ${card.tone || ""} ${card.active ? "active" : ""}" ${card.action || ""} aria-label="${escapeHtml(card.label)}">
          <span>${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.value)}</strong>
          ${card.hint ? `<small>${escapeHtml(card.hint)}</small>` : ""}
        </button>
      `).join("")}
    </section>
  `;
}

function hasVisualFilters(scope) {
  return Object.values(state.visualFilters[scope] || {}).some(Boolean);
}

function focusPendingRegistryTable() {
  const scope = state.pendingRegistryFocus;
  if (!scope) return;
  state.pendingRegistryFocus = "";
  const focus = () => {
    const table = document.querySelector(`[data-registry-table="${scope}"]`);
    if (!table) return;
    table.scrollIntoView({ behavior: "smooth", block: "start" });
    table.focus({ preventScroll: true });
  };
  if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(focus);
  else setTimeout(focus, 0);
}

function restorePendingScrollPosition() {
  const target = state.pendingScrollRestore;
  if (!target) return;
  state.pendingScrollRestore = null;
  const restore = () => window.scrollTo({ top: target.top, left: target.left, behavior: "instant" });
  if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(restore);
  else setTimeout(restore, 0);
}

function resetVisualFilters(scope) {
  if (!state.visualFilters[scope]) return;
  state.visualFilters[scope] = Object.fromEntries(Object.keys(state.visualFilters[scope]).map((key) => [key, ""]));
}

function applyRegistryKpiFilter(scope, filter, value) {
  if (!state.visualFilters[scope]) return;
  const sameActive = filter && filter !== "all" && state.visualFilters[scope]?.[filter] === value;
  resetVisualFilters(scope);
  if (filter && filter !== "all" && !sameActive) state.visualFilters[scope][filter] = value;
  state.pendingRegistryFocus = scope;
}

function renderDonutPanel({ title, subtitle, segments, total, centerLabel, scope, filterKey, activeValue, compact = false }) {
  const numericTotal = Number(total) || segments.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const safeTotal = numericTotal || 1;
  let current = 0;
  const gradient = segments.length
    ? segments.map((item) => {
      const start = current;
      current += (Number(item.value || 0) / safeTotal) * 100;
      return `${item.color} ${start.toFixed(2)}% ${current.toFixed(2)}%`;
    }).join(", ")
    : "#e2e8f0 0% 100%";
  return `
    <section class="panel chart-panel ${compact ? "compact-donut-panel" : ""}">
      <div class="panel-title"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p class="hint">${escapeHtml(subtitle)}</p>` : ""}</div></div>
      <div class="donut-row">
        <div class="donut" style="background: conic-gradient(${gradient});"><span>${escapeHtml(centerLabel || String(numericTotal || 0))}</span></div>
        <div class="legend-list">
          ${segments.map((item) => `
            <button class="${activeValue === item.label ? "active" : ""}" data-action="visual-filter" data-scope="${scope}" data-filter="${filterKey}" data-value="${escapeHtml(item.label)}">
              <i style="background:${item.color}"></i>
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(String(item.valueLabel || item.value))}</strong>
            </button>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderBarPanel({ title, subtitle, segments, scope, filterKey, activeValue, valueFormatter = (value) => value, compact = false }) {
  const max = Math.max(...segments.map((item) => Number(item.value || 0)), 1);
  return `
    <section class="panel chart-panel ${compact ? "compact-bar-panel" : ""}">
      <div class="panel-title"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p class="hint">${escapeHtml(subtitle)}</p>` : ""}</div></div>
      <div class="bar-list">
        ${segments.map((item) => {
          const width = Math.max(5, Math.round((Number(item.value || 0) / max) * 100));
          const tone = item.tone || (item.label.includes("Проср") || item.label.includes("Не обеспеч") || item.label.includes("Крит") ? "danger" : item.label.includes("Част") || item.label.includes("Сегодня") || item.label.includes("Истека") ? "warning" : "");
          return `
            <button class="bar-row ${tone} ${activeValue === item.label ? "active" : ""}" data-action="visual-filter" data-scope="${scope}" data-filter="${filterKey}" data-value="${escapeHtml(item.label)}">
              <span>${escapeHtml(item.label)}</span>
              <div><i style="width:${width}%"></i></div>
              <strong>${escapeHtml(String(valueFormatter(item.value)))}</strong>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderTasksRegistry() {
  const role = getRole();
  const filters = state.filters.tasks;
  const visual = state.visualFilters.tasks;
  const activeTab = state.taskRegistryTab || "mine";
  const filteredRows = state.data.tasks.filter((task) => {
    const collateral = getCollateral(task.collateralId);
    const contract = getContract(task.contractId);
    return matches(task.id, filters.number)
      && matches(contract?.inn || collateral?.clientId, filters.clientId)
      && matches(task.client || contract?.clientName || collateral?.clientName, filters.clientName)
      && matches(task.collateralId, filters.collateralId)
      && matches(task.type, filters.type)
      && matches(task.status, filters.status)
      && matches(task.assignee, filters.assignee);
  });
  const baseRows = filteredRows.filter((task) => matchesTaskRegistryTab(task, activeTab, role));
  const rows = baseRows.filter((task) =>
    (!visual.type || task.type === visual.type)
    && (!visual.urgency || getTaskUrgency(task) === visual.urgency)
    && (!visual.status || task.status === visual.status)
    && (!visual.priority || task.priority === visual.priority)
  );
  const typeSegments = toSegments(countBy(baseRows, (task) => task.type));
  const urgencyOrder = ["Просрочены", "Сегодня", "На неделе", "В срок"];
  const urgencyCounts = countBy(baseRows, getTaskUrgency);
  const urgencySegments = urgencyOrder.map((label) => ({ label, value: urgencyCounts[label] || 0 })).filter((item) => item.value > 0);
  return `
    ${renderPageHeader("Реестр задач", "Рабочая очередь задач по залогам, осмотрам, мониторингу и оценке.",
      `${role.permissions.createTask ? `<button class="btn btn-primary" data-route="/app/tasks/new">Создать задачу</button>` : ""}`)}
    ${renderTaskRegistryTabs(filteredRows, activeTab, role)}
    ${renderKpiGrid([
      { label: "Всего задач", value: String(baseRows.length), hint: "В выбранной вкладке", tone: "info", active: !hasVisualFilters("tasks"), action: 'data-action="registry-kpi" data-scope="tasks" data-filter="all"' },
      { label: "В работе", value: String(baseRows.filter((task) => task.status === "В работе").length), hint: "Активные задачи", tone: "info", active: visual.status === "В работе", action: 'data-action="registry-kpi" data-scope="tasks" data-filter="status" data-value="В работе"' },
      { label: "Просрочены", value: String(baseRows.filter((task) => getTaskUrgency(task) === "Просрочены").length), hint: "По плановому сроку", tone: "danger", active: visual.urgency === "Просрочены", action: 'data-action="registry-kpi" data-scope="tasks" data-filter="urgency" data-value="Просрочены"' },
      { label: "Сегодня", value: String(baseRows.filter((task) => getTaskUrgency(task) === "Сегодня").length), hint: "Требуют обработки", tone: "warn", active: visual.urgency === "Сегодня", action: 'data-action="registry-kpi" data-scope="tasks" data-filter="urgency" data-value="Сегодня"' },
      { label: "Критический приоритет", value: String(baseRows.filter((task) => task.priority === "Критический").length), hint: "Особый контроль", tone: "danger", active: visual.priority === "Критический", action: 'data-action="registry-kpi" data-scope="tasks" data-filter="priority" data-value="Критический"' }
    ])}
    <section class="analytics-grid registry-analytics equal-height-analytics">
      ${renderDonutPanel({
        title: "Структура задач по типам",
        subtitle: "Клик по сектору фильтрует таблицу задач.",
        segments: typeSegments,
        total: baseRows.length,
        scope: "tasks",
        filterKey: "type",
        activeValue: visual.type,
        compact: true
      })}
      ${renderBarPanel({
        title: "Срочность задач",
        subtitle: "Фильтр SLA вынесен в диаграмму срочности.",
        segments: urgencySegments,
        scope: "tasks",
        filterKey: "urgency",
        activeValue: visual.urgency,
        compact: true
      })}
    </section>
    <section class="panel">
      <div class="filter-grid registry-filter-grid">
        ${filterInput("tasks", "number", "Номер задачи")}
        ${filterInput("tasks", "clientId", "ИНН/ПИНФЛ клиента")}
        ${filterInput("tasks", "clientName", "Наименование/ФИО клиента")}
        ${filterInput("tasks", "collateralId", "Идентификатор залога")}
        ${filterSelect("tasks", "type", "Тип задачи", ["", ...taskTypes])}
        ${filterSelect("tasks", "status", "Статус", ["", "Назначена", "В работе", "Отложена", "На доработке", "Завершена"])}
        ${filterSelect("tasks", "assignee", "Исполнитель", ["", ...employees])}
        <button class="btn btn-secondary" data-action="reset-filters" data-scope="tasks">Сбросить</button>
      </div>
    </section>
    <section class="panel table-panel" data-registry-table="tasks" tabindex="-1">
      <div class="panel-title"><h2>Задачи</h2><span class="panel-note">${rows.length} из ${baseRows.length}</span></div>
      ${rows.length ? `
        <table>
          <thead><tr><th>Номер</th><th>Тип</th><th>Клиент</th><th>Объект</th><th>Исполнитель</th><th>Срок</th><th>Статус</th><th>Приоритет</th></tr></thead>
          <tbody>${rows.map((task) => {
            const collateral = getCollateral(task.collateralId);
            return `
              <tr>
                <td><a class="link registry-object-link" href="#/app/tasks/${escapeHtml(task.id)}">${escapeHtml(task.id)}</a><br><small>${escapeHtml(task.createdAt)}</small></td>
                <td>${escapeHtml(task.type)}<br><small>${escapeHtml(task.source)}</small></td>
                <td>${escapeHtml(task.client)}</td>
                <td>${escapeHtml(task.collateralId || "-")}<br><small>${escapeHtml(collateral?.description || "Объект не найден")}</small></td>
                <td>${escapeHtml(task.assignee)}</td>
                <td>${escapeHtml(task.dueDate)}<br>${badge(task.sla)}</td>
                <td>${badge(task.status)}</td>
                <td>${badge(task.priority)}</td>
              </tr>
            `;
          }).join("")}</tbody>
        </table>` : renderEmpty("Задачи не найдены", "Измените фильтры или создайте новую задачу.", "tasks")}
    </section>
  `;
}

function renderContractsRegistry() {
  const filters = state.filters.contracts;
  const visual = state.visualFilters.contracts;
  const baseRows = state.data.contracts.filter((contract) =>
    matches(contract.inn, filters.clientId)
    && matches(contract.clientName, filters.clientName)
    && matches(contract.gsz, filters.gsz)
    && matches(contract.number, filters.number)
    && matchesDateRange(contract.startDate, filters.periodFrom, filters.periodTo)
    && matches(contract.collateralIds.join(" "), filters.collateralId)
    && matches(contract.status, filters.status)
  );
  const rows = baseRows.filter((contract) =>
    (!visual.coverage || contract.coverageStatus === visual.coverage)
    && (!visual.quality || contract.loanQuality === visual.quality)
    && (!visual.kpi || matchesContractKpi(contract, visual.kpi))
  );
  const filteredTotals = getContractsTotals(rows);
  const debtTotal = sumBy(baseRows, getContractDebtUzs);
  const allocatedTotal = sumBy(baseRows, (contract) => contract.allocatedValue);
  const weightedLtv = allocatedTotal ? Math.round((debtTotal / allocatedTotal) * 100) : 0;
  const deficit = sumBy(baseRows.filter((contract) => contract.ltv > 100), (contract) => Math.max(0, getContractDebtUzs(contract) - contract.allocatedValue));
  const crossContractCount = baseRows.filter((contract) => contract.collateralIds.some((id) => getCollateral(id)?.crossPledge)).length;
  const coverageSegments = toSegments(countBy(baseRows, (contract) => contract.coverageStatus));
  const qualityCounts = countBy(baseRows, (contract) => contract.loanQuality);
  const qualitySegments = ["1 класс", "2 класс", "3 класс", "4 класс"]
    .map((label, index) => ({ label, value: qualityCounts[label] || 0, color: chartPalette[index % chartPalette.length] }))
    .filter((item) => item.value > 0);
  return `
    ${renderPageHeader("Реестр договоров", "Договоры, остатки долга, покрытие и связанные залоги.")}
    ${renderKpiGrid([
      { label: "Кредитный портфель", value: formatShortMoney(debtTotal), hint: "Остаток долга", tone: "info", active: !hasVisualFilters("contracts"), action: 'data-action="registry-kpi" data-scope="contracts" data-filter="all"' },
      { label: "Залоговая масса", value: formatShortMoney(allocatedTotal), hint: "Аллоцированная стоимость", tone: "info", action: 'data-action="registry-kpi" data-scope="contracts" data-filter="all"' },
      { label: "Средневзвешенный LTV", value: `${weightedLtv}%`, hint: "Показать LTV выше 80%", tone: weightedLtv > 100 ? "danger" : weightedLtv > 80 ? "warn" : "info", active: visual.kpi === "high-ltv", action: 'data-action="registry-kpi" data-scope="contracts" data-filter="kpi" data-value="high-ltv"' },
      { label: "Дефицит обеспечения", value: formatShortMoney(deficit), hint: "LTV выше 100%", tone: deficit ? "danger" : "info", active: visual.kpi === "deficit", action: 'data-action="registry-kpi" data-scope="contracts" data-filter="kpi" data-value="deficit"' },
      { label: "Кросс-залоги", value: String(crossContractCount), hint: "Договоры с общим обеспечением", tone: "warn", active: visual.kpi === "cross", action: 'data-action="registry-kpi" data-scope="contracts" data-filter="kpi" data-value="cross"' }
    ])}
    <section class="analytics-grid registry-analytics equal-height-analytics">
      ${renderDonutPanel({
        title: "Качество покрытия",
        subtitle: "Полное, частичное и недостаточное обеспечение.",
        segments: coverageSegments,
        total: baseRows.length,
        scope: "contracts",
        filterKey: "coverage",
        activeValue: visual.coverage
      })}
      ${renderBarPanel({
        title: "Категории качества ссуд",
        subtitle: "Данные поступают из АБС и не редактируются в модуле.",
        segments: qualitySegments,
        scope: "contracts",
        filterKey: "quality",
        activeValue: visual.quality,
        compact: true
      })}
    </section>
    <section class="panel">
      <div class="filter-grid registry-filter-grid">
        ${filterInput("contracts", "clientId", "ИНН/ПИНФЛ клиента")}
        ${filterInput("contracts", "clientName", "Наименование/ФИО клиента")}
        ${filterInput("contracts", "gsz", "ГСЗ")}
        ${filterInput("contracts", "number", "Номер договора")}
        ${filterDateRange("contracts", "periodFrom", "periodTo", "Период заключения договора")}
        ${filterInput("contracts", "collateralId", "Идентификатор залога")}
        ${filterSelect("contracts", "status", "Статус договора", ["", "Активен"])}
        <button class="btn btn-secondary" data-action="reset-filters" data-scope="contracts">Сбросить</button>
      </div>
    </section>
    <section class="panel table-panel" data-registry-table="contracts" tabindex="-1">
      <div class="panel-title"><h2>Договоры</h2><span class="panel-note">${rows.length} записей</span></div>
      <table class="contracts-table">
        <thead><tr><th>Договор</th><th>Клиент</th><th>ГСЗ</th><th>Продукт</th><th>Текущий остаток долга</th><th>Рыночная стоимость</th><th>Аллоцированная стоимость</th><th>Совокупный LTV</th><th>Статус покрытия</th><th>Категория качества</th><th>Размер резерва</th><th>Залоги</th></tr></thead>
        <tbody>${rows.map((contract) => `
          <tr>
            <td><a class="link registry-object-link" href="#/app/contracts/${escapeHtml(contract.id)}">${escapeHtml(contract.number)}</a><br><small>${escapeHtml(contract.startDate)} - ${escapeHtml(contract.endDate)}</small><br>${badge(contract.status)}</td>
            <td>${escapeHtml(contract.clientName)}<br><small>${escapeHtml(contract.inn)}</small></td>
            <td>${escapeHtml(contract.gsz)}</td>
            <td>${escapeHtml(contract.product)}</td>
            <td>${renderContractDebtCell(contract)}</td>
            <td>${formatMoney(contract.marketValue || 0)}</td>
            <td>${formatMoney(contract.allocatedValue || 0)}</td>
            <td>${badge(`${contract.ltv}%`, contract.ltv >= 100 ? "danger" : contract.ltv > 80 ? "warn" : "ok")}</td>
            <td>${badge(contract.coverageStatus, contract.coverageStatus === "Не обеспечено" ? "danger" : contract.coverageStatus === "Частичное" ? "warn" : "ok")}</td>
            <td>${escapeHtml(contract.loanQuality)}</td>
            <td>${formatMoney(contract.reserve || 0)}</td>
            <td>${contract.collateralIds.map((id) => `<button class="link" data-route="/app/collaterals/${id}">${id}</button>`).join("<br>")}</td>
          </tr>
        `).join("")}</tbody>
        <tfoot>
          <tr class="contracts-total-row">
            <td><strong>ИТОГО</strong><br><small>${rows.length} договоров</small></td>
            <td colspan="3"><span class="contracts-total-note">${escapeHtml(filters.gsz ? `Финальная залоговая позиция по ГСЗ: ${filters.gsz}` : "По отфильтрованным строкам")}</span></td>
            <td>${formatMoney(filteredTotals.debt)}</td>
            <td>${formatMoney(filteredTotals.marketValue)}</td>
            <td>${formatMoney(filteredTotals.allocatedValue)}</td>
            <td>${badge(`${filteredTotals.ltv}%`, filteredTotals.ltv >= 100 ? "danger" : filteredTotals.ltv > 80 ? "warn" : "ok")}</td>
            <td>-</td>
            <td>-</td>
            <td>${formatMoney(filteredTotals.reserve)}</td>
            <td>-</td>
          </tr>
        </tfoot>
      </table>
    </section>
  `;
}

function getContractsTotals(rows) {
  const debt = sumBy(rows, getContractDebtUzs);
  const marketValue = sumBy(rows, (contract) => contract.marketValue);
  const allocatedValue = sumBy(rows, (contract) => contract.allocatedValue);
  const reserve = sumBy(rows, (contract) => contract.reserve);
  const ltv = allocatedValue ? Math.round((debt / allocatedValue) * 100) : 0;
  return { debt, marketValue, allocatedValue, reserve, ltv };
}

function renderCollateralsRegistry() {
  const filters = state.filters.collaterals;
  const visual = state.visualFilters.collaterals;
  const baseRows = state.data.collaterals.filter((item) => {
    const contractText = item.contractIds.map((id) => getContract(id)?.number || id).join(" ");
    return matches(item.clientId, filters.clientId)
      && matches(item.clientName, filters.clientName)
      && matches(item.gsz, filters.gsz)
      && matches(contractText, filters.number)
      && matches(item.id, filters.collateralId)
      && matches(item.address, filters.address)
      && matches(item.type, filters.type);
  });
  const rows = baseRows.filter((item) =>
    (!visual.type || item.type === visual.type)
    && (!visual.gsz || item.gsz === visual.gsz)
    && (!visual.kpi || matchesCollateralKpi(item, visual.kpi))
  );
  const types = [...new Set(state.data.collaterals.map((item) => item.type))];
  const typeSegments = toSegments(Object.entries(baseRows.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + Number(item.pledgeValue || item.marketValue || 0);
    return acc;
  }, {})).map(([label, value]) => ({ label, value })));
  const gszSegments = toSegments(Object.entries(baseRows.reduce((acc, item) => {
    acc[item.gsz] = (acc[item.gsz] || 0) + Number(item.pledgeValue || 0);
    return acc;
  }, {})).map(([label, value]) => ({ label, value })), { limit: 5 });
  return `
    ${renderPageHeader("Реестр залогов", "Объекты залога с оценками, страхованием, рисками и внешними источниками.",
      `<button class="btn btn-secondary" data-action="open-import-collaterals">Загрузить из таблицы</button>`)}
    ${renderKpiGrid([
      { label: "Всего объектов", value: String(baseRows.length), hint: "В выбранном срезе", tone: "info", active: !hasVisualFilters("collaterals"), action: 'data-action="registry-kpi" data-scope="collaterals" data-filter="all"' },
      { label: "Залоговая стоимость", value: formatShortMoney(sumBy(baseRows, (item) => item.pledgeValue)), hint: "Сумма по объектам", tone: "info", action: 'data-action="registry-kpi" data-scope="collaterals" data-filter="all"' },
      { label: "Критические риски", value: String(baseRows.filter((item) => riskTone(item) === "danger").length), hint: "Красные триггеры", tone: "danger", active: visual.kpi === "critical", action: 'data-action="registry-kpi" data-scope="collaterals" data-filter="kpi" data-value="critical"' },
      { label: "Кросс-залоги", value: String(baseRows.filter((item) => item.crossPledge).length), hint: "Несколько договоров", tone: "warn", active: visual.kpi === "cross", action: 'data-action="registry-kpi" data-scope="collaterals" data-filter="kpi" data-value="cross"' },
      { label: "Истекает оценка", value: String(baseRows.filter((item) => item.appraisalStatus === "Истекает" || item.appraisalStatus === "Просрочена").length), hint: "Контроль оценки", tone: "warn", active: visual.kpi === "appraisal", action: 'data-action="registry-kpi" data-scope="collaterals" data-filter="kpi" data-value="appraisal"' }
    ])}
    <section class="analytics-grid registry-analytics equal-height-analytics">
      ${renderDonutPanel({
        title: "Портфель по видам имущества",
        subtitle: "Доли рассчитаны по залоговой стоимости.",
        segments: typeSegments.map((item) => ({ ...item, valueLabel: formatShortMoney(item.value) })),
        total: sumBy(baseRows, (item) => item.pledgeValue),
        centerLabel: formatShortMoney(sumBy(baseRows, (item) => item.pledgeValue)),
        scope: "collaterals",
        filterKey: "type",
        activeValue: visual.type
      })}
      ${renderBarPanel({
        title: "Топ-5 ГСЗ по залоговой стоимости",
        subtitle: "Крупнейшие группы связанных заемщиков.",
        segments: gszSegments,
        scope: "collaterals",
	        filterKey: "gsz",
	        activeValue: visual.gsz,
	        valueFormatter: formatShortMoney,
	        compact: true
	      })}
    </section>
    <section class="panel">
      <div class="filter-grid registry-filter-grid">
        ${filterInput("collaterals", "clientId", "ИНН/ПИНФЛ клиента")}
        ${filterInput("collaterals", "clientName", "Наименование/ФИО клиента")}
        ${filterInput("collaterals", "gsz", "ГСЗ")}
        ${filterInput("collaterals", "number", "Номер договора")}
        ${filterInput("collaterals", "collateralId", "Идентификатор залога")}
        ${filterInput("collaterals", "address", "Адрес")}
        ${filterSelect("collaterals", "type", "Тип объекта", ["", ...types])}
        <button class="btn btn-secondary" data-action="reset-filters" data-scope="collaterals">Сбросить</button>
      </div>
    </section>
    <section class="panel table-panel" data-registry-table="collaterals" tabindex="-1">
      <div class="panel-title"><h2>Залоги</h2><span class="panel-note">${rows.length} объектов</span></div>
      <table>
        <thead><tr><th>ID</th><th>Тип</th><th>Описание</th><th>Клиент</th><th>ГСЗ</th><th>Договоры</th><th>Рыночная</th><th>Залоговая</th><th>Оценка</th><th>Страхование</th><th>Риск</th></tr></thead>
        <tbody>${rows.map((item) => `
          <tr>
            <td><a class="link registry-object-link" href="#/app/collaterals/${escapeHtml(item.id)}">${escapeHtml(item.id)}</a>${item.crossPledge ? `<br>${badge("Кросс-залог", "warn")}` : ""}</td>
            <td>${escapeHtml(item.type)}</td>
            <td>${escapeHtml(item.description)}<br><small>${escapeHtml(item.address)}</small></td>
            <td>${escapeHtml(item.clientName)}<br><small>${escapeHtml(item.clientId)}</small></td>
            <td>${escapeHtml(item.gsz)}</td>
            <td>${item.contractIds.map((id) => `<button class="link" data-route="/app/contracts/${id}">${escapeHtml(getContract(id)?.number || id)}</button>`).join("<br>")}</td>
            <td>${formatMoney(item.marketValue)}</td>
            <td>${formatMoney(item.pledgeValue)}</td>
            <td>${badge(item.appraisalStatus)}<br><small>${escapeHtml(item.appraisalDue)}</small></td>
            <td>${badge(item.insuranceStatus)}<br><small>${escapeHtml(item.insuranceDue)}</small></td>
            <td>${badge(item.riskState, riskTone(item))}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    </section>
  `;
}

function matchesContractKpi(contract, kpi) {
  if (kpi === "high-ltv") return contract.ltv > 80;
  if (kpi === "deficit") return contract.ltv > 100 || contract.coverageStatus === "Недостаточное";
  if (kpi === "cross") return contract.collateralIds.some((id) => getCollateral(id)?.crossPledge);
  return true;
}

function matchesCollateralKpi(collateral, kpi) {
  if (kpi === "critical") return riskTone(collateral) === "danger";
  if (kpi === "cross") return Boolean(collateral.crossPledge);
  if (kpi === "appraisal") return collateral.appraisalStatus === "Истекает" || collateral.appraisalStatus === "Просрочена";
  return true;
}

function filterInput(scope, name, label) {
  const value = state.filters[scope]?.[name] || "";
  return `
    <label class="filter-field">
      <span class="filter-label">${escapeHtml(label)}</span>
      <input value="${escapeHtml(value)}" data-filter-scope="${scope}" data-filter-name="${name}" />
    </label>
  `;
}

function filterDateRange(scope, fromName, toName, label) {
  const fromValue = state.filters[scope]?.[fromName] || "";
  const toValue = state.filters[scope]?.[toName] || "";
  return `
    <label class="filter-field filter-date-range">
      <span class="filter-label">${escapeHtml(label)}</span>
      <span class="date-range-inputs">
        <input type="date" value="${escapeHtml(fromValue)}" data-filter-scope="${scope}" data-filter-name="${fromName}" aria-label="${escapeHtml(`${label}: дата начала`)}" />
        <input type="date" value="${escapeHtml(toValue)}" data-filter-scope="${scope}" data-filter-name="${toName}" aria-label="${escapeHtml(`${label}: дата окончания`)}" />
      </span>
    </label>
  `;
}

function filterSelect(scope, name, label, options) {
  const value = state.filters[scope]?.[name] || "";
  return `
    <label class="filter-field">
      <span class="filter-label">${escapeHtml(label)}</span>
      <select data-filter-scope="${scope}" data-filter-name="${name}">
        ${options.map((item) => `<option value="${escapeHtml(item)}" ${item === value ? "selected" : ""}>${escapeHtml(item || "Все")}</option>`).join("")}
      </select>
    </label>
  `;
}

function matches(value, filter) {
  if (!filter) return true;
  return String(value ?? "").toLowerCase().includes(String(filter).toLowerCase().trim());
}

function matchesDateRange(value, from, to) {
  if (!value) return true;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function renderEmpty(title, text, scope) {
  return `<div class="empty-state"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><button class="btn btn-secondary" data-action="reset-filters" data-scope="${scope}">Сбросить фильтры</button></div>`;
}

function renderTaskCard(taskId) {
  const task = getTask(taskId);
  if (!task) return renderNotFound("Задача не найдена", "/app/tasks");
  const collaterals = getTaskCollaterals(task);
  const collateral = getTaskActiveCollateral(task, collaterals);
  const contract = getContract(task.contractId);
  const role = getRole();
  const canWork = role.permissions.completeTask && task.status !== "Завершена";
  const taskPageClass = [
    "task-page",
    "task-card-compact",
    isRevaluationTaskType(task.type) ? "task-card-revaluation" : "",
    isInspectionTaskType(task.type) || isMobileInspectionTaskType(task.type) ? "task-card-inspection" : ""
  ].filter(Boolean).join(" ");
  return `
    <div class="${taskPageClass}">
      ${renderPageHeader(
        `${task.id} - ${task.type}`,
        `${task.title}. Источник: ${task.source}. SLA: ${task.sla}.`,
        `<button class="btn btn-secondary" data-route="/app/tasks">Назад</button>
         ${role.permissions.reassign ? `<button class="btn btn-secondary" data-action="open-reassign" data-task="${task.id}">Переназначить</button>` : ""}
         ${canWork ? `<button class="btn btn-secondary" data-action="task-status" data-task="${task.id}" data-status="Отложена">Отложить</button>` : ""}
         ${role.permissions.returnTask && task.status !== "Завершена" ? `<button class="btn btn-secondary" data-action="task-status" data-task="${task.id}" data-status="На доработке">Вернуть</button>` : ""}
         ${canWork ? `<button class="btn btn-secondary" data-action="save-task" data-task="${task.id}">Сохранить</button><button class="btn btn-primary" data-action="task-status" data-task="${task.id}" data-status="Завершена">Завершить</button>` : ""}`
      )}
      ${renderTaskMainInfo(task)}
      <section class="task-detail-layout">
        <div class="task-detail-main">
          ${renderTaskCollateralContext(task, collaterals, collateral)}
          ${renderTaskSpecificBlocks(task, collateral, collaterals)}
          ${renderTaskExpertConclusion(task, collateral)}
        </div>
        <aside class="task-detail-sidebar">
          ${renderTaskClientContractInfo(task, contract)}
          ${renderTaskDocumentsPanel(task, collaterals, collateral)}
          ${renderTaskRoute(task, role)}
          ${renderTaskHistory(task)}
        </aside>
      </section>
    </div>
  `;
}

function renderTaskMainInfo(task) {
  return `
    <section class="panel task-main-info-panel">
      <div class="panel-title">
        <div>
          <span class="eyebrow">Общий компонент задачи</span>
          <h2>Основная информация по задаче</h2>
          <p class="hint">${escapeHtml(task.title)}. Источник: ${escapeHtml(task.source)}. SLA: ${escapeHtml(task.sla)}.</p>
        </div>
        <div class="status-stack">${badge(task.status)}${badge(task.priority)}</div>
      </div>
      <div class="hero-metrics task-main-metrics">
        <div><span>Номер задачи</span><strong>${escapeHtml(task.id)}</strong></div>
        <div><span>Тип задачи</span><strong>${escapeHtml(task.type)}</strong></div>
        <div><span>Плановый срок</span><strong>${escapeHtml(task.dueDate)}</strong></div>
        <div><span>Норматив</span><strong>${escapeHtml(task.normativeTerm || "5 рабочих дней")}</strong></div>
        <div><span>Исполнитель</span><strong>${escapeHtml(task.assignee)}</strong></div>
        <div><span>Клиент</span><strong>${escapeHtml(task.client)}</strong></div>
      </div>
      <p class="task-main-result">${escapeHtml(task.result)}</p>
    </section>
  `;
}

function renderTaskClientContractInfo(task, contract) {
  return `
    <section class="panel task-client-contract-panel">
      <h2>Информация о клиенте и договоре</h2>
      ${renderInfoGrid({
        "Клиент": task.client,
        "ИНН/ПИНФЛ": contract?.inn,
        "ГСЗ": contract?.gsz,
        "Договор": contract?.number,
        "Продукт": contract?.product,
        "Остаток долга": formatMoney(contract?.debt || 0, contract?.currency),
        "Категория качества": contract?.loanQuality,
        "LTV": `${contract?.ltv || 0}%`
      })}
    </section>
  `;
}

function renderTaskCollateralContext(task, collaterals, activeCollateral) {
  if (!collaterals.length) {
    return `<section class="panel task-collateral-panel"><h2>Описание объекта залога</h2><p class="hint">Объект залога не привязан к задаче.</p></section>`;
  }
  if (collaterals.length === 1) return renderTaskCollateralDescription(task, collaterals[0]);
  return renderTaskCollateralObjectsInfo(task, collaterals, activeCollateral);
}

function renderTaskCollateralDescription(task, collateral) {
  const contract = getContract(collateral.contractIds?.[0] || task.contractId);
  const category = collateral.fields?.["Категория"] || collateral.fields?.["Назначение"] || collateral.fields?.["Марка/модель"] || collateral.type;
  return `
    <section class="panel task-collateral-panel task-collateral-description">
      <div class="panel-title">
        <div><h2>Описание объекта залога</h2></div>
        <span class="panel-note">${escapeHtml(collateral.id)}</span>
      </div>
      ${renderInfoGrid({
        "ID залога": collateral.id,
        "Тип объекта": collateral.type,
        "Категория / подтип": category,
        "Описание": collateral.description,
        "Адрес / местонахождение": collateral.address,
        "Залогодатель / клиент": collateral.clientName,
        "ИНН/ПИНФЛ": collateral.clientId,
        "ГСЗ": collateral.gsz,
        "Договор": contract?.number || task.contractId,
        "Рыночная стоимость": formatMoney(collateral.marketValue || 0),
        "Залоговая стоимость": formatMoney(collateral.pledgeValue || 0),
        "Оценка": collateral.appraisalStatus,
        "Страхование": collateral.insuranceStatus,
        "Состояние риска": collateral.riskState,
        "Источник данных": collateral.source
      })}
      <div class="inline-actions">
        <button class="btn btn-secondary" data-route="/app/collaterals/${collateral.id}">Открыть залог</button>
        <button class="btn btn-secondary" data-route="/app/contracts/${contract?.id || task.contractId}">Открыть договор</button>
      </div>
    </section>
  `;
}

function renderTaskCollateralObjectsInfo(task, collaterals, activeCollateral) {
  return `
    <section class="panel table-panel task-collateral-panel task-collateral-info task-object-selector">
      <div class="panel-title">
        <div><h2>Информация по объектам залога</h2><p class="hint">Выберите строку, чтобы документы, страхование, сигналы и состояние обновились по активному залогу.</p></div>
        <span class="panel-note">Активен: ${escapeHtml(activeCollateral?.id || collaterals[0]?.id || "-")}</span>
      </div>
      <div class="table-wrap compact-table">
        <table>
          <thead><tr><th>ID</th><th>Тип</th><th>Объект</th><th>Адрес</th><th>Залогодатель / клиент</th><th>Договор</th><th>Рыночная</th><th>Залоговая</th><th>Контроль</th><th>Риск</th></tr></thead>
          <tbody>${collaterals.map((item) => {
            const contract = getContract(item.contractIds?.[0] || task.contractId);
            const active = item.id === activeCollateral?.id;
            return `
              <tr class="${active ? "is-active" : ""}" data-action="select-task-collateral" data-task="${task.id}" data-collateral="${item.id}">
                <td><button class="link" data-route="/app/collaterals/${item.id}">${item.id}</button></td>
                <td>${escapeHtml(item.type)}</td>
                <td><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(item.clientId)}</small></td>
                <td>${escapeHtml(item.address)}</td>
                <td>${escapeHtml(item.clientName)}</td>
                <td>${escapeHtml(contract?.number || task.contractId || "-")}</td>
                <td>${formatMoney(item.marketValue || 0)}</td>
                <td>${formatMoney(item.pledgeValue || 0)}</td>
                <td><div class="status-stack">${badge(item.appraisalStatus)}${badge(item.insuranceStatus)}</div></td>
                <td>${badge(item.riskState, riskTone(item))}</td>
              </tr>
            `;
          }).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTaskSpecificBlocks(task, collateral, collaterals) {
  if (isInspectionTaskType(task.type)) return renderInspectionTaskBlock(task, collateral);
  if (isMobileInspectionTaskType(task.type)) return renderMobileInspectionTaskBlock(task, collateral);
  if (isRevaluationTaskType(task.type)) return renderRevaluationTaskBlock(task, collateral);
  if (isMonitoringTaskType(task.type)) return renderMonitoringTaskBlock(task, collateral, collaterals);
  if (isPledgeOperationTaskType(task.type)) return renderPledgeOperationBlock(task, collateral);
  return "";
}

function renderInspectionTaskBlock(task, collateral) {
  const reportFields = getInspectionReportFields(task, collateral);
  const rightFields = getInspectionRightsFields(collateral);
  const insuranceFields = getInspectionInsuranceFields(collateral);
  const result = getInspectionResult(task, collateral);
  return `
    <section class="task-specific-form inspection-task-form">
      <section class="panel task-form-panel">
        <div class="panel-title">
          <div><h2>Описание отчета</h2></div>
          ${badge(task.type, "info")}
        </div>
        ${renderTaskFormGrid(reportFields, "task-form-grid compact")}
      </section>
      ${renderInspectionChecklistBlock(task, collateral, result)}
      ${renderInspectionResultPanel(task, collateral, result)}
      <section class="panel task-form-panel">
        <div class="panel-title">
          <div><h2>Документы, подтверждающие право на объект залога</h2><p class="hint">Проверочные поля по праву собственности. Файлы прикладываются в едином блоке «Документы» справа.</p></div>
        </div>
        ${renderTaskFormGrid(rightFields, "task-form-grid compact")}
      </section>
      <section class="panel task-form-panel">
        <div class="panel-title">
          <div><h2>Документы, подтверждающие страхование объекта залога</h2><p class="hint">Проверочные поля по страховому полису активного объекта. Сам контейнер файлов расположен справа.</p></div>
        </div>
        ${renderTaskFormGrid(insuranceFields, "task-form-grid compact")}
      </section>
      ${renderCollateralPhotoShots(task, collateral)}
      ${renderMobileInspectionResults(task, collateral)}
    </section>
  `;
}

function renderMobileInspectionTaskBlock(task, collateral) {
  const isClient = task.mobileKind === "clientInspection" || task.type === "Клиентский осмотр";
  const mobileRoute = isClient ? `/mobile/client/tasks/${task.id}/photos` : `/mobile/employee/tasks/${task.id}/photos`;
  const result = getMobileInspectionProgress(task, collateral);
  return `
    <section class="task-specific-form inspection-task-form">
      <section class="panel task-form-panel mobile-inspection-task-panel">
        <div class="panel-title">
          <div>
            <h2>${isClient ? "Запрос клиенту на осмотр" : "Задача на выездной осмотр"}</h2>
            <p class="hint">Мобильная подзадача создана из основного осмотра ${escapeHtml(task.parentTaskId || "-")} и возвращает фотофиксацию в основную задачу.</p>
          </div>
          ${badge(task.status)}
        </div>
        ${renderInfoGrid({
          "Основная задача": task.parentTaskId || "-",
          "Канал выполнения": isClient ? "Мобильное приложение клиента" : "Мобильный АРМ сотрудника",
          "Исполнитель / контакт": isClient ? task.clientContact || task.client : task.assignee,
          "Объект залога": collateral?.id || task.collateralId,
          "Плановый срок": task.dueDate,
          "Фото получены": `${result.done} из ${result.total}`,
          "Результат": task.result
        })}
        <div class="inline-actions">
          <button class="btn btn-primary" data-route="${mobileRoute}">Открыть мобильный интерфейс</button>
          ${task.parentTaskId ? `<button class="btn btn-secondary" data-route="/app/tasks/${task.parentTaskId}">Открыть основную задачу</button>` : ""}
        </div>
      </section>
      ${renderCollateralPhotoShots(task, collateral)}
    </section>
  `;
}

function getInspectionReportFields(task, collateral) {
  const isRepeat = task.type === "Повторный осмотр";
  return [
    { label: "Причина осмотра", value: isRepeat ? "По замечаниям предыдущего осмотра" : "По заявке / новой задаче", type: "select", options: ["По заявке / новой задаче", "Плановый контроль", "По замечаниям предыдущего осмотра", "По сигналу риска"] },
    { label: "Вид осмотра", value: isRepeat ? "Внеплановый" : "Плановый", type: "select", options: ["Плановый", "Внеплановый"] },
    { label: "Тип осмотра", value: "Выездной", type: "select", options: ["Выездной", "Дистанционный", "Документарный"] },
    { label: "Ресурс для осмотра", value: task.assignee || "Сотрудник Банка", type: "select", options: ["Сотрудник Банка", "Аутсорсер", task.assignee || "Сотрудник Банка"] },
    { label: "Участник осмотра", value: collateral?.clientName || task.client || "" },
    { label: "Статус верификации", value: "Действующая", type: "select", options: ["Действующая", "Требует подтверждения", "Не подтверждена"] }
  ];
}

function getInspectionRightsFields(collateral) {
  const encumbrance = collateral?.encumbrances?.[0] || {};
  return [
    { label: "Право залогодателя", value: collateral?.externalData?.["Право собственности"] || "Установлено", type: "select", options: ["Установлено", "Требует проверки", "Не подтверждено"] },
    { label: "Основание права", value: getOwnershipBasis(collateral), type: "select", options: ["Договор купли-продажи", "Кадастровая выписка", "Инвойс и акт ввода", "Техпаспорт / СТС", "Складские документы"] },
    { label: "Копия правоустанавливающего документа", value: "Вложена / Отсутствует", type: "select", options: ["Вложена / Отсутствует", "Вложена", "Отсутствует"] },
    { label: "Номер", value: encumbrance.number || collateral?.fields?.["Кадастровый номер"] || collateral?.fields?.["VIN"] || collateral?.fields?.["Серийный номер"] || "123" },
    { label: "Дата", value: encumbrance.date || collateral?.updatedAt?.slice(0, 10) || "2026-06-17", type: "date" },
    { label: "Копия документа об оплате", value: "Вложена / Отсутствует", type: "select", options: ["Вложена / Отсутствует", "Вложена", "Отсутствует"] }
  ];
}

function getInspectionInsuranceFields(collateral) {
  const insurance = collateral?.insurance || {};
  return [
    { label: "Требуется страхование", value: "ДА", type: "select", options: ["ДА", "НЕТ"] },
    { label: "Объект залога застрахован", value: collateral?.insuranceStatus === "Оплачена" ? "ДА" : "НЕТ", type: "select", options: ["ДА", "НЕТ"] },
    { label: "Страховая премия уплачена", value: insurance.premiumStatus === "Оплачена" ? "ДА" : "НЕТ", type: "select", options: ["ДА", "НЕТ"] },
    { label: "Полис страхования представлен", value: insurance.policy ? "ДА" : "НЕТ", type: "select", options: ["ДА", "НЕТ"] },
    { label: "Наименование страховщика", value: insurance.company || "Не указано" },
    { label: "Статус аккредитации", value: "Действующая", type: "select", options: ["Действующая", "Требует проверки", "Не аккредитована"] },
    { label: "Номер полиса страхования", value: insurance.policy || "Не указан" },
    { label: "Срок действия полиса", value: insurance.to || collateral?.insuranceDue || "2026-12-31", type: "date" }
  ];
}

function getOwnershipBasis(collateral) {
  if (collateral?.type === "Недвижимость") return "Кадастровая выписка";
  if (collateral?.type === "Автотранспорт") return "Техпаспорт / СТС";
  if (collateral?.type === "Оборудование") return "Инвойс и акт ввода";
  if (collateral?.type === "Товары в обороте") return "Складские документы";
  return "Договор купли-продажи";
}

function renderInspectionResultPanel(task, collateral, result) {
  return `
    <section class="panel task-form-panel inspection-result-panel">
      <div class="panel-title">
        <div><h2>Результат осмотра объекта залога</h2><p class="hint">Результат пересчитывается по чек-листу факторов, весам групп и мастер-шкале состояния.</p></div>
        <div class="status-stack">${badge(result.state, result.tone)}${badge(`Балл ${result.score}`, result.tone)}</div>
      </div>
      ${renderTaskFormGrid([
        { label: "Оценка состояния", value: result.state, readonly: true },
        { label: "Итоговый балл", value: result.score, type: "number", readonly: true },
        { label: "Диапазон мастер-шкалы", value: `${result.scale.min}-${result.scale.max}`, readonly: true },
        { label: "Может быть принято в залог", value: result.canAccept, readonly: true },
        { label: "Дополнительные данные по осмотру объекта", value: result.comment, textarea: true, wide: true },
        { label: "Выводы", value: result.conclusion, textarea: true, wide: true }
      ], "task-form-grid compact")}
    </section>
  `;
}

function getInspectionResult(task, collateral) {
  const calculation = calculateInspectionFactorResult(task, collateral);
  return {
    ...calculation,
    comment: task.result || "Наблюдения в процессе осмотра зафиксированы. Фото и документы сверены с данными карточки залога.",
    conclusion: calculation.canAccept === "НЕТ"
      ? "По итогам осмотра объект не может быть принят без устранения критичных замечаний."
      : "По итогам осмотра объект подтвержден, существенных расхождений с карточкой залога не выявлено."
  };
}

function calculateInspectionFactorResult(task, collateral) {
  const groups = getInspectionFactorGroups(collateral).map((group) => {
    const items = group.items.map((factor, index) => {
      const selected = getInspectionSelectedOption(task, collateral, factor);
      const maxScore = Math.max(...factor.values.map((item) => item.score));
      const factorWeight = getInspectionFactorWeight(group, factor, index);
      const weightedFactorScore = selected.score * (factorWeight / 100);
      const maxWeightedFactorScore = maxScore * (factorWeight / 100);
      return { ...factor, weight: factorWeight, selected, score: selected.score, maxScore, weightedFactorScore, maxWeightedFactorScore };
    });
    const rawScore = items.reduce((sum, item) => sum + item.weightedFactorScore, 0);
    const maxRawScore = items.reduce((sum, item) => sum + item.maxWeightedFactorScore, 0);
    const weightedScore = Math.round(rawScore * (group.weight / 100));
    const maxWeightedScore = Math.round(maxRawScore * (group.weight / 100));
    return { ...group, items, rawScore, maxRawScore, weightedScore, maxWeightedScore };
  });
  const score = Math.max(0, Math.round(groups.reduce((sum, group) => sum + group.weightedScore, 0)));
  const maxScore = Math.max(1, groups.reduce((sum, group) => sum + group.maxWeightedScore, 0));
  const scale = getInspectionMasterScale(score, maxScore);
  return { score, state: scale.state, tone: scale.tone, canAccept: scale.canAccept, scale, groups };
}

const inspectionFactorWeights = {
  "AUTO-ID-VIN": 40,
  "AUTO-ID-LOCATION": 30,
  "AUTO-ID-ODOMETER": 15,
  "AUTO-ID-DOCS": 15,
  "AUTO-BODY-DAMAGE": 35,
  "AUTO-BODY-LIGHTS": 20,
  "AUTO-BODY-TIRES": 25,
  "AUTO-BODY-CORROSION": 20,
  "AUTO-TECH-ENGINE": 35,
  "AUTO-TECH-CHASSIS": 25,
  "AUTO-TECH-SERVICE": 20,
  "AUTO-TECH-USAGE": 20,
  "AUTO-DOCS-INSURANCE": 30,
  "AUTO-DOCS-PHOTOS": 30,
  "AUTO-DOCS-OWNER": 25,
  "AUTO-DOCS-KEYS": 15,
  "REALTY-LAND-LOCATION": 30,
  "REALTY-LAND-BORDERS": 25,
  "REALTY-LAND-ACCESS": 25,
  "REALTY-LAND-PURPOSE": 20,
  "REALTY-BUILDING-USE": 25,
  "REALTY-BUILDING-FACADE": 25,
  "REALTY-BUILDING-INTERIOR": 25,
  "REALTY-BUILDING-ENGINEERING": 25,
  "REALTY-RIGHTS-OWNER": 35,
  "REALTY-RIGHTS-BANS": 35,
  "REALTY-RIGHTS-CADASTRE": 30,
  "REALTY-LIQUIDITY-DEMAND": 35,
  "REALTY-LIQUIDITY-PHOTOS": 20,
  "REALTY-LIQUIDITY-INFRA": 25,
  "REALTY-LIQUIDITY-USE": 20,
  "GEN-ID-LOCATION": 35,
  "GEN-ID-MARKING": 25,
  "GEN-ID-OWNER": 20,
  "GEN-ID-ACCESS": 20,
  "GEN-CONDITION-WORK": 35,
  "GEN-CONDITION-STORAGE": 25,
  "GEN-CONDITION-WEAR": 25,
  "GEN-CONDITION-SAFETY": 15,
  "GEN-DOCS-COMPLETE": 35,
  "GEN-DOCS-PHOTOS": 25,
  "GEN-DOCS-INSURANCE": 25,
  "GEN-DOCS-VALUATION": 15
};

function getInspectionFactorWeight(group, factor, index) {
  if (Number.isFinite(Number(factor.weight))) return Number(factor.weight);
  if (Number.isFinite(Number(inspectionFactorWeights[factor.code]))) return Number(inspectionFactorWeights[factor.code]);
  return Math.round(100 / Math.max(1, group.items.length || index + 1));
}

function getInspectionMasterScale(score, maxScore = 100) {
  const excellent = Math.round(maxScore * 0.9);
  const good = Math.round(maxScore * 0.7);
  const satisfactory = Math.round(maxScore * 0.4);
  if (score >= excellent) return { state: "Отличное", min: excellent, max: maxScore, canAccept: "ДА", tone: "ok" };
  if (score >= good) return { state: "Хорошее", min: good, max: Math.max(good, excellent - 1), canAccept: "ДА", tone: "ok" };
  if (score >= satisfactory) return { state: "Удовлетворительное", min: satisfactory, max: Math.max(satisfactory, good - 1), canAccept: "ДА, с условиями", tone: "warn" };
  return { state: "Неудовлетворительное", min: 0, max: Math.max(0, satisfactory - 1), canAccept: "НЕТ", tone: "danger" };
}

function getInspectionSelectedOption(task, collateral, factor) {
  const value = task?.inspectionAnswers?.[collateral?.id]?.[factor.code] || factor.defaultValue || factor.values[0]?.code;
  return factor.values.find((item) => item.code === value) || factor.values[0];
}

function updateTaskInspectionFactor(fieldEl) {
  const task = getTask(fieldEl.dataset.task);
  if (!task || !fieldEl.dataset.collateral || !fieldEl.dataset.factor) return;
  task.inspectionAnswers = task.inspectionAnswers || {};
  task.inspectionAnswers[fieldEl.dataset.collateral] = task.inspectionAnswers[fieldEl.dataset.collateral] || {};
  task.inspectionAnswers[fieldEl.dataset.collateral][fieldEl.dataset.factor] = fieldEl.value;
}

function renderInspectionChecklistBlock(task, collateral, result) {
  const groups = result.groups;
  return `
    <section class="panel task-form-panel inspection-checklist-panel">
      <div class="panel-title">
        <div><h2>Чек-лист осмотра</h2></div>
        <div class="status-stack">${badge(collateral?.type || "Тип не указан", "info")}${badge(`Итого ${result.score}`, result.tone)}</div>
      </div>
      <div class="inspection-checklist-grid">
        ${groups.map((group) => `
          <article class="inspection-checklist-group">
            <div class="inspection-factor-group-head">
              <h3>${escapeHtml(group.title)}</h3>
              <div class="risk-group-metrics">
                <div><span>Вес группы</span><strong>${group.weight}%</strong></div>
                <div><span>Балл группы</span><strong>${group.weightedScore}</strong></div>
              </div>
            </div>
            <div class="inspection-checklist-items">
              ${group.items.map((item) => `
                <div class="inspection-check-row">
                  <div class="inspection-factor-name"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.code)}</span></div>
                  <select data-inspection-factor data-task="${escapeHtml(task.id)}" data-collateral="${escapeHtml(collateral?.id || "")}" data-factor="${escapeHtml(item.code)}" aria-label="${escapeHtml(item.name)}">
                    ${item.values.map((option) => `<option value="${escapeHtml(option.code)}" ${option.code === item.selected.code ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
                  </select>
                  <div class="inspection-factor-score"><strong>${item.score}</strong><span>вес ${item.weight}%</span></div>
                </div>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function getInspectionFactorGroups(collateral) {
  if (collateral?.type === "Автотранспорт") {
    return [
      { code: "AUTO-ID", title: "Идентификация транспорта", weight: 25, items: [
        { code: "AUTO-ID-VIN", name: "VIN и регистрационный номер", defaultValue: "match", values: [
          { code: "match", label: "VIN и госномер соответствуют техпаспорту", score: 100 },
          { code: "partial", label: "Есть несущественное расхождение в регистрационных данных", score: 60 },
          { code: "mismatch", label: "VIN или госномер не соответствуют документам", score: 10 }
        ] },
	        { code: "AUTO-ID-LOCATION", name: "Местонахождение транспорта", defaultValue: "confirmed", values: [
	          { code: "confirmed", label: "Транспорт находится по адресу осмотра", score: 100 },
	          { code: "moved", label: "Транспорт перемещен, адрес подтвержден ответственным", score: 65 },
	          { code: "missing", label: "Транспорт не найден по заявленному адресу", score: 0 }
	        ] },
	        { code: "AUTO-ID-ODOMETER", name: "Пробег и показания приборов", defaultValue: "normal", values: [
	          { code: "normal", label: "Пробег и показания соответствуют эксплуатации", score: 100 },
	          { code: "attention", label: "Показания требуют дополнительной сверки", score: 55 },
	          { code: "critical", label: "Показания не подтверждены или искажены", score: 10 }
	        ] },
	        { code: "AUTO-ID-DOCS", name: "Сверка техпаспорта", defaultValue: "match", values: [
	          { code: "match", label: "Техпаспорт соответствует объекту", score: 100 },
	          { code: "partial", label: "Есть несущественные расхождения", score: 60 },
	          { code: "mismatch", label: "Документ не соответствует объекту", score: 0 }
	        ] }
	      ] },
      { code: "AUTO-BODY", title: "Кузов и внешний вид", weight: 25, items: [
        { code: "AUTO-BODY-DAMAGE", name: "Повреждения кузова", defaultValue: "minor", values: [
          { code: "none", label: "Повреждения кузова отсутствуют", score: 100 },
          { code: "minor", label: "Есть косметические дефекты без влияния на стоимость", score: 70 },
          { code: "critical", label: "Есть существенные повреждения кузова", score: 20 }
        ] },
	        { code: "AUTO-BODY-LIGHTS", name: "Световые приборы и стекла", defaultValue: "ok", values: [
	          { code: "ok", label: "Световые приборы и стекла исправны", score: 100 },
	          { code: "attention", label: "Требуется замена отдельных элементов", score: 60 },
	          { code: "bad", label: "Неисправность влияет на эксплуатацию", score: 20 }
	        ] },
	        { code: "AUTO-BODY-TIRES", name: "Шины и колеса", defaultValue: "wear", values: [
	          { code: "ok", label: "Шины соответствуют сезону и норме износа", score: 100 },
	          { code: "wear", label: "Есть умеренный износ", score: 65 },
	          { code: "bad", label: "Требуется срочная замена шин", score: 20 }
	        ] },
	        { code: "AUTO-BODY-CORROSION", name: "Коррозия и следы ремонта", defaultValue: "minor", values: [
	          { code: "none", label: "Коррозия и следы ремонта не выявлены", score: 100 },
	          { code: "minor", label: "Есть локальные следы ремонта", score: 70 },
	          { code: "critical", label: "Есть коррозия или ремонт несущих элементов", score: 15 }
	        ] }
	      ] },
      { code: "AUTO-TECH", title: "Техническое состояние", weight: 30, items: [
        { code: "AUTO-TECH-ENGINE", name: "Двигатель и ошибки панели", defaultValue: "ok", values: [
          { code: "ok", label: "Ошибки отсутствуют, двигатель работает штатно", score: 100 },
          { code: "service", label: "Есть предупреждения, требуется сервисная диагностика", score: 55 },
          { code: "bad", label: "Выявлены критичные ошибки или нестабильная работа", score: 10 }
        ] },
	        { code: "AUTO-TECH-CHASSIS", name: "Ходовая часть и тормоза", defaultValue: "ok", values: [
	          { code: "ok", label: "Ходовая часть и тормоза без замечаний", score: 100 },
	          { code: "wear", label: "Есть износ, влияющий на ликвидность", score: 65 },
	          { code: "unsafe", label: "Эксплуатация требует ремонта", score: 15 }
	        ] },
	        { code: "AUTO-TECH-SERVICE", name: "Сервисная история", defaultValue: "confirmed", values: [
	          { code: "confirmed", label: "Сервисная история подтверждена", score: 100 },
	          { code: "partial", label: "История подтверждена частично", score: 60 },
	          { code: "missing", label: "Сервисная история отсутствует", score: 20 }
	        ] },
	        { code: "AUTO-TECH-USAGE", name: "Интенсивность эксплуатации", defaultValue: "normal", values: [
	          { code: "normal", label: "Эксплуатация соответствует назначению", score: 100 },
	          { code: "high", label: "Интенсивная эксплуатация повышает износ", score: 55 },
	          { code: "extreme", label: "Эксплуатация критично влияет на ресурс", score: 10 }
	        ] }
	      ] },
      { code: "AUTO-DOCS", title: "Эксплуатация и документы", weight: 20, items: [
        { code: "AUTO-DOCS-INSURANCE", name: "Страхование и техосмотр", defaultValue: collateral?.insuranceStatus === "Оплачена" ? "valid" : "attention", values: [
          { code: "valid", label: "Страхование и техосмотр действуют", score: 100 },
          { code: "attention", label: "Есть истекающий документ, требуется обновление", score: 60 },
          { code: "expired", label: "Ключевой документ отсутствует или истек", score: 15 }
        ] },
	        { code: "AUTO-DOCS-PHOTOS", name: "Фотофиксация ракурсов", defaultValue: "partial", values: [
	          { code: "complete", label: "Все обязательные фото ракурсов приложены", score: 100 },
	          { code: "partial", label: "Часть фото ожидается из мобильного приложения", score: 65 },
	          { code: "missing", label: "Фотофиксация не выполнена", score: 10 }
	        ] },
	        { code: "AUTO-DOCS-OWNER", name: "Право собственности", defaultValue: "confirmed", values: [
	          { code: "confirmed", label: "Право собственности подтверждено", score: 100 },
	          { code: "need-check", label: "Требуется сверка владельца", score: 50 },
	          { code: "not-confirmed", label: "Право собственности не подтверждено", score: 0 }
	        ] },
	        { code: "AUTO-DOCS-KEYS", name: "Комплект ключей и принадлежностей", defaultValue: "partial", values: [
	          { code: "complete", label: "Комплект передан полностью", score: 100 },
	          { code: "partial", label: "Комплект передан частично", score: 60 },
	          { code: "missing", label: "Комплект отсутствует", score: 15 }
	        ] }
	      ] }
    ];
  }
  if (collateral?.type === "Недвижимость") {
    return [
      { code: "REALTY-LAND", title: "Земельный участок", weight: 30, items: [
        { code: "REALTY-LAND-LOCATION", name: "Местонахождение участка", defaultValue: "cadastre-match", values: [
          { code: "cadastre-match", label: "Фактический адрес участка соответствует кадастру", score: 100 },
          { code: "cadastre-partial", label: "Фактический адрес участка частично требует уточнения", score: 60 },
          { code: "cadastre-mismatch", label: "Фактический адрес участка не соответствует кадастру", score: 10 }
        ] },
        { code: "REALTY-LAND-BORDERS", name: "Границы участка", defaultValue: "clear", values: [
          { code: "clear", label: "Границы участка установлены и соответствуют плану", score: 100 },
          { code: "unclear", label: "Границы читаются частично, требуется уточнение", score: 60 },
          { code: "conflict", label: "Границы участка не подтверждены", score: 15 }
        ] },
	        { code: "REALTY-LAND-ACCESS", name: "Подъездные пути", defaultValue: "available", values: [
	          { code: "available", label: "Подъездные пути доступны круглый год", score: 100 },
	          { code: "limited", label: "Доступ ограничен сезонно или режимом территории", score: 65 },
	          { code: "blocked", label: "Доступ к участку затруднен", score: 20 }
	        ] },
	        { code: "REALTY-LAND-PURPOSE", name: "Разрешенное использование", defaultValue: "match", values: [
	          { code: "match", label: "Использование соответствует документам", score: 100 },
	          { code: "attention", label: "Есть ограничения по использованию", score: 60 },
	          { code: "mismatch", label: "Фактическое использование не соответствует документам", score: 10 }
	        ] }
	      ] },
      { code: "REALTY-BUILDING", title: "Строение", weight: 35, items: [
        { code: "REALTY-BUILDING-USE", name: "Фактическое использование", defaultValue: "active", values: [
          { code: "active", label: "Объект эксплуатируется по назначению", score: 100 },
          { code: "partial", label: "Эксплуатация частичная, есть свободные площади", score: 65 },
          { code: "stopped", label: "Объект не эксплуатируется", score: 20 }
        ] },
        { code: "REALTY-BUILDING-FACADE", name: "Фасад и кровля", defaultValue: "attention", values: [
          { code: "ok", label: "Фасад и кровля без видимых дефектов", score: 100 },
          { code: "attention", label: "Требуется обновить фото или устранить локальные дефекты", score: 70 },
          { code: "bad", label: "Есть дефекты, влияющие на стоимость", score: 25 }
        ] },
	        { code: "REALTY-BUILDING-INTERIOR", name: "Внутреннее состояние", defaultValue: "ok", values: [
	          { code: "ok", label: "Помещения в рабочем состоянии", score: 100 },
	          { code: "wear", label: "Есть износ отделки и инженерных систем", score: 60 },
	          { code: "critical", label: "Состояние помещений неудовлетворительное", score: 15 }
	        ] },
	        { code: "REALTY-BUILDING-ENGINEERING", name: "Инженерные коммуникации", defaultValue: "work", values: [
	          { code: "work", label: "Коммуникации работают штатно", score: 100 },
	          { code: "limited", label: "Есть ограничения по отдельным системам", score: 60 },
	          { code: "critical", label: "Коммуникации требуют капитального ремонта", score: 10 }
	        ] }
	      ] },
      { code: "REALTY-RIGHTS", title: "Права и ограничения", weight: 20, items: [
        { code: "REALTY-RIGHTS-OWNER", name: "Собственник и право", defaultValue: "confirmed", values: [
          { code: "confirmed", label: "Собственник и право подтверждены документами", score: 100 },
          { code: "need-check", label: "Требуется уточнение правоустанавливающего документа", score: 55 },
          { code: "not-confirmed", label: "Право собственности не подтверждено", score: 0 }
        ] },
	        { code: "REALTY-RIGHTS-BANS", name: "Аресты и запреты", defaultValue: collateral?.riskState === "Критическое" ? "critical" : "clean", values: [
	          { code: "clean", label: "Аресты и запреты не выявлены", score: 100 },
	          { code: "attention", label: "Есть внешний сигнал, требуется проверка", score: 50 },
	          { code: "critical", label: "Выявлены ограничения, влияющие на залог", score: 0 }
	        ] },
	        { code: "REALTY-RIGHTS-CADASTRE", name: "Кадастровая актуальность", defaultValue: "actual", values: [
	          { code: "actual", label: "Кадастровые данные актуальны", score: 100 },
	          { code: "need-update", label: "Требуется обновление выписки", score: 55 },
	          { code: "outdated", label: "Кадастровые сведения устарели", score: 15 }
	        ] }
	      ] },
      { code: "REALTY-LIQUIDITY", title: "Ликвидность и доступность", weight: 15, items: [
        { code: "REALTY-LIQUIDITY-DEMAND", name: "Ликвидность объекта", defaultValue: "normal", values: [
          { code: "high", label: "Спрос на аналогичные объекты высокий", score: 100 },
          { code: "normal", label: "Спрос на аналогичные объекты стабильный", score: 80 },
          { code: "low", label: "Спрос ограничен, реализация может быть длительной", score: 35 }
        ] },
	        { code: "REALTY-LIQUIDITY-PHOTOS", name: "Фотофиксация объекта", defaultValue: "partial", values: [
	          { code: "complete", label: "Все обязательные ракурсы приложены", score: 100 },
	          { code: "partial", label: "Требуется обновить отдельные фото", score: 65 },
	          { code: "missing", label: "Фотофиксация отсутствует", score: 10 }
	        ] },
	        { code: "REALTY-LIQUIDITY-INFRA", name: "Инфраструктура и окружение", defaultValue: "normal", values: [
	          { code: "strong", label: "Окружение повышает ликвидность", score: 100 },
	          { code: "normal", label: "Окружение типовое для региона", score: 75 },
	          { code: "weak", label: "Окружение ограничивает спрос", score: 35 }
	        ] },
	        { code: "REALTY-LIQUIDITY-USE", name: "Альтернативное использование", defaultValue: "available", values: [
	          { code: "available", label: "Возможны альтернативные сценарии использования", score: 100 },
	          { code: "limited", label: "Альтернативное использование ограничено", score: 60 },
	          { code: "none", label: "Альтернативное использование не просматривается", score: 20 }
	        ] }
	      ] }
    ];
  }
  return [
    { code: "GEN-ID", title: "Наличие и идентификация", weight: 35, items: [
      { code: "GEN-ID-LOCATION", name: "Местонахождение объекта", defaultValue: "confirmed", values: [
        { code: "confirmed", label: "Объект находится по заявленному адресу", score: 100 },
        { code: "partial", label: "Местонахождение подтверждено ответственным лицом", score: 65 },
        { code: "missing", label: "Объект не найден по заявленному адресу", score: 0 }
      ] },
	      { code: "GEN-ID-MARKING", name: "Маркировка и номера", defaultValue: "match", values: [
	        { code: "match", label: "Маркировка и номера соответствуют документам", score: 100 },
	        { code: "partial", label: "Маркировка читается частично", score: 55 },
	        { code: "mismatch", label: "Маркировка не соответствует документам", score: 10 }
	      ] },
	      { code: "GEN-ID-OWNER", name: "Право владения", defaultValue: "confirmed", values: [
	        { code: "confirmed", label: "Право владения подтверждено", score: 100 },
	        { code: "need-check", label: "Право требует дополнительной проверки", score: 55 },
	        { code: "not-confirmed", label: "Право владения не подтверждено", score: 0 }
	      ] },
	      { code: "GEN-ID-ACCESS", name: "Доступ к объекту", defaultValue: "available", values: [
	        { code: "available", label: "Доступ к объекту обеспечен", score: 100 },
	        { code: "limited", label: "Доступ ограничен по времени или режиму", score: 60 },
	        { code: "blocked", label: "Доступ к объекту отсутствует", score: 15 }
	      ] }
	    ] },
    { code: "GEN-CONDITION", title: "Физическое состояние", weight: 40, items: [
      { code: "GEN-CONDITION-WORK", name: "Работоспособность", defaultValue: "work", values: [
        { code: "work", label: "Объект работоспособен", score: 100 },
        { code: "service", label: "Требуется обслуживание без остановки эксплуатации", score: 60 },
        { code: "broken", label: "Работоспособность не подтверждена", score: 15 }
      ] },
	      { code: "GEN-CONDITION-STORAGE", name: "Условия хранения", defaultValue: "ok", values: [
	        { code: "ok", label: "Условия хранения соответствуют типу объекта", score: 100 },
	        { code: "attention", label: "Есть замечания к условиям хранения", score: 60 },
	        { code: "bad", label: "Условия хранения создают риск ухудшения", score: 20 }
	      ] },
	      { code: "GEN-CONDITION-WEAR", name: "Износ объекта", defaultValue: "normal", values: [
	        { code: "low", label: "Износ не влияет на стоимость", score: 100 },
	        { code: "normal", label: "Износ умеренный", score: 65 },
	        { code: "high", label: "Износ существенно снижает стоимость", score: 20 }
	      ] },
	      { code: "GEN-CONDITION-SAFETY", name: "Безопасность эксплуатации", defaultValue: "safe", values: [
	        { code: "safe", label: "Эксплуатация безопасна", score: 100 },
	        { code: "attention", label: "Есть замечания по безопасности", score: 60 },
	        { code: "danger", label: "Эксплуатация небезопасна", score: 10 }
	      ] }
	    ] },
    { code: "GEN-DOCS", title: "Документы и фото", weight: 25, items: [
      { code: "GEN-DOCS-COMPLETE", name: "Комплектность документов", defaultValue: "complete", values: [
        { code: "complete", label: "Комплект документов достаточен", score: 100 },
        { code: "partial", label: "Не хватает отдельных подтверждающих документов", score: 55 },
        { code: "missing", label: "Ключевые документы отсутствуют", score: 10 }
      ] },
	      { code: "GEN-DOCS-PHOTOS", name: "Фотофиксация", defaultValue: "partial", values: [
	        { code: "complete", label: "Фотофиксация выполнена по всем ракурсам", score: 100 },
	        { code: "partial", label: "Фотофиксация выполнена частично", score: 65 },
	        { code: "missing", label: "Фотофиксация отсутствует", score: 10 }
	      ] },
	      { code: "GEN-DOCS-INSURANCE", name: "Страховые документы", defaultValue: collateral?.insuranceStatus === "Оплачена" ? "valid" : "attention", values: [
	        { code: "valid", label: "Страховые документы действуют", score: 100 },
	        { code: "attention", label: "Страховые документы требуют обновления", score: 55 },
	        { code: "missing", label: "Страховые документы отсутствуют", score: 10 }
	      ] },
	      { code: "GEN-DOCS-VALUATION", name: "Документы оценки", defaultValue: collateral?.appraisalStatus === "Действует" ? "valid" : "attention", values: [
	        { code: "valid", label: "Отчет оценки актуален", score: 100 },
	        { code: "attention", label: "Отчет оценки близок к истечению", score: 60 },
	        { code: "expired", label: "Отчет оценки истек", score: 15 }
	      ] }
	    ] }
  ];
}

function renderTaskFormGrid(fields, className = "task-form-grid") {
  return `
    <div class="${className}">
      ${fields.map((field) => renderTaskField(field)).join("")}
    </div>
  `;
}

function renderTaskField(field) {
  const value = field.value ?? "";
  const classes = ["task-field", field.wide ? "wide" : "", field.full ? "full-span" : ""].filter(Boolean).join(" ");
  if (field.textarea) {
    return `<label class="${classes}">${escapeHtml(field.label)}<textarea ${field.readonly ? "readonly" : ""}>${escapeHtml(value)}</textarea></label>`;
  }
  if (field.type === "select") {
    const options = [...new Set([...(field.options || []), value].filter((item) => item !== undefined && item !== null && item !== ""))];
    return `<label class="${classes}">${escapeHtml(field.label)}<select>${options.map((option) => `<option ${String(option) === String(value) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
  }
  return `<label class="${classes}">${escapeHtml(field.label)}<input type="${escapeHtml(field.type || "text")}" value="${escapeHtml(value)}" ${field.readonly ? "readonly" : ""}></label>`;
}

function renderMonitoringTaskBlock(task, collateral) {
  if (!collateral) return `<section class="panel"><p class="hint">Для задачи мониторинга не найден связанный объект залога.</p></section>`;
  return `
    <section class="monitoring-task-layout">
      <section class="panel">
        <div class="panel-title"><h2>Проверка состояния</h2><span class="panel-note">${escapeHtml(collateral.id)}</span></div>
        ${renderInfoGrid({
          "Последний осмотр": collateral.monitoring?.lastInspection,
          "Следующий осмотр": collateral.monitoring?.nextInspection,
          "Периодичность": collateral.monitoring?.periodicity,
          "Текущее состояние": collateral.monitoring?.condition,
          "Риск-состояние": collateral.riskState,
          "Адрес / местонахождение": collateral.address
        })}
        <label>Комментарий мониторинга<textarea>${escapeHtml(task.result)}</textarea></label>
      </section>
      <section class="panel">
        <div class="panel-title"><h2>Сигналы риска</h2><span class="panel-note">${escapeHtml(collateral.id)}</span></div>
        ${renderRiskPanel(collateral)}
      </section>
      ${renderInsuranceBlock(collateral, { note: collateral.id, description: "Компонент повторяет данные страхования из карточки выбранного залога." })}
    </section>
  `;
}

function renderPledgeOperationBlock(task, collateral) {
  return `
    <section class="task-specific-form pledge-operation-form">
      <section class="panel">
        <h2>${escapeHtml(task.type)}: регистрационные данные</h2>
        ${renderInfoGrid({
          "Объект": collateral?.description,
          "Статус обременения": collateral?.encumbrances?.[0]?.status,
          "Источник данных": collateral?.source,
          "Внешняя проверка": collateral?.externalData?.["Дата проверки"]
        })}
        <label>Основание операции<textarea>Операция выполняется по заявке и проверенным данным внешних источников.</textarea></label>
      </section>
      ${renderInsuranceBlock(collateral, { note: collateral?.id || "", description: "Единый блок страхования активного залога. Данные полиса не редактируются в задаче." })}
      <section class="panel integration-call">
        <h2>Интеграционный вызов АБС</h2>
        <p>Метод: передача статуса залога и результата задачи. До завершения задачи статус обмена фиксируется системой.</p>
        <button class="btn btn-primary" data-action="send-abs" data-task="${task.id}">Передать в АБС</button>
      </section>
    </section>
  `;
}

function renderTaskDocumentsPanel(task, collaterals, activeCollateral) {
  return renderDocumentWidget({
    context: "task",
    ownerId: task.id,
    task,
    documents: task.documents || [],
    collaterals,
    activeCollateral,
    title: "Документы",
    subtitle: "Единый контейнер файлов задачи",
    description: "Файлы привязываются к задаче и выбранному залогу."
  });
}

function renderTaskExpertConclusion(task, collateral) {
  const defaults = getTaskExpertDefaults(task, collateral);
  const canGenerate = isInspectionTaskType(task.type) || isRevaluationTaskType(task.type);
  return `
    <section class="panel expert-conclusion-panel">
      <div class="panel-title">
        <div><h2>Экспертное заключение</h2><p class="hint">Единый блок для фиксации комментариев и итоговых выводов по задаче.</p></div>
        ${canGenerate ? `<button class="btn btn-secondary" data-action="generate-task-conclusion" data-task="${task.id}">Сформировать заключение</button>` : ""}
      </div>
      <div class="expert-conclusion-grid">
        <label>Комментарии<textarea data-task-expert="expertComment" data-task="${task.id}">${escapeHtml(task.expertComment ?? defaults.comment)}</textarea></label>
        <label>Выводы<textarea data-task-expert="expertConclusion" data-task="${task.id}">${escapeHtml(task.expertConclusion ?? defaults.conclusion)}</textarea></label>
      </div>
    </section>
  `;
}

function getTaskExpertDefaults(task, collateral) {
  if (isInspectionTaskType(task.type)) return { comment: task.result || "По результатам осмотра необходимо зафиксировать состояние объекта.", conclusion: `Объект ${collateral?.id || ""} может быть принят к дальнейшей работе после проверки документов и фото.` };
  if (isRevaluationTaskType(task.type)) return { comment: task.result || "Оценка выполняется с учетом рыночных аналогов.", conclusion: `Стоимость объекта ${collateral?.id || ""} требует подтверждения расчетом.` };
  if (isMonitoringTaskType(task.type)) return { comment: task.result || "Мониторинг выполняется по активному объекту залога.", conclusion: `По объекту ${collateral?.id || ""} требуется зафиксировать результат контроля.` };
  return { comment: task.result || "Комментарий исполнителя по результату обработки задачи.", conclusion: "Результат задачи зафиксирован и готов к дальнейшему маршруту." };
}

function renderTaskRoute(task, role) {
  const canCreateFollowup = role.permissions.createTask;
  const showInspectionTask = canCreateFollowup && isMonitoringTaskType(task.type);
  const showRevaluationTask = canCreateFollowup && (isMonitoringTaskType(task.type) || isInspectionTaskType(task.type));
  const showMobileInspectionActions = canCreateFollowup && isInspectionTaskType(task.type);
  return `
    <section class="panel task-route-panel">
      <h2>Маршрут</h2>
      <div class="timeline">${(task.route || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      <div class="route-actions">
        <button class="btn btn-secondary" data-action="add-approver" data-task="${task.id}">Добавить согласующего</button>
        ${showInspectionTask ? `<button class="btn btn-secondary" data-action="create-followup-task" data-task="${task.id}" data-task-type="Первичный осмотр">Создать задачу на осмотр</button>` : ""}
        ${showRevaluationTask ? `<button class="btn btn-primary" data-action="create-followup-task" data-task="${task.id}" data-task-type="Единичная переоценка">Создать задачу на оценку</button>` : ""}
        ${showMobileInspectionActions ? `<button class="btn btn-secondary" data-action="open-mobile-inspection-task" data-task="${task.id}" data-mobile-kind="employee">Создать задачу на выездной осмотр</button>` : ""}
        ${showMobileInspectionActions ? `<button class="btn btn-secondary" data-action="open-mobile-inspection-task" data-task="${task.id}" data-mobile-kind="client">Отправить запрос клиенту на осмотр</button>` : ""}
      </div>
    </section>
  `;
}

function renderTaskHistory(task) {
  return `
    <section class="panel task-history-panel">
      <h2>История действий по задаче</h2>
      <div class="task-history-list">
        ${(task.history || []).map((item) => `
          <article class="task-history-event">
            <div><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.date)} - ${escapeHtml(item.user)}</span></div>
            ${badge(item.status)}
            <p>${escapeHtml(item.comment)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRiskPanel(collateral) {
  return `<div class="risk-panel">${(collateral?.risks || []).map((risk) => `<div class="risk-item ${risk.level === "critical" ? "critical" : risk.level === "warn" ? "warn" : "ok"}"><span>${escapeHtml(risk.name)}</span><small>${escapeHtml(risk.source)}</small><strong>${escapeHtml(risk.level === "critical" ? "Критично" : risk.level === "warn" ? "Внимание" : "Норма")}</strong></div>`).join("")}</div>`;
}

function riskTone(collateral) {
  if (collateral?.riskState === "Критическое" || collateral?.riskScore >= 75) return "danger";
  if (collateral?.riskState === "Требует внимания" || collateral?.riskScore >= 45) return "warn";
  return "ok";
}

function renderInsuranceFields(collateral) {
  const insurance = collateral?.insurance || {};
  return renderInfoGrid({
    "Страховая компания": insurance.company,
    "Номер полиса": insurance.policy,
    "Срок действия с": insurance.from,
    "Срок действия до": insurance.to,
    "Страховая сумма": formatMoney(insurance.amount || 0),
    "Оплата премии": insurance.premiumStatus,
    "Источник": insurance.source,
    "Статус в карточке": collateral?.insuranceStatus
  });
}

function renderInsuranceBlock(collateral, options = {}) {
  const { note = "", description = "Параметры страхования поступают из конвейера или АБС и не редактируются в Залоговом модуле." } = options;
  return `
    <section class="panel insurance-panel">
      <div class="panel-title">
        <div><h2>Страхование</h2><p class="hint">${escapeHtml(description)}</p></div>
        ${note ? `<span class="panel-note">${escapeHtml(note)}</span>` : ""}
      </div>
      ${renderInsuranceFields(collateral)}
    </section>
  `;
}

function getCollateralPhotoAngles(collateral) {
  if (collateral?.type === "Автотранспорт") return ["VIN", "Госномер", "Вид спереди", "Вид сзади", "Шины", "Панель приборов"];
  if (collateral?.type === "Недвижимость") return ["Фасад", "Входная группа", "Помещение 1", "Помещение 2", "Кадастровая табличка"];
  if (collateral?.type === "Скот") return ["Общий вид стада", "Бирки", "Место содержания", "Кормовая зона"];
  return ["Общий вид", "Маркировка", "Состояние", "Место хранения"];
}

function getTaskPhotoValue(task, collateralId, angle) {
  return task.photoShots?.[collateralId]?.[angle] || state.mobile.employeePhotos[`${task.id}::${collateralId}::${angle}`] || state.mobile.clientPhotos[`${task.id}::${collateralId}::${angle}`];
}

function getMobilePhotoValue(kind, taskId, collateralId, angle) {
  const store = kind === "client" ? state.mobile.clientPhotos : state.mobile.employeePhotos;
  return store[`${taskId}::${collateralId}::${angle}`];
}

function getMobileInspectionProgress(task, collateral) {
  const collateralId = collateral?.id || task?.collateralId || "";
  const kind = task?.mobileKind === "clientInspection" || task?.type === "Клиентский осмотр" ? "client" : "employee";
  const angles = getCollateralPhotoAngles(collateral);
  const done = angles.filter((angle) => getMobilePhotoValue(kind, task.id, collateralId, angle)).length;
  return { done, total: angles.length, angles, kind };
}

function getRelatedMobileInspectionTasks(task) {
  if (!task?.id) return [];
  return state.data.tasks.filter((item) => item.parentTaskId === task.id && isMobileInspectionTaskType(item.type));
}

function renderMobileInspectionResults(task, collateral) {
  const related = getRelatedMobileInspectionTasks(task);
  if (!related.length) return "";
  return `
    <section class="panel mobile-inspection-results-panel">
      <div class="panel-title">
        <div><h2>Результаты выездного/клиентского осмотра</h2><p class="hint">Данные поступают из созданных мобильных подзадач и отображаются в основной задаче осмотра.</p></div>
        ${badge(`${related.length} подзадач`, "info")}
      </div>
      <div class="mobile-inspection-results">
        ${related.map((item) => {
          const itemCollateral = getCollateral(item.collateralId) || collateral;
          const result = getMobileInspectionProgress(item, itemCollateral);
          const isClient = result.kind === "client";
          return `
            <article class="mobile-result-card">
              <div class="mobile-result-head">
                <div>
                  <strong>${escapeHtml(item.type)}</strong>
                  <span>${escapeHtml(item.id)} · ${escapeHtml(itemCollateral?.id || item.collateralId || "-")}</span>
                </div>
                <div class="status-stack">${badge(item.status)}${badge(`${result.done}/${result.total} фото`, result.done === result.total ? "ok" : "warn")}</div>
              </div>
              <div class="mobile-result-meta">
                <div><span>${isClient ? "Контакт клиента" : "Исполнитель"}</span><strong>${escapeHtml(isClient ? item.clientContact || item.client : item.assignee)}</strong></div>
                <div><span>Срок</span><strong>${escapeHtml(item.dueDate)}</strong></div>
                <div><span>Результат</span><strong>${escapeHtml(item.result || "Ожидается")}</strong></div>
              </div>
              <div class="mobile-result-photos">
                ${result.angles.map((angle) => {
                  const photo = getMobilePhotoValue(result.kind, item.id, itemCollateral?.id || item.collateralId, angle);
                  return `<span class="mobile-photo-chip ${photo ? "done" : ""}">${escapeHtml(angle)}${photo ? `: ${escapeHtml(photo.name)}` : ""}</span>`;
                }).join("")}
              </div>
              <div class="inline-actions">
                <button class="btn btn-secondary" data-route="${isClient ? `/mobile/client/tasks/${item.id}/photos` : `/mobile/employee/tasks/${item.id}/photos`}">Открыть мобильный экран</button>
                <button class="btn btn-secondary" data-route="/app/tasks/${item.id}">Открыть подзадачу</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderCollateralPhotoShots(task, collateral) {
  if (!collateral) return "";
  const angles = getCollateralPhotoAngles(collateral);
  return `
    <div class="panel collateral-photo-panel">
      <div class="panel-title"><div><h2>Фото снимки объекта залога</h2><p class="hint">Фото прикрепляются по каждому обязательному ракурсу с привязкой к задаче ${escapeHtml(task.id)} и залогу ${escapeHtml(collateral.id)}.</p></div>${badge(`${angles.length} ракурсов`, "info")}</div>
      <div class="collateral-photo-list">
        ${angles.map((angle) => {
          const photo = getTaskPhotoValue(task, collateral.id, angle);
          return `
            <div class="collateral-photo-row ${photo ? "done" : "missing"}">
              <div class="photo-shot-icon">${photo ? "JPG" : "!"}</div>
              <div><strong>${escapeHtml(angle)}</strong><span>${escapeHtml(photo?.name || "Фото не прикреплено")}</span></div>
              <div class="collateral-photo-actions">
                <label class="btn btn-secondary file-button">Прикрепить<input type="file" accept="image/*" data-task-photo-file="${task.id}::${collateral.id}::${escapeHtml(angle)}"></label>
                <button class="btn btn-secondary" data-action="attach-task-photo" data-task="${task.id}" data-collateral="${collateral.id}" data-angle="${escapeHtml(angle)}">Демо-фото</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderRevaluationTaskBlock(task, collateral) {
  const matrix = getMarketAnalogMatrix(task, collateral);
  const valueCalc = getRevaluationValueCalculation(collateral, matrix);
  return `
    <section class="task-specific-form revaluation-task-form">
      ${renderValuationInspectionBlock(task, collateral)}
      ${renderIndependentValuationBlock(collateral)}
      ${renderTaskRiskAssessment(task, collateral)}
      ${renderValuationCostsBlock(collateral)}
      <section class="panel market-analysis-panel">
        <div class="panel-title">
          <div><h2>Анализ рынка аналогичных объектов в регионе</h2><p class="hint">Один столбец таблицы соответствует одному сопоставимому объекту. Характеристики и корректировки доступны для ручной правки.</p></div>
          <button class="btn btn-secondary" data-action="search-analogs" data-task="${task.id}">Найти аналоги</button>
        </div>
        <div class="market-analysis-controls">
          <label>Регион анализа<input value="${escapeHtml(collateral?.region || "Регион не указан")}" /></label>
          <label>Тип залога<input value="${escapeHtml(collateral?.type || "Не указан")}" /></label>
          <label>Дата анализа<input type="date" value="2026-06-16" /></label>
        </div>
        ${renderMarketAnalogMatrix(task, collateral, matrix)}
      </section>
      ${renderValuationValueBlock(collateral, valueCalc)}
    </section>
  `;
}

function renderValuationInspectionBlock(task, collateral) {
  const result = getInspectionResult(task, collateral);
  return `
    <section class="panel task-form-panel">
      <div class="panel-title">
        <div><h2>Осмотр объекта залога</h2><p class="hint">Данные первичного/повторного осмотра, используемые при единичной переоценке.</p></div>
      </div>
      ${renderTaskFormGrid([
        { label: "Требуется первичный осмотр", value: "ДА", type: "select", options: ["ДА", "НЕТ"] },
        { label: "Первичный осмотр проведен", value: result.state === "Неудовлетворительное" ? "НЕТ" : "ДА", type: "select", options: ["ДА", "НЕТ"] },
        { label: "Дата осмотра", value: collateral?.monitoring?.lastInspection || "2026-06-01", type: "date" },
        { label: "Тип первичного осмотра", value: "Дистанционный", type: "select", options: ["Дистанционный", "Выездной", "Документарный"] },
        { label: "Ресурс для осмотра", value: task.assignee || "Сотрудник Банка", type: "select", options: ["Сотрудник Банка", "Аутсорсер", task.assignee || "Сотрудник Банка"] },
        { label: "Результат первичного осмотра", value: result.state, type: "select", options: ["Удовлетворительное", "Требует внимания", "Неудовлетворительное"] },
        { label: "Балл", value: result.score, type: "number" }
      ], "task-form-grid compact")}
    </section>
  `;
}

function renderIndependentValuationBlock(collateral) {
  const evaluation = collateral?.evaluations?.[0] || {};
  const market = Number(evaluation.market || collateral?.marketValue || 0);
  const methods = getValuationMethods(collateral, market);
  return `
    <section class="panel task-form-panel">
      <div class="panel-title">
        <div><h2>Независимая оценка объекта залога</h2></div>
        ${badge(collateral?.appraisalStatus || "Не указано")}
      </div>
      ${renderTaskFormGrid([
        { label: "Требуется независимая оценка", value: "ДА", type: "select", options: ["ДА", "НЕТ"] },
        { label: "Независимая оценка проведена", value: evaluation.date ? "ДА" : "НЕТ", type: "select", options: ["ДА", "НЕТ"] },
        { label: "Дата оценки", value: evaluation.date || "2026-06-01", type: "date" },
        { label: "Аккредитованный оценщик", value: evaluation.appraiser || "OOO ELEKTRON BAHOLASH" },
        { label: "Статус аккредитации", value: "Действующая", type: "select", options: ["Действующая", "Требует проверки", "Не аккредитована"] },
        { label: "Тип независимой оценки", value: evaluation.method || "Все методы" }
      ], "task-form-grid compact")}
      <div class="method-table-wrap">
        <table class="method-table">
          <thead><tr><th>Метод оценки</th>${methods.map((item) => `<th>${escapeHtml(item.name)}</th>`).join("")}</tr></thead>
          <tbody>
            <tr><td>Результат оценки</td>${methods.map((item) => `<td><input value="${escapeHtml(formatMoney(item.value))}"></td>`).join("")}</tr>
            <tr><td>Вес оценки</td>${methods.map((item) => `<td><div class="percent-input"><input value="${escapeHtml(item.weight)}"><span>%</span></div></td>`).join("")}</tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function getValuationMethods(collateral, market) {
  const isRealty = collateral?.type === "Недвижимость";
  return [
    { name: "Доходный метод", value: Math.round(market * (isRealty ? 0.73 : 0.89)), weight: isRealty ? 30 : 30 },
    { name: "Сравнительный метод", value: Math.round(market * (isRealty ? 1.21 : 1.15)), weight: isRealty ? 40 : 50 },
    { name: "Затратный метод", value: Math.round(market * (isRealty ? 1.03 : 1.27)), weight: isRealty ? 30 : 20 }
  ];
}

function renderTaskRiskAssessment(task, collateral) {
  const result = calculateValuationRiskResult(task, collateral);
  return `
    <section class="panel risk-assessment-panel">
      <div class="panel-title">
        <div><h2>Оценка рисков объекта залога</h2></div>
        <div class="status-stack">${badge(result.liquidity, result.tone)}${badge(`Балл ${result.score}`, result.tone)}</div>
      </div>
      <div class="valuation-risk-summary">
        <div><span>Ликвидность</span><strong>${escapeHtml(result.liquidity)}</strong></div>
        <div><span>Срок экспозиции</span><strong>${escapeHtml(result.exposurePeriod)}</strong></div>
        <div><span>Диапазон мастер-шкалы</span><strong>${result.scale.min}-${result.scale.max}</strong></div>
      </div>
      <div class="risk-factor-grid">
        ${result.groups.map((group) => `
          <article class="risk-factor-group">
            <div class="inspection-factor-group-head">
              <h3>${escapeHtml(group.title)}</h3>
              <div><span>Вес группы</span><strong>${group.weight}%</strong></div>
              <div><span>Балл группы</span><strong>${group.weightedScore}</strong></div>
            </div>
            <div class="risk-factor-items">
              ${group.items.map((item) => `
                <div class="inspection-check-row">
                  <div class="inspection-factor-name"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.code)}</span></div>
                  <select data-valuation-risk-factor data-task="${escapeHtml(task.id)}" data-collateral="${escapeHtml(collateral?.id || "")}" data-factor="${escapeHtml(item.code)}" aria-label="${escapeHtml(item.name)}">
                    ${item.values.map((option) => `<option value="${escapeHtml(option.code)}" ${option.code === item.selected.code ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
                  </select>
                  <div class="inspection-factor-score"><strong>${item.score}</strong><span>вес ${item.weight}%</span></div>
                </div>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function getTaskRiskFactorGroups(collateral) {
  const high = collateral?.riskScore >= 70;
  const medium = collateral?.riskScore >= 35;
  return [
    { code: "STOP", title: "Стоп-факторы", weight: 60, items: [
      { code: "STOP-ARREST", name: "Аресты, суды и ограничения", weight: 35, defaultValue: high ? "yes" : "no", values: yesNoRiskValues() },
      { code: "STOP-OWNER", name: "Права третьих лиц", weight: 25, defaultValue: medium ? "yes" : "no", values: yesNoRiskValues() },
      { code: "STOP-CROSS", name: "Двойной залог / кросс-связь", weight: 20, defaultValue: collateral?.crossPledge ? "yes" : "no", values: yesNoRiskValues() },
      { code: "STOP-REGISTRATION", name: "Регистрационные ограничения", weight: 20, defaultValue: high ? "yes" : "no", values: yesNoRiskValues() }
    ] },
    { code: "RISK", title: "Риск-факторы", weight: 40, items: [
      { code: "RISK-DEMAND", name: "Спрос и ликвидность объекта", weight: 25, defaultValue: medium ? "medium" : "minimal", values: liquidityRiskValues() },
      { code: "RISK-CONDITION", name: "Физическое состояние объекта", weight: 25, defaultValue: high ? "high" : "minimal", values: liquidityRiskValues() },
      { code: "RISK-ANALOGS", name: "Доступность аналогов", weight: 15, defaultValue: "absent", values: liquidityRiskValues() },
      { code: "RISK-MARKET", name: "Изменение рыночной стоимости", weight: 15, defaultValue: medium ? "medium" : "minimal", values: liquidityRiskValues() },
      { code: "RISK-LTV", name: "Ухудшение LTV", weight: 10, defaultValue: high ? "high" : "minimal", values: liquidityRiskValues() },
      { code: "RISK-COSTS", name: "Расходы на реализацию", weight: 10, defaultValue: "medium", values: liquidityRiskValues() }
    ] }
  ];
}

function yesNoRiskValues() {
  return [
    { code: "no", label: "Нет", score: 0 },
    { code: "yes", label: "Да", score: 100 }
  ];
}

function liquidityRiskValues() {
  return [
    { code: "absent", label: "Риск отсутствует", score: 0 },
    { code: "minimal", label: "Риск минимальный", score: 25 },
    { code: "medium", label: "Риск средний", score: 60 },
    { code: "high", label: "Риск высокий", score: 100 }
  ];
}

function calculateValuationRiskResult(task, collateral) {
  const groups = getTaskRiskFactorGroups(collateral).map((group) => {
    const items = group.items.map((factor, index) => {
      const selected = getValuationRiskSelectedOption(task, collateral, factor);
      const factorWeight = Number(factor.weight ?? Math.round(100 / Math.max(1, group.items.length || index + 1)));
      const maxScore = Math.max(...factor.values.map((item) => item.score));
      const weightedFactorScore = selected.score * (factorWeight / 100);
      const maxWeightedFactorScore = maxScore * (factorWeight / 100);
      return { ...factor, weight: factorWeight, selected, score: selected.score, maxScore, weightedFactorScore, maxWeightedFactorScore };
    });
    const rawScore = items.reduce((sum, item) => sum + item.weightedFactorScore, 0);
    const maxRawScore = items.reduce((sum, item) => sum + item.maxWeightedFactorScore, 0);
    const weightedScore = Math.round(rawScore * (group.weight / 100));
    const maxWeightedScore = Math.round(maxRawScore * (group.weight / 100));
    return { ...group, items, rawScore, maxRawScore, weightedScore, maxWeightedScore };
  });
  const score = Math.max(0, Math.round(groups.reduce((sum, group) => sum + group.weightedScore, 0)));
  const maxScore = Math.max(1, groups.reduce((sum, group) => sum + group.maxWeightedScore, 0));
  const scale = getValuationRiskMasterScale(score, maxScore);
  return { groups, score, maxScore, scale, liquidity: scale.liquidity, exposurePeriod: scale.exposurePeriod, tone: scale.tone };
}

function getValuationRiskMasterScale(score, maxScore = 100) {
  const low = Math.round(maxScore * 0.2);
  const medium = Math.round(maxScore * 0.45);
  const high = Math.round(maxScore * 0.7);
  if (score <= low) return { liquidity: "Высокая", exposurePeriod: "до 3 месяцев", min: 0, max: low, tone: "ok" };
  if (score <= medium) return { liquidity: "Средняя", exposurePeriod: "3-6 месяцев", min: low + 1, max: medium, tone: "info" };
  if (score <= high) return { liquidity: "Низкая", exposurePeriod: "6-12 месяцев", min: medium + 1, max: high, tone: "warn" };
  return { liquidity: "Критически низкая", exposurePeriod: "свыше 12 месяцев", min: high + 1, max: maxScore, tone: "danger" };
}

function getValuationRiskSelectedOption(task, collateral, factor) {
  const value = task?.valuationRiskAnswers?.[collateral?.id]?.[factor.code] || factor.defaultValue || factor.values[0]?.code;
  return factor.values.find((item) => item.code === value) || factor.values[0];
}

function updateTaskValuationRiskFactor(fieldEl) {
  const task = getTask(fieldEl.dataset.task);
  if (!task || !fieldEl.dataset.collateral || !fieldEl.dataset.factor) return;
  task.valuationRiskAnswers = task.valuationRiskAnswers || {};
  task.valuationRiskAnswers[fieldEl.dataset.collateral] = task.valuationRiskAnswers[fieldEl.dataset.collateral] || {};
  task.valuationRiskAnswers[fieldEl.dataset.collateral][fieldEl.dataset.factor] = fieldEl.value;
}

function renderValuationCostsBlock(collateral) {
  const costs = getValuationCosts(collateral);
  return `
    <section class="panel task-form-panel valuation-costs-panel">
      <div class="panel-title">
        <div><h2>Затраты на содержание и реализацию объекта залога</h2><p class="hint">Проценты используются в формуле расчета расходов на реализацию.</p></div>
        ${badge(`Итого ${costs.total}%`, costs.total > 8 ? "warn" : "info")}
      </div>
      ${renderTaskFormGrid(costs.items.map((item) => ({ label: item.label, value: item.value, type: "number" })), "task-form-grid compact")}
    </section>
  `;
}

function getValuationCosts(collateral) {
  const isRealty = collateral?.type === "Недвижимость";
  const items = [
    { label: "Затраты на фондирование на период, %", value: isRealty ? "4.19" : "4.19" },
    { label: "Оплата услуг по реализации, %", value: isRealty ? "0.74" : "0.74" },
    { label: "Организация торгов по реализации, %", value: isRealty ? "1.73" : "1.73" },
    { label: "Оформление собственности, %", value: isRealty ? "1.23" : "1.23" },
    { label: "Организация охраны, %", value: isRealty ? "0.00" : "0.05" },
    { label: "Ставка страховой компании, %", value: "0.05" },
    { label: "Коммунальные услуги, %", value: isRealty ? "0.00" : "0.00" },
    { label: "Налог на имущество, %", value: isRealty ? "0.00" : "0.00" },
    { label: "Транспортировка, %", value: isRealty ? "0.00" : "0.07" },
    { label: "Аренда склада, %", value: isRealty ? "0.00" : "0.02" },
    { label: "Мониторинг и оценка, %", value: "0.02" }
  ];
  const total = Number(items.reduce((sum, item) => sum + Number(item.value), 0).toFixed(2));
  return { items, total };
}

function renderValuationValueBlock(collateral, calc) {
  return `
    <section class="panel task-form-panel valuation-value-panel" data-valuation-value-panel data-collateral="${escapeHtml(collateral?.id || "")}">
      <div class="panel-title">
        <div><h2>Определение стоимости объекта залога</h2></div>
        <button class="btn btn-secondary" data-action="recalculate-valuation" data-collateral="${escapeHtml(collateral?.id || "")}">Обновить расчет</button>
      </div>
      <div class="valuation-formula-grid">
        <div><span>Рыночная стоимость</span><strong data-valuation-field="marketValue">${formatMoney(calc.marketValue)}</strong></div>
        <div><span>Залоговый дисконт</span><strong data-valuation-field="discount">${calc.discount}%</strong></div>
        <div><span>Залоговая стоимость</span><strong data-valuation-field="pledgeValue">${formatMoney(calc.pledgeValue)}</strong></div>
        <div><span>Предполагаемый срок реализации</span><strong data-valuation-field="realizationYears">${calc.realizationYears} года</strong></div>
        <div><span>CoR</span><strong data-valuation-field="cor">${calc.cor}%</strong></div>
        <div><span>Дисконтированная стоимость</span><strong data-valuation-field="discountedValue">${formatMoney(calc.discountedValue)}</strong></div>
      </div>
      ${renderTaskFormGrid([
        { label: "Дополнительные данные по оценке объекта", value: calc.comment, textarea: true, wide: true },
        { label: "Выводы", value: calc.conclusion, textarea: true, wide: true }
      ])}
    </section>
  `;
}

function getRevaluationValueCalculation(collateral, matrix) {
  const marketValue = matrix.finalMarketValue || collateral?.marketValue || 0;
  const baseDiscount = collateral?.marketValue ? Math.max(10, Math.round((1 - (collateral?.pledgeValue || 0) / collateral.marketValue) * 10000) / 100) : 30;
  const riskAdd = collateral?.riskScore >= 70 ? 10 : collateral?.riskScore >= 35 ? 5 : 0;
  const discount = Number((baseDiscount + riskAdd).toFixed(2));
  const pledgeValue = Math.round(marketValue * (1 - discount / 100));
  const realizationYears = collateral?.type === "Недвижимость" ? 4 : 3;
  const cor = 3.6;
  const discountedValue = Math.round(pledgeValue / Math.pow(1 + cor / 100, realizationYears));
  return {
    marketValue,
    discount,
    pledgeValue,
    realizationYears,
    cor,
    discountedValue,
    comment: "Обеспечение степени ликвидности объекта залога, допущения и ограничения в отношении определенной стоимости объекта залога, иные комментарии.",
    conclusion: `Ликвидность имущества может быть оценена как ${collateral?.riskScore >= 45 ? "средняя" : "очень высокая"}, ожидаемый срок продажи не превысит ${realizationYears * 12} месяцев.`
  };
}

function getMarketAnalogMatrix(task, collateral) {
  const isAuto = collateral?.type === "Автотранспорт";
  const isRealty = collateral?.type === "Недвижимость";
  const source = isAuto ? marketAnalogs.filter((item) => item.source.includes("Avtoelon")) : isRealty ? marketAnalogs.filter((item) => item.source.includes("OLX")) : marketAnalogs;
  const savedAdjustments = task?.marketAnalogAdjustments?.[collateral?.id || "default"] || {};
  const sourcePool = source.length ? source : marketAnalogs;
  const columns = Array.from({ length: 3 }, (_, index) => {
    const item = sourcePool[index] || sourcePool[index % Math.max(1, sourcePool.length)] || {};
    const price = item.price || (collateral?.marketValue || 0);
    const correction = Number(String(item.correction || "0").replace(/[+%]/g, "")) || [2, -1, 0][index] || 0;
    const defaultAdjustments = [correction, -1, 0, 1, -0.5];
    const adjustments = defaultAdjustments.map((value, rowIndex) => {
      const savedValue = savedAdjustments?.[index]?.[rowIndex];
      return savedValue === undefined ? value : parseNumericInput(savedValue);
    });
    return {
      title: `Залог-аналог ${index + 1}`,
      source: item.source || "Экспертный источник",
      name: item.object || collateral?.description || "Аналог",
      year: isAuto ? "2021-2022" : "Регистрация 2020-2022",
      details: isAuto ? "Пробег и состояние сопоставимы" : "Площадь, локация и состояние сопоставимы",
      offerDate: "2026-06-12",
      price,
      link: `${item.source || "Источник"} / карточка аналога`,
      dynamic: [collateral?.type || "Иное", collateral?.region || "Регион", collateral?.address || "Местонахождение", "Состояние сопоставимо", "Требует экспертной проверки"],
      adjustments
    };
  });
  const normalized = columns.map((column) => {
    const totalCorrection = Number(column.adjustments.reduce((sum, value) => sum + value, 0).toFixed(1));
    const adjustedPrice = Math.round(column.price * (1 + totalCorrection / 100));
    return { ...column, totalCorrection, adjustedPrice };
  });
  const finalMarketValue = Math.round(normalized.reduce((sum, column) => sum + column.adjustedPrice, 0) / normalized.length);
  return {
    columns: normalized,
    dynamicRows: isAuto ? ["Марка / модель", "Регион", "Местонахождение", "Состояние", "Сопоставимость"] : ["Тип имущества", "Регион", "Местонахождение", "Состояние", "Сопоставимость"],
    adjustmentRows: ["Корректировка за год/локацию", "Корректировка за объем/площадь", "Корректировка за комплектацию", "Корректировка за состояние", "Корректировка за торг/ликвидность"],
    totalCorrection: Number((normalized.reduce((sum, column) => sum + column.totalCorrection, 0) / normalized.length).toFixed(1)),
    finalMarketValue,
    recommendation: finalMarketValue > (collateral?.marketValue || 0) ? "Допустить повышение после независимой оценки" : "Назначить повторную независимую оценку"
  };
}

function renderMarketAnalogMatrix(task, collateral, matrix) {
  const context = { taskId: task?.id || "", collateralId: collateral?.id || "" };
  const commonRows = [
    ["Наименование/Модель аналога", (column) => column.name, "manual"],
    ["Год выпуска / Дата регистрации", (column) => column.year, "manual"],
    ["Дополнительные сведения", (column) => column.details, "manual"],
    ["Дата продажи / предложения", (column) => column.offerDate, "manual"],
    ["Цена продажи / предложения", (column) => formatMoney(column.price), "manual"],
    ["Ссылка на источник / Документ-основание", (column) => column.link, "manual source"],
    ["Источник автозаполнения", (column) => column.source, "manual"]
  ];
  return `
    <div class="market-matrix-wrap">
      <table class="market-matrix">
        <thead><tr><th>Характеристика</th>${matrix.columns.map((column) => `<th>${escapeHtml(column.title)}<small>${escapeHtml(column.source)}</small></th>`).join("")}</tr></thead>
        <tbody>
          <tr class="matrix-section"><td colspan="4">1. Характеристики объекта</td></tr>
          ${commonRows.map(([label, getter, mode]) => renderMarketMatrixRow(label, matrix.columns, getter, mode)).join("")}
          ${matrix.dynamicRows.map((label, index) => renderMarketMatrixRow(label, matrix.columns, (column) => column.dynamic[index], "manual")).join("")}
          <tr class="matrix-section"><td colspan="4">2. Корректировка цены, %</td></tr>
          ${matrix.adjustmentRows.map((label, index) => renderMarketMatrixRow(label, matrix.columns, (column) => column.adjustments[index], "percent", { ...context, rowIndex: index })).join("")}
          <tr class="matrix-section"><td colspan="4">3. Автоматические итоговые расчеты</td></tr>
          ${renderMarketMatrixRow("Итого корректировка", matrix.columns, (column) => `${column.totalCorrection}%`, "calculated", { ...context, calcType: "total" })}
          ${renderMarketMatrixRow("Скорректированная цена", matrix.columns, (column) => formatMoney(column.adjustedPrice), "calculated strong", { ...context, calcType: "adjusted" })}
          <tr class="market-final-row"><td>Итоговое значение рыночной стоимости</td><td colspan="3" data-market-final-value data-task="${escapeHtml(context.taskId)}" data-collateral="${escapeHtml(context.collateralId)}">${formatMoney(matrix.finalMarketValue)}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderMarketMatrixRow(label, columns, getter, mode = "manual", context = {}) {
  return `
    <tr class="${mode.includes("calculated") ? "calculated-row" : ""}">
      <td>${escapeHtml(label)}${mode.includes("calculated") ? "" : `<small>ручной ввод</small>`}</td>
      ${columns.map((column, columnIndex) => {
        const value = getter(column);
        if (mode === "percent") return `<td><div class="percent-input"><input value="${escapeHtml(value)}" data-market-adjustment data-task="${escapeHtml(context.taskId || "")}" data-collateral="${escapeHtml(context.collateralId || "")}" data-column="${columnIndex}" data-row="${escapeHtml(context.rowIndex ?? "")}" /><span>%</span></div></td>`;
        if (mode.includes("calculated")) return `<td><strong data-market-calc="${escapeHtml(context.calcType || "")}" data-task="${escapeHtml(context.taskId || "")}" data-collateral="${escapeHtml(context.collateralId || "")}" data-market-column="${columnIndex}">${escapeHtml(value)}</strong></td>`;
        if (mode.includes("source")) return `<td><input value="${escapeHtml(value)}" /></td>`;
        return `<td><textarea>${escapeHtml(value)}</textarea></td>`;
      }).join("")}
    </tr>
  `;
}

function parseNumericInput(value) {
  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace("%", "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function updateMarketAdjustment(fieldEl) {
  const task = getTask(fieldEl.dataset.task);
  const collateral = getCollateral(fieldEl.dataset.collateral);
  if (!task || !collateral) return;
  const columnIndex = Number(fieldEl.dataset.column);
  const rowIndex = Number(fieldEl.dataset.row);
  if (!Number.isInteger(columnIndex) || !Number.isInteger(rowIndex)) return;

  task.marketAnalogAdjustments = task.marketAnalogAdjustments || {};
  task.marketAnalogAdjustments[collateral.id] = task.marketAnalogAdjustments[collateral.id] || {};
  task.marketAnalogAdjustments[collateral.id][columnIndex] = task.marketAnalogAdjustments[collateral.id][columnIndex] || {};
  task.marketAnalogAdjustments[collateral.id][columnIndex][rowIndex] = parseNumericInput(fieldEl.value);

  const matrix = getMarketAnalogMatrix(task, collateral);
  const calc = getRevaluationValueCalculation(collateral, matrix);
  refreshMarketCalculationView(task, collateral, matrix, calc);
}

function refreshMarketCalculationView(task, collateral, matrix, calc) {
  matrix.columns.forEach((column, columnIndex) => {
    document.querySelectorAll(`[data-market-calc="total"][data-task="${task.id}"][data-collateral="${collateral.id}"][data-market-column="${columnIndex}"]`)
      .forEach((el) => { el.textContent = `${column.totalCorrection}%`; });
    document.querySelectorAll(`[data-market-calc="adjusted"][data-task="${task.id}"][data-collateral="${collateral.id}"][data-market-column="${columnIndex}"]`)
      .forEach((el) => { el.textContent = formatMoney(column.adjustedPrice); });
  });
  document.querySelectorAll(`[data-market-final-value][data-task="${task.id}"][data-collateral="${collateral.id}"]`)
    .forEach((el) => { el.textContent = formatMoney(matrix.finalMarketValue); });

  document.querySelectorAll(`[data-valuation-value-panel][data-collateral="${collateral.id}"]`).forEach((panel) => {
    const values = {
      marketValue: formatMoney(calc.marketValue),
      discount: `${calc.discount}%`,
      pledgeValue: formatMoney(calc.pledgeValue),
      realizationYears: `${calc.realizationYears} года`,
      cor: `${calc.cor}%`,
      discountedValue: formatMoney(calc.discountedValue)
    };
    Object.entries(values).forEach(([field, value]) => {
      const target = panel.querySelector(`[data-valuation-field="${field}"]`);
      if (target) target.textContent = value;
    });
  });
}

function renderDocumentWidget({ context, ownerId, task = null, documents = [], collaterals = [], activeCollateral = null, title = "Документы", subtitle = "Единый контейнер файлов", description = "" }) {
  const targets = context === "task" ? (collaterals.length ? collaterals : [activeCollateral].filter(Boolean)) : [];
  const activeTarget = activeCollateral?.id || targets[0]?.id || "task";
  const sourceDocuments = context === "task"
    ? documents.filter((doc) => {
      const target = doc.target || doc.collateralId || activeTarget;
      return target === activeTarget || target === "task";
    })
    : documents;
  const existing = sourceDocuments.map((doc) => ({
    title: doc.title || doc.type || doc.name || "Документ",
    name: doc.name || "Файл прикреплен",
    target: doc.target || doc.collateralId || activeTarget,
    required: doc.required ?? false,
    status: doc.status || "Прикреплен",
    date: doc.date || "2026-06-17"
  }));
  const ruleRows = getDocumentRules(task, activeCollateral).filter((rule) => !existing.some((doc) => doc.title === rule.title && (context !== "task" || doc.target === activeTarget)));
  const rows = [...existing, ...ruleRows.map((rule) => ({ ...rule, name: "", target: activeTarget, status: "Ожидает файл" }))];
  return `
    <section class="panel document-widget">
      <div class="panel-title">
        <div><h2>${escapeHtml(title)}</h2><p class="hint">${escapeHtml(subtitle)}. ${escapeHtml(description)}</p></div>
        ${context === "task" && targets.length > 1 ? `<span class="panel-note">Активный залог: ${escapeHtml(activeTarget)}</span>` : ""}
      </div>
      <div class="document-container">
        ${rows.map((doc) => {
          const hasFile = Boolean(doc.name);
          const targetText = context === "task" ? `Залог: ${doc.target}` : `Карточка: ${ownerId}`;
          return `
            <div class="document-file-row ${hasFile ? "has-file" : "empty-file"}">
              <div>
                <strong>${escapeHtml(doc.title)}</strong>
                <span>${hasFile ? escapeHtml(doc.name) : "Файл еще не прикреплен"}</span>
                <small>${escapeHtml(targetText)} · ${escapeHtml(doc.status)}</small>
              </div>
              <div class="document-file-meta">${doc.required ? badge("Обязательный", "warn") : badge("Дополнительный", "neutral")}${hasFile ? badge("Файл", "ok") : badge("Нет файла", "neutral")}</div>
              <div class="document-row-actions">
                <label class="doc-add-button ${hasFile ? "secondary" : ""}" title="Прикрепить файл">+
                  <input type="file" data-doc-file="${context}::${ownerId}::${escapeHtml(doc.title)}::${escapeHtml(doc.target)}">
                </label>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function getDocumentRules(task, collateral) {
  return documentRules.filter((rule) => {
    const byType = rule.collateralType === "any" || rule.collateralType === collateral?.type;
    const byClient = rule.clientType === "any" || rule.clientType === collateral?.clientType;
    const byTask = !task || rule.taskType === "any" || rule.taskType === task.type;
    return byType && byClient && byTask;
  });
}

function renderContractCard(contractId) {
  const contract = getContract(contractId);
  if (!contract) return renderNotFound("Договор не найден", "/app/contracts");
  const collaterals = contract.collateralIds.map(getCollateral).filter(Boolean);
  return `
    ${renderPageHeader(`Договор ${contract.number}`, `${contract.clientName}. Карточка договора доступна только для просмотра.`, `<button class="btn btn-secondary" data-route="/app/contracts">Назад</button><button class="btn btn-secondary" data-route="/app/print/${contract.id}">Печатная форма</button>`)}
    <section class="object-hero">
      <div><span class="eyebrow">Статус покрытия</span><h2>${badge(contract.coverageStatus)} ${badge(`${contract.ltv}%`, contract.ltv >= 100 ? "danger" : contract.ltv > 70 ? "warn" : "ok")}</h2><p>Категория качества и расчетный резерв получены из АБС и не редактируются в модуле.</p></div>
      <div class="hero-metrics"><div><span>Остаток долга</span><strong>${formatMoney(contract.debt, contract.currency)}</strong></div><div><span>Аллоцированная стоимость</span><strong>${formatMoney(contract.allocatedValue)}</strong></div><div><span>Резерв</span><strong>${formatMoney(contract.reserve)}</strong></div></div>
    </section>
    <section class="grid-2">
      <div class="panel"><h2>Общая информация</h2>${renderInfoGrid({ "Номер": contract.number, "Дата": contract.startDate, "Дата окончания": contract.endDate, "Продукт": contract.product, "Валюта": contract.currency, "Лимит": formatMoney(contract.limit, contract.currency), "Статус": contract.status, "Категория качества": contract.loanQuality })}</div>
      <div class="panel table-panel"><h2>Участники сделки</h2><table><thead><tr><th>Роль</th><th>Наименование/ФИО</th><th>ИНН/ПИНФЛ</th><th>Доля/роль</th><th>Контакт</th></tr></thead><tbody>${contract.participants.map((item) => `<tr><td>${escapeHtml(item.role)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.idn)}</td><td>${escapeHtml(item.share)}</td><td>${escapeHtml(item.contact)}</td></tr>`).join("")}</tbody></table></div>
    </section>
    <section class="panel table-panel"><h2>Связанные залоги</h2><table><thead><tr><th>ID</th><th>Тип</th><th>Описание</th><th>Рыночная</th><th>Залоговая</th><th>Аллоцированная</th><th>Статус</th><th></th></tr></thead><tbody>${collaterals.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.description)}</td><td>${formatMoney(item.marketValue)}</td><td>${formatMoney(item.pledgeValue)}</td><td>${formatMoney(item.allocatedValue)}</td><td>${badge(item.status)}</td><td><button class="btn btn-small" data-route="/app/collaterals/${item.id}">Карточка залога</button></td></tr>`).join("")}</tbody></table></section>
  `;
}

function renderCollateralCard(collateralId, query = new URLSearchParams()) {
  const collateral = getCollateral(collateralId);
  if (!collateral) return renderNotFound("Залог не найден", "/app/collaterals");
  const tabs = [
    ["overview", "Общая информация"], ["monitoring", "Мониторинг и осмотры"], ["values", "Оценки"], ["insurance", "Страхование"], ["contracts", "Договоры и обременения"], ["pledgors", "Залогодатели"], ["risks", "Риски"], ["external", "Внешние данные"], ["documents", "Документы"]
  ];
  const requestedTab = query.get("tab");
  if (tabs.some(([id]) => id === requestedTab)) state.collateralTab = requestedTab;
  if (!tabs.some(([id]) => id === state.collateralTab)) state.collateralTab = "overview";
  return `
    ${renderPageHeader(`${collateral.id} - ${collateral.type}`, collateral.description, `<button class="btn btn-secondary" data-route="/app/collaterals">Назад</button><button class="btn btn-secondary" data-route="/app/tasks/new?collateral=${collateral.id}">Создать задачу</button><button class="btn btn-primary" data-action="refresh-external" data-collateral="${collateral.id}">Обновить внешние данные</button>`)}
    <section class="object-hero">
      <div><span class="eyebrow">${collateral.clientType === "ФЛ" ? "ФИО / ПИНФЛ" : "Наименование / ИНН"}</span><h2>${escapeHtml(collateral.clientName)}</h2><p>${escapeHtml(collateral.clientId)} - ${escapeHtml(collateral.gsz)} - ${escapeHtml(collateral.region)}</p></div>
      <div class="hero-metrics"><div><span>Рыночная стоимость</span><strong>${formatMoney(collateral.marketValue)}</strong></div><div><span>Залоговая стоимость</span><strong>${formatMoney(collateral.pledgeValue)}</strong></div><div><span>Риск</span><strong>${badge(collateral.riskState, riskTone(collateral))}</strong></div></div>
    </section>
    <div class="tabs wrap">${tabs.map(([id, label]) => `<button class="${state.collateralTab === id ? "active" : ""}" data-action="collateral-tab" data-tab="${id}">${escapeHtml(label)}</button>`).join("")}</div>
    ${renderCollateralTab(collateral)}
  `;
}

function renderCollateralTab(collateral) {
  if (state.collateralTab === "monitoring") return renderCollateralMonitoring(collateral);
  if (state.collateralTab === "values") return renderCollateralValues(collateral);
  if (state.collateralTab === "insurance") return renderInsuranceBlock(collateral);
  if (state.collateralTab === "contracts") return renderCollateralContracts(collateral);
  if (state.collateralTab === "pledgors") return renderCollateralPledgors(collateral);
  if (state.collateralTab === "risks") return renderCollateralRisks(collateral);
  if (state.collateralTab === "external") return renderCollateralExternal(collateral);
  if (state.collateralTab === "documents") return renderDocumentWidget({ context: "collateral", ownerId: collateral.id, documents: collateral.documents || [], activeCollateral: collateral, title: "Документы", subtitle: "Единый контейнер файлов карточки залога", description: "Документы привязываются к залогу. Обязательные пустые строки формируются по справочнику документов." });
  return renderCollateralOverview(collateral);
}

function renderCollateralOverview(collateral) {
  const subtype = getCollateralSubtype(collateral);
  const category = getCollateralCategory(collateral);
  const fieldEntries = Object.entries(collateral.fields || {});
  const objectFields = {
    "Идентификатор залога": collateral.id,
    "Вид залога": collateral.type,
    "Подтип": subtype,
    "Категория": category,
    "Статус объекта": collateral.status,
    "Регион": collateral.region,
    "Полный адрес / место хранения": collateral.address,
    "Описание": collateral.description
  };
  const ownershipFields = {
    [collateral.clientType === "ФЛ" ? "ФИО залогодателя" : "Залогодатель / организация"]: collateral.clientName,
    "ИНН/ПИНФЛ": collateral.clientId,
    "Тип клиента": collateral.clientType,
    "ГСЗ": collateral.gsz,
    "Ответственный": collateral.responsible,
    "Источник загрузки": collateral.source,
    "Дата обновления": collateral.updatedAt,
    "Признак кросс-залога": collateral.crossPledge ? "Да" : "Нет"
  };
  const valueFields = {
    "Метод оценки": collateral.evaluations?.[0]?.method || "По последней действующей оценке",
    "Рыночная стоимость": formatMoney(collateral.marketValue),
    "Залоговая стоимость": formatMoney(collateral.pledgeValue),
    "Аллоцированная стоимость": formatMoney(collateral.allocatedValue),
    "Дата последней оценки": collateral.evaluations?.[0]?.date || "-",
    "Статус оценки": collateral.appraisalStatus,
    "Страхование": collateral.insuranceStatus,
    "Следующий контроль": collateral.monitoring?.nextInspection || "-"
  };
  return `
    <section class="collateral-tab-view collateral-overview-view">
      <div class="tab-summary-card overview-summary">
        <div>
          <span class="eyebrow">Паспорт залогового имущества</span>
          <h2>${escapeHtml(collateral.type)} / ${escapeHtml(subtype)}</h2>
          <p>${escapeHtml(collateral.description)}. Вкладка содержит паспортные данные объекта, параметры залогодателя, характеристики по виду залога и контроль стоимости.</p>
        </div>
        <div class="overview-metrics">
          <div><span>Рыночная стоимость</span><strong>${formatMoney(collateral.marketValue)}</strong></div>
          <div><span>Залоговая стоимость</span><strong>${formatMoney(collateral.pledgeValue)}</strong></div>
          <div><span>Риск</span><strong>${badge(collateral.riskState, riskTone(collateral))}</strong></div>
        </div>
      </div>
      <section class="panel">
        <div class="panel-title">
          <div><h2>Основные реквизиты</h2><p class="hint">Паспортные поля объекта, залогодатель, источник загрузки и ответственный.</p></div>
          <span class="panel-note">${escapeHtml(collateral.updatedAt)}</span>
        </div>
        ${renderReadonlyFieldGrid({ ...objectFields, ...ownershipFields })}
      </section>
      <section class="panel">
        <div class="panel-title">
          <div><h2>Характеристики по виду залога</h2><p class="hint">Состав полей зависит от типа объекта: недвижимость, транспорт, оборудование, товары в обороте или скот.</p></div>
          ${badge(collateral.type, "info")}
        </div>
        ${fieldEntries.length ? renderReadonlyFieldGrid(Object.fromEntries(fieldEntries)) : `<div class="empty-state"><h2>Характеристики не заполнены</h2><p>Для этого объекта нет дополнительных полей по виду залога.</p></div>`}
      </section>
      <section class="panel">
        <div class="panel-title">
          <div><h2>Стоимость и контроль</h2><p class="hint">Стоимостные параметры, оценка, страхование и ближайший контроль объекта.</p></div>
        </div>
        ${renderReadonlyFieldGrid(valueFields)}
      </section>
    </section>
  `;
}

function renderReadonlyFieldGrid(items) {
  return `
    <div class="readonly-field-grid collateral-field-grid">
      ${Object.entries(items).map(([key, value]) => {
        const displayValue = value ?? "-";
        const wide = String(displayValue).length > 45 || ["Описание", "Полный адрес / место хранения"].includes(key);
        return `
          <div class="readonly-field ${wide ? "wide" : ""}">
            <span>${escapeHtml(key)}</span>
            <strong>${typeof displayValue === "string" && displayValue.startsWith("<") ? displayValue : escapeHtml(displayValue)}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getCollateralSubtype(collateral) {
  return collateral.fields?.["Подтип"]
    || collateral.fields?.["Назначение"]
    || collateral.fields?.["Марка/модель"]
    || collateral.fields?.["Производитель"]
    || collateral.fields?.["Порода"]
    || collateral.type;
}

function getCollateralCategory(collateral) {
  if (collateral.type === "Недвижимость") return collateral.fields?.["Назначение"] || "Недвижимое имущество";
  if (collateral.type === "Автотранспорт") return collateral.fields?.["Марка/модель"] || "Транспортное средство";
  if (collateral.type === "Оборудование") return collateral.fields?.["Производитель"] || "Производственное оборудование";
  if (collateral.type === "Товары в обороте") return collateral.fields?.["Группа товаров"] || "Товарные запасы";
  if (collateral.type === "Скот") return collateral.fields?.["Порода"] || "Сельскохозяйственные животные";
  return collateral.type;
}

function renderCollateralMonitoring(collateral) {
  return renderMonitoringObjectComponent(collateral, {
    title: "Мониторинг и осмотры",
    subtitle: "Настройки мониторинга определяют периодичность контрольных мероприятий и дату следующей проверки объекта залога.",
    showSummary: false,
    note: collateral.id
  });
}

function renderMonitoringObjectComponent(collateral, options = {}) {
  const { title = "Мониторинг объекта залога", subtitle = "Настройки мониторинга определяют периодичность контрольных мероприятий и дату следующей проверки объекта залога.", note = "", showSummary = true } = options;
  const monitoring = collateral.monitoring || {};
  const schedule = monitoring.schedule || [];
  const last = [...schedule].reverse().find((item) => item.status === "Завершен") || schedule[0] || {};
  const next = schedule.find((item) => item.status === "Запланирован") || {};
  const periodicities = ["Ежемесячно", "Ежеквартально", "Раз в полгода", "Ежегодно", "По событию"];
  const monitoringRequired = monitoring.required || "ДА";
  const currentPeriodicity = monitoring.periodicity || "Ежеквартально";
  const previousControl = monitoring.lastInspection || last.date || "";
  const nextControl = monitoring.nextInspection || next.date || "";
  return `
    <section class="collateral-inspections-view collateral-tab-view monitoring-object-component">
      ${showSummary ? `<div class="tab-summary-card">
        <div>
          <span class="eyebrow">${escapeHtml(title)}</span>
          <h2>${escapeHtml(monitoring.condition || "Контроль по графику")}</h2>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        <div class="external-summary-meta">
          <div><span>Требуется мониторинг</span><strong>${escapeHtml(monitoringRequired)}</strong></div>
          <div><span>Периодичность</span><strong>${escapeHtml(currentPeriodicity)}</strong></div>
          <div><span>Предыдущий контроль</span><strong>${escapeHtml(previousControl || "-")}</strong></div>
          <div><span>Следующий контроль</span><strong>${escapeHtml(nextControl || "-")}</strong></div>
        </div>
      </div>` : ""}
      <section class="panel monitoring-settings-panel">
        <div class="panel-title">
          <div><h2>Настройки мониторинга</h2><p class="hint">Требование мониторинга, периодичность и следующий контроль редактируются. Предыдущий контроль фиксируется по последнему завершенному осмотру.</p></div>
          ${note ? `<span class="panel-note">${escapeHtml(note)}</span>` : ""}
          <button class="btn btn-secondary" data-action="save-monitoring" data-collateral="${collateral.id}">Сохранить настройки</button>
        </div>
        <div class="form-grid monitoring-settings-grid">
          <label>Требуется мониторинг
            <select data-monitoring-field="required" data-collateral="${collateral.id}">
              ${["ДА", "НЕТ"].map((item) => `<option value="${escapeHtml(item)}" ${item === monitoringRequired ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}
            </select>
          </label>
          <label>Периодичность
            <select data-monitoring-field="periodicity" data-collateral="${collateral.id}">
              ${periodicities.map((item) => `<option value="${escapeHtml(item)}" ${item === currentPeriodicity ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}
            </select>
          </label>
          <label>Предыдущий контроль
            <input type="date" value="${escapeHtml(previousControl)}" readonly>
          </label>
          <label>Следующий контроль
            <input type="date" value="${escapeHtml(nextControl)}" data-monitoring-field="nextInspection" data-collateral="${collateral.id}">
          </label>
        </div>
      </section>
      <section class="panel inspection-card"><h2>Последний осмотр</h2>${renderInfoGrid({ "Дата": last.date || previousControl, "Тип": last.type, "Результат": last.result, "Инспектор": last.inspector || monitoring.inspector, "Статус": last.status })}</section>
      <section class="panel table-panel inspection-table"><h2>Таблица осмотров</h2><table><thead><tr><th>Дата</th><th>Тип</th><th>Результат</th><th>Инспектор</th><th>Статус</th></tr></thead><tbody>${schedule.map((item) => `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.result)}</td><td>${escapeHtml(item.inspector)}</td><td>${badge(item.status)}</td></tr>`).join("")}</tbody></table></section>
    </section>
  `;
}

function renderCollateralValues(collateral) {
  return `<section class="panel table-panel collateral-values-view"><h2>Оценки</h2><table><thead><tr><th>Дата</th><th>Оценщик</th><th>Рыночная</th><th>Залоговая</th><th>Метод</th><th>Статус</th></tr></thead><tbody>${(collateral.evaluations || []).map((item) => `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.appraiser)}</td><td>${formatMoney(item.market)}</td><td>${formatMoney(item.pledge)}</td><td>${escapeHtml(item.method)}</td><td>${badge(item.status)}</td></tr>`).join("")}</tbody></table></section>`;
}

function renderCollateralContracts(collateral) {
  const contracts = (collateral.contractIds || []).map(getContract).filter(Boolean);
  return `<section class="panel table-panel"><h2>Договоры и обременения</h2><table><thead><tr><th>Договор</th><th>Клиент</th><th>Остаток</th><th>LTV</th><th>Обременение</th><th>Статус</th></tr></thead><tbody>${contracts.map((contract) => `<tr><td><button class="link" data-route="/app/contracts/${contract.id}">${escapeHtml(contract.number)}</button></td><td>${escapeHtml(contract.clientName)}</td><td>${formatMoney(contract.debt, contract.currency)}</td><td>${badge(`${contract.ltv}%`)}</td><td>${escapeHtml(collateral.encumbrances?.[0]?.number || "-")}</td><td>${badge(contract.status)}</td></tr>`).join("")}</tbody></table></section>`;
}

function renderCollateralPledgors(collateral) {
  return `<section class="panel table-panel"><h2>Залогодатели</h2><table><thead><tr><th>Доля</th><th>Наименование/ФИО</th><th>ИНН/ПИНФЛ</th><th>Роль</th><th>Проверка</th></tr></thead><tbody>${(collateral.pledgors || []).map((item) => `<tr><td>${escapeHtml(item.share)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.idn)}</td><td>${escapeHtml(item.role)}</td><td>${badge(item.check)}</td></tr>`).join("")}</tbody></table></section>`;
}

function renderCollateralRisks(collateral) {
  const levels = (collateral.risks || []).reduce((acc, risk) => {
    acc[risk.level] = (acc[risk.level] || 0) + 1;
    return acc;
  }, {});
  return `
    <section class="collateral-risks-view collateral-tab-view">
      <div class="tab-summary-card">
        <div>
          <span class="eyebrow">Риск-профиль залога</span>
          <h2>${escapeHtml(collateral.riskState)}</h2>
          <p>Критичных сигналов: ${levels.critical || 0}, требуют внимания: ${levels.warn || 0}, без замечаний: ${levels.ok || 0}. Контроль строится по данным карточки, страхования, оценки, кросс-залогов и внешних источников.</p>
        </div>
        <div class="risk-score-ring" title="Балл риска">
          <span>${escapeHtml(collateral.riskScore)}</span>
        </div>
      </div>
      <section class="grid-2 tab-feature-grid">
        <div class="panel risk-signals-panel">
          <div class="panel-title">
            <div><h2>Сигналы рисков</h2><p class="hint">Состояние объекта по контрольным правилам и последним проверкам.</p></div>
            ${badge(collateral.riskState, riskTone(collateral))}
          </div>
          ${renderRiskPanel(collateral)}
          <div class="score-card">
            <span>Балл риска</span>
            <p>${escapeHtml(collateral.riskState)}</p>
            <strong>${escapeHtml(collateral.riskScore)}</strong>
          </div>
        </div>
        <div class="panel risk-rules-panel">
          <div class="panel-title">
            <div><h2>Контрольные правила</h2><p class="hint">Правила помогают объяснить заказчику, почему объект требует внимания.</p></div>
          </div>
          ${renderCollateralRiskRules(collateral)}
        </div>
      </section>
    </section>
  `;
}

function renderCollateralRiskRules(collateral) {
  const nextInspection = collateral.monitoring?.nextInspection || "-";
  const rules = [
    {
      title: "Страхование",
      description: `Статус ${collateral.insuranceStatus || "-"}, срок действия до ${collateral.insuranceDue || collateral.insurance?.to || "-"}.`,
      status: collateral.insuranceStatus || "Не указано",
      tone: collateral.insuranceStatus === "Оплачена" ? "ok" : "warn"
    },
    {
      title: "Оценка",
      description: `Статус ${collateral.appraisalStatus || "-"}, следующая переоценка до ${collateral.appraisalDue || "-"}.`,
      status: collateral.appraisalStatus || "Не указано",
      tone: collateral.appraisalStatus === "Действует" ? "ok" : "warn"
    },
    {
      title: "Кросс-залог",
      description: collateral.crossPledge ? `Объект участвует в ${collateral.contractIds.length} договорах, требуется контроль аллокации.` : "Объект привязан к одному договору.",
      status: collateral.crossPledge ? "Да" : "Нет",
      tone: collateral.crossPledge ? "warn" : "ok"
    },
    {
      title: "Мониторинг",
      description: `Следующий контроль: ${nextInspection}. Последний осмотр: ${collateral.monitoring?.lastInspection || "-"}.`,
      status: collateral.monitoring?.condition || "По графику",
      tone: "info"
    },
    {
      title: "Внешние ограничения",
      description: collateral.externalData?.["Аресты"] || collateral.externalData?.["Ограничения"] || collateral.externalData?.["Запреты"] || "Проверка выполнена по внешним источникам.",
      status: collateral.externalData?.["Аресты"] === "Не выявлены" || collateral.externalData?.["Ограничения"] === "Не выявлены" ? "Без ограничений" : "Проверить",
      tone: collateral.externalData?.["Аресты"] === "Не выявлены" || collateral.externalData?.["Ограничения"] === "Не выявлены" ? "ok" : "warn"
    }
  ];
  return `
    <div class="risk-rule-list">
      ${rules.map((rule) => `
        <button data-action="risk-rule" data-rule="${escapeHtml(rule.title)}">
          <span>${escapeHtml(rule.title)}</span>
          ${badge(rule.status, rule.tone)}
          <small>${escapeHtml(rule.description)}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderCollateralExternal(collateral) {
  const sourceRows = getCollateralExternalRows(collateral);
  const actualRows = sourceRows.filter((row) => row.status !== "Не применимо");
  const errorRows = sourceRows.filter((row) => /ошиб/i.test(row.status)).length;
  const lastSync = sourceRows.map((row) => row.updatedAt).filter(Boolean).sort().slice(-1)[0] || collateral.updatedAt;
  return `
    <section class="collateral-external-view">
      <section class="panel external-summary tab-summary-card">
        <div>
          <span class="eyebrow">Внешние данные</span>
          <h2>Источники проверки объекта ${escapeHtml(collateral.id)}</h2>
          <p>По каждому источнику показаны назначение проверки, результат по объекту, статус обмена, дата последнего обновления и сообщение из последней синхронизации.</p>
        </div>
        <div class="external-summary-meta">
          <div><span>Источников</span><strong>${sourceRows.length}</strong></div>
          <div><span>С данными по объекту</span><strong>${actualRows.length}</strong></div>
          <div><span>Ошибок обмена</span><strong>${errorRows}</strong></div>
          <div><span>Последнее обновление</span><strong>${escapeHtml(lastSync)}</strong></div>
        </div>
      </section>
      <section class="panel table-panel external-source-panel">
        <div class="panel-title">
          <div><h2>Проверки по источникам</h2><p class="hint">Вкладка не является мониторингом интеграций: она показывает только данные, релевантные выбранному залогу.</p></div>
          <button class="btn btn-primary" data-action="refresh-external" data-collateral="${collateral.id}">Синхронизировать</button>
        </div>
        <table>
          <thead><tr><th>Источник</th><th>Тип данных</th><th>Данные по залогу</th><th>Дата обновления</th><th>Статус</th><th>Сообщение</th></tr></thead>
          <tbody>
            ${sourceRows.map((row) => `
              <tr>
                <td><strong>${escapeHtml(row.source)}</strong><br><small>${escapeHtml(row.group)}</small></td>
                <td>${escapeHtml(row.dataType)}</td>
                <td>${escapeHtml(row.value)}</td>
                <td>${escapeHtml(row.updatedAt)}</td>
                <td>${badge(row.status, row.tone)}</td>
                <td>${escapeHtml(row.message)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
      <section class="panel table-panel external-source-panel">
        <h2>Полученные атрибуты объекта</h2>
        <table>
          <thead><tr><th>Источник</th><th>Параметр</th><th>Значение</th><th>Дата проверки</th><th>Статус</th></tr></thead>
          <tbody>${Object.entries(collateral.externalData || {}).filter(([key]) => !["Источник", "Дата проверки"].includes(key)).map(([key, value]) => `
            <tr>
              <td>${escapeHtml(collateral.externalData?.["Источник"] || collateral.source)}</td>
              <td>${escapeHtml(key)}</td>
              <td>${escapeHtml(value)}</td>
              <td>${escapeHtml(collateral.externalData?.["Дата проверки"] || collateral.updatedAt)}</td>
              <td>${badge("Актуально", "ok")}</td>
            </tr>
          `).join("")}</tbody>
        </table>
      </section>
    </section>
  `;
}

function getCollateralExternalRows(collateral) {
  const sources = (state.data.integrations || []).filter((source) => source.group === "Внешняя");
  return sources.map((source) => {
    const log = (source.logs || []).find((item) => item.object === collateral.id)
      || (source.logs || []).find((item) => item.message?.includes(collateral.id))
      || (source.logs || [])[0];
    const detail = getCollateralExternalSourceDetail(source, collateral);
    const status = detail.status || source.status;
    return {
      source: source.name,
      group: source.group,
      dataType: detail.dataType || source.method,
      value: detail.value,
      updatedAt: log?.time || source.lastSync || collateral.updatedAt,
      status,
      tone: status === "Ошибка" ? "danger" : status === "Предупреждение" ? "warn" : status === "Не применимо" ? "neutral" : "ok",
      message: detail.message || log?.message || source.method
    };
  });
}

function getCollateralExternalSourceDetail(source, collateral) {
  const data = collateral.externalData || {};
  if (source.id === "garov") {
    return {
      dataType: "Обременения и ограничения",
      value: data["Внешний залоговый реестр"] || data["Признак двойного залога"] || data["Ограничения"] || "Проверка реестра выполнена",
      message: data["Аресты"] || data["Запреты"] || "Сведения по реестру сопоставлены с карточкой залога"
    };
  }
  if (source.id === "cadastre") {
    const applicable = collateral.type === "Недвижимость";
    return {
      dataType: "Кадастровые данные недвижимости",
      value: applicable ? `${data["Право собственности"] || "Право проверено"}; ${data["Аресты"] || data["Запреты"] || "ограничения проверены"}` : "Источник не применяется к типу объекта",
      status: applicable ? source.status : "Не применимо",
      message: applicable ? (data["Дата проверки"] ? `Проверка от ${data["Дата проверки"]}` : "Кадастровые параметры проверены") : "Используется только для недвижимости"
    };
  }
  if (source.id === "gai") {
    const applicable = collateral.type === "Автотранспорт";
    return {
      dataType: "Регистрация и ограничения автотранспорта",
      value: applicable ? (data["Аресты"] || data["Запреты"] || data["Регистрация"] || "Регистрационные ограничения не выявлены") : "Источник не применяется к типу объекта",
      status: applicable ? source.status : "Не применимо",
      message: applicable ? "Данные СБДД/ГАИ сопоставлены с VIN и госномером" : "Используется только для автотранспорта"
    };
  }
  if (source.id === "avtoelon") {
    const applicable = collateral.type === "Автотранспорт";
    return {
      dataType: "Рыночные аналоги автотранспорта",
      value: applicable ? "Аналоги доступны для задачи переоценки" : "Источник не применяется к типу объекта",
      status: applicable ? source.status : "Не применимо",
      message: applicable ? "Результаты используются в анализе рынка аналогичных объектов" : "Используется только для автотранспорта"
    };
  }
  if (source.id === "olx") {
    const applicable = collateral.type === "Недвижимость";
    return {
      dataType: "Рыночные аналоги недвижимости",
      value: applicable ? "Аналоги доступны для сравнительного анализа" : "Источник не применяется к типу объекта",
      status: applicable ? source.status : "Не применимо",
      message: applicable ? "Результаты используются в анализе рынка аналогичных объектов" : "Используется только для недвижимости"
    };
  }
  return {
    dataType: source.method,
    value: data["Источник"] || "Данные источника сопоставлены с карточкой",
    message: source.method
  };
}

function renderCollateralHistory(collateral) {
  return `<section class="panel table-panel"><h2>История изменений</h2><table><thead><tr><th>Дата</th><th>Пользователь</th><th>Поле</th><th>Было</th><th>Стало</th><th>Основание</th><th>Источник</th></tr></thead><tbody>${(collateral.history || []).map((item) => `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.user)}</td><td>${escapeHtml(item.field)}</td><td>${escapeHtml(item.oldValue)}</td><td>${escapeHtml(item.newValue)}</td><td>${escapeHtml(item.reason)}</td><td>${escapeHtml(item.source)}</td></tr>`).join("")}</tbody></table></section>`;
}

function renderTaskCreate(query) {
  ensureNewTaskDraft(query);
  const draftTaskId = "new-task-draft";
  const type = state.newTask.type || query.get("type") || state.modal?.taskType || "Плановый мониторинг";
  const selectedIds = state.newTask.selectedCollateralIds;
  const collaterals = selectedIds.map(getCollateral).filter(Boolean);
  const activeId = state.taskActiveCollateral[draftTaskId];
  const activeCollateral = collaterals.find((item) => item.id === activeId) || collaterals[0] || null;
  if (activeCollateral) state.taskActiveCollateral[draftTaskId] = activeCollateral.id;
  const draftTask = {
    id: draftTaskId,
    type,
    contractId: activeCollateral?.contractIds?.[0] || "",
    documents: state.newTask.documents
  };
  return `
    ${renderPageHeader("Создание задачи", "Форма создания задачи с выбором залогов и привязкой сканов документов по каждому объекту.", `<button class="btn btn-secondary" data-route="/app/tasks">Назад</button>`)}
    <section class="task-create-layout">
      <div class="panel">
        <div class="panel-title">
          <h2>Основные параметры</h2>
        </div>
        <div class="form-grid">
          <label>Тип задачи<select id="newTaskType" data-new-task-field="type">${taskTypes.map((item) => `<option ${item === type ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>
          <label>Исполнитель<select id="newTaskAssignee">${employees.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
          <label>Плановый срок<input id="newTaskDue" type="date" value="2026-06-24"></label>
          <label>Приоритет<select id="newTaskPriority"><option>Средний</option><option>Высокий</option><option>Критический</option></select></label>
        </div>
        <label>Комментарий<textarea id="newTaskComment">Создать задачу по выбранным объектам залога и приложенным сканам.</textarea></label>
        <div class="task-create-footer">
          <div class="task-create-selection-note">${collaterals.length ? `Выбрано объектов залога: ${collaterals.length}` : "Объекты залога пока не добавлены"}</div>
          <div class="inline-actions task-create-actions">
            <button class="btn task-create-action pick" data-action="open-collateral-registry-picker">Выбрать объекты из реестра</button>
            <button class="btn task-create-action add" data-action="open-new-collateral-form">Добавить новый объект</button>
            <button class="btn task-create-action import" data-action="open-task-import-collaterals">Загрузить объекты из таблицы</button>
          </div>
        </div>
      </div>
    </section>
    ${collaterals.length ? renderTaskCollateralObjectsInfo(draftTask, collaterals, activeCollateral) : ""}
    ${collaterals.length ? renderDocumentWidget({
      context: "task",
      ownerId: draftTaskId,
      task: draftTask,
      documents: state.newTask.documents,
      collaterals,
      activeCollateral,
      title: "Документы",
      subtitle: "Единый контейнер файлов",
      description: "Выберите строку залога выше, чтобы увидеть обязательные документы именно по этому объекту."
    }) : ""}
    <section class="panel task-confirm-panel">
      <div class="inline-actions"><button class="btn btn-primary" data-action="create-task-submit" ${collaterals.length ? "" : "disabled"}>Создать задачу</button></div>
    </section>
  `;
}

function ensureNewTaskDraft(query) {
  const preselected = query.get("collateral") || "";
  const key = preselected ? `collateral:${preselected}` : "registry";
  if (state.newTask.key === key) return;
  state.newTask = {
    key,
    type: query.get("type") || state.modal?.taskType || "Плановый мониторинг",
    selectedCollateralIds: preselected ? [preselected] : [],
    documents: []
  };
  state.taskActiveCollateral["new-task-draft"] = preselected || "";
}

function renderReports() {
  return `${renderPageHeader("Отчеты", "Сводные отчеты руководителя по задачам, сотрудникам и видам залогов.")}<section class="grid-2">${reportCatalog.map((report) => `<div class="panel table-panel"><h2>${escapeHtml(report.name)}</h2><p class="hint">Параметры: ${report.parameters.map(escapeHtml).join(", ")}</p><table><thead><tr>${report.headers.map((head) => `<th>${escapeHtml(head)}</th>`).join("")}</tr></thead><tbody>${report.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table><button class="btn btn-secondary" data-action="report-export">Сформировать</button></div>`).join("")}</section>`;
}

function renderPrintPreview(id) {
  const collateral = getCollateral(id);
  const contract = getContract(id);
  const title = collateral ? `${collateral.id} - ${collateral.description}` : contract ? `Договор ${contract.number}` : id;
  return `${renderPageHeader("Печатная форма", "Демонстрационный предпросмотр документа.", `<button class="btn btn-secondary" data-route="/app/tasks">Назад</button><button class="btn btn-primary" data-action="print">Печать</button>`)}<section class="print-preview"><h2>${escapeHtml(title)}</h2><p>Форма содержит реквизиты клиента, договора, объекта залога, стоимости, страхования и истории согласования.</p></section>`;
}

function renderMobileEmployeeTasks() {
  const tasks = state.data.tasks
    .filter((task) => task.mobileKind === "employeeInspection" || task.type === "Выездной осмотр" || (isInspectionTaskType(task.type) && task.route?.includes("Выездной сотрудник")))
    .slice(0, 8);
  return `<section class="mobile-wrap"><div class="mobile-header"><h1>Мобильный осмотр</h1></div><div class="mobile-list">${tasks.length ? tasks.map((task) => {
    const collateral = getCollateral(task.collateralId);
    const progress = getMobileInspectionProgress(task, collateral);
    return `<article class="mobile-card"><h2>${escapeHtml(task.type)}</h2><p>${escapeHtml(task.title)}</p><div class="mobile-card-meta"><span>${escapeHtml(collateral?.id || task.collateralId || "-")}</span>${badge(`${progress.done}/${progress.total} фото`, progress.done === progress.total ? "ok" : "warn")}</div><div class="mobile-actions"><button class="btn btn-primary" data-route="/mobile/employee/tasks/${task.id}/photos">Фото</button></div></article>`;
  }).join("") : `<article class="mobile-card detail"><h2>Задач нет</h2><p>Создайте задачу на выездной осмотр из маршрута основного осмотра.</p></article>`}</div></section>`;
}

function renderMobileClientRequest() {
  const tasks = state.data.tasks.filter((task) => task.mobileKind === "clientInspection" || task.type === "Клиентский осмотр").slice(0, 8);
  return `<section class="mobile-wrap"><div class="mobile-header"><h1>Запрос Банка</h1></div><div class="mobile-list">${tasks.length ? tasks.map((task) => {
    const collateral = getCollateral(task.collateralId);
    const progress = getMobileInspectionProgress(task, collateral);
    return `<article class="mobile-card"><h2>${escapeHtml(task.type)}</h2><p>${escapeHtml(task.title)}</p><div class="mobile-card-meta"><span>${escapeHtml(collateral?.id || task.collateralId || "-")}</span>${badge(`${progress.done}/${progress.total} фото`, progress.done === progress.total ? "ok" : "warn")}</div><div class="mobile-actions"><button class="btn btn-primary" data-route="/mobile/client/tasks/${task.id}/photos">Перейти к фото</button></div></article>`;
  }).join("") : `<article class="mobile-card detail"><h2>Запросов нет</h2><p>Запрос появится после отправки из маршрута основной задачи осмотра.</p></article>`}</div></section>`;
}

function renderMobilePhotos(kind, taskId) {
  const task = getTask(taskId) || state.data.tasks.find((item) => isInspectionTaskType(item.type)) || state.data.tasks[0];
  const collateral = getCollateral(task.collateralId);
  const angles = getCollateralPhotoAngles(collateral);
  return `<section class="mobile-wrap"><div class="mobile-header"><button class="btn btn-secondary" data-route="${kind === "employee" ? "/mobile/employee/tasks" : "/mobile/client/request"}">Назад</button><h1>Фото снимки объекта залога</h1></div><div class="mobile-photo-context"><strong>${escapeHtml(collateral?.id || "")}</strong><p>${escapeHtml(collateral?.description || "")}</p><span>${escapeHtml(task.id)} · ${escapeHtml(task.type)}</span></div><div class="photo-wizard">${angles.map((angle) => {
    const photo = getMobilePhotoValue(kind, task.id, collateral?.id || "", angle);
    return `<div class="photo-step ${photo ? "done" : ""}"><strong>${escapeHtml(angle)}</strong><span>${escapeHtml(photo?.name || "Фото не сделано")}</span><button class="btn btn-primary" data-action="mobile-take-photo" data-kind="${kind}" data-task="${task.id}" data-collateral="${collateral?.id || ""}" data-angle="${escapeHtml(angle)}">${photo ? "Переснять" : "Сделать фото"}</button></div>`;
  }).join("")}</div></section>`;
}

function renderCollateralRegistryPickerModal() {
  const search = state.modal.search || "";
  const selected = new Set(state.newTask.selectedCollateralIds);
  const rows = state.data.collaterals.filter((item) => {
    const haystack = [item.id, item.type, item.description, item.address, item.clientName, item.clientId, item.gsz].join(" ");
    return matches(haystack, search);
  });
  return `
    <div class="modal-backdrop">
      <section class="modal wide">
        <div class="modal-head"><h2>Выбрать из реестра залогов</h2><button class="btn btn-secondary" data-action="close-modal">Закрыть</button></div>
        <div class="task-pool-search">
          <label>Поиск по ID, клиенту, адресу, ГСЗ или типу<input value="${escapeHtml(search)}" data-modal-collateral-search></label>
          <span>${rows.length} объектов найдено</span>
        </div>
        <div class="table-wrap collateral-picker-table">
          <table>
            <thead><tr><th></th><th>ID</th><th>Тип</th><th>Объект</th><th>Клиент</th><th>ГСЗ</th><th>Залоговая стоимость</th><th>Риск</th></tr></thead>
            <tbody>${rows.map((item) => `
              <tr>
                <td><input type="checkbox" data-modal-collateral-choice="${escapeHtml(item.id)}" ${selected.has(item.id) ? "checked" : ""}></td>
                <td><strong>${escapeHtml(item.id)}</strong></td>
                <td>${escapeHtml(item.type)}</td>
                <td>${escapeHtml(item.description)}<br><small>${escapeHtml(item.address)}</small></td>
                <td>${escapeHtml(item.clientName)}<br><small>${escapeHtml(item.clientId)}</small></td>
                <td>${escapeHtml(item.gsz)}</td>
                <td>${formatMoney(item.pledgeValue || 0)}</td>
                <td>${badge(item.riskState, riskTone(item))}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
        <div class="modal-actions"><button class="btn btn-primary" data-action="submit-collateral-picker">Добавить выбранные</button></div>
      </section>
    </div>
  `;
}

function renderNewCollateralModal() {
  const types = [...new Set(state.data.collaterals.map((item) => item.type))];
  const contracts = state.data.contracts;
  const nextId = getNextCollateralId();
  return `
    <div class="modal-backdrop">
      <section class="modal wide">
        <div class="modal-head"><h2>Добавить объект залога</h2><button class="btn btn-secondary" data-action="close-modal">Закрыть</button></div>
        <div class="form-grid">
          <label>Идентификатор объекта залога<input id="newCollateralId" value="${escapeHtml(nextId)}" required></label>
          <label>Тип залога<select id="newCollateralType">${types.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
          <label>Договор<select id="newCollateralContract"><option value="">Не выбран</option>${contracts.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.number)} - ${escapeHtml(item.clientName)}</option>`).join("")}</select></label>
          <label>Наименование/ФИО клиента<input id="newCollateralClient" value="OOO New Plast"></label>
          <label>ИНН/ПИНФЛ клиента<input id="newCollateralClientId" value="309998771"></label>
          <label>ГСЗ<input id="newCollateralGsz" value="New Plast Group"></label>
          <label>Полный адрес / место хранения<input id="newCollateralAddress" value="Ташкентская область, промышленная зона Ангрен, склад 7"></label>
        </div>
        <label>Описание объекта<textarea id="newCollateralDescription">Линия термопластавтоматов Haitian Mars II, 2024 год выпуска, комплект пресс-форм и шкаф управления.</textarea></label>
        <div class="modal-actions"><button class="btn btn-primary" data-action="submit-new-collateral">Добавить в задачу</button></div>
      </section>
    </div>
  `;
}

function renderImportCollateralsModal() {
  const rows = state.modal.fileLoaded ? (state.data.importRows || []) : [];
  const isTaskContext = state.modal.context === "taskCreate";
  return `
    <div class="modal-backdrop">
      <section class="modal wide">
        <div class="modal-head"><h2>Загрузка объектов залога из таблицы</h2><button class="btn btn-secondary" data-action="close-modal">Закрыть</button></div>
        <p class="hint">${isTaskContext ? "Корректные строки будут добавлены в пул объектов создаваемой задачи." : "Имитация загрузки Excel: строки проверены, часть объектов готова к созданию или обновлению."}</p>
        <label class="import-file-drop">Excel-файл<input type="file" accept=".xlsx,.xls" data-import-file></label>
        ${rows.length ? `<table>
            <thead><tr><th>Строка</th><th>ID залога</th><th>Тип</th><th>Владелец</th><th>Договор</th><th>Статус</th><th>Комментарий</th></tr></thead>
            <tbody>${rows.map((row) => `<tr><td>${row.row}</td><td>${escapeHtml(row.collateralId || "-")}</td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(row.owner)}</td><td>${escapeHtml(row.contract)}</td><td>${badge(row.status, row.status === "Ошибка" ? "danger" : row.status === "Создать" ? "ok" : "warn")}</td><td>${escapeHtml(row.message)}</td></tr>`).join("")}</tbody>
          </table>`
        : `<div class="empty-state import-empty-state"><h2>Файл не загружен</h2><p>Выберите Excel-файл, после этого здесь появится предварительная проверка строк.</p></div>`}
        <div class="modal-actions"><button class="btn btn-primary" data-action="confirm-import" ${rows.length ? "" : "disabled"}>Загрузить корректные строки</button></div>
      </section>
    </div>
  `;
}

function renderMobileInspectionModal() {
  const parent = getTask(state.modal.parentTaskId);
  const collaterals = getTaskCollaterals(parent);
  const active = getTaskActiveCollateral(parent, collaterals) || collaterals[0];
  const isClient = state.modal.kind === "client";
  const title = isClient ? "Отправить запрос клиенту на осмотр" : "Создать задачу на выездной осмотр";
  return `
    <div class="modal-backdrop">
      <section class="modal">
        <div class="modal-head"><h2>${title}</h2><button class="btn btn-secondary" data-action="close-modal">Закрыть</button></div>
        <div class="form-grid">
          <label>Основная задача<input value="${escapeHtml(parent?.id || "")}" readonly></label>
          <label>Объект залога<select id="mobileInspectionCollateral">
            ${collaterals.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === active?.id ? "selected" : ""}>${escapeHtml(item.id)} - ${escapeHtml(item.description)}</option>`).join("")}
          </select></label>
          ${isClient
            ? `<label>Контакт клиента<input id="mobileInspectionContact" value="${escapeHtml(parent?.client || active?.clientName || "")}, +998 90 712-45-18"></label>`
            : `<label>Выездной сотрудник<select id="mobileInspectionAssignee">${employees.map((item) => `<option ${item === "Бахтиер Салиев" ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>`}
          <label>Плановый срок<input id="mobileInspectionDue" type="date" value="2026-06-21"></label>
          <label>Канал выполнения<select id="mobileInspectionChannel">
            <option>${isClient ? "Мобильное приложение клиента" : "Мобильный АРМ сотрудника"}</option>
            <option>${isClient ? "SMS-ссылка клиенту" : "Мобильный АРМ аутсорсера"}</option>
          </select></label>
        </div>
        <label>Комментарий<textarea id="mobileInspectionComment">${isClient ? "Просим клиента выполнить фотофиксацию объекта по обязательным ракурсам." : "Необходимо выполнить выездной осмотр и приложить фото по обязательным ракурсам."}</textarea></label>
        <div class="modal-actions"><button class="btn btn-primary" data-action="submit-mobile-inspection-task">Создать</button></div>
      </section>
    </div>
  `;
}

function renderModal() {
  if (!state.modal) return "";
  if (state.modal.type === "followup") {
    return `
      <div class="modal-backdrop">
        <section class="modal">
          <div class="modal-head"><h2>Создать связанную задачу</h2><button class="btn btn-secondary" data-action="close-modal">Закрыть</button></div>
          <div class="form-grid">
            <label>Тип задачи<select id="followupType">${taskTypes.map((item) => `<option ${item === state.modal.taskType ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label>Объект залога<input id="followupCollateral" value="${escapeHtml(state.modal.collateralId || "")}"></label>
            <label>Исполнитель<select id="followupAssignee">${employees.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label>Срок<input id="followupDue" type="date" value="2026-06-24"></label>
          </div>
          <label>Комментарий<textarea id="followupComment">Задача создана из маршрута ${escapeHtml(state.modal.parentTaskId)}.</textarea></label>
          <div class="modal-actions"><button class="btn btn-primary" data-action="submit-followup">Создать</button></div>
        </section>
      </div>
    `;
  }
  if (state.modal.type === "mobileInspection") return renderMobileInspectionModal();
  if (state.modal.type === "import") return renderImportCollateralsModal();
  if (state.modal.type === "collateralPicker") return renderCollateralRegistryPickerModal();
  if (state.modal.type === "newCollateral") return renderNewCollateralModal();
	  return "";
	}

function renderToasts() {
  return `<div class="toast-stack">${state.toasts.map((toast) => `<div class="toast ${toast.tone || ""}"><strong>${escapeHtml(toast.title)}</strong><span>${escapeHtml(toast.text || "")}</span></div>`).join("")}</div>`;
}

function addToast(title, text = "", tone = "") {
  const id = Date.now() + Math.random();
  state.toasts.push({ id, title, text, tone });
  render();
  setTimeout(() => {
    state.toasts = state.toasts.filter((toast) => toast.id !== id);
    render();
  }, 2600);
}

function updateCollateralMonitoringField(fieldEl) {
  const collateral = getCollateral(fieldEl.dataset.collateral);
  const field = fieldEl.dataset.monitoringField;
  if (!collateral || !field) return;
  collateral.monitoring = collateral.monitoring || {};
  collateral.monitoring[field] = fieldEl.value;
  if (field === "nextInspection") {
    const planned = collateral.monitoring.schedule?.find((item) => item.status === "Запланирован");
    if (planned) planned.date = fieldEl.value;
  }
}

function createTask(payload) {
  const id = `TSK-2026-${String(1200 + state.data.tasks.length).padStart(4, "0")}`;
  const collateral = getCollateral(payload.collateralId);
  const contract = getContract(payload.contractId || collateral?.contractIds?.[0]);
  const task = {
    id,
    type: payload.type,
    title: payload.title || `${payload.type} по объекту ${payload.collateralId}`,
    collateralId: payload.collateralId,
    collateralIds: payload.collateralIds?.length > 1 ? payload.collateralIds : undefined,
    contractId: contract?.id,
    client: contract?.clientName || collateral?.clientName || "Клиент не указан",
    assignee: payload.assignee || employees[0],
    status: "Назначена",
    dueDate: payload.dueDate || "2026-06-24",
    createdAt: "2026-06-17",
    sla: "Норма",
    priority: payload.priority || "Средний",
    source: payload.source || "Вручную",
    route: payload.route || ["Специалист", "Руководитель"],
    result: payload.comment || "Задача создана пользователем",
    documents: payload.documents || [],
    history: [{ date: "2026-06-17 20:40", user: getRole().user, action: "Создана задача", status: "Назначена", comment: payload.comment || "Создано из прототипа" }]
  };
  if (payload.status) task.status = payload.status;
  if (payload.parentTaskId) task.parentTaskId = payload.parentTaskId;
  if (payload.mobileKind) task.mobileKind = payload.mobileKind;
  if (payload.clientContact) task.clientContact = payload.clientContact;
  state.data.tasks.unshift(task);
  return task;
}

document.addEventListener("click", (event) => {
  const routeEl = event.target.closest("[data-route]");
  if (routeEl) {
    window.location.hash = routeEl.dataset.route;
    return;
  }
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  if (action === "change-role") return;
  if (action === "reset-filters") {
    const scope = actionEl.dataset.scope;
    state.pendingScrollRestore = { top: window.scrollY, left: window.scrollX };
    state.filters[scope] = Object.fromEntries(Object.keys(state.filters[scope]).map((key) => [key, key === "status" && scope === "contracts" ? "Активен" : ""]));
    if (state.visualFilters[scope]) state.visualFilters[scope] = Object.fromEntries(Object.keys(state.visualFilters[scope]).map((key) => [key, ""]));
    state.pendingRegistryFocus = "";
  }
  if (action === "visual-filter") {
    const scope = actionEl.dataset.scope;
    const filter = actionEl.dataset.filter;
    const value = actionEl.dataset.value;
    if (state.visualFilters[scope]) state.visualFilters[scope][filter] = state.visualFilters[scope][filter] === value ? "" : value;
    state.pendingRegistryFocus = scope;
  }
  if (action === "registry-kpi") {
    applyRegistryKpiFilter(actionEl.dataset.scope, actionEl.dataset.filter, actionEl.dataset.value || "");
  }
  if (action === "task-registry-tab") {
    state.taskRegistryTab = actionEl.dataset.tab || "mine";
  }
  if (action === "collateral-tab") state.collateralTab = actionEl.dataset.tab;
  if (action === "select-task-collateral") state.taskActiveCollateral[actionEl.dataset.task] = actionEl.dataset.collateral;
  if (action === "task-status") updateTaskStatus(actionEl.dataset.task, actionEl.dataset.status);
  if (action === "save-task") addToast("Задача сохранена", actionEl.dataset.task, "ok");
  if (action === "open-reassign") addToast("Назначение изменено", "В демо выбран следующий доступный исполнитель.", "warn");
  if (action === "add-approver") addToast("Согласующий добавлен", "Маршрут обновлен в демо-режиме.", "ok");
  if (action === "create-followup-task") openFollowup(actionEl.dataset.task, actionEl.dataset.taskType);
  if (action === "submit-followup") submitFollowup();
  if (action === "open-mobile-inspection-task") openMobileInspectionTask(actionEl.dataset.task, actionEl.dataset.mobileKind);
  if (action === "submit-mobile-inspection-task") submitMobileInspectionTask();
  if (action === "close-modal") state.modal = null;
  if (action === "open-collateral-registry-picker") state.modal = { type: "collateralPicker", search: "" };
  if (action === "open-new-collateral-form") state.modal = { type: "newCollateral" };
  if (action === "submit-collateral-picker") submitCollateralPicker();
  if (action === "submit-new-collateral") submitNewCollateral();
  if (action === "generate-task-conclusion") generateConclusion(actionEl.dataset.task);
  if (action === "send-abs") addToast("Передано в АБС", "Статус обмена: успешно.", "ok");
  if (action === "search-analogs") addToast("Аналоги обновлены", "Найдены 3 сопоставимых объекта.", "ok");
  if (action === "recalculate-valuation") addToast("Расчет обновлен", `Стоимость пересчитана по объекту ${actionEl.dataset.collateral || ""}.`, "ok");
  if (action === "attach-task-photo") attachPhoto(actionEl.dataset.task, actionEl.dataset.collateral, actionEl.dataset.angle);
  if (action === "mobile-take-photo") attachMobilePhoto(actionEl.dataset.kind, actionEl.dataset.task, actionEl.dataset.collateral, actionEl.dataset.angle);
  if (action === "refresh-external") addToast("Внешние данные обновлены", actionEl.dataset.collateral || "", "ok");
  if (action === "risk-rule") addToast("Контрольное правило", `${actionEl.dataset.rule}: проверка выполнена по данным карточки залога.`, "info");
  if (action === "save-monitoring") {
    document.querySelectorAll(`[data-monitoring-field][data-collateral="${actionEl.dataset.collateral}"]`).forEach(updateCollateralMonitoringField);
    addToast("Настройки мониторинга сохранены", actionEl.dataset.collateral, "ok");
  }
  if (action === "open-import-collaterals") state.modal = { type: "import", fileLoaded: false };
  if (action === "open-task-import-collaterals") state.modal = { type: "import", context: "taskCreate", fileLoaded: false };
  if (action === "confirm-import") submitImportCollaterals();
  if (action === "report-export") addToast("Отчет сформирован", "Файл подготовлен в демо-режиме.", "ok");
  if (action === "print") window.print();
  if (action === "create-task-submit") submitNewTask();
  render();
});

document.addEventListener("input", (event) => {
  const marketAdjustment = event.target.closest("[data-market-adjustment]");
  if (marketAdjustment) {
    updateMarketAdjustment(marketAdjustment);
    return;
  }
  const monitoringField = event.target.closest("[data-monitoring-field]");
  if (monitoringField) updateCollateralMonitoringField(monitoringField);
  const filter = event.target.closest("[data-filter-scope]");
  if (filter) {
    state.filters[filter.dataset.filterScope][filter.dataset.filterName] = filter.value;
    render();
  }
	  const expert = event.target.closest("[data-task-expert]");
	  if (expert) {
	    const task = getTask(expert.dataset.task);
	    if (task) task[expert.dataset.taskExpert] = expert.value;
	  }
  const modalSearch = event.target.closest("[data-modal-collateral-search]");
  if (modalSearch && state.modal?.type === "collateralPicker") {
    state.modal.search = modalSearch.value;
    render();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-inspection-factor]")) {
    updateTaskInspectionFactor(event.target);
    render();
    return;
  }
  if (event.target.matches("[data-valuation-risk-factor]")) {
    updateTaskValuationRiskFactor(event.target);
    render();
    return;
  }
  if (event.target.matches("[data-monitoring-field]")) {
    updateCollateralMonitoringField(event.target);
  }
  if (event.target.matches("[data-new-task-field]")) {
    state.newTask[event.target.dataset.newTaskField] = event.target.value;
    render();
    return;
  }
  if (event.target.matches("[data-import-file]")) {
    state.modal = { ...(state.modal || {}), fileLoaded: Boolean(event.target.files?.length || event.target.value) };
    addToast("Файл загружен", "Выполнена предварительная проверка строк Excel.", "ok");
    render();
    return;
  }
  if (event.target.matches("[data-action='change-role']")) {
    state.roleId = event.target.value;
    localStorage.setItem("pledgeRole", state.roleId);
    const role = getRole();
    if (role.menu.includes("mobileEmployee")) window.location.hash = "/mobile/employee/tasks";
    else if (role.menu.includes("mobileClient")) window.location.hash = "/mobile/client/request";
    else window.location.hash = "/app/tasks";
    render();
  }
  if (event.target.matches("[data-filter-scope]")) {
    state.filters[event.target.dataset.filterScope][event.target.dataset.filterName] = event.target.value;
    render();
  }
  if (event.target.matches("[data-doc-file]")) {
    attachDocument(event.target.dataset.docFile, event.target.files?.[0]?.name);
  }
  if (event.target.matches("[data-task-photo-file]")) {
    const [taskId, collateralId, angle] = event.target.dataset.taskPhotoFile.split("::");
    attachPhoto(taskId, collateralId, angle, event.target.files?.[0]?.name);
  }
});

function updateTaskStatus(taskId, status) {
  const task = getTask(taskId);
  if (!task) return;
  task.status = status;
  task.history = task.history || [];
  task.history.push({ date: "2026-06-17 20:40", user: getRole().user, action: `Статус изменен`, status, comment: "Изменено в демо-прототипе" });
  addToast("Статус задачи обновлен", `${taskId}: ${status}`, status === "Завершена" ? "ok" : "warn");
}

function openFollowup(taskId, taskType) {
  const parent = getTask(taskId);
  const collaterals = getTaskCollaterals(parent);
  const active = getTaskActiveCollateral(parent, collaterals);
  state.modal = { type: "followup", parentTaskId: taskId, taskType, collateralId: active?.id || parent?.collateralId };
}

function submitFollowup() {
  const task = createTask({
    type: document.getElementById("followupType")?.value || state.modal.taskType,
    collateralId: document.getElementById("followupCollateral")?.value || state.modal.collateralId,
    assignee: document.getElementById("followupAssignee")?.value || employees[0],
    dueDate: document.getElementById("followupDue")?.value,
    comment: document.getElementById("followupComment")?.value,
    source: "Маршрут"
  });
  state.modal = null;
  window.location.hash = `/app/tasks/${task.id}`;
  addToast("Связанная задача создана", task.id, "ok");
}

function openMobileInspectionTask(taskId, kind) {
  const parent = getTask(taskId);
  const collaterals = getTaskCollaterals(parent);
  const active = getTaskActiveCollateral(parent, collaterals);
  state.modal = { type: "mobileInspection", parentTaskId: taskId, kind, collateralId: active?.id || parent?.collateralId };
}

function submitMobileInspectionTask() {
  const parent = getTask(state.modal?.parentTaskId);
  if (!parent) return;
  const kind = state.modal.kind;
  const collateralId = document.getElementById("mobileInspectionCollateral")?.value || state.modal.collateralId || parent.collateralId;
  const collateral = getCollateral(collateralId);
  const isClient = kind === "client";
  const contact = document.getElementById("mobileInspectionContact")?.value || parent.client;
  const assignee = isClient ? "Клиент" : document.getElementById("mobileInspectionAssignee")?.value || "Бахтиер Салиев";
  const dueDate = document.getElementById("mobileInspectionDue")?.value || "2026-06-21";
  const channel = document.getElementById("mobileInspectionChannel")?.value || (isClient ? "Мобильное приложение клиента" : "Мобильный АРМ сотрудника");
  const comment = document.getElementById("mobileInspectionComment")?.value || "";
  const task = createTask({
    type: isClient ? "Клиентский осмотр" : "Выездной осмотр",
    title: `${isClient ? "Клиентский осмотр" : "Выездной осмотр"} по объекту ${collateralId}`,
    collateralId,
    assignee,
    dueDate,
    priority: parent.priority,
    source: "Маршрут основного осмотра",
    status: isClient ? "Ожидает клиента" : "Назначена",
    parentTaskId: parent.id,
    mobileKind: isClient ? "clientInspection" : "employeeInspection",
    clientContact: isClient ? contact : "",
    route: isClient ? ["Специалист", "Клиент", "Контроль специалиста"] : ["Специалист", "Выездной сотрудник", "Контроль специалиста"],
    comment: `${comment} Канал: ${channel}. Основная задача: ${parent.id}.`
  });
  parent.history = parent.history || [];
  parent.history.unshift({
    date: "2026-06-17 20:45",
    user: getRole().user,
    action: isClient ? "Отправлен запрос клиенту на осмотр" : "Создана задача на выездной осмотр",
    status: parent.status,
    comment: `${task.id}: ${collateral?.description || collateralId}`
  });
  state.modal = null;
  addToast(isClient ? "Запрос клиенту отправлен" : "Задача на выездной осмотр создана", `${task.id} доступна в мобильном интерфейсе.`, "ok");
}

function submitCollateralPicker() {
  const checked = [...document.querySelectorAll("[data-modal-collateral-choice]:checked")].map((item) => item.dataset.modalCollateralChoice);
  const selected = [...new Set([...state.newTask.selectedCollateralIds, ...checked])];
  state.newTask.selectedCollateralIds = selected;
  const activeId = state.taskActiveCollateral["new-task-draft"];
  if (!selected.includes(activeId)) state.taskActiveCollateral["new-task-draft"] = selected[0] || "";
  state.modal = null;
  addToast("Пул объектов обновлен", selected.length ? `Выбрано объектов: ${selected.length}` : "Объекты не выбраны", selected.length ? "ok" : "warn");
}

function submitNewCollateral() {
  const collateral = createDraftCollateralFromForm();
  if (!collateral) return;
  state.data.collaterals.push(collateral);
  state.newTask.selectedCollateralIds = [...new Set([...state.newTask.selectedCollateralIds, collateral.id])];
  state.taskActiveCollateral["new-task-draft"] = collateral.id;
  state.modal = null;
  addToast("Объект залога добавлен", collateral.id, "ok");
}

function submitImportCollaterals() {
  const context = state.modal?.context || "registry";
  const imported = (state.data.importRows || [])
    .filter((row) => row.status !== "Ошибка" && row.collateralId)
    .map(ensureImportedCollateral)
    .filter(Boolean);

  if (context === "taskCreate") {
    const ids = imported.map((item) => item.id);
    state.newTask.selectedCollateralIds = [...new Set([...state.newTask.selectedCollateralIds, ...ids])];
    const activeId = state.taskActiveCollateral["new-task-draft"];
    if (!state.newTask.selectedCollateralIds.includes(activeId)) state.taskActiveCollateral["new-task-draft"] = ids[0] || state.newTask.selectedCollateralIds[0] || "";
  }

  state.modal = null;
  addToast(
    "Таблица обработана",
    context === "taskCreate"
      ? `В задачу добавлено объектов: ${imported.length}`
      : `Корректные строки загружены в реестр: ${imported.length}`,
    imported.length ? "ok" : "warn"
  );
}

function ensureImportedCollateral(row) {
  const existing = getCollateral(row.collateralId);
  if (existing) {
    existing.source = "Excel";
    existing.updatedAt = "2026-06-18 00:45";
    existing.history = existing.history || [];
    existing.history.unshift({
      date: "2026-06-18 00:45",
      user: getRole().user,
      field: "Карточка залога",
      oldValue: "Текущие данные",
      newValue: row.message,
      reason: "Загрузка из Excel",
      source: "Excel"
    });
    return existing;
  }

  const collateral = createImportedCollateral(row);
  state.data.collaterals.push(collateral);
  return collateral;
}

function createImportedCollateral(row) {
  const contract = getContractByNumber(row.contract);
  const id = row.collateralId || getNextCollateralId();
  const type = row.type || "Оборудование";
  const owner = row.owner || contract?.clientName || "Клиент из Excel";
  const clientId = contract?.inn || "309 555 771";
  const gsz = contract?.gsz || `ГСЗ ${owner}`;
  const address = type === "Автотранспорт"
    ? "Фергана, автобаза клиента, зона стоянки 4"
    : "Ташкентская область, складской комплекс клиента";
  const marketValue = type === "Автотранспорт" ? 720000000 : 1250000000;
  const pledgeValue = Math.round(marketValue * 0.8);
  return {
    id,
    type,
    clientType: "ЮЛ",
    clientName: owner,
    clientId,
    gsz,
    region: address.split(",")[0] || "Регион не указан",
    address,
    description: type === "Автотранспорт"
      ? "Грузовой автотранспорт из загруженной таблицы, VIN ожидает сверки с СБДД"
      : `${type}: объект загружен из таблицы клиента`,
    contractIds: contract ? [contract.id] : [],
    status: "Загружен из Excel",
    source: "Excel",
    responsible: getRole().user,
    marketValue,
    pledgeValue,
    allocatedValue: pledgeValue,
    appraisalStatus: "Требуется оценка",
    appraisalDue: "2026-07-18",
    insuranceStatus: "Требуется проверка",
    insuranceDue: "2026-07-18",
    riskState: "Требует проверки",
    riskScore: 35,
    crossPledge: false,
    fields: { "Категория": type, "Подтип": "Импортированный объект", "Источник создания": "Excel" },
    monitoring: { required: "ДА", periodicity: "Ежеквартально", lastInspection: "-", nextInspection: "2026-07-18", condition: "Не проверялся", schedule: [] },
    insurance: { company: "Не выбрана", policy: "Не указан", from: "-", to: "-", amount: 0, premiumStatus: "Не проверено", source: "Excel" },
    evaluations: [],
    encumbrances: [],
    pledgors: [{ share: "100%", name: owner, idn: clientId, role: "Залогодатель", check: "Требует проверки" }],
    risks: [{ title: "Требуется первичная проверка данных Excel", level: "Средний", source: "Excel" }],
    documents: [],
    history: [{ date: "2026-06-18 00:45", user: getRole().user, field: "Карточка залога", oldValue: "-", newValue: "Создана из Excel", reason: row.message, source: "Excel" }],
    externalData: { "Источник": "Excel", "Дата проверки": "2026-06-18", "Статус проверки": "Ожидает обогащения" },
    updatedAt: "2026-06-18 00:45"
  };
}

function createDraftCollateralFromForm() {
  const id = (document.getElementById("newCollateralId")?.value || "").trim();
  if (!id) {
    addToast("Укажите идентификатор объекта", "Поле обязательно для создания нового залога.", "warn");
    return null;
  }
  if (state.data.collaterals.some((item) => item.id === id)) {
    addToast("Идентификатор уже существует", `${id} уже есть в реестре залогов.`, "warn");
    return null;
  }
  const type = document.getElementById("newCollateralType")?.value || "Оборудование";
  const contractId = document.getElementById("newCollateralContract")?.value || "";
  const contract = getContract(contractId);
  const clientName = document.getElementById("newCollateralClient")?.value || contract?.clientName || "OOO New Plast";
  const clientId = document.getElementById("newCollateralClientId")?.value || contract?.inn || "309998771";
  const gsz = document.getElementById("newCollateralGsz")?.value || contract?.gsz || "New Plast Group";
  const address = document.getElementById("newCollateralAddress")?.value || "Ташкентская область, промышленная зона Ангрен, склад 7";
  const description = document.getElementById("newCollateralDescription")?.value || `${type}: новый объект залога`;
  return {
    id,
    type,
    clientType: clientName.toLowerCase().includes("ооо") || clientName.toLowerCase().includes("ooo") || clientName.toLowerCase().includes("ao") ? "ЮЛ" : "ФЛ",
    clientName,
    clientId,
    gsz,
    region: address.split(",")[0] || "Регион не указан",
    address,
    description,
    contractIds: contractId ? [contractId] : [],
    status: "Новый",
    source: "Вручную",
    responsible: getRole().user,
    marketValue: 0,
    pledgeValue: 0,
    allocatedValue: 0,
    appraisalStatus: "Требуется оценка",
    appraisalDue: "Не назначена",
    insuranceStatus: "Требуется проверка",
    insuranceDue: "Не назначено",
    riskState: "Новый",
    riskScore: 0,
    crossPledge: false,
    fields: { "Категория": "Требует заполнения", "Подтип": type, "Источник создания": "Форма задачи" },
    monitoring: { required: "ДА", periodicity: "Ежеквартально", lastInspection: "-", nextInspection: "2026-07-17", condition: "Не проверялся", schedule: [] },
    insurance: { company: "Не выбрана", policy: "Не указан", from: "-", to: "-", amount: 0, premiumStatus: "Не проверено", source: "Вручную" },
    evaluations: [],
    encumbrances: [],
    pledgors: [{ share: "100%", name: clientName, idn: clientId, role: "Залогодатель", check: "Требует проверки" }],
    risks: [],
    documents: [],
    history: [{ date: "2026-06-18 00:40", user: getRole().user, field: "Карточка залога", oldValue: "-", newValue: "Создана из задачи", reason: "Ручное добавление объекта", source: "АРМ" }],
    externalData: { "Источник": "Не запрашивался", "Дата проверки": "-", "Статус проверки": "Ожидает обогащения" },
    updatedAt: "2026-06-18 00:40"
  };
}

function getNextCollateralId() {
  const max = state.data.collaterals.reduce((value, item) => {
    const match = String(item.id || "").match(/COL-(\d+)/);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  let next = max + 1;
  let id = `COL-${String(next).padStart(3, "0")}`;
  while (state.data.collaterals.some((item) => item.id === id)) {
    next += 1;
    id = `COL-${String(next).padStart(3, "0")}`;
  }
  return id;
}

function submitNewTask() {
  const selected = state.newTask.selectedCollateralIds.filter((id) => getCollateral(id));
  if (!selected.length) {
    addToast("Выберите объект залога", "Для создания задачи нужно сформировать пул объектов.", "warn");
    return;
  }
  const primary = selected[0];
  const docs = state.newTask.documents || [];
  const task = createTask({
    type: document.getElementById("newTaskType")?.value,
    collateralId: primary,
    collateralIds: selected,
    assignee: document.getElementById("newTaskAssignee")?.value,
    dueDate: document.getElementById("newTaskDue")?.value,
	    priority: document.getElementById("newTaskPriority")?.value,
	    comment: document.getElementById("newTaskComment")?.value,
	    documents: docs
	  });
  state.newTask = { key: "", type: "Плановый мониторинг", selectedCollateralIds: [], documents: [] };
  state.taskActiveCollateral["new-task-draft"] = "";
	  window.location.hash = `/app/tasks/${task.id}`;
	  addToast("Задача создана", "Документы привязаны к задаче и выбранным залогам.", "ok");
	}

function generateConclusion(taskId) {
  const task = getTask(taskId);
  const collateral = getCollateral(task?.collateralId);
  if (!task) return;
  task.expertConclusion = `Сформировано автоматически: объект ${collateral?.id || ""} проверен по документам, фото и внешним данным. Результат допустим для дальнейшего маршрута.`;
  addToast("Заключение сформировано", taskId, "ok");
}

function attachDocument(encoded, filename = "") {
  const [context, ownerId, title, target] = encoded.split("::");
  const owner = context === "task"
    ? (ownerId === "new-task-draft" ? state.newTask : getTask(ownerId))
    : getCollateral(ownerId);
  if (!owner) return;
  owner.documents = owner.documents || [];
  owner.documents.push({ title, name: filename || `${title}.pdf`, target, required: true, status: "Прикреплен", date: "2026-06-17" });
  addToast("Документ прикреплен", `${title}: ${target}`, "ok");
}

function attachPhoto(taskId, collateralId, angle, filename = "") {
  const task = getTask(taskId);
  if (!task) return;
  task.photoShots = task.photoShots || {};
  task.photoShots[collateralId] = task.photoShots[collateralId] || {};
  task.photoShots[collateralId][angle] = { name: filename || `${angle} - демо.jpg`, date: "2026-06-17" };
  addToast("Фото прикреплено", `${collateralId}: ${angle}`, "ok");
}

function attachMobilePhoto(kind, taskId, collateralId, angle) {
  const key = `${taskId}::${collateralId}::${angle}`;
  const store = kind === "employee" ? state.mobile.employeePhotos : state.mobile.clientPhotos;
  store[key] = { name: `${angle} - мобильное фото.jpg`, date: "2026-06-17" };
  updateMobileInspectionTaskResult(kind, taskId, collateralId);
  addToast("Фото сделано", angle, "ok");
}

function updateMobileInspectionTaskResult(kind, taskId, collateralId) {
  const task = getTask(taskId);
  const collateral = getCollateral(collateralId);
  if (!task || !collateral) return;
  const progress = getMobileInspectionProgress(task, collateral);
  const channelText = kind === "client" ? "клиентского осмотра" : "выездного осмотра";
  task.status = progress.done === progress.total ? "Завершена" : "В работе";
  task.result = progress.done === progress.total
    ? `Результат ${channelText} получен: фото ${progress.done}/${progress.total} переданы в основную задачу.`
    : `Фотофиксация ${channelText}: получено ${progress.done}/${progress.total} фото.`;
  if (progress.done !== progress.total || !task.parentTaskId || task.mobileResultSent) return;
  const parent = getTask(task.parentTaskId);
  if (!parent) return;
  parent.history = parent.history || [];
  parent.history.unshift({
    date: "2026-06-17 20:55",
    user: kind === "client" ? task.clientContact || task.client : task.assignee,
    action: kind === "client" ? "Получен клиентский осмотр" : "Получен выездной осмотр",
    status: parent.status,
    comment: `${task.id}: полный комплект фото по объекту ${collateralId}`
  });
  parent.result = `${parent.result || "Основная задача осмотра"} Получен результат ${channelText} ${task.id}.`;
  task.mobileResultSent = true;
}

window.addEventListener("hashchange", render);
render();
