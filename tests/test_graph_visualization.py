"""Tests for graph traversal and visualization payload."""

from autoborder.connectors.sap_connector import SAPConnector
from autoborder.engine.usmca_calculator import USMCACalculator
from autoborder.graph.neo4j_mapper import Neo4jGraphMapper
from autoborder.graph.traversal import GraphTraversalService
from autoborder.models import OriginStatus


def _load_context():
    bom = SAPConnector().extract_bom("12345")
    snapshot = Neo4jGraphMapper().build_snapshot(bom)
    rvc = USMCACalculator().calculate(bom)
    return bom, snapshot, rvc


def test_bfs_depths():
    _, snapshot, _ = _load_context()
    traversal = GraphTraversalService(snapshot)
    depths = traversal.bfs_depths()
    assert depths["12345"] == 0
    assert max(depths.values()) >= 2


def test_nodes_at_depth():
    _, snapshot, _ = _load_context()
    traversal = GraphTraversalService(snapshot)
    depth_1 = traversal.nodes_at_depth(1)
    assert "12345-01" in depth_1
    assert "12345-03" in depth_1


def test_descendants_and_ancestors():
    _, snapshot, _ = _load_context()
    traversal = GraphTraversalService(snapshot)
    descendants = traversal.descendants("12345-03")
    assert "12345-03-A" in descendants
    ancestors = traversal.ancestors("12345-03-A")
    assert "12345-03" in ancestors
    assert "12345" in ancestors


def test_non_originating_paths():
    _, snapshot, _ = _load_context()
    traversal = GraphTraversalService(snapshot)
    paths = traversal.find_non_originating_paths()
    assert len(paths) >= 2
    bearing_path = next(p for p in paths if "12345-03" in p.node_ids)
    assert bearing_path.node_ids[0] == "12345"
    assert bearing_path.total_extended_cost > 0


def test_build_visualization_payload():
    bom, snapshot, rvc = _load_context()
    traversal = GraphTraversalService(snapshot)
    payload = traversal.build_visualization(rvc, part_description=bom.description)
    assert payload.root_part_number == "12345"
    assert payload.rvc_percentage == rvc.rvc_percentage
    assert len(payload.nodes) == len(snapshot.nodes)
    assert len(payload.edges) == len(snapshot.edges)
    assert payload.nodes[0].color == "#2563EB" or any(n.is_root for n in payload.nodes)

    colors = {n.id: n.color for n in payload.nodes}
    assert colors["12345-03"] in {"#DC2626", "#991B1B"}
    assert colors["12345-01"] == "#16A34A"


def test_visualization_api_endpoint():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/graph/12345/visualization")
    assert response.status_code == 200
    data = response.json()
    assert data["rvc_percentage"] > 0
    assert len(data["non_originating_paths"]) >= 2
    assert data["meets_usmca_threshold"] is True


def test_demo_ui_served():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/demo")
    assert response.status_code == 200
    assert "AutoBorder Comply" in response.text
    assert "cytoscape" in response.text


def test_paths_api_endpoint():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/graph/12345/paths")
    assert response.status_code == 200
    data = response.json()
    assert data["path_count"] >= 2


def test_traverse_api_endpoint():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/graph/12345/traverse?depth=2")
    assert response.status_code == 200
    data = response.json()
    assert "12345-03-A" in data["nodes"] or "12345-04-A" in data["nodes"]
