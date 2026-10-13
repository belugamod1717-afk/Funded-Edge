// FundedEdge — homepage/directory script
// Renders firm cards into #firmsGrid if it exists on the page.

import { db, SUPABASE_URL, SUPABASE_KEY } from "./supabase.js";

let allFirms = [];
let currentUser = null;
let initPromise = null;

/* ---------- HELPERS ---------- */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function getNumbers(value) {
  const matches = String(value ?? "").match(/\d[\d,]*(?:\.\d+)?\s*[kKmM]?/g) || [];
  return matches.map(item => {
    const cleaned = item.replace(/,/g, "").replace(/\s/g, "");
    const multiplier = /m$/i.test(cleaned) ? 1000000 : /k$/i.test(cleaned) ? 1000 : 1;
    return parseFloat(cleaned.replace(/[kKmM]$/, "")) * multiplier;
  }).filter(Number.isFinite);
}

function getLogoDomain(firm) {
  const name = (firm.name || "").toLowerCase().trim();
  const known = {
    "ftmo": "ftmo.com",
    "the5ers": "the5ers.com",
    "the 5ers": "the5ers.com",
    "topstep": "topstep.com",
    "apex trader funding": "apextraderfunding.com"
  };
  if (known[name]) return known[name];
  try {
    const u = new URL(firm.official_website || "");
    if (u.protocol === "https:" || u.protocol === "http:") return u.hostname;
  } catch (_) {}
  return "";
}

function getInitials(name) {
  const words = String(name || "PF").trim().split(/\s+/).filter(Boolean);
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (words[0] || "PF").slice(0, 2).toUpperCase();
}

function logoURL(firm) {
  const domain = getLogoDomain(firm);
  return firm.logo_url ||
    (domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : "");
}

/* ---------- STYLES ---------- */
function injectStyles() {
  if (document.getElementById("fe-firm-styles")) return;
  const style = document.createElement("style");
  style.id = "fe-firm-styles";
  style.textContent = `
    #firmsGrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    #firmsGrid .firm-card {
      display: flex;
      flex-direction: column;
      padding: 18px;
      background: var(--surface, #131820);
      border: 1px solid var(--line, #242b35);
      border-radius: 10px;
      transition: border-color .15s, background .15s;
      min-width: 0;
    }
    #firmsGrid .firm-card:hover {
      border-color: var(--line-2, #2f3846);
      background: var(--surface-2, #161c26);
    }

    #firmsGrid .firm-head {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    #firmsGrid .firm-logo {
      position: relative;
      width: 44px; height: 44px;
      flex-shrink: 0;
      border-radius: 8px;
      border: 1px solid var(--line, #242b35);
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-size: 14px;
      font-weight: 700;
      color: var(--accent, #4a9eff);
      isolation: isolate;
      contain: paint;
    }
    #firmsGrid .firm-logo img {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: contain;
      padding: 6px;
      background: #fff;
      z-index: 1;
    }
    #firmsGrid .firm-meta { flex: 1; min-width: 0; }
    #firmsGrid .firm-cat {
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: .4px;
      color: var(--text-mute, #6b7787);
      margin-bottom: 3px;
    }
    #firmsGrid .firm-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text, #e6ebf0);
      margin: 0;
      overflow-wrap: anywhere;
    }
    #firmsGrid .firm-rating {
      font-size: 12px;
      font-weight: 600;
      color: var(--gold, #e4b949);
      flex-shrink: 0;
    }

    #firmsGrid .firm-desc {
      font-size: 13px;
      color: var(--text-dim, #a3aebd);
      line-height: 1.6;
      margin: 0 0 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    #firmsGrid .firm-rows {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 12px;
      padding-top: 12px;
      border-top: 1px solid var(--line, #242b35);
      margin-bottom: 14px;
    }
    #firmsGrid .firm-rows .k {
      font-size: 10.5px;
      color: var(--text-mute, #6b7787);
      margin-bottom: 2px;
      letter-spacing: .3px;
      text-transform: uppercase;
    }
    #firmsGrid .firm-rows .v {
      font-size: 12.5px;
      color: var(--text, #e6ebf0);
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    #firmsGrid .firm-cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding-top: 12px;
      border-top: 1px solid var(--line, #242b35);
      margin-top: auto;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent, #4a9eff);
      text-decoration: none;
      transition: color .15s;
    }
    #firmsGrid .firm-cta:hover { color: #7db8ff; }

    #firmsGrid .fe-no-results {
      grid-column: 1 / -1;
      padding: 40px 20px;
      text-align: center;
      border: 1px dashed var(--line-2, #2f3846);
      border-radius: 10px;
      color: var(--text-dim, #a3aebd);
      font-size: 13.5px;
    }
  `;
  document.head.appendChild(style);
}

/* ---------- LOAD SESSION ---------- */
async function initSession() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { data } = await db.auth.getSession();
    currentUser = data.session?.user || null;
  })().catch(err => console.error("Session init failed:", err));
  return initPromise;
}

