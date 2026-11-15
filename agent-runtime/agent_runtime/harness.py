"""Harness runner — subprocess execution for heavy deterministic steps."""

from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class HarnessResult:
    status: str
    data: dict
    stdout: str
    stderr: str
    exit_code: int
    script: str

    @property
    def ok(self) -> bool:
        return self.status != "FAIL" and self.exit_code == 0


class HarnessRunner:
    """Run product scripts/*.py with consistent timeouts and JSON parsing."""

    def __init__(self, scripts_dir: Path | str, default_timeout_seconds: float = 300.0):
        self.scripts_dir = Path(scripts_dir)
        self.default_timeout_seconds = default_timeout_seconds

    def run(
        self,
        script: str,
        *args: str,
        timeout_seconds: float | None = None,
    ) -> HarnessResult:
        path = self.scripts_dir / script
        if not path.is_file():
            return HarnessResult(
                status="FAIL",
                data={"error": f"Harness script not found: {path}"},
                stdout="",
                stderr="",
                exit_code=127,
                script=script,
            )

        timeout = timeout_seconds if timeout_seconds is not None else self.default_timeout_seconds
        result = subprocess.run(
            [sys.executable, str(path), *args],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        stdout = result.stdout or ""
        stderr = result.stderr or ""
        try:
            data = json.loads(stdout)
            status = str(data.get("status", "OK" if result.returncode == 0 else "FAIL"))
        except json.JSONDecodeError:
            if result.returncode == 0:
                data = {"status": "OK", "raw_stdout": stdout.strip()}
                status = "OK"
            else:
                data = {"error": stderr or stdout or "Invalid JSON from harness"}
                status = "FAIL"

        return HarnessResult(
            status=status,
            data=data,
            stdout=stdout,
            stderr=stderr,
            exit_code=result.returncode,
            script=script,
        )