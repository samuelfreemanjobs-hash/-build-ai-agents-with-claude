"""QA analysis orchestrator using deterministic scripts."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"


def _load(name: str):
    path = SCRIPTS_DIR / f"{name}.py"
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class QAAnalyzer:
    def analyze(self, scope: dict) -> dict:
        coverage_mod = _load("coverage_analyzer")
        risk_mod = _load("risk_scorer")
        validator_mod = _load("test_suite_validator")
        regression_mod = _load("regression_detector")
        readiness_mod = _load("release_readiness_checker")

        coverage = coverage_mod.analyze(scope)
        risk = risk_mod.score(scope, coverage)
        validation = validator_mod.validate(scope)
        regression = regression_mod.detect(scope)
        readiness = readiness_mod.check(coverage, risk, validation, regression)

        return {
            "coverage": coverage,
            "risk": risk,
            "validation": validation,
            "regression": regression,
            "readiness": readiness,
        }

    def validate_readiness(self, analysis: dict) -> dict:
        readiness = analysis["readiness"]
        if readiness.get("blockers"):
            return {"halt": True, "blockers": readiness["blockers"]}
        return {"halt": False, "readiness": readiness}