/* ---------- RENDER ---------- */
function renderFirms() {
  const grid = document.getElementById("firmsGrid");
  if (!grid) return;

  const search = (document.getElementById("feSearch")?.value || "").trim().toLowerCase();
  const category = document.getElementById("feCategory")?.value || "";
  const minAccount = Number(document.getElementById("feAccount")?.value || 0);
  const maxPrice = Number(document.getElementById("fePrice")?.value || 999999);
  const sort = document.getElementById("feSort")?.value || "rating";

  let firms = allFirms.filter(firm => {
    const searchable = [firm.name, firm.category, firm.description, firm.tag, firm.platforms]
      .join(" ").toLowerCase();
    const accountNumbers = getNumbers(firm.account_sizes);
    const maxAccountSize = accountNumbers.length ? Math.max(...accountNumbers) : 0;
    const prices = getNumbers(firm.price);
    const startingPrice = prices.length ? Math.min(...prices) : null;

    return searchable.includes(search) &&
      (!category || firm.category === category) &&
      (!minAccount || maxAccountSize >= minAccount) &&
      (maxPrice === 999999 || (startingPrice !== null && startingPrice <= maxPrice));
  });

  firms.sort((a, b) => {
    if (sort === "name") return (a.name || "").localeCompare(b.name || "");
    if (sort === "price") {
      const pa = getNumbers(a.price), pb = getNumbers(b.price);
      return (pa.length ? Math.min(...pa) : Infinity) - (pb.length ? Math.min(...pb) : Infinity);
    }
    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
  });

  if (!firms.length) {
    grid.innerHTML = `<div class="fe-no-results">No firms match your search.</div>`;
    return;
  }

  grid.innerHTML = firms.map(firm => {
    const logo = logoURL(firm);
    const rating = firm.rating ? `★ ${firm.rating}` : "—";
    return `<article class="firm-card">
      <div class="firm-head">
        <div class="firm-logo">
          <span>${escapeHTML(getInitials(firm.name))}</span>
          ${logo ? `<img src="${escapeHTML(logo)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
        </div>
        <div class="firm-meta">
          <div class="firm-cat">${escapeHTML(firm.category || "Prop Firm")}</div>
          <h3 class="firm-name">${escapeHTML(firm.name)}</h3>
        </div>
        <div class="firm-rating">${escapeHTML(rating)}</div>
      </div>
      <p class="firm-desc">${escapeHTML(firm.description || "Trading conditions and account options.")}</p>
      <div class="firm-rows">
        <div><div class="k">Accounts</div><div class="v">${escapeHTML(firm.account_sizes || "—")}</div></div>
        <div><div class="k">From</div><div class="v">${escapeHTML(firm.price || "—")}</div></div>
        <div><div class="k">Target</div><div class="v">${escapeHTML(firm.profit_target || "—")}</div></div>
        <div><div class="k">Split</div><div class="v">${escapeHTML(firm.profit_split || "—")}</div></div>
      </div>
      <a class="firm-cta" href="firm.html?id=${encodeURIComponent(firm.id)}">View details →</a>
    </article>`;
  }).join("");
}

/* ---------- FILTERS ---------- */
function createFilters(grid) {
  if (document.getElementById("feFilters")) return;

  const wrapper = document.createElement("section");
  wrapper.innerHTML = `
    <button class="fe-filters-toggle" id="feFiltersToggle" type="button" aria-expanded="false">
      <span>Filters</span>
      <span class="fe-caret">▼</span>
    </button>
    <div class="fe-filters" id="feFilters">
      <div><label class="fe-filter-label" for="feSearch">Search</label><input id="feSearch" type="search" placeholder="Search by name..."></div>
      <div><label class="fe-filter-label" for="feCategory">Category</label><select id="feCategory"><option value="">All categories</option></select></div>
      <div><label class="fe-filter-label" for="feAccount">Min account</label><select id="feAccount"><option value="0">Any</option><option value="10000">$10K+</option><option value="25000">$25K+</option><option value="50000">$50K+</option><option value="100000">$100K+</option></select></div>
      <div><label class="fe-filter-label" for="fePrice">Max price</label><select id="fePrice"><option value="999999">Any</option><option value="50">Up to $50</option><option value="100">Up to $100</option><option value="200">Up to $200</option></select></div>
      <div><label class="fe-filter-label" for="feSort">Sort by</label><select id="feSort"><option value="rating">Highest rated</option><option value="name">Name A–Z</option><option value="price">Lowest price</option></select></div>
      <div class="fe-filter-actions"><button class="fe-reset" id="feReset" type="button">Reset</button></div>
    </div>
    <p class="fe-results-count" id="feResultsCount"></p>
  `;
  grid.parentNode.insertBefore(wrapper, grid);

  const categories = [...new Set(allFirms.map(f => f.category).filter(Boolean))].sort();
  const catSelect = wrapper.querySelector("#feCategory");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  wrapper.querySelectorAll("input,select").forEach(control => {
    control.addEventListener("input", renderFirms);
    control.addEventListener("change", renderFirms);
  });

  wrapper.querySelector("#feReset").addEventListener("click", () => {
    wrapper.querySelector("#feSearch").value = "";
    wrapper.querySelector("#feCategory").value = "";
    wrapper.querySelector("#feAccount").value = "0";
    wrapper.querySelector("#fePrice").value = "999999";
    wrapper.querySelector("#feSort").value = "rating";
    renderFirms();
  });

  const toggleBtn = wrapper.querySelector("#feFiltersToggle");
  const panel = wrapper.querySelector("#feFilters");
  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggleBtn.classList.toggle("is-open", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggleBtn.querySelector("span").textContent = isOpen ? "Hide filters" : "Filters";
  });
}

/* ---------- LOAD ---------- */
async function loadFirms() {
  const grid = document.getElementById("firmsGrid");
  if (!grid) return;

  injectStyles();
  grid.innerHTML = `<div class="fe-no-results">Loading firms…</div>`;

  await initSession();

  try {
    const { data, error } = await db.from("firms").select("*").eq("status", "active").order("rating", { ascending: false });
    if (error) throw error;
    allFirms = data || [];
    window.allFirms = allFirms;
    createFilters(grid);
    renderFirms();
  } catch (error) {
    console.error("FundedEdge error:", error);
    grid.innerHTML = `<div class="fe-no-results">Couldn't load prop firms.</div>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadFirms);
} else {
  loadFirms();
}
