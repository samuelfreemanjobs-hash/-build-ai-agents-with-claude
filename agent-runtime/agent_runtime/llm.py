"""LLM client with core-config models and usage signals."""

from __future__ import annotations

import logging
import os
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from agent_runtime.config import load_core_config

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class LlmUsageSignal:
    model: str
    input_tokens: int
    output_tokens: int
    used_fallback: bool = False


class LlmClient:
    def __init__(
        self,
        core_config_path: Path | str,
        api_key: str | None = None,
        mock: bool | None = None,
    ):
        self.config = load_core_config(core_config_path)
        self.mock = mock if mock is not None else not (api_key or os.environ.get("ANTHROPIC_API_KEY"))
        self._client = None
        self.last_usage: LlmUsageSignal | None = None
        if not self.mock:
            import anthropic

            self._client = anthropic.Anthropic(
                api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
            )

    def complete(
        self,
        system: str,
        user: str,
        max_tokens: int | None = None,
        mock_fn: Callable[[str], str] | None = None,
    ) -> str:
        if max_tokens is None:
            raw = self.config.limits.get("max_tool_output_tokens", "4096")
            try:
                max_tokens = int(raw)
            except ValueError:
                max_tokens = 4096

        if self.mock:
            if mock_fn is not None:
                return mock_fn(user)
            return '{"status": "mock"}'

        model = self.config.primary_model
        used_fallback = False
        try:
            text, usage = self._request(model, system, user, max_tokens)
        except Exception:
            if self.config.fallback_model:
                logger.warning("Primary model %s failed; trying fallback", model)
                model = self.config.fallback_model
                used_fallback = True
                text, usage = self._request(model, system, user, max_tokens)
            else:
                raise

        if self.config.emit_token_counts:
            self.last_usage = LlmUsageSignal(
                model=model,
                input_tokens=usage.get("input", 0),
                output_tokens=usage.get("output", 0),
                used_fallback=used_fallback,
            )
            logger.info(
                "llm_usage model=%s in=%s out=%s fallback=%s",
                model,
                usage.get("input", 0),
                usage.get("output", 0),
                used_fallback,
            )
        return text

    def _request(self, model: str, system: str, user: str, max_tokens: int) -> tuple[str, dict]:
        assert self._client is not None
        response = self._client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        usage = {
            "input": getattr(response.usage, "input_tokens", 0),
            "output": getattr(response.usage, "output_tokens", 0),
        }
        return response.content[0].text, usage