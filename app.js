const SUPABASE_URL = "https://mvltzznwdglwaedfzxze.supabase.co";
const SUPABASE_KEY = "sb_publishable_6Z18S8P-DzDiBcl_EwRuZQ_nrq_8hid";

let allFirms = [];
let feSupabase = null;
let feCurrentUser = null;
let feMemberInitPromise = null;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getNumbers(value) {
  const matches = String(value ?? "").match(/\d[\d,]*(?:\.\d+)?\s*[kKmM]?/g) || [];

  return matches.map(item => {
    const cleaned = item.replace(/,/g, "").replace(/\s/g, "");
    const multiplier = /m$/i.test(cleaned) ? 1000000 :
      /k$/i.test(cleaned) ? 1000 : 1;

    return parseFloat(cleaned.replace(/[kKmM]$/, "")) * multiplier;
  }).filter(Number.isFinite);
}

/* MEMBER SESSION */

async function initMemberFeatures() {
  if (feMemberInitPromise) return feMemberInitPromise;

  feMemberInitPromise = (async () => {
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );

    feSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await feSupabase.auth.getSession();
    if (error) throw error;

    feCurrentUser = data.session?.user || null;

    renderAuthArea();
  })().catch(error => {
    console.error("Member features initialization failed:", error);
    renderAuthArea();
  });

  return feMemberInitPromise;
}

/* AUTH NAV */

function getDashboardUrl() {
  return "dashboard.html";
}

function getAuthUrl(mode) {
  const page = window.location.pathname.split("/").pop() || "index.html";
  const next = encodeURIComponent(page + window.location.search);
  return `auth.html?mode=${mode}&next=${next}`;
}

function renderAuthArea() {
  const area = document.getElementById("feAuthArea");
  if (!area) return;

  if (feCurrentUser) {
    const name =
      feCurrentUser.user_metadata?.full_name ||
      feCurrentUser.user_metadata?.name ||
      feCurrentUser.email ||
      "Account";
    const initial = String(name).trim().charAt(0).toUpperCase() || "U";

    area.innerHTML = `
      <a class="fe-user-chip" href="${getDashboardUrl()}">
        <span class="fe-user-initial">${escapeHTML(initial)}</span>
        <span>Dashboard</span>
      </a>
    `;
  } else {
    area.innerHTML = `
      <a class="nav-cta fe-auth-signin" href="${getAuthUrl("signin")}">Sign In</a>
      <a class="nav-cta fe-auth-signup" href="${getAuthUrl("signup")}">Sign Up</a>
    `;
  }
}

/* PREMIUM DIRECTORY STYLES */

