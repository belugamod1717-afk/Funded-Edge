
const SUPABASE_URL = "https://mvltzznwdglwaedfzxze.supabase.co";
const SUPABASE_KEY = "sb_publishable_6Z18S8P-DzDiBcl_EwRuZQ_nrq_8hid";

let allFirms = [];

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

function injectDirectoryStyles() {
  if (document.getElementById("fe-directory-styles")) return;

  const style = document.createElement("style");
  style.id = "fe-directory-styles";
  style.textContent = `
    .fe-filters {
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(155px,1fr));
      gap:12px;
      margin:24px 0;
      padding:18px;
      border:1px solid #244637;
      border-radius:16px;
      background:#0d1b15;
    }
    .fe-filters input,.fe-filters select {
      box-sizing:border-box;
      width:100%;
      min-width:0;
      padding:12px;
      border:1px solid #315343;
      border-radius:9px;
      background:#10251b;
      color:#f1f7f3;
      font:inherit;
    }
    .fe-filters input::placeholder {color:#a2b6a9}
    .fe-filter-label {
      display:block;
      margin-bottom:6px;
      color:#b6cabb;
      font-size:12px;
    }
    .fe-filter-actions {
      display:flex;
      align-items:end;
    }
    .fe-reset {
      width:100%;
      padding:12px;
      border:0;
      border-radius:9px;
      background:#b9f6cf;
      color:#10251b;
      font-weight:700;
      cursor:pointer;
    }
    .fe-results-count {
      margin:12px 0;
      color:#b6cabb;
      font-size:14px;
    }
    .fe-no-results {
      padding:28px;
      border:1px solid #315343;
      border-radius:14px;
      color:#dce9df;
      text-align:center;
    }
    @media(max-width:480px) {
      .fe-filters {grid-template-columns:1fr;padding:13px}
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
        <select id="feCategory">
          <option value="">All categories</option>
        </select>
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

  const categories = [...new Set(
    allFirms.map(f => f.category).filter(Boolean)
  )].sort();

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

  const search = (document.getElementById("feSearch")?.value || "")
    .trim().toLowerCase();
  const category = document.getElementById("feCategory")?.value || "";
  const minAccount = Number(document.getElementById("feAccount")?.value || 0);
  const maxPrice = Number(document.getElementById("fePrice")?.value || 999999);
  const sort = document.getElementById("feSort")?.value || "rating";

  let firms = allFirms.filter(firm => {
    const searchable = [
      firm.name, firm.category, firm.description, firm.tag,
      firm.platforms
    ].join(" ").toLowerCase();

    const accountNumbers = getNumbers(firm.account_sizes);
    const maxAccountSize = accountNumbers.length
      ? Math.max(...accountNumbers) : 0;

    const prices = getNumbers(firm.price);
    const startingPrice = prices.length ? Math.min(...prices) : null;

    const matchesSearch = searchable.includes(search);
    const matchesCategory = !category || firm.category === category;
    const matchesAccount = !minAccount || maxAccountSize >= minAccount;
    const matchesPrice = maxPrice === 999999 ||
      (startingPrice !== null && startingPrice <= maxPrice);

    return matchesSearch && matchesCategory &&
      matchesAccount && matchesPrice;
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

  document.getElementById("feResultsCount").textContent =
    `Showing ${firms.length} of ${allFirms.length} prop firms`;

  if (!firms.length) {
    grid.innerHTML = `
      <div class="fe-no-results">
        <h3>No matching firms found</h3>
        <p>Try changing your search or resetting the filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = firms.map(firm => `
    <article class="firm-card">
      <div class="firm-card-top">
        <div>
          <span class="firm-tag">${escapeHTML(firm.tag || firm.category || "PROP FIRM")}</span>
          <h3>${escapeHTML(firm.name)}</h3>
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
        <a class="firm-button" href="firm.html?id=${encodeURIComponent(firm.id)}">View Firm</a>
      </div>
    </article>
  `).join("");
}

async function loadFirms() {
  const grid = document.getElementById("firmsGrid");
  if (!grid) {
    console.error("Cannot find #firmsGrid in index.html");
    return;
  }

  injectDirectoryStyles();
  grid.innerHTML = "<p>Loading prop firms...</p>";

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
