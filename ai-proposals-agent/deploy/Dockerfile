FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/pyproject.toml backend/README.md ./
COPY backend/ai_proposals_agent ./ai_proposals_agent

RUN pip install --no-cache-dir .

RUN mkdir -p /app/generated_proposals /app/uploads

ENV API_HOST=0.0.0.0
ENV API_PORT=8000
ENV PROPOSALS_OUTPUT_DIR=/app/generated_proposals

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

CMD ["uvicorn", "ai_proposals_agent.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
