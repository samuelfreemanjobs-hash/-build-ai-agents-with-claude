# AWS Terraform — outline

Production deployment starter. **Not a complete module** — customize for your AWS account, region, and compliance requirements.

## Target architecture

- **CloudFront** + ACM certificate → HTTPS
- **ALB** → **ECS Fargate** (api container from `deploy/Dockerfile`)
- **RDS PostgreSQL 15** (Multi-AZ) — schema from `deploy/sql/init.sql`
- **ElastiCache Redis** — job queue (when wired)
- **S3** — `generated_proposals/` artifacts
- **Secrets Manager** — `ANTHROPIC_API_KEY`
- **CloudWatch** — logs + alarms on 5xx / HALTED rate

## Suggested resources

```hcl
# Variables
variable "aws_region" { default = "us-east-1" }
variable "environment" { default = "production" }

# Core
# - aws_vpc + public/private subnets
# - aws_ecs_cluster
# - aws_ecs_task_definition (image from ECR)
# - aws_ecs_service + aws_lb + aws_lb_target_group
# - aws_db_instance (postgres 15, db.t3.medium)
# - aws_elasticache_cluster (redis)
# - aws_s3_bucket (proposals artifacts)
# - aws_secretsmanager_secret (anthropic key)
# - aws_cloudfront_distribution (optional — frontend static on S3)
```

## Deploy flow

```bash
# 1. Build & push API image
aws ecr get-login-password | docker login ...
docker build -f deploy/Dockerfile -t ai-proposals-api ..
docker tag ai-proposals-api:latest $ECR_URI:latest
docker push $ECR_URI:latest

# 2. Build frontend
cd frontend && npm run build
aws s3 sync dist/ s3://your-frontend-bucket/

# 3. Terraform
cd deploy/terraform
terraform init && terraform apply

# 4. Run migrations (if not via init container)
psql $DATABASE_URL -f ../sql/init.sql
```

## Estimated monthly cost

| Service | Size | ~Cost |
|---------|------|-------|
| ECS Fargate | 1 vCPU / 2GB × 2 | $60–90 |
| RDS PostgreSQL | db.t3.medium Multi-AZ | $120–180 |
| ElastiCache | cache.t3.micro | $15–25 |
| ALB | 1 | $20–25 |
| S3 + CloudFront | low traffic | $10–30 |
| **Total** | | **$300–500** |

## Environment injection (ECS task)

```json
{
  "environment": [
    { "name": "DATABASE_URL", "value": "postgresql://..." },
    { "name": "CORS_ORIGINS", "value": "https://proposals.yourdomain.com" },
    { "name": "PROPOSALS_OUTPUT_DIR", "value": "/app/generated_proposals" }
  ],
  "secrets": [
    { "name": "ANTHROPIC_API_KEY", "valueFrom": "arn:aws:secretsmanager:..." }
  ]
}
```

See [`../docs/deployment-guide.md`](../docs/deployment-guide.md) for full checklist.
