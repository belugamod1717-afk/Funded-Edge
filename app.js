// FundedEdge - Supabase connection
// Public/publishable key is safe to use in the browser when RLS is configured.

const SUPABASE_URL = "https://mvltzznwdglwaedfzxze.supabase.co";
const SUPABASE_KEY = "sb_publishable_6Z18S8P-DzDiBcl_EwRuZQ_nrq_8hid";

async function getFirms() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/firms?status=eq.active&order=rating.desc`,
      {
        method: "GET",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("FundedEdge database error:", error);
    return [];
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createFirmCard(firm) {
  return `
    <article class="firm-card">
      <div class="firm-card-top">
        <div>
          <span class="firm-tag">
            ${escapeHTML(firm.tag || "PROP FIRM")}
          </span>

          <h3>${escapeHTML(firm.name)}</h3>
        </div>

        <div class="firm-rating">
          ★ ${escapeHTML(firm.rating || "0")}
        </div>
      </div>

      <p class="firm-description">
        ${escapeHTML(
          firm.description ||
          "View this prop firm's trading conditions, rules and account options."
        )}
      </p>

      <div class="firm-stats">
        <div>
          <small>Account Sizes</small>
          <strong>${escapeHTML(firm.account_sizes || "—")}</strong>
        </div>

        <div>
          <small>Profit Target</small>
          <strong>${escapeHTML(firm.profit_target || "—")}</strong>
        </div>

        <div>
          <small>Max Drawdown</small>
          <strong>${escapeHTML(firm.max_drawdown || "—")}</strong>
        </div>

        <div>
          <small>Profit Split</small>
          <strong>${escapeHTML(firm.profit_split || "—")}</strong>
        </div>
      </div>

      <div class="firm-card-bottom">
        <span class="firm-price">
          ${escapeHTML(firm.price || "