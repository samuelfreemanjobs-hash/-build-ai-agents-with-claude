"""Transform BOM JSON into Neo4j graph nodes and edges."""

from __future__ import annotations

from dataclasses import dataclass, field

from autoborder.models import BOMComponent, BOMTree, GraphEdge, GraphNode, GraphSnapshot, OriginStatus


@dataclass
class InMemoryGraph:
    """Fallback graph store when Neo4j AuraDB is not configured."""

    nodes: dict[str, GraphNode] = field(default_factory=dict)
    edges: list[GraphEdge] = field(default_factory=list)
    root_part_number: str = ""


class Neo4jGraphMapper:
    """
    Populate Neo4j with BOM nodes/edges and generate Cypher for audit replay.

    Nodes: Part entities with origin status and cost properties.
    Edges: CONTAINS relationships with quantity and extended cost.
    """

    def __init__(self, uri: str = "", user: str = "neo4j", password: str = "") -> None:
        self.uri = uri
        self.user = user
        self.password = password
        self._memory = InMemoryGraph()

    @property
    def memory_graph(self) -> InMemoryGraph:
        return self._memory

    def build_snapshot(self, bom: BOMTree) -> GraphSnapshot:
        self._memory = InMemoryGraph(root_part_number=bom.root_part_number)
        self._walk_component(bom.root, parent_number=None)
        return GraphSnapshot(
            root_part_number=bom.root_part_number,
            nodes=list(self._memory.nodes.values()),
            edges=list(self._memory.edges),
        )

    def _walk_component(self, component: BOMComponent, parent_number: str | None) -> None:
        if component.part_number not in self._memory.nodes:
            self._memory.nodes[component.part_number] = GraphNode(
                part_number=component.part_number,
                description=component.description,
                origin_status=component.origin_status,
                origin_country=component.origin_country,
                unit_cost=component.unit_cost,
                originating_content_pct=component.originating_content_pct,
                erp_transaction_id=component.erp_transaction_id,
            )

        if parent_number is not None:
            edge = GraphEdge(
                parent_part_number=parent_number,
                child_part_number=component.part_number,
                quantity=component.quantity,
                unit_cost=component.unit_cost,
                extended_cost=component.extended_cost,
                erp_transaction_id=component.erp_transaction_id,
            )
            self._memory.edges.append(edge)

        for child in component.children:
            self._walk_component(child, parent_number=component.part_number)

    def generate_cypher(self, bom: BOMTree) -> list[str]:
        """Generate Cypher statements to recreate the graph in Neo4j AuraDB."""
        snapshot = self.build_snapshot(bom)
        statements: list[str] = [
            "// AutoBorder Comply — BOM graph load script",
            f"// Root part: {snapshot.root_part_number}",
            "MATCH (n) DETACH DELETE n;",
        ]

        for node in snapshot.nodes:
            origin = node.origin_status.value
            pct = node.originating_content_pct if node.originating_content_pct is not None else "null"
            txn = f"'{node.erp_transaction_id}'" if node.erp_transaction_id else "null"
            country = f"'{node.origin_country}'" if node.origin_country else "null"
            statements.append(
                "CREATE (n:Part {"
                f"part_number: '{node.part_number}', "
                f"description: '{self._escape(node.description)}', "
                f"origin_status: '{origin}', "
                f"origin_country: {country}, "
                f"unit_cost: {node.unit_cost}, "
                f"originating_content_pct: {pct}, "
                f"erp_transaction_id: {txn}"
                "});"
            )

        for edge in snapshot.edges:
            txn = f"'{edge.erp_transaction_id}'" if edge.erp_transaction_id else "null"
            statements.append(
                "MATCH (parent:Part {part_number: '" + edge.parent_part_number + "'}), "
                "(child:Part {part_number: '" + edge.child_part_number + "'}) "
                "CREATE (parent)-[:CONTAINS {"
                f"quantity: {edge.quantity}, "
                f"unit_cost: {edge.unit_cost}, "
                f"extended_cost: {edge.extended_cost}, "
                f"erp_transaction_id: {txn}"
                "}]->(child);"
            )

        statements.append(
            f"MATCH (root:Part {{part_number: '{snapshot.root_part_number}'}}) "
            "SET root:RootPart;"
        )
        return statements

    def load_to_neo4j(self, bom: BOMTree) -> GraphSnapshot:
        """Persist graph to Neo4j when credentials are configured."""
        snapshot = self.build_snapshot(bom)
        if not self.uri or not self.password:
            return snapshot

        from neo4j import GraphDatabase

        driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        cypher_statements = self.generate_cypher(bom)

        with driver.session() as session:
            for statement in cypher_statements:
                if statement.startswith("//"):
                    continue
                session.run(statement)

        driver.close()
        return snapshot

    def traverse_bom_depth(self, root_part_number: str) -> int:
        """Calculate max BOM depth via graph traversal (used for performance benchmarks)."""
        children_map: dict[str, list[str]] = {}
        for edge in self._memory.edges:
            children_map.setdefault(edge.parent_part_number, []).append(edge.child_part_number)

        def depth(part: str, visited: set[str]) -> int:
            if part in visited:
                return 0
            visited.add(part)
            child_parts = children_map.get(part, [])
            if not child_parts:
                return 1
            return 1 + max(depth(child, visited.copy()) for child in child_parts)

        return depth(root_part_number, set())

    @staticmethod
    def _escape(value: str) -> str:
        return value.replace("'", "\\'")
