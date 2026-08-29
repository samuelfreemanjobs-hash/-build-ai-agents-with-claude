"""Insurance MGU integration stub for indemnity bond quotes."""

from autoborder.models import InsuranceQuoteRequest, InsuranceQuoteResponse


class InsuranceMGUClient:
    """
    Stub for insurance MGU API integration.

    Premium = 15% of base SaaS fee ($8,500) → $1,275/mo per business plan.
    Coverage capped at $500k per contract.
    """

    BASE_SAAS_FEE = 8_500.0
    PREMIUM_RATE = 0.15

    def __init__(self, api_url: str = "", api_key: str = "") -> None:
        self.api_url = api_url
        self.api_key = api_key

    def quote(self, request: InsuranceQuoteRequest) -> InsuranceQuoteResponse:
        premium = round(self.BASE_SAAS_FEE * self.PREMIUM_RATE, 2)
        coverage = min(request.coverage_limit_usd, 500_000.0)
        reference = f"ABC-IND-{request.part_number}-{int(request.rvc_percentage)}"

        if self.api_url and self.api_key:
            # Live integration point — POST to MGU API when credentials configured
            pass

        return InsuranceQuoteResponse(
            premium_monthly_usd=premium,
            coverage_limit_usd=coverage,
            policy_reference=reference,
            status="quoted",
        )
