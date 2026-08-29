"""Base connector interface for ERP data ingestion."""

from abc import ABC, abstractmethod

from autoborder.models import BOMTree


class ERPConnector(ABC):
    @abstractmethod
    def extract_bom(self, part_number: str, plant: str = "1000") -> BOMTree:
        """Extract full cost-rollup BOM tree for a part number."""

    @abstractmethod
    def health_check(self) -> dict[str, str]:
        """Return connector health status."""
