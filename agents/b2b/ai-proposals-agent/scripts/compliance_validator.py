#!/usr/bin/env python3
"""
Fail-closed compliance validator.

A certification resolves to COMPLIANT only on positive evidence. Every other
state — missing, expired, expiring before contract start, unparseable,
ambiguous — resolves to GAP. There is no path to COMPLIANT through absence
of contrary evidence.

Run self-tests:  python3 compliance_validator.py --selftest
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, asdict, field
from datetime import date, datetime
from typing import Dict, List, Optional

VALIDATOR_VERSION = "2.0.0"

STATUS_COMPLIANT = "COMPLIANT"
STATUS_GAP = "GAP"

GAP_REASONS = {
    "NO_RECORD": "No certification record found for this requirement.",
    "EXPIRED": "Certification expired before submission date.",
    "EXPIRES_MID_TERM": "Certification expires before contract start date.",
    "UNPARSEABLE_DATE": "Certification date could not be parsed.",
    "MISSING_NUMBER": "Certification record has no certificate number.",
    "AMBIGUOUS_MATCH": "Requirement matched multiple records ambiguously.",
    "INACTIVE_STATUS": "Certification record is not marked active.",
}


class ComplianceHalt(Exception):
    """Malformed input records. Distinct from a GAP finding."""


def _parse_date(value, field_name: str) -> Optional[date]:
    if value in (None, ""):
        return None
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


@dataclass
class MatrixRow:
    requirement: str
    requirement_source_ref: str
    mandatory: bool
    status: str
    reason: Optional[str] = None
    certificate_number: Optional[str] = None
    expiry_date: Optional[str] = None
    record_source_ref: Optional[str] = None


@dataclass
class ComplianceResult:
    validator_version: str = VALIDATOR_VERSION
    submission_date: str = ""
    contract_start_date: Optional[str] = None
    rows: List[MatrixRow] = field(default_factory=list)
    n_compliant: int = 0
    n_gap: int = 0
    n_mandatory_gap: int = 0
    coverage_pct: float = 0.0


def _normalize(s: str) -> str:
    return "".join(ch for ch in str(s).upper() if ch.isalnum())


def validate(
    requirements: List[dict],
    certification_records: List[dict],
    submission_date: str,
    contract_start_date: Optional[str] = None,
) -> dict:

    sub_dt = _parse_date(submission_date, "submission_date")
    if sub_dt is None:
        raise ComplianceHalt(f"unparseable submission_date: {submission_date!r}")

    start_dt = _parse_date(contract_start_date, "contract_start_date")

    index: Dict[str, List[dict]] = {}
    for rec in certification_records:
        if "cert_type" not in rec:
            raise ComplianceHalt(f"certification record missing cert_type: {rec!r}")
        index.setdefault(_normalize(rec["cert_type"]), []).append(rec)

    result = ComplianceResult(
        submission_date=str(sub_dt),
        contract_start_date=str(start_dt) if start_dt else None,
    )

    for req in requirements:
        name = req.get("name")
        if not name:
            raise ComplianceHalt(f"requirement missing name: {req!r}")

        row = MatrixRow(
            requirement=name,
            requirement_source_ref=req.get("source_ref", ""),
            mandatory=bool(req.get("mandatory", True)),
            status=STATUS_GAP,
            reason=GAP_REASONS["NO_RECORD"],
        )

        matches = index.get(_normalize(name), [])

        if len(matches) > 1:
            row.status = STATUS_GAP
            row.reason = GAP_REASONS["AMBIGUOUS_MATCH"]
        elif len(matches) == 1:
            rec = matches[0]
            expiry = _parse_date(rec.get("expiry_date"), "expiry_date")
            number = rec.get("cert_number") or None
            active = str(rec.get("status", "active")).lower() == "active"

            if not active:
                row.reason = GAP_REASONS["INACTIVE_STATUS"]
            elif not number:
                row.reason = GAP_REASONS["MISSING_NUMBER"]
            elif expiry is None:
                row.reason = GAP_REASONS["UNPARSEABLE_DATE"]
            elif expiry < sub_dt:
                row.reason = GAP_REASONS["EXPIRED"]
                row.expiry_date = str(expiry)
            elif start_dt is not None and expiry < start_dt:
                row.reason = GAP_REASONS["EXPIRES_MID_TERM"]
                row.expiry_date = str(expiry)
            else:
                row.status = STATUS_COMPLIANT
                row.reason = None
                row.certificate_number = number
                row.expiry_date = str(expiry)
                row.record_source_ref = rec.get("source_ref", "")

        result.rows.append(row)

    result.n_compliant = sum(1 for r in result.rows if r.status == STATUS_COMPLIANT)
    result.n_gap = sum(1 for r in result.rows if r.status == STATUS_GAP)
    result.n_mandatory_gap = sum(
        1 for r in result.rows if r.status == STATUS_GAP and r.mandatory
    )
    total = len(result.rows)
    result.coverage_pct = round((result.n_compliant / total) * 100, 1) if total else 0.0

    return json.loads(json.dumps(asdict(result), default=str))


def _selftest() -> int:
    failures = []

    records = [
        {"cert_type": "ISO 9001", "cert_number": "ISO-12345",
         "expiry_date": "2027-12-31", "status": "active",
         "source_ref": "kb/certifications.json#iso9001"},
        {"cert_type": "CTPAT", "cert_number": "CT-67890",
         "expiry_date": "2026-01-15", "status": "active",
         "source_ref": "kb/certifications.json#ctpat"},
        {"cert_type": "SmartWay", "cert_number": "",
         "expiry_date": "2027-06-30", "status": "active"},
        {"cert_type": "TSA IAC", "cert_number": "TSA-111",
         "expiry_date": "bad-date", "status": "active"},
        {"cert_type": "SOC 2", "cert_number": "SOC-222",
         "expiry_date": "2027-03-01", "status": "lapsed"},
        {"cert_type": "ISO 27001", "cert_number": "A-1",
         "expiry_date": "2028-01-01", "status": "active"},
        {"cert_type": "ISO27001", "cert_number": "A-2",
         "expiry_date": "2028-01-01", "status": "active"},
    ]

    reqs = [
        {"name": "ISO 9001", "mandatory": True, "source_ref": "rfp.pdf#p4L12"},
        {"name": "CTPAT", "mandatory": True, "source_ref": "rfp.pdf#p4L13"},
        {"name": "SmartWay", "mandatory": False, "source_ref": "rfp.pdf#p4L14"},
        {"name": "TSA IAC", "mandatory": True, "source_ref": "rfp.pdf#p4L15"},
        {"name": "SOC 2", "mandatory": True, "source_ref": "rfp.pdf#p4L16"},
        {"name": "ISO 27001", "mandatory": True, "source_ref": "rfp.pdf#p4L17"},
        {"name": "Hazmat Endorsement", "mandatory": True, "source_ref": "rfp.pdf#p4L18"},
    ]

    out = validate(reqs, records, "2026-08-10", contract_start_date="2026-10-01")
    by_req = {r["requirement"]: r for r in out["rows"]}

    checks = [
        ("ISO 9001", STATUS_COMPLIANT, None),
        ("CTPAT", STATUS_GAP, GAP_REASONS["EXPIRED"]),
        ("SmartWay", STATUS_GAP, GAP_REASONS["MISSING_NUMBER"]),
        ("TSA IAC", STATUS_GAP, GAP_REASONS["UNPARSEABLE_DATE"]),
        ("SOC 2", STATUS_GAP, GAP_REASONS["INACTIVE_STATUS"]),
        ("ISO 27001", STATUS_GAP, GAP_REASONS["AMBIGUOUS_MATCH"]),
        ("Hazmat Endorsement", STATUS_GAP, GAP_REASONS["NO_RECORD"]),
    ]

    for name, want_status, want_reason in checks:
        row = by_req.get(name)
        if row is None:
            failures.append(f"missing row: {name}")
            continue
        if row["status"] != want_status:
            failures.append(f"{name}: status {row['status']} want {want_status}")
        if want_reason and row["reason"] != want_reason:
            failures.append(f"{name}: reason {row['reason']!r} want {want_reason!r}")

    mid = validate(
        [{"name": "ISO 9001", "mandatory": True, "source_ref": "x"}],
        [{"cert_type": "ISO 9001", "cert_number": "N1",
          "expiry_date": "2026-09-01", "status": "active", "source_ref": "y"}],
        "2026-08-10",
        contract_start_date="2026-10-01",
    )
    if mid["rows"][0]["reason"] != GAP_REASONS["EXPIRES_MID_TERM"]:
        failures.append("mid-term expiry not detected")

    empty = validate(reqs, [], "2026-08-10")
    if empty["n_compliant"] != 0 or empty["n_gap"] != len(reqs):
        failures.append("empty record set did not fail closed")

    try:
        validate(reqs, records, "not-a-date")
        failures.append("malformed submission_date did not halt")
    except ComplianceHalt:
        pass

    try:
        validate(reqs, [{"cert_number": "X"}], "2026-08-10")
        failures.append("malformed cert record did not halt")
    except ComplianceHalt:
        pass

    if failures:
        print("SELFTEST FAILED")
        for f in failures:
            print("  -", f)
        return 1

    print(f"SELFTEST PASSED — compliance_validator {VALIDATOR_VERSION} — 11/11")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        sys.exit(_selftest())
    ap.error("--selftest required (library use otherwise)")
