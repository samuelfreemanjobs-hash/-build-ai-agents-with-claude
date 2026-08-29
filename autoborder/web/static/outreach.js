let currentFilter = "email";
let kitData = null;

async function loadTargets() {
  const response = await fetch("/outreach/targets");
  const targets = await response.json();
  const select = document.getElementById("target-select");
  targets.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify(t);
    opt.textContent = `${t.company_name} — ${t.contact_name} (${t.city})`;
    select.appendChild(opt);
  });
}

document.getElementById("target-select").addEventListener("change", (e) => {
  if (!e.target.value) return;
  const target = JSON.parse(e.target.value);
  const form = document.getElementById("prospect-form");
  Object.entries(target).forEach(([key, val]) => {
    const input = form.elements[key];
    if (input) input.value = val;
  });
  form.dispatchEvent(new Event("submit"));
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderScripts();
  });
});

document.getElementById("prospect-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const prospect = Object.fromEntries(formData.entries());

  const response = await fetch("/outreach/personalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prospect),
  });

  kitData = await response.json();
  document.getElementById("program-summary").textContent = kitData.program_summary;
  document.getElementById("guarantee-clause").textContent = kitData.guarantee_clause;
  renderScripts();
});

function renderScripts() {
  if (!kitData) return;
  const container = document.getElementById("scripts-container");
  container.innerHTML = "";

  const filtered = kitData.scripts.filter((s) => s.channel === currentFilter);
  if (!filtered.length) {
    container.innerHTML = "<p class='script-meta'>No scripts in this category.</p>";
    return;
  }

  filtered.forEach((script) => {
    const card = document.createElement("div");
    card.className = "script-card";

    const subjectHtml = script.subject
      ? `<div class="script-subject"><strong>Subject:</strong> ${escapeHtml(script.subject)}</div>`
      : "";

    const notesHtml = script.notes
      ? `<p class="script-notes">${escapeHtml(script.notes)}</p>`
      : "";

    card.innerHTML = `
      <div class="script-header">
        <div>
          <h3>${escapeHtml(script.title)}</h3>
          <span class="script-meta">${script.channel} · ${script.template_id}</span>
        </div>
        <button class="copy-btn" data-copy>Copy</button>
      </div>
      ${subjectHtml}
      <div class="script-body">${escapeHtml(script.body)}</div>
      ${notesHtml}
    `;

    card.querySelector(".copy-btn").addEventListener("click", (ev) => {
      const text = script.subject
        ? `Subject: ${script.subject}\n\n${script.body}`
        : script.body;
      navigator.clipboard.writeText(text).then(() => {
        ev.target.textContent = "Copied!";
        ev.target.classList.add("copied");
        setTimeout(() => {
          ev.target.textContent = "Copy";
          ev.target.classList.remove("copied");
        }, 2000);
      });
    });

    container.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

loadTargets();
document.getElementById("prospect-form").dispatchEvent(new Event("submit"));
