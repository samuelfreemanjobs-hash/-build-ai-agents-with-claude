from enum import Enum

class HaltCause(str, Enum):
    OVERCOMMIT = "OVERCOMMIT"
    CRITICAL_BLOCKER = "CRITICAL_BLOCKER"
    HR_DECISION_ATTEMPT = "HR_DECISION_ATTEMPT"
    MISSING_TEAM_DATA = "MISSING_TEAM_DATA"
    SCHEMA_VIOLATION = "SCHEMA_VIOLATION"

NON_OVERRIDABLE = frozenset({HaltCause.OVERCOMMIT, HaltCause.CRITICAL_BLOCKER, HaltCause.HR_DECISION_ATTEMPT})

class HaltError(Exception):
    def __init__(self, cause: HaltCause, message: str, fix_path: str, stage: str = ""):
        self.cause, self.message, self.fix_path, self.stage = cause, message, fix_path, stage
        super().__init__(f"{cause.value}: {message}")

    @property
    def overridable(self) -> bool:
        return self.cause not in NON_OVERRIDABLE
