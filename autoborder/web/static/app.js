/* global cytoscape, cytoscapeDagre */

let cy = null;
let currentPayload = null;

const ORIGIN_LABELS = {
  originating: "Originating",
  non_originating: "Non-Originating",
  unknown: "Unknown",
};

function fmtMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function showError(message) {
  document.getElementById("error").textContent = message;
  document.getElementById("error").classList.remove("hidden");
  document.getElementById("loading").classList.add("hidden");
}

function hideError() {
  document.getElementById("error").classList.add("hidden");
}

async function loadGraph(partNumber) {
  hideError();
  document.getElementById("loading").classList.remove("hidden");

  try {
    const response = await fetch(`/graph/${encodeURIComponent(partNumber)}/visualization`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to load graph");
    }
    currentPayload = await response.json();
    renderDashboard(currentPayload);
    renderGraph(currentPayload);
    renderRiskPaths(currentPayload);
  } catch (err) {
    showError(err.message);
  } finally {
    document.getElementById("loading").classList.add("hidden");
  }
}

function renderDashboard(data) {
  const status = document.getElementById("rvc-status");
  status.textContent = data.meets_usmca_threshold ? "USMCA COMPLIANT" : "NON-COMPLIANT";
  status.className = `rvc-status ${data.meets_usmca_threshold ? "compliant" : "non-compliant"}`;

  document.getElementById("stat-rvc").textContent = `${data.rvc_percentage}%`;
  document.getElementById("stat-net").textContent = fmtMoney(data.net_cost);
  document.getElementById("stat-non-orig").textContent = fmtMoney(data.value_non_originating_materials);
  document.getElementById("stat-depth").textContent = String(data.max_depth);
  document.getElementById("stat-nodes").textContent = String(data.nodes.length);
}

function renderRiskPaths(data) {
  const list = document.getElementById("risk-paths");
  list.innerHTML = "";

  if (!data.non_originating_paths.length) {
    list.innerHTML = "<li>No risk paths detected.</li>";
    return;
  }

  data.non_originating_paths.forEach((path) => {
    const li = document.createElement("li");
    const isPartial = path.headline.includes("Partial");
    if (isPartial) li.classList.add("partial");

    li.innerHTML = `
      <strong>${path.headline}</strong>
      <span>${path.labels.join(" → ")}</span>
      <span class="path-cost">${fmtMoney(path.total_extended_cost)} extended cost</span>
    `;
    li.addEventListener("click", () => highlightPath(path.node_ids));
    list.appendChild(li);
  });
}

function renderGraph(data) {
  const elements = [];

  data.nodes.forEach((node) => {
    elements.push({
      data: {
        id: node.id,
        label: node.label,
        description: node.description,
        origin_status: node.origin_status,
        origin_country: node.origin_country || "—",
        unit_cost: node.unit_cost,
        non_originating_cost: node.non_originating_cost,
        erp_transaction_id: node.erp_transaction_id || "—",
        depth: node.depth,
        color: node.color,
        is_root: node.is_root,
      },
    });
  });

  data.edges.forEach((edge) => {
    elements.push({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        quantity: edge.quantity,
        extended_cost: edge.extended_cost,
        label: `×${edge.quantity}`,
      },
    });
  });

  if (cy) cy.destroy();

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements,
    layout: {
      name: "dagre",
      rankDir: "TB",
      nodeSep: 40,
      rankSep: 70,
      padding: 30,
    },
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "background-color": "data(color)",
          color: "#f8fafc",
          "text-valign": "bottom",
          "text-halign": "center",
          "font-size": 10,
          "font-weight": 600,
          width: 36,
          height: 36,
          "border-width": 2,
          "border-color": "#0f172a",
          "text-margin-y": 6,
        },
      },
      {
        selector: "node[is_root = true]",
        style: { width: 48, height: 48, "font-size": 11 },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "#475569",
          "target-arrow-color": "#475569",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(label)",
          "font-size": 9,
          color: "#94a3b8",
        },
      },
      {
        selector: ".highlighted",
        style: {
          "border-width": 4,
          "border-color": "#fbbf24",
          "background-blacken": -0.2,
        },
      },
      {
        selector: ".dimmed",
        style: { opacity: 0.25 },
      },
      {
        selector: ".path-edge",
        style: {
          width: 4,
          "line-color": "#fbbf24",
          "target-arrow-color": "#fbbf24",
        },
      },
    ],
  });

  cy.on("tap", "node", (event) => {
    showNodeDetail(event.target.data());
  });

  cy.on("tap", (event) => {
    if (event.target === cy) clearHighlight();
  });
}

function showNodeDetail(node) {
  const panel = document.getElementById("node-detail");
  panel.classList.remove("hidden");
  document.getElementById("detail-part").textContent = node.label;
  document.getElementById("detail-desc").textContent = node.description;
  document.getElementById("detail-origin").textContent = ORIGIN_LABELS[node.origin_status] || node.origin_status;
  document.getElementById("detail-country").textContent = node.origin_country;
  document.getElementById("detail-cost").textContent = fmtMoney(node.unit_cost);
  document.getElementById("detail-non-orig").textContent = fmtMoney(node.non_originating_cost || 0);
  document.getElementById("detail-erp").textContent = node.erp_transaction_id;
}

function highlightPath(nodeIds) {
  if (!cy) return;
  clearHighlight();

  const nodeSet = new Set(nodeIds);
  cy.nodes().forEach((node) => {
    if (nodeSet.has(node.id())) node.addClass("highlighted");
    else node.addClass("dimmed");
  });

  cy.edges().forEach((edge) => {
    const src = edge.source().id();
    const tgt = edge.target().id();
    for (let i = 0; i < nodeIds.length - 1; i += 1) {
      if (nodeIds[i] === src && nodeIds[i + 1] === tgt) {
        edge.addClass("path-edge");
        return;
      }
    }
    edge.addClass("dimmed");
  });

  cy.fit(cy.collection().filter(".highlighted"), 60);
}

function clearHighlight() {
  if (!cy) return;
  cy.elements().removeClass("highlighted dimmed path-edge");
}

document.getElementById("load-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const partNumber = document.getElementById("part-number").value.trim();
  if (partNumber) loadGraph(partNumber);
});

loadGraph("12345");