function injectDirectoryStyles() {
  if (document.getElementById("fe-directory-styles")) return;

  const style = document.createElement("style");
  style.id = "fe-directory-styles";

  style.textContent = `
    #firmsGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      align-items: stretch;
    }

    .fe-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
      gap: 12px;
      margin: 24px 0;
      padding: 20px;
      border: 1px solid #254634;
      border-radius: 16px;
      background: linear-gradient(145deg, #102219, #0a1510);
      box-shadow: 0 12px 35px rgba(0,0,0,.12);
    }

    .fe-filters input,
    .fe-filters select {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      padding: 12px;
      border: 1px solid #315343;
      border-radius: 9px;
      background: #0a1710;
      color: #f1f7f3;
      font: inherit;
      outline: none;
    }

    .fe-filters input:focus,
    .fe-filters select:focus {
      border-color: #72f0a8;
      box-shadow: 0 0 0 3px rgba(114,240,168,.1);
    }

    .fe-filters input::placeholder { color: #91a99a; }

    .fe-filter-label {
      display: block;
      margin-bottom: 7px;
      color: #b6cabb;
      font-size: 12px;
      font-weight: 600;
    }

    .fe-filter-actions {
      display: flex;
      align-items: end;
    }

    .fe-reset {
      width: 100%;
      padding: 12px;
      border: 1px solid #315343;
      border-radius: 9px;
      background: #183b27;
      color: #8ff4b5;
      font-weight: 700;
      cursor: pointer;
      transition: .2s;
    }

    .fe-reset:hover {
      background: #214b32;
      border-color: #72f0a8;
    }

    .fe-results-count {
      margin: 14px 0;
      color: #9eb4a4;
      font-size: 13px;
    }

    #firmsGrid .firm-card {
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding: 23px;
      overflow: hidden;
      border: 1px solid #274735;
      border-radius: 17px;
      background:
        radial-gradient(ellipse at top right, rgba(57,133,82,.12), transparent 48%),
        linear-gradient(145deg, #112219, #0b1510 80%);
      box-shadow: 0 8px 26px rgba(0,0,0,.13);
      transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
    }

    #firmsGrid .firm-card:hover {
      transform: translateY(-4px);
      border-color: #4e9166;
      box-shadow: 0 16px 36px rgba(0,0,0,.24);
    }

    #firmsGrid .firm-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 17px;
      border-bottom: 1px solid rgba(126,166,137,.16);
    }

    #firmsGrid .firm-card-top > div:first-child { min-width: 0; }

    #firmsGrid .firm-brand {
      display: flex;
      align-items: center;
      gap: 13px;
      min-width: 0;
    }

    #firmsGrid .firm-logo {
      position: relative;
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
      overflow: hidden;
      border: 1px solid #315440;
      border-radius: 13px;
      background: linear-gradient(145deg,#1a3825,#0b1710);
      color: #82edaa;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    #firmsGrid .firm-logo img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      padding: 9px;
      box-sizing: border-box;
      object-fit: contain;
      background: #f7faf7;
    }

    #firmsGrid .firm-brand-info { min-width: 0; }

    #firmsGrid .firm-tag {
      display: inline-block;
      max-width: 100%;
      margin-bottom: 9px;
      padding: 5px 9px;
      border: 1px solid #28583a;
      border-radius: 6px;
      background: rgba(41,102,61,.18);
      color: #82edaa;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      overflow-wrap: anywhere;
    }

    #firmsGrid .firm-card h3 {
      margin: 0;
      color: #f0f8f2;
      font-family: "Manrope","DM Sans",Arial,sans-serif;
      font-size: 21px;
      font-weight: 800;
      line-height: 1.35;
      letter-spacing: -.6px;
      overflow-wrap: anywhere;
    }

    #firmsGrid .firm-rating {
      flex-shrink: 0;
      padding: 6px 9px;
      border: 1px solid #4b4327;
      border-radius: 8px;
      background: #211f13;
      color: #f5d77b;
      font-size: 13px;
      font-weight: 800;
    }

    #firmsGrid .firm-description {
      min-height: 48px;
      margin: 15px 0 20px;
      color: #a7bbae;
      font-size: 13px;
      line-height: 1.75;
      overflow-wrap: anywhere;
    }

    #firmsGrid .firm-stats {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 10px;
      margin-bottom: 22px;
    }

    #firmsGrid .firm-stats > div {
      min-width: 0;
      padding: 13px;
      border: 1px solid rgba(100,145,112,.16);
      border-radius: 10px;
      background: rgba(5,16,10,.55);
    }

    #firmsGrid .firm-stats small {
      display: block;
      margin-bottom: 6px;
      color: #91a99a;
      font-size: 11px;
      line-height: 1.4;
    }

    #firmsGrid .firm-stats strong {
      display: block;
      color: #eaf5ed;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.5;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    #firmsGrid .firm-stats > div:first-child strong,
    #firmsGrid .firm-stats > div:last-child strong { color: #80eaaa; }

    #firmsGrid .firm-card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: auto;
      padding-top: 17px;
      border-top: 1px solid rgba(126,166,137,.16);
    }

    #firmsGrid .firm-price {
      color: #f0f8f2;
      font-size: 17px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    #firmsGrid .firm-card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 8px;
    }

    #firmsGrid .firm-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 11px 15px;
      border: 1px solid #72f0a8;
      border-radius: 9px;
      background: #72f0a8;
      color: #07150d;
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
      transition: .2s;
    }

    #firmsGrid .firm-button::after { content: " ↗"; margin-left: 4px; }

    #firmsGrid .firm-button:hover {
      border-color: #a4ffc5;
      background: #a4ffc5;
      transform: translateY(-1px);
    }

    #firmsGrid .fe-no-results {
      grid-column: 1 / -1;
      padding: 35px 20px;
      border: 1px dashed #315343;
      border-radius: 14px;
      background: #0d1b15;
      color: #dce9df;
      text-align: center;
    }

    #firmsGrid .fe-no-results h3 { margin-top: 0; }
    #firmsGrid .fe-no-results p { color: #a7bbae; overflow-wrap: anywhere; }

    @media (max-width:760px) {
      #firmsGrid { grid-template-columns: 1fr; gap: 15px; }
      #firmsGrid .firm-card { padding: 20px; }
      #firmsGrid .firm-description { min-height: 0; }
    }

    @media (max-width:480px) {
      .fe-filters { grid-template-columns: 1fr; padding: 14px; }
      #firmsGrid .firm-card { padding: 17px; border-radius: 14px; }
      #firmsGrid .firm-card h3 { font-size: 19px; }
      #firmsGrid .firm-logo { width: 46px; height: 46px; border-radius: 11px; }
      #firmsGrid .firm-stats { gap: 8px; }
      #firmsGrid .firm-stats > div { padding: 11px; }
      #firmsGrid .firm-stats strong { font-size: 13px; }
      #firmsGrid .firm-price { font-size: 15px; }
      #firmsGrid .firm-button { padding: 10px 11px; }
    }
  `;

  document.head.appendChild(style);
}

