# DUTIES — Operating Contract

## HARD RULES (evaluated before any process step)

$hard_rules_list

---

## Pipeline

| Stage | Name | Mode |
|---|---|---|
$pipeline_stages

---

## Human gates

Any stage with mode `human` or `export` that touches a customer-facing channel
requires explicit operator approval before execution completes.

---

## HALT conditions

- Required binding fact has no source record or deterministic output
- Schema validation fails twice on the same artifact
- Run log write fails
