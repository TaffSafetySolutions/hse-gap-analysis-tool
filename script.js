/* ============================================================
   HSE GAP ANALYSIS TOOL
   Static, client-side, no backend. All data lives in the
   browser's localStorage until exported.
   ============================================================ */

const STORAGE_KEY = "hseGapAnalysis_v1";

/* ---------------- FRAMEWORK DEFINITIONS ---------------- */
/* Each requirement: id, ref, title, desc                    */

const FRAMEWORKS = {
  iso45001: {
    label: "ISO 45001",
    requirements: [
      ["4.1","Context of the organization","Determine internal/external issues relevant to the OH&S management system and its intended outcomes."],
      ["4.2","Needs of workers & interested parties","Identify interested parties and their relevant needs, expectations and requirements."],
      ["4.3","Scope of the OH&S MS","Define and document the boundaries and applicability of the management system."],
      ["4.4","OH&S management system","Establish, implement, maintain and continually improve the OH&S MS, including required processes."],
      ["5.1","Leadership & commitment","Top management demonstrates leadership and commitment to the OH&S MS."],
      ["5.2","OH&S policy","A documented policy appropriate to the organization is established and communicated."],
      ["5.3","Roles, responsibilities & authorities","Responsibilities and authorities for relevant roles are assigned and communicated."],
      ["5.4","Consultation & participation of workers","Workers at all levels are consulted and participate in OH&S decision-making."],
      ["6.1.2","Hazard identification & risk assessment","Proactive process to identify hazards and assess OH&S risks on an ongoing basis."],
      ["6.1.3","Legal & other requirements","Applicable legal requirements and other requirements are determined and kept up to date."],
      ["6.2","OH&S objectives & planning","Measurable objectives are established at relevant functions/levels with plans to achieve them."],
      ["7.1","Resources","Resources needed for the OH&S MS are determined and provided."],
      ["7.2","Competence","Worker competence based on education, training or experience is determined and verified."],
      ["7.3","Awareness","Workers are aware of the policy, their contribution, and consequences of non-conformance."],
      ["7.4","Communication","Internal and external communication processes relevant to the OH&S MS are established."],
      ["7.5","Documented information","Required documented information is created, updated and controlled."],
      ["8.1.2","Eliminating hazards & reducing risks","Hierarchy of controls is applied to eliminate hazards and reduce OH&S risks."],
      ["8.1.3","Management of change","Temporary and permanent changes are controlled to manage OH&S risk."],
      ["8.1.4","Procurement & contractors","Procurement, contractors and outsourcing are controlled to manage OH&S risk."],
      ["8.2","Emergency preparedness & response","Processes to prepare for and respond to emergency situations are established and tested."],
      ["9.1","Monitoring, measurement & evaluation","Performance is monitored, measured, analysed and evaluated."],
      ["9.1.2","Evaluation of compliance","Compliance with legal and other requirements is periodically evaluated."],
      ["9.2","Internal audit","Internal audits are conducted at planned intervals to check MS conformance and effectiveness."],
      ["9.3","Management review","Top management reviews the OH&S MS at planned intervals for suitability and effectiveness."],
      ["10.1","Incident, nonconformity & corrective action","Incidents and nonconformities are reported, investigated and corrected."],
      ["10.2","Continual improvement","The suitability, adequacy and effectiveness of the OH&S MS is continually improved."]
    ]
  },
  oshad: {
    label: "OSHAD-SF",
    requirements: [
      ["EL.1","Leadership & accountability","Visible leadership commitment and clear OSH accountability at all management levels."],
      ["EL.2","OSH risk management","Systematic hazard identification, risk assessment and control across all activities."],
      ["EL.3","Legal & other requirements","Applicable UAE/Abu Dhabi legal and OSHAD-SF requirements are identified and tracked."],
      ["EL.4","OSH training","Role-based OSH training and competence verification for the workforce."],
      ["EL.5","Communication","OSH information is communicated effectively across the organization and to stakeholders."],
      ["EL.6","Documents & records","Controlled OSH documents and records are maintained and retrievable."],
      ["EL.7","Emergency preparedness & response","Emergency plans are established, resourced, and tested through drills."],
      ["EL.8","Operational control","Safe systems of work, permits and procedures control routine and non-routine operations."],
      ["EL.9","Management of change","OSH risk is assessed and controlled for changes to process, plant, people or organization."],
      ["EL.10","Third party management","Contractor and supplier OSH performance is pre-qualified, monitored and managed."],
      ["EL.11","Incident notification, reporting & investigation","Incidents are notified, reported and investigated with corrective actions tracked to closure."],
      ["EL.12","Audit & inspection","Planned audits and inspections verify OSH-MS conformance and drive improvement."],
      ["EL.13","Occupational health","Health surveillance, fitness for work and occupational health hazards are managed."],
      ["EL.14","Management review","Senior management periodically reviews OSH performance and system effectiveness."]
    ]
  },
  molksa: {
    label: "Saudi MOL/GOSI",
    requirements: [
      ["KSA.1","Workforce documentation","Valid Iqama, work permits and employment contracts held for all site personnel."],
      ["KSA.2","HSE organization & Safety Officer","Qualified Safety Officer(s)/HSE Committee appointed per workforce size requirements."],
      ["KSA.3","Medical fitness","Workers hold valid medical fitness certificates appropriate to their role."],
      ["KSA.4","PPE provision","Appropriate PPE is provided to workers at no cost and its use is enforced."],
      ["KSA.5","First aid provision","Trained first aiders and adequate first aid facilities are available on site."],
      ["KSA.6","Heat stress / summer midday work ban","Compliance with the Ministry midday outdoor work ban (15 Jun–15 Sep, 12:00–15:00) and heat stress controls."],
      ["KSA.7","Welfare & accommodation facilities","Labor accommodation and site welfare facilities meet applicable housing/welfare standards."],
      ["KSA.8","Fire protection & means of escape","Fire detection, fire fighting equipment and means of escape meet Civil Defence requirements."],
      ["KSA.9","Machinery & lifting equipment certification","Plant, machinery and lifting equipment hold current third-party inspection certificates."],
      ["KSA.10","Permit to work system","Hot work, confined space, excavation and working-at-height activities are controlled by permit."],
      ["KSA.11","Incident reporting (GOSI/MOL)","Work injuries and occupational illnesses are reported to GOSI/MOL within required timeframes."],
      ["KSA.12","Training & induction records","Safety induction and toolbox talk records are maintained for the workforce."],
      ["KSA.13","Working hours compliance","Working hours, rest breaks and overtime comply with Saudi Labor Law limits."],
      ["KSA.14","Contractor HSE pre-qualification","Subcontractors are pre-qualified and monitored against project/client HSE requirements."]
    ]
  }
};

