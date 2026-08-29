# AutoBorder Comply

**Stop Guessing Tariffs. Start Guaranteeing Them.**

AutoBorder Comply is the USMCA Regional Value Content (RVC) calculation platform for automotive suppliers — the "Stripe for Tariffs." We guarantee CBP-compliant RVC math or we pay the penalty.

## What This Repo Contains

This is the Week 1–12 engineering MVP from the operational blueprint:

| Sprint | Module | Status |
|--------|--------|--------|
| Week 1–2 | SAP ERP connector (`SAPConnector`) | ✅ Mock sandbox + live PyRFC path |
| Week 3–4 | Neo4j graph mapper | ✅ In-memory + AuraDB Cypher export |
| Week 5–6 | USMCA RVC calculator | ✅ Deterministic Annex 4-B build-down |
| Week 7–8 | LLM cost extractor | ✅ OpenAI + heuristic fallback |
| Week 9–10 | Forensic PDF generator | ✅ ReportLab audit document |
| Week 11–12 | FastAPI gateway + insurance stub | ✅ Full REST API |

## Quick Start

```bash
# Install
pip install -e ".[dev]"

# Run full pipeline on mock brake rotor (Part #12345)
autoborder pipeline 12345

# Calculate RVC only
autoborder rvc 12345 -v

# Start API server
uvicorn autoborder.api.main:app --reload --port 8000
```

## Architecture

```
ERP (SAP/Oracle) → JSON BOM Tree → Neo4j Graph → USMCA Calculator → Forensic PDF
                                        ↑
                              LLM Extractor (classification only, never math)
```

**Core formula (USMCA Annex 4-B build-down):**

```
RVC = ((Net Cost - Value of Non-Originating Materials) / Net Cost) × 100
```

Exclusions: packing, warranty, royalties. Partial originating components use proportional tracing.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + connector status |
| GET | `/bom/{part_number}` | Extract BOM tree from ERP |
| GET | `/rvc/{part_number}` | Calculate RVC percentage |
| GET | `/graph/{part_number}` | Build supply chain graph |
| GET | `/forensic-pdf/{part_number}` | Download CBP audit PDF |
| POST | `/extract-costs` | Extract costs from messy spreadsheet |
| POST | `/insurance/quote` | Get indemnity bond quote |
| POST | `/pipeline/{part_number}` | End-to-end processing |

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `AUTOBORDER_USE_MOCK_SAP=true` | Use mock brake rotor BOM (default) |
| `NEO4J_URI` / `NEO4J_PASSWORD` | Neo4j AuraDB connection |
| `SAP_ASHOST` / `SAP_USER` / `SAP_PASSWORD` | Live SAP S/4HANA |
| `OPENAI_API_KEY` | LLM cost sheet extraction |

## Mock Data

Part `#12345` is a 5-level brake rotor assembly with:
- **Green** originating components (MX, US, CA)
- **Red** non-originating Chinese bearing assembly
- **Partial** 60% originating Canadian coating kit
- Excluded packing, warranty, and royalty line items

## Project Structure

```
autoborder/
├── connectors/     # SAP + Oracle ERP ingestion
├── graph/          # Neo4j mapper + Cypher generator
├── engine/         # Deterministic USMCA RVC calculator
├── extractors/     # LLM cost field extraction
├── reports/        # Forensic PDF generator
├── services/       # Insurance MGU integration
├── api/            # FastAPI gateway
├── data/mock/      # Sandbox BOM + cost sheets
└── cli.py          # Command-line interface
```

## Unit Economics (Per Client)

| Stream | Amount |
|--------|--------|
| Base SaaS (1,000 BOMs) | $8,500/mo |
| Insurance add-on (15%) | $1,275/mo |
| Implementation (Year 1) | $15,000 one-time |
| **Year 1 ARR** | **~$117,000** |

## License

Proprietary — AutoBorder Comply
