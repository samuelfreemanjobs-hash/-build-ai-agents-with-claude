<?xml version="1.0" encoding="UTF-8"?>
<!--
  ENVIRONMENTAL GATES ONLY.
  Behavior lives in system-prompt.md and DUTIES.md.
-->
<config version="1.0.0" agent="$product_id">

  <models>
    <primary id="claude-sonnet-4-5" role="narrative,extraction,evaluation"/>
    <fallback id="claude-haiku-4-5" role="all" trigger="primary_unavailable"/>
  </models>

  <limits>
    <max_tool_output_tokens>25000</max_tool_output_tokens>
    <max_context_tokens>180000</max_context_tokens>
    <max_evaluator_cycles>2</max_evaluator_cycles>
  </limits>

  <paths>
    <run_log>.ai/data/runs.jsonl</run_log>
    <knowledge_base>./kb/</knowledge_base>
    <schemas>./schemas/</schemas>
    <output>./out/</output>
  </paths>

  <gates>
    <gate name="schema_validation" on_fail="halt"/>
    <gate name="run_log_write" on_fail="halt"/>
  </gates>

  <observability>
    <log_level>info</log_level>
    <emit_stage_timings>true</emit_stage_timings>
    <emit_token_counts>true</emit_token_counts>
  </observability>

</config>
