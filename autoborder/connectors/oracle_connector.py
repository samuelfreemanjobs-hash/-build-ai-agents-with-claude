"""Oracle EBS connector stub — Priority 2 ERP integration."""

from autoborder.connectors.base import ERPConnector
from autoborder.models import BOMTree


class OracleConnector(ERPConnector):
    """Placeholder for Oracle EBS BOM + Cost Management module integration."""

    def health_check(self) -> dict[str, str]:
        return {"status": "stub", "mode": "not_implemented", "modules": "BOM, Cost Management"}

    def extract_bom(self, part_number: str, plant: str = "1000") -> BOMTree:
        raise NotImplementedError(
            "Oracle EBS connector is scheduled for Sprint 2. Use SAPConnector with mock mode."
        )
