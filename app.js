
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
    /* Premium directory layout */
    #firmsGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      align-items: stretch;
    }

    /* Premium filter panel */
    .fe-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
      gap: 12px;
      margin: 24px 0;
      padding: 20px;
      border: 1px solid #254634;
      border-radius: 16px;
      background: linear-gradient(145deg, #102219, #0a1510);
      box-shadow: 0 12px 35px rgba(0, 0, 0, .12);
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
      box-shadow: 0 0 0 3px rgba(114, 240, 168, .1);
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

    /* Main firm card */
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
        radial-gradient(ellipse at top right,
          rgba(57, 133, 82, .12), transparent 48%),
        linear-gradient(145deg, #112219, #0b1510 80%);
      box-shadow: 0 8px 26px rgba(0, 0, 0, .13);
      transition: transform .22s ease,
                  border-color .22s ease,
                  box-shadow .22s ease;
    }

    #firmsGrid .firm-card:hover {
      transform: translateY(-4px);
      border-color: #4e9166;
      box-shadow: 0 16px 36px rgba(0, 0, 0, .24);
    }

    #firmsGrid .firm-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 17px;
      border-bottom: 1px solid rgba(126, 166, 137, .16);
    }

    #firmsGrid .firm-card-top > div:first-child {
      min-width: 0;
    }

    #firmsGrid .firm-tag {
      display: inline-block;
      max-width: 100%;
      margin-bottom: 9px;
      padding: 5px 9px;
      border: 1px solid #28583a;
      border-radius: 6px;
      background: rgba(41, 102, 61, .18);
      color: #82edaa;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      overflow-wrap: anywhere;
    }

    #firmsGrid .firm-card h3 {
      margin: 0;
      color: #f0f8f2;
      font-family: "Manrope", "DM Sans", Arial, sans-serif;
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

    /* Financial information */
    #firmsGrid .firm-stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 22px;
    }

    #firmsGrid .firm-stats > div {
      min-width: 0;
      padding: 13px;
      border: 1px solid rgba(100, 145, 112, .16);
      border-radius: 10px;
      background: rgba(5, 16, 10, .55);
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
    #firmsGrid .firm-stats > div:last-child strong {
      color: #80eaaa;
    }

    /* Price and call-to-action */
    #firmsGrid .firm-card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: auto;
      padding-top: 17px;
      border-top: 1px solid rgba(126, 166, 137, .16);
    }

    #firmsGrid .firm-price {
      color: #f0f8f2;
      font-size: 17px;
      font-weight: 800;
      overflow-wrap: anywhere;
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

    #firmsGrid .firm-button::after {
      content: " ↗";
      margin-left: 4px;
    }

    #firmsGrid .firm-button:hover {
      border-color: #a4ffc5;
      background: #a4ffc5;
      transform: translateY(-1px);
    }

    /* Empty and loading states */
    #firmsGrid .fe-no-results {
      grid-column: 1 / -1;
      padding: 35px 20px;
      border: 1px dashed #315343;
      border-radius: 14px;
      background: #0d1b15;
      color: #dce9df;
      text-align: center;
    }

    #firmsGrid .fe-no-results h3 {
      margin-top: 0;
    }

    #firmsGrid .fe-no-results p {
      color: #a7bbae;
      overflow-wrap: anywhere;
    }

    /* Tablet and phone layouts */
    @media (max-width: 760px) {
      #firmsGrid {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      #firmsGrid .firm-card {
        padding: 20px;
      }

      #firmsGrid .firm-description {
        min-height: 0;
      }
    }

    @media (max-width: 480px) {
      .fe-filters {
        grid-template-columns: 1fr;
        padding: 14px;
      }

      #firmsGrid .firm-card {
        padding: 17px;
        border-radius: 14px;
      }

      #firmsGrid .firm-card h3 {
        font-size: 19px;
      }

      #firmsGrid .firm-stats {
        gap: 8px;
      }

      #firmsGrid .firm-stats > div {
        padding: 11px;
      }

      #firmsGrid .firm-stats strong {
        font-size: 13px;
      }

      #firmsGrid .firm-card-bottom {
        align-items: flex-start;
      }

      #firmsGrid .firm-price {
        font-size: 15px;
      }

      #firmsGrid .firm-button {
        padding: 10px 11px;
      }
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
