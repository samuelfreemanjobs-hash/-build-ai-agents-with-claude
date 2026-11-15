from pathlib import Path

import pytest

from agent_runtime.config import load_core_config

FIXTURE = Path(__file__).resolve().parents[2] / "software-developer-agent" / "agent" / "core-config.xml"


def test_load_core_config_models():
    cfg = load_core_config(FIXTURE)
    assert cfg.agent_id == "software-developer-agent"
    assert cfg.primary_model == "claude-sonnet-4-5"
    assert cfg.fallback_model == "claude-haiku-4-5"
    assert cfg.emit_token_counts is True


def test_load_core_config_missing_raises(tmp_path: Path):
    with pytest.raises(Exception):
        load_core_config(tmp_path / "missing.xml")