function createFilters(grid) {
  if (document.getElementById("feFilters")) return;

  const wrapper = document.createElement("section");
  wrapper.innerHTML = `
    <div class="fe-filters" id="feFilters">
      <div>
        <label class="fe-filter-label" for="feSearch">Search firms</label>
        <input id="feSearch" type="search" placeholder="Search by name..." />
      </div>
      <div>
        <label class="fe-filter-label" for="feCategory">Firm category</label>
        <select id="feCategory"><option value="">All categories</option></select>
      </div>
      <div>
        <label class="fe-filter-label" for="feAccount">Minimum account size</label>
        <select id="feAccount">
          <option value="0">Any account size</option>
          <option value="10000">$10,000+</option>
          <option value="25000">$25,000+</option>
          <option value="50000">$50,000+</option>
          <option value="100000">$100,000+</option>
        </select>
      </div>
      <div>
        <label class="fe-filter-label" for="fePrice">Maximum starting price</label>
        <select id="fePrice">
          <option value="999999">Any price</option>
          <option value="50">Up to $50</option>
          <option value="100">Up to $100</option>
          <option value="200">Up to $200</option>
        </select>
      </div>
      <div>
        <label class="fe-filter-label" for="feSort">Sort results</label>
        <select id="feSort">
          <option value="rating">Highest rated</option>
          <option value="name">Name: A to Z</option>
          <option value="price">Lowest starting price</option>
        </select>
      </div>
      <div class="fe-filter-actions">
        <button class="fe-reset" id="feReset" type="button">Reset filters</button>
      </div>
    </div>
    <p class="fe-results-count" id="feResultsCount" aria-live="polite"></p>
  `;

  grid.parentNode.insertBefore(wrapper, grid);

  const categories = [...new Set(allFirms.map(f => f.category).filter(Boolean))].sort();
  const categorySelect = wrapper.querySelector("#feCategory");

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
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
}

