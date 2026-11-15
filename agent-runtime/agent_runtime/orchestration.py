"""Framework-style pipeline stage runner."""

from __future__ import annotations

import logging
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Generic, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")


@dataclass
class StageRecord:
    stage_id: str
    status: str
    duration_ms: int
    detail: str | None = None


@dataclass
class FrameworkPipeline:
    """Lightweight framework orchestration — timings and stage records only."""

    agent_id: str
    run_id: str
    records: list[StageRecord] = field(default_factory=list)

    def run_stage(
        self,
        stage_id: str,
        fn: Callable[[], T],
        *,
        emit_timings: bool = True,
    ) -> T:
        start = time.perf_counter()
        try:
            result = fn()
            duration_ms = int((time.perf_counter() - start) * 1000)
            record = StageRecord(stage_id=stage_id, status="ok", duration_ms=duration_ms)
            self.records.append(record)
            if emit_timings:
                logger.info("%s %s completed in %sms", self.run_id, stage_id, duration_ms)
            return result
        except Exception as exc:
            duration_ms = int((time.perf_counter() - start) * 1000)
            record = StageRecord(
                stage_id=stage_id,
                status="halt",
                duration_ms=duration_ms,
                detail=str(exc),
            )
            self.records.append(record)
            if emit_timings:
                logger.info("%s %s halted in %sms", self.run_id, stage_id, duration_ms)
            raise