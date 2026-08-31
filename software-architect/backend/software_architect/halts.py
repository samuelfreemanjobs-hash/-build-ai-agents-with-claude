from enum import Enum


class HaltCause(str, Enum):
    C4_VALIDATION_FAILED = "C4_VALIDATION_FAILED"
    CRITICAL_COUPLING = "CRITICAL_COUPLING"
    MISSING_AS_IS = "MISSING_AS_IS"
    NFR_GAPS_UNADDRESSED = "NFR_GAPS_UNADDRESSED"
    UNNAMED_BOUNDARY = "UNNAMED_BOUNDARY"
    SCHEMA_VIOLATION = "SCHEMA_VIOLATION"


NON_OVERRIDABLE = frozenset({HaltCause.C4_VALIDATION_FAILED, HaltCause.CRITICAL_COUPLING, HaltCause.MISSING_AS_IS})


class HaltError(Exception):
    def __init__(self, cause: HaltCause, message: str, fix_path: str, stage: str = ""):
        self.cause, self.message, self.fix_path, self.stage = cause, message, fix_path, stage
        super().__init__(f"{cause.value}: {message}")

    @property
    def overridable(self) -> bool:
        return self.cause not in NON_OVERRIDABLE
