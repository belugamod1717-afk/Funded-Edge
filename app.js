
const SUPABASE_URL = "https://mvltzznwdglwaedfzxze.supabase.co";
const SUPABASE_KEY = "sb_publishable_6Z18S8P-DzDiBcl_EwRuZQ_nrq_8hid";

async function loadFirms() {
  const grid = document.getElementById("firmsGrid");

  if (!grid) {
    console.error("Cannot find #firmsGrid in index.html");
    return;
  }

  grid.innerHTML = '<p class="loading">Loading prop firms...</p>';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/firms?select=*&status=eq.active&order=rating.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Supabase ${response.status}: ${details}`);
    }

    const firms = await response.json();

    if (!firms.length) {
      grid.innerHTML = "<p>No active firms returned by the database.</p>";
      return;
    }

    grid.innerHTML = firms.map(firm => `
      <article class="firm-card">
        <div class="firm-card-top">
          <div>
            <span class="firm-tag">${escapeHTML(firm.tag || "PROP FIRM")}</span>
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
          <a class="firm-button"
             href="firm.html?id=${encodeURIComponent(firm.id)}">View Firm</a>
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error("FundedEdge error:", error);
    grid.innerHTML = `
      <div class="no-firms">
        <h3>Couldn't load prop firms</h3>
        <p>${escapeHTML(error.message)}</p>
        <p>Send me a screenshot of this error.</p>
      </div>
    `;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.addEventListener("DOMContentLoaded", loadFirms);
