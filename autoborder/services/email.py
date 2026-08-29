"""Email delivery stub for Savings Reports — swap for SendGrid/SES in production."""

from autoborder.models import SavingsReportDelivery, TariffLeakResult
from autoborder.reports.savings_report import SavingsReportGenerator


class EmailDeliveryService:
    """Queue Savings Report delivery to CFO inbox."""

    def send_savings_report(
        self,
        result: TariffLeakResult,
        recipient_email: str,
        report_generator: SavingsReportGenerator,
    ) -> SavingsReportDelivery:
        html = report_generator.render_html(result)

        # Production: POST to SendGrid/SES with html body
        # MVP: log delivery intent and return success
        _ = html

        return SavingsReportDelivery(
            report_id=result.report_id,
            recipient_email=recipient_email,
            status="queued",
            message=f"Savings Report {result.report_id} queued for delivery to {recipient_email}. "
            f"Estimated overpayment: ${result.overpaid_last_quarter:,.0f}/quarter.",
        )
