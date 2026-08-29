let currentReportId = null;

function fmtMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const uploadZone = document.getElementById("upload-zone");
const fileInput = document.getElementById("bom-file");
const placeholder = document.getElementById("upload-placeholder");
const selected = document.getElementById("upload-selected");
const fileName = document.getElementById("file-name");

uploadZone.addEventListener("click", () => fileInput.click());

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragover"));

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    showSelectedFile(e.dataTransfer.files[0].name);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) showSelectedFile(fileInput.files[0].name);
});

document.getElementById("clear-file").addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.value = "";
  placeholder.classList.remove("hidden");
  selected.classList.add("hidden");
});

function showSelectedFile(name) {
  fileName.textContent = name;
  placeholder.classList.add("hidden");
  selected.classList.remove("hidden");
}

document.getElementById("use-sample").addEventListener("click", async (e) => {
  e.stopPropagation();
  const response = await fetch("/calculator/sample-bom");
  const blob = await response.blob();
  const file = new File([blob], "brake_rotor_bom.json", { type: "application/json" });
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
  showSelectedFile(file.name);
});

document.getElementById("calculator-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  document.getElementById("upload-section").classList.add("hidden");
  document.getElementById("loading-section").classList.remove("hidden");
  document.getElementById("results-section").classList.add("hidden");

  try {
    const response = await fetch("/calculator/analyze", { method: "POST", body: formData });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Analysis failed");
    }
    const result = await response.json();
    currentReportId = result.report_id;
    renderResults(result);
  } catch (err) {
    alert(err.message);
    document.getElementById("upload-section").classList.remove("hidden");
  } finally {
    document.getElementById("loading-section").classList.add("hidden");
  }
});

function renderResults(result) {
  document.getElementById("results-section").classList.remove("hidden");

  const heroMetric = result.overpaid_last_quarter > 0
    ? result.overpaid_last_quarter
    : result.penalty_exposure > 0
      ? result.penalty_exposure
      : result.annual_savings_potential;

  const heroLabel = result.overpaid_last_quarter > 0
    ? "Overpaid Last Quarter"
    : result.penalty_exposure > 0
      ? "CBP Penalty Exposure"
      : "Annual Savings Potential";

  document.getElementById("result-headline").textContent = result.headline;
  document.getElementById("hero-metric").textContent = fmtMoney(heroMetric);
  document.getElementById("hero-label").textContent = heroLabel;
  document.getElementById("result-recommendation").textContent = result.recommendation;

  document.getElementById("stat-rvc").textContent = `${result.rvc_percentage}%`;
  document.getElementById("stat-import").textContent = fmtMoney(result.quarterly_import_value);
  document.getElementById("stat-paid").textContent = fmtMoney(result.duty_paid_last_quarter);
  document.getElementById("stat-should").textContent = fmtMoney(result.duty_should_have_paid);
  document.getElementById("stat-annual").textContent = fmtMoney(result.annual_savings_potential);
  document.getElementById("stat-penalty").textContent = fmtMoney(result.penalty_exposure);

  const leakList = document.getElementById("leak-list");
  leakList.innerHTML = "";
  (result.top_leaks || []).forEach((leak) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${leak.description}</span><span class="leak-amount">${fmtMoney(leak.amount_usd)}</span>`;
    leakList.appendChild(li);
  });

  if (!result.top_leaks?.length) {
    leakList.innerHTML = "<li>No tariff leaks detected in this BOM.</li>";
  }
}

document.getElementById("view-report-btn").addEventListener("click", () => {
  if (currentReportId) window.open(`/calculator/report/${currentReportId}`, "_blank");
});

document.getElementById("email-report-btn").addEventListener("click", async () => {
  if (!currentReportId) return;
  const email = document.querySelector('[name="contact_email"]').value;
  const response = await fetch(`/calculator/report/${currentReportId}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient_email: email }),
  });
  const data = await response.json();
  alert(data.message);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  document.getElementById("results-section").classList.add("hidden");
  document.getElementById("upload-section").classList.remove("hidden");
  currentReportId = null;
});