const STATUS_LABELS = {
  compliant: "Compliant",
  partial: "Partial",
  "non-compliant": "Non-compliant",
  na: "Not applicable",
  unassessed: "Unassessed"
};
const STATUS_ORDER = ["compliant","partial","non-compliant","na","unassessed"];
const STATUS_COLORS = {
  compliant: "var(--good)",
  partial: "var(--warn)",
  "non-compliant": "var(--critical)",
  na: "var(--na)",
  unassessed: "var(--steel-light)"
};

/* ---------------- STATE ---------------- */
let state = loadState();

function defaultState() {
  const s = { meta: { project: "", assessor: "", date: "", activeFrameworks: {} }, items: {} };
  Object.keys(FRAMEWORKS).forEach(fw => {
    FRAMEWORKS[fw].requirements.forEach(r => {
      const key = fw + ":" + r[0];
      s.items[key] = {
        framework: fw, ref: r[0], status: "unassessed",
        evidence: "", gap: "", action: "", owner: "",
        targetDate: "", priority: "medium", actionStatus: "open"
      };
    });
  });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const fresh = defaultState();
    // merge saved item data onto fresh scaffold (handles framework list changes gracefully)
    Object.keys(parsed.items || {}).forEach(k => {
      if (fresh.items[k]) fresh.items[k] = Object.assign(fresh.items[k], parsed.items[k]);
    });
    fresh.meta = Object.assign(fresh.meta, parsed.meta || {});
    return fresh;
  } catch (e) {
    console.error("Failed to load saved data, starting fresh.", e);
    return defaultState();
  }
}

