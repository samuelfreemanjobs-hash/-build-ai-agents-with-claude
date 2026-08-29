"""Graph traversal, path finding, and visualization payload builders."""

from __future__ import annotations

from collections import deque

from autoborder.models import (
    GraphSnapshot,
    GraphVisualizationPayload,
    NonOriginatingPath,
    OriginStatus,
    RVCCalculationResult,
    VisualizationEdge,
    VisualizationNode,
)

ORIGIN_COLORS = {
    OriginStatus.ORIGINATING: "#16A34A",
    OriginStatus.NON_ORIGINATING: "#DC2626",
    OriginStatus.UNKNOWN: "#6B7280",
}
ROOT_COLOR = "#2563EB"
PARTIAL_COLOR = "#D97706"


class GraphTraversalService:
    """
    Traverse BOM supply chain graphs for sales demos and CBP audit prep.

    Supports BFS depth assignment, ancestor/descendant queries, and
    non-originating path discovery — the Call 2 screen-share centerpiece.
    """

    def __init__(self, snapshot: GraphSnapshot) -> None:
        self.snapshot = snapshot
        self._nodes = {node.part_number: node for node in snapshot.nodes}
        self._children: dict[str, list[str]] = {}
        self._parents: dict[str, list[str]] = {}
        self._edges_by_child: dict[str, list] = {}
        for edge in snapshot.edges:
            self._children.setdefault(edge.parent_part_number, []).append(edge.child_part_number)
            self._parents.setdefault(edge.child_part_number, []).append(edge.parent_part_number)
            self._edges_by_child.setdefault(edge.child_part_number, []).append(edge)

    def bfs_depths(self, root: str | None = None) -> dict[str, int]:
        root = root or self.snapshot.root_part_number
        depths: dict[str, int] = {root: 0}
        queue: deque[str] = deque([root])
        while queue:
            current = queue.popleft()
            for child in self._children.get(current, []):
                if child not in depths:
                    depths[child] = depths[current] + 1
                    queue.append(child)
        return depths

    def descendants(self, part_number: str) -> list[str]:
        result: list[str] = []
        stack = list(self._children.get(part_number, []))
        while stack:
            node = stack.pop()
            result.append(node)
            stack.extend(self._children.get(node, []))
        return result

    def ancestors(self, part_number: str) -> list[str]:
        result: list[str] = []
        stack = list(self._parents.get(part_number, []))
        while stack:
            node = stack.pop()
            result.append(node)
            stack.extend(self._parents.get(node, []))
        return result

    def max_depth(self) -> int:
        depths = self.bfs_depths()
        return max(depths.values()) if depths else 0

    def nodes_at_depth(self, depth: int) -> list[str]:
        return [part for part, d in self.bfs_depths().items() if d == depth]

    def find_non_originating_paths(self) -> list[NonOriginatingPath]:
        """
        Find root-to-component paths ending at non-originating or partial nodes.

        These are the red chains shown in the Call 2 sales demo.
        """
        root = self.snapshot.root_part_number
        paths: list[NonOriginatingPath] = []

        targets = [
            node.part_number
            for node in self.snapshot.nodes
            if node.part_number != root
            and (
                node.origin_status == OriginStatus.NON_ORIGINATING
                or (
                    node.originating_content_pct is not None
                    and 0 < node.originating_content_pct < 100
                )
            )
        ]

        for target in targets:
            path_ids = self._path_to_root(target)
            if not path_ids:
                continue
            path_ids.reverse()
            labels = [
                f"{self._nodes[n].part_number} ({self._nodes[n].origin_country or '?'})"
                for n in path_ids
            ]
            total_cost = sum(
                next(
                    e.extended_cost
                    for e in self.snapshot.edges
                    if e.parent_part_number == path_ids[i]
                    and e.child_part_number == path_ids[i + 1]
                )
                for i in range(len(path_ids) - 1)
            )
            node = self._nodes[target]
            paths.append(
                NonOriginatingPath(
                    path_id=f"path-{target}",
                    node_ids=path_ids,
                    labels=labels,
                    total_extended_cost=round(total_cost, 2),
                    headline=self._path_headline(node),
                )
            )

        return sorted(paths, key=lambda p: p.total_extended_cost, reverse=True)

    def _path_to_root(self, part_number: str) -> list[str]:
        """Return path from part_number up to root (inclusive, leaf-first order)."""
        path = [part_number]
        current = part_number
        visited: set[str] = set()
        while current in self._parents:
            parent = self._parents[current][0]
            if parent in visited:
                break
            path.append(parent)
            visited.add(parent)
            current = parent
            if current == self.snapshot.root_part_number:
                break
        if path[-1] != self.snapshot.root_part_number:
            return []
        return path

    def build_visualization(
        self,
        rvc: RVCCalculationResult,
        storage: str = "in-memory",
        part_description: str = "",
    ) -> GraphVisualizationPayload:
        depths = self.bfs_depths()
        rvc_by_part = {detail.part_number: detail for detail in rvc.component_details}
        non_orig_paths = self.find_non_originating_paths()
        highlighted_ids = {node_id for path in non_orig_paths for node_id in path.node_ids}

        vis_nodes: list[VisualizationNode] = []
        for node in self.snapshot.nodes:
            is_root = node.part_number == self.snapshot.root_part_number
            color = self._node_color(node, is_root, node.part_number in highlighted_ids)
            detail = rvc_by_part.get(node.part_number)
            vis_nodes.append(
                VisualizationNode(
                    id=node.part_number,
                    label=node.part_number,
                    description=node.description,
                    origin_status=node.origin_status,
                    origin_country=node.origin_country,
                    unit_cost=node.unit_cost,
                    originating_content_pct=node.originating_content_pct,
                    erp_transaction_id=node.erp_transaction_id,
                    is_root=is_root,
                    depth=depths.get(node.part_number, 0),
                    color=color,
                    non_originating_cost=detail.non_originating_value if detail else 0.0,
                )
            )

        vis_edges = [
            VisualizationEdge(
                id=f"{edge.parent_part_number}->{edge.child_part_number}",
                source=edge.parent_part_number,
                target=edge.child_part_number,
                quantity=edge.quantity,
                unit_cost=edge.unit_cost,
                extended_cost=edge.extended_cost,
                erp_transaction_id=edge.erp_transaction_id,
            )
            for edge in self.snapshot.edges
        ]

        return GraphVisualizationPayload(
            root_part_number=self.snapshot.root_part_number,
            part_description=part_description,
            nodes=vis_nodes,
            edges=vis_edges,
            max_depth=self.max_depth(),
            non_originating_paths=non_orig_paths,
            rvc_percentage=rvc.rvc_percentage,
            meets_usmca_threshold=rvc.meets_usmca_threshold,
            net_cost=rvc.net_cost,
            value_non_originating_materials=rvc.value_non_originating_materials,
            storage=storage,
        )

    def _node_color(self, node, is_root: bool, highlighted: bool) -> str:
        if is_root:
            return ROOT_COLOR
        if (
            node.originating_content_pct is not None
            and 0 < node.originating_content_pct < 100
        ):
            return PARTIAL_COLOR
        if highlighted and node.origin_status == OriginStatus.NON_ORIGINATING:
            return "#991B1B"
        return ORIGIN_COLORS.get(node.origin_status, ORIGIN_COLORS[OriginStatus.UNKNOWN])

    @staticmethod
    def _path_headline(node) -> str:
        country = node.origin_country or "unknown origin"
        if node.origin_status == OriginStatus.NON_ORIGINATING:
            return f"Non-originating {country} content blocking RVC compliance"
        return f"Partial originating content ({node.originating_content_pct:.0f}%) — review required"