function renderFirms() {
  const grid = document.getElementById("firmsGrid");
  if (!grid) return;

  const search = (document.getElementById("feSearch")?.value || "").trim().toLowerCase();
  const category = document.getElementById("feCategory")?.value || "";
  const minAccount = Number(document.getElementById("feAccount")?.value || 0);
  const maxPrice = Number(document.getElementById("fePrice")?.value || 999999);
  const sort = document.getElementById("feSort")?.value || "rating";

  let firms = allFirms.filter(firm => {
    const searchable = [
      firm.name, firm.category, firm.description, firm.tag, firm.platforms
    ].join(" ").toLowerCase();

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
      const pa = getNumbers(a.price);
      const pb = getNumbers(b.price);
      return (pa.length ? Math.min(...pa) : Infinity) -
        (pb.length ? Math.min(...pb) : Infinity);
    }

    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
  });

  const count = document.getElementById("feResultsCount");
  if (count) count.textContent = `Showing ${firms.length} of ${allFirms.length} prop firms`;

  if (!firms.length) {
    grid.innerHTML = `
      <div class="fe-no-results">
        <h3>No matching firms found</h3>
        <p>Try changing your search or resetting the filters.</p>
      </div>`;
    return;
  }

  function getLogoDomain(firm) {
    const name = (firm.name || "").toLowerCase().trim();
    const knownDomains = {
      "ftmo": "ftmo.com",
      "the5ers": "the5ers.com",
      "the 5ers": "the5ers.com",
      "topstep": "topstep.com",
      "apex trader funding": "apextraderfunding.com"
    };

    if (knownDomains[name]) return knownDomains[name];

    try {
      const url = new URL(firm.official_website || "");
      if (url.protocol === "https:" || url.protocol === "http:") return url.hostname;
    } catch (_) {}

    return "";
  }

  function getInitials(name) {
    const words = String(name || "PF").trim().split(/\s+/).filter(Boolean);
    return words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (words[0] || "PF").slice(0, 2).toUpperCase();
  }

  grid.innerHTML = firms.map(firm => {
    const domain = getLogoDomain(firm);
    const initials = getInitials(firm.name);

    const logo = domain
      ? `<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128"
              alt="${escapeHTML(firm.name)} website icon"
              loading="lazy"
              onerror="this.style.display='none'">`
      : "";

    return `
      <article class="firm-card">
        <div class="firm-card-top">
          <div class="firm-brand">
            <div class="firm-logo">
              <span>${escapeHTML(initials)}</span>
              ${logo}
            </div>
            <div class="firm-brand-info">
              <span class="firm-tag">${escapeHTML(firm.tag || firm.category || "PROP FIRM")}</span>
              <h3>${escapeHTML(firm.name)}</h3>
            </div>
          </div>
          <div class="firm-rating">★ ${escapeHTML(firm.rating ?? "—")}</div>
        </div>

        <p class="firm-description">
          ${escapeHTML(firm.description || "Explore this firm's trading conditions.")}
        </p>

        <div class="firm-stats">
          <div><small>Account Sizes</small><strong>${escapeHTML(firm.account_sizes || "—")}</strong></div>
          <div><small>Profit Target</small><strong>${escapeHTML(firm.profit_target || "—")}</strong></div>
          <div><small>Max Drawdown</small><strong>${escapeHTML(firm.max_drawdown || "—")}</strong></div>
          <div><small>Profit Split</small><strong>${escapeHTML(firm.profit_split || "—")}</strong></div>
        </div>

        <div class="firm-card-bottom">
          <span class="firm-price">${escapeHTML(firm.price || "See details")}</span>
          <div class="firm-card-actions">
            <a class="firm-button" href="firm.html?id=${encodeURIComponent(firm.id)}">View Firm</a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadFirms() {
  const grid = document.getElementById("firmsGrid");
  if (!grid) {
    console.error("Cannot find #firmsGrid");
    return;
  }

  injectDirectoryStyles();
  grid.innerHTML = "<p>Loading prop firms...</p>";

  renderAuthArea();
  await initMemberFeatures();

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/firms?select=*&status=eq.active&order=rating.desc`,
      { headers: { apikey: SUPABASE_KEY } }
    );

    if (!response.ok) {
      throw new Error(`Supabase ${response.status}: ${await response.text()}`);
    }

    allFirms = await response.json();
    createFilters(grid);
    renderFirms();
  } catch (error) {
    console.error("FundedEdge error:", error);
    grid.innerHTML = `
      <div class="fe-no-results">
        <h3>Couldn't load prop firms</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadFirms);