function getActiveFrameworksMap() {
  return state.meta.activeFrameworks || {};
}
function getActiveFrameworks() {
  const map = getActiveFrameworksMap();
  // A framework is active unless explicitly switched off (undefined counts as active)
  return Object.keys(FRAMEWORKS).filter(fw => map[fw] !== false);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("projectName").value = state.meta.project || "";
  document.getElementById("assessorName").value = state.meta.assessor || "";
  document.getElementById("assessmentDate").value = state.meta.date || "";

  ["projectName","assessorName","assessmentDate"].forEach(id => {
    document.getElementById(id).addEventListener("input", e => {
      const map = { projectName: "project", assessorName: "assessor", assessmentDate: "date" };
      state.meta[map[id]] = e.target.value;
      saveState();
    });
  });

  Object.keys(FRAMEWORKS).forEach(fw => renderTable(fw));
  renderActionsTable();
  renderFrameworkToggles();
  updateTabVisibility();
  renderDashboard();

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll(".filter-status").forEach(sel => {
    sel.addEventListener("change", () => renderTable(sel.dataset.scope, sel.value));
  });
  document.getElementById("actionStatusFilter").addEventListener("change", e => {
    renderActionsTable(e.target.value);
  });

  document.getElementById("btnExportJSON").addEventListener("click", exportJSON);
  document.getElementById("btnExportExcel").addEventListener("click", exportExcel);
  document.getElementById("btnExportWord").addEventListener("click", exportWordReport);
  document.getElementById("btnExportCSVGaps").addEventListener("click", exportGapCSV);
  document.getElementById("btnExportCSVActions").addEventListener("click", exportActionCSV);
  document.getElementById("btnPrint").addEventListener("click", () => window.print());
  document.getElementById("btnReset").addEventListener("click", resetAll);
  document.getElementById("importFile").addEventListener("change", handleImport);
});

function renderFrameworkToggles() {
  const container = document.getElementById("frameworkToggles");
  const activeMap = getActiveFrameworksMap();
  container.innerHTML = Object.keys(FRAMEWORKS).map(fw => `
    <label class="framework-toggle">
      <input type="checkbox" data-fw="${fw}" ${activeMap[fw] !== false ? "checked" : ""}>
      <span>${FRAMEWORKS[fw].label}</span>
    </label>
  `).join("");

  container.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", e => {
      const fw = e.target.dataset.fw;
      if (!state.meta.activeFrameworks) state.meta.activeFrameworks = {};
      state.meta.activeFrameworks[fw] = e.target.checked;

      const stillHasActive = getActiveFrameworks().length > 0;
      if (!stillHasActive) {
        e.target.checked = true;
        state.meta.activeFrameworks[fw] = true;
        alert("At least one framework needs to stay selected.");
      }
      saveState();
      updateTabVisibility();
      renderDashboard();
    });
  });
}

function updateTabVisibility() {
  const active = getActiveFrameworks();
  let activeTabWasHidden = false;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    const tab = btn.dataset.tab;
    if (FRAMEWORKS[tab]) {
      const show = active.includes(tab);
      btn.style.display = show ? "" : "none";
      if (!show && btn.classList.contains("active")) activeTabWasHidden = true;
    }
  });
  if (activeTabWasHidden) switchTab("dashboard");
}

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + tab));
  if (tab === "dashboard") renderDashboard();
  if (tab === "actions") renderActionsTable();
}

