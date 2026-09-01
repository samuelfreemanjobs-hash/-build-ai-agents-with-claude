import json, subprocess, sys, tempfile
from pathlib import Path

from software_architect.halts import HaltCause, HaltError

SCRIPTS = Path(__file__).resolve().parent.parent.parent / "scripts"


def _run(script: str, *args: str) -> dict:
    r = subprocess.run([sys.executable, str(SCRIPTS / script), *args], capture_output=True, text=True, timeout=120)
    return json.loads(r.stdout)


class ArchitectureAnalyzer:
    def analyze(self, repo_path: str) -> dict:
        discovery = _run("system_discovery.py", repo_path)
        coupling = _run("coupling_analyzer.py", repo_path)
        if coupling.get("critical_count", 0) > 0:
            raise HaltError(HaltCause.CRITICAL_COUPLING,
                            f"{coupling['critical_count']} critical coupling findings",
                            "Acknowledge or resolve circular dependencies", stage="S1")
        patterns = _run("pattern_catalog.py", "--discovery", self._write_temp(discovery))
        nfr = _run("nfr_analyzer.py", "--discovery", self._write_temp(discovery))
        return {"discovery": discovery, "coupling": coupling, "patterns": patterns, "nfr": nfr}

    def validate_c4(self, model: dict, tier: str) -> dict:
        path = self._write_temp(model)
        result = _run("c4_validator.py", "--model", path, "--tier", tier)
        if result.get("status") == "FAIL":
            raise HaltError(HaltCause.C4_VALIDATION_FAILED,
                            f"{len(result.get('errors', []))} C4 validation errors",
                            "Fix C4 model completeness", stage="S4")
        return result

    def _write_temp(self, data: dict) -> str:
        f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        json.dump(data, f)
        f.close()
        return f.name
