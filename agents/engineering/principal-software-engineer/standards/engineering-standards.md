# Engineering standards reference for Principal Software Engineer Agent™

## API Design
- All public APIs must be versioned (e.g., /api/v1/)
- Breaking changes require a new version, not in-place modification
- Error responses follow RFC 7807 Problem Details format

## Security
- No hardcoded credentials in any artifact
- Authentication required for all non-public endpoints
- PII must be encrypted at rest and in transit

## Observability
- All services expose health check endpoints
- Structured logging with correlation IDs
- Key metrics: latency (p50/p95/p99), error rate, throughput

## Reliability
- Production services require backup/DR plan
- No single points of failure without documented mitigation
- Graceful degradation for non-critical features

## Data
- Database migrations must be backward-compatible
- Data retention policies documented
- Cross-service data consistency model explicit