/* ---------------- TABLE RENDERING ---------------- */
function renderTable(fw, statusFilter) {
  statusFilter = statusFilter || "";
  const table = document.getElementById("table-" + fw);
  const reqs = FRAMEWORKS[fw].requirements;

  let html = `<thead><tr>
    <th style="width:70px">Ref</th>
    <th style="width:240px">Requirement</th>
    <th style="width:120px">Status</th>
    <th style="width:180px">Evidence / Notes</th>
    <th style="width:180px">Gap description</th>
    <th style="width:170px">Corrective action</th>
    <th style="width:110px">Owner</th>
    <th style="width:130px">Target date</th>
  </tr></thead><tbody>`;

  reqs.forEach(r => {
    const key = fw + ":" + r[0];
    const item = state.items[key];
    if (statusFilter && item.status !== statusFilter) return;
    const rowClass = item.status === "non-compliant" ? "row-non-compliant" : (item.status === "partial" ? "row-partial" : "");
    html += `<tr class="${rowClass}" data-key="${key}">
      <td class="ref-cell">${r[0]}</td>
      <td><p class="req-title">${r[1]}</p><p class="req-desc">${r[2]}</p></td>
      <td>${statusSelectHTML(item.status, key)}</td>
      <td><textarea rows="2" data-field="evidence" data-key="${key}">${escapeHTML(item.evidence)}</textarea></td>
      <td><textarea rows="2" data-field="gap" data-key="${key}">${escapeHTML(item.gap)}</textarea></td>
      <td><textarea rows="2" data-field="action" data-key="${key}">${escapeHTML(item.action)}</textarea></td>
      <td><input type="text" data-field="owner" data-key="${key}" value="${escapeHTML(item.owner)}"></td>
      <td><input type="date" data-field="targetDate" data-key="${key}" value="${escapeHTML(item.targetDate)}"></td>
    </tr>`;
  });

  html += "</tbody>";
  table.innerHTML = html;

  table.querySelectorAll("select.status-select").forEach(sel => {
    sel.addEventListener("change", e => {
      const key = e.target.dataset.key;
      state.items[key].status = e.target.value;
      saveState();
      renderTable(fw, document.querySelector(`.filter-status[data-scope="${fw}"]`).value);
      renderDashboard();
    });
  });
  table.querySelectorAll("textarea, input[type=text], input[type=date]").forEach(el => {
    el.addEventListener("input", e => {
      const key = e.target.dataset.key;
      const field = e.target.dataset.field;
      state.items[key][field] = e.target.value;
      saveState();
    });
  });
}

function statusSelectHTML(current, key) {
  let opts = STATUS_ORDER.map(s => `<option value="${s}" ${s === current ? "selected" : ""}>${STATUS_LABELS[s]}</option>`).join("");
  return `<select class="status-select status-${current}" data-key="${key}">${opts}</select>`;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

/* ---------------- ACTION PLAN TABLE ---------------- */
function renderActionsTable(filter) {
  filter = filter || "";
  const table = document.getElementById("table-actions");
  const today = new Date().toISOString().slice(0,10);

  const active = getActiveFrameworks();
  let rows = Object.values(state.items).filter(it =>
    active.includes(it.framework) &&
    (it.status === "non-compliant" || it.status === "partial") && (it.action || it.gap)
  );
  if (filter) rows = rows.filter(it => it.actionStatus === filter);

  let html = `<thead><tr>
    <th style="width:90px">Framework</th>
    <th style="width:70px">Ref</th>
    <th style="width:200px">Gap</th>
    <th style="width:200px">Action</th>
    <th style="width:110px">Owner</th>
    <th style="width:120px">Target date</th>
    <th style="width:130px">Action status</th>
    <th style="width:80px">Priority</th>
  </tr></thead><tbody>`;

  if (rows.length === 0) {
    html += `<tr><td colspan="8" style="color:var(--steel-light);text-align:center;padding:24px;">No open gaps with actions recorded yet.</td></tr>`;
  }

  rows.forEach(it => {
    const key = it.framework + ":" + it.ref;
    const overdue = it.targetDate && it.targetDate < today && it.actionStatus !== "closed";
    html += `<tr data-key="${key}">
      <td>${FRAMEWORKS[it.framework].label}</td>
      <td class="ref-cell">${it.ref}</td>
      <td>${escapeHTML(it.gap) || "<span style='color:var(--steel-light)'>—</span>"}</td>
      <td>${escapeHTML(it.action) || "<span style='color:var(--steel-light)'>—</span>"}</td>
      <td>${escapeHTML(it.owner) || "—"}</td>
      <td>${it.targetDate || "—"}${overdue ? '<span class="overdue-flag">OVERDUE</span>' : ''}</td>
      <td>
        <select data-field="actionStatus" data-key="${key}" class="action-status-${it.actionStatus}">
          <option value="open" ${it.actionStatus==="open"?"selected":""}>Open</option>
          <option value="in-progress" ${it.actionStatus==="in-progress"?"selected":""}>In progress</option>
          <option value="closed" ${it.actionStatus==="closed"?"selected":""}>Closed</option>
        </select>
      </td>
      <td>
        <select data-field="priority" data-key="${key}">
          <option value="high" ${it.priority==="high"?"selected":""}>High</option>
          <option value="medium" ${it.priority==="medium"?"selected":""}>Medium</option>
          <option value="low" ${it.priority==="low"?"selected":""}>Low</option>
        </select>
      </td>
    </tr>`;
  });
  html += "</tbody>";
  table.innerHTML = html;

  table.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", e => {
      const key = e.target.dataset.key;
      const field = e.target.dataset.field;
      state.items[key][field] = e.target.value;
      saveState();
      renderActionsTable(filter);
      renderDashboard();
    });
  });
}

/* ---------------- DASHBOARD ---------------- */
function computeStats(fw) {
  const active = getActiveFrameworks();
  const items = Object.values(state.items).filter(it => fw ? it.framework === fw : active.includes(it.framework));
  const scored = items.filter(it => it.status !== "na" && it.status !== "unassessed");
  const compliantWeight = scored.reduce((sum, it) => {
    if (it.status === "compliant") return sum + 1;
    if (it.status === "partial") return sum + 0.5;
    return sum;
  }, 0);
  const pct = scored.length ? Math.round((compliantWeight / scored.length) * 100) : 0;
  const counts = {};
  STATUS_ORDER.forEach(s => counts[s] = 0);
  items.forEach(it => counts[it.status]++);
  return { pct, counts, total: items.length, assessed: scored.length };
}

function renderDashboard() {
  const overall = computeStats(null);
  document.getElementById("statOverall").textContent = overall.assessed ? overall.pct + "%" : "—";
  document.getElementById("statAssessed").textContent = overall.assessed + " / " + overall.total;
  document.getElementById("statGaps").textContent = overall.counts["non-compliant"] + overall.counts["partial"];

  const active = getActiveFrameworks();
  const today = new Date().toISOString().slice(0,10);
  const overdue = Object.values(state.items).filter(it =>
    active.includes(it.framework) &&
    (it.status === "non-compliant" || it.status === "partial") &&
    it.targetDate && it.targetDate < today && it.actionStatus !== "closed"
  ).length;
  document.getElementById("statOverdue").textContent = overdue;

  const gaugeRow = document.getElementById("gaugeRow");
  gaugeRow.innerHTML = "";
  active.forEach(fw => {
    const s = computeStats(fw);
    gaugeRow.appendChild(buildGaugeCard(FRAMEWORKS[fw].label, s.pct, s.assessed));
  });

  const breakdown = document.getElementById("statusBreakdown");
  breakdown.innerHTML = STATUS_ORDER.map(s => {
    const count = overall.counts[s];
    const pct = overall.total ? Math.round((count / overall.total) * 100) : 0;
    return `<div class="status-row">
      <span class="swatch" style="background:${STATUS_COLORS[s]}"></span>
      <span style="width:110px">${STATUS_LABELS[s]}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${pct}%;background:${STATUS_COLORS[s]}"></span></span>
      <span class="count">${count}</span>
    </div>`;
  }).join("");

  const priorityBox = document.getElementById("priorityGaps");
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const openGaps = Object.values(state.items)
    .filter(it => active.includes(it.framework) && (it.status === "non-compliant" || it.status === "partial"))
    .sort((a,b) => (priorityOrder[a.priority]??1) - (priorityOrder[b.priority]??1))
    .slice(0, 8);

  priorityBox.innerHTML = openGaps.length ? openGaps.map(it => `
    <div class="priority-item">
      <span class="priority-ref">${FRAMEWORKS[it.framework].label} ${it.ref}</span>
      <span>${escapeHTML(it.gap) || escapeHTML(it.action) || "Gap identified, details pending"}</span>
    </div>
  `).join("") : `<p class="priority-empty">No gaps recorded yet — assess requirements in each framework tab.</p>`;
}

function buildGaugeCard(label, pct, assessedCount) {
  const div = document.createElement("div");
  div.className = "gauge-card";
  const r = 70, cx = 90, cy = 90;
  const circumference = Math.PI * r; // semicircle length
  const filled = (pct / 100) * circumference;
  const color = pct >= 80 ? "var(--good)" : pct >= 50 ? "var(--warn)" : "var(--critical)";

  div.innerHTML = `
    <svg viewBox="0 0 180 100" width="100%" height="100">
      <path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}"
            fill="none" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/>
      <path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}"
            fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
            stroke-dasharray="${filled} ${circumference - filled}"/>
    </svg>
    <div class="gauge-pct">${assessedCount ? pct + "%" : "—"}</div>
    <h4>${label}</h4>
  `;
  return div;
}

/* ---------------- EXPORT / IMPORT ---------------- */
function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportJSON() {
  downloadBlob(JSON.stringify(state, null, 2), "hse-gap-analysis-" + dateStamp() + ".json", "application/json");
}

function exportExcel() {
  if (typeof XLSX === "undefined") {
    alert("The Excel export library didn't load (check your internet connection) — please try again, or use the CSV export instead.");
    return;
  }
  const active = getActiveFrameworks();
  const wb = XLSX.utils.book_new();

  // --- Summary sheet ---
  const overall = computeStats(null);
  const summaryRows = [
    ["HSE Gap Analysis Report"],
    [],
    ["Project / Site", state.meta.project || ""],
    ["Assessor", state.meta.assessor || ""],
    ["Assessment date", state.meta.date || ""],
    ["Report generated", dateStamp()],
    [],
    ["Overall compliance", overall.assessed ? overall.pct + "%" : "N/A"],
    ["Requirements assessed", overall.assessed + " / " + overall.total],
    ["Open gaps (non-compliant + partial)", overall.counts["non-compliant"] + overall.counts["partial"]],
    [],
    ["Framework", "Compliance %", "Compliant", "Partial", "Non-compliant", "Not applicable", "Unassessed"]
  ];
  active.forEach(fw => {
    const s = computeStats(fw);
    summaryRows.push([FRAMEWORKS[fw].label, s.assessed ? s.pct + "%" : "N/A",
      s.counts.compliant, s.counts.partial, s.counts["non-compliant"], s.counts.na, s.counts.unassessed]);
  });
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // --- One sheet per active framework ---
  active.forEach(fw => {
    const rows = [["Ref", "Requirement", "Description", "Status", "Evidence / Notes", "Gap Description", "Corrective Action", "Owner", "Target Date"]];
    FRAMEWORKS[fw].requirements.forEach(r => {
      const item = state.items[fw + ":" + r[0]];
      rows.push([r[0], r[1], r[2], STATUS_LABELS[item.status], item.evidence, item.gap, item.action, item.owner, item.targetDate]);
    });
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [{ wch: 10 }, { wch: 26 }, { wch: 40 }, { wch: 14 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, sheet, FRAMEWORKS[fw].label.slice(0, 31));
  });

  // --- Action plan sheet ---
  const actionRows = [["Framework", "Ref", "Gap", "Action", "Owner", "Target Date", "Action Status", "Priority"]];
  Object.values(state.items)
    .filter(it => active.includes(it.framework) && (it.status === "non-compliant" || it.status === "partial"))
    .forEach(it => {
      actionRows.push([FRAMEWORKS[it.framework].label, it.ref, it.gap, it.action, it.owner, it.targetDate, it.actionStatus, it.priority]);
    });
  const actionSheet = XLSX.utils.aoa_to_sheet(actionRows);
  actionSheet["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, actionSheet, "Action Plan");

  XLSX.writeFile(wb, "hse-gap-analysis-" + dateStamp() + ".xlsx");
}

function exportWordReport() {
  const active = getActiveFrameworks();
  const overall = computeStats(null);

  const statusBg = {
    compliant: "#E4F1EC", partial: "#FBF1DC", "non-compliant": "#FBEAE3",
    na: "#EEF0EF", unassessed: "#F6F6F5"
  };

  function tableFor(fw) {
    let rows = `<tr>
      <th style="width:8%">Ref</th><th style="width:18%">Requirement</th><th style="width:12%">Status</th>
      <th style="width:16%">Evidence / Notes</th><th style="width:16%">Gap Description</th>
      <th style="width:16%">Corrective Action</th><th style="width:8%">Owner</th><th style="width:8%">Target Date</th>
    </tr>`;
    FRAMEWORKS[fw].requirements.forEach(r => {
      const item = state.items[fw + ":" + r[0]];
      rows += `<tr style="background:${statusBg[item.status]}">
        <td><b>${r[0]}</b></td>
        <td><b>${escapeHTML(r[1])}</b><br><span style="font-size:8.5pt;color:#555">${escapeHTML(r[2])}</span></td>
        <td>${STATUS_LABELS[item.status]}</td>
        <td>${escapeHTML(item.evidence)}</td>
        <td>${escapeHTML(item.gap)}</td>
        <td>${escapeHTML(item.action)}</td>
        <td>${escapeHTML(item.owner)}</td>
        <td>${item.targetDate || ""}</td>
      </tr>`;
    });
    return `<h2>${FRAMEWORKS[fw].label}</h2><table>${rows}</table>`;
  }

  let actionRows = `<tr>
    <th style="width:12%">Framework</th><th style="width:8%">Ref</th><th style="width:22%">Gap</th>
    <th style="width:22%">Action</th><th style="width:12%">Owner</th><th style="width:10%">Target Date</th>
    <th style="width:9%">Status</th><th style="width:5%">Priority</th>
  </tr>`;
  const openItems = Object.values(state.items).filter(it => active.includes(it.framework) && (it.status === "non-compliant" || it.status === "partial"));
  if (openItems.length === 0) {
    actionRows += `<tr><td colspan="8" style="text-align:center;color:#888">No open gaps recorded.</td></tr>`;
  } else {
    openItems.forEach(it => {
      actionRows += `<tr style="background:${statusBg[it.status]}">
        <td>${FRAMEWORKS[it.framework].label}</td><td><b>${it.ref}</b></td>
        <td>${escapeHTML(it.gap)}</td><td>${escapeHTML(it.action)}</td>
        <td>${escapeHTML(it.owner)}</td><td>${it.targetDate || ""}</td>
        <td>${it.actionStatus}</td><td>${it.priority}</td>
      </tr>`;
    });
  }

  const summaryTableRows = active.map(fw => {
    const s = computeStats(fw);
    return `<tr><td>${FRAMEWORKS[fw].label}</td><td>${s.assessed ? s.pct + "%" : "N/A"}</td>
      <td>${s.counts.compliant}</td><td>${s.counts.partial}</td><td>${s.counts["non-compliant"]}</td>
      <td>${s.counts.na}</td><td>${s.counts.unassessed}</td></tr>`;
  }).join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>HSE Gap Analysis Report</title>
    <!--[if gte mso 9]>
    <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom></w:WordDocument></xml>
    <![endif]-->
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; color: #16232E; }
      h1 { font-size: 20pt; color: #16232E; border-bottom: 3px solid #C1440E; padding-bottom: 8px; }
      h2 { font-size: 14pt; color: #16232E; margin-top: 26px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
      th, td { border: 1px solid #999; padding: 5px 7px; font-size: 9pt; vertical-align: top; text-align: left; }
      th { background: #16232E; color: #fff; }
      .meta-table td { border: none; padding: 2px 6px 2px 0; }
    </style>
  </head>
  <body>
    <h1>HSE Gap Analysis Report</h1>
    <table class="meta-table" style="width:auto;margin-bottom:18px;">
      <tr><td><b>Project / Site:</b></td><td>${escapeHTML(state.meta.project) || "—"}</td></tr>
      <tr><td><b>Assessor:</b></td><td>${escapeHTML(state.meta.assessor) || "—"}</td></tr>
      <tr><td><b>Assessment date:</b></td><td>${state.meta.date || "—"}</td></tr>
      <tr><td><b>Report generated:</b></td><td>${dateStamp()}</td></tr>
      <tr><td><b>Overall compliance:</b></td><td>${overall.assessed ? overall.pct + "%" : "N/A"} (${overall.assessed} / ${overall.total} requirements assessed)</td></tr>
    </table>

    <h2>Summary by framework</h2>
    <table>
      <tr><th>Framework</th><th>Compliance %</th><th>Compliant</th><th>Partial</th><th>Non-compliant</th><th>N/A</th><th>Unassessed</th></tr>
      ${summaryTableRows}
    </table>

    ${active.map(fw => tableFor(fw)).join("")}

    <h2>Consolidated Action Plan</h2>
    <table>${actionRows}</table>
  </body>
  </html>`;

  downloadBlob(html, "hse-gap-analysis-" + dateStamp() + ".doc", "application/msword");
}

function exportGapCSV() {
  const rows = [["Framework","Ref","Status","Evidence/Notes","Gap Description","Action","Owner","Target Date"]];
  Object.values(state.items).forEach(it => {
    rows.push([FRAMEWORKS[it.framework].label, it.ref, STATUS_LABELS[it.status], it.evidence, it.gap, it.action, it.owner, it.targetDate]);
  });
  downloadBlob(toCSV(rows), "hse-gap-register-" + dateStamp() + ".csv", "text/csv");
}

function exportActionCSV() {
  const rows = [["Framework","Ref","Gap","Action","Owner","Target Date","Action Status","Priority"]];
  Object.values(state.items)
    .filter(it => it.status === "non-compliant" || it.status === "partial")
    .forEach(it => {
      rows.push([FRAMEWORKS[it.framework].label, it.ref, it.gap, it.action, it.owner, it.targetDate, it.actionStatus, it.priority]);
    });
  downloadBlob(toCSV(rows), "hse-action-plan-" + dateStamp() + ".csv", "text/csv");
}

function toCSV(rows) {
  return rows.map(r => r.map(cell => {
    const v = (cell === undefined || cell === null) ? "" : String(cell);
    return '"' + v.replace(/"/g, '""') + '"';
  }).join(",")).join("\r\n");
}

function dateStamp() {
  return new Date().toISOString().slice(0,10);
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!parsed.items) throw new Error("File does not look like a valid export.");
      const fresh = defaultState();
      Object.keys(parsed.items).forEach(k => {
        if (fresh.items[k]) fresh.items[k] = Object.assign(fresh.items[k], parsed.items[k]);
      });
      fresh.meta = Object.assign(fresh.meta, parsed.meta || {});
      state = fresh;
      saveState();
      document.getElementById("projectName").value = state.meta.project || "";
      document.getElementById("assessorName").value = state.meta.assessor || "";
      document.getElementById("assessmentDate").value = state.meta.date || "";
      Object.keys(FRAMEWORKS).forEach(fw => renderTable(fw));
      renderActionsTable();
      renderFrameworkToggles();
      updateTabVisibility();
      renderDashboard();
      alert("Data imported successfully.");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function resetAll() {
  if (!confirm("This will permanently clear all assessment data in this browser. Export a backup first if needed. Continue?")) return;
  state = defaultState();
  saveState();
  document.getElementById("projectName").value = "";
  document.getElementById("assessorName").value = "";
  document.getElementById("assessmentDate").value = "";
  Object.keys(FRAMEWORKS).forEach(fw => renderTable(fw));
  renderActionsTable();
  renderFrameworkToggles();
  updateTabVisibility();
  renderDashboard();
}
