# Resend Webhook Setup

HUNTER auto-updates pipeline stages when prospects open or click your emails.

## Setup (5 minutes)

1. Deploy HUNTER with a public URL (Railway, Render, etc.)
2. Set `PUBLIC_URL` in `.env` (e.g. `https://hunter-production.up.railway.app`)
3. In [Resend Dashboard](https://resend.com/webhooks) → **Add Webhook**
4. **Endpoint URL:** `https://your-domain.com/api/webhooks/resend`
5. **Events to subscribe:**
   - `email.delivered`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
   - `email.complained`

## What happens automatically

| Event | HUNTER Action |
|-------|---------------|
| `email.opened` (1st time) | Log status → `opened`, Slack alert |
| `email.opened` (2nd+ time) | Move lead to **Diagnostic Ready**, Slack alert |
| `email.clicked` | Move to **Diagnostic Ready**, pause follow-ups, Slack alert |
| `email.bounced` | Log status → `bounced`, add note to lead |
| `email.complained` | Mark bounced, Slack alert |

## Test locally (ngrok)

```bash
ngrok http 3001
# Set PUBLIC_URL to ngrok URL
# Point Resend webhook to https://xxxx.ngrok.io/api/webhooks/resend
```

## Simulate webhook (dev)

```bash
curl -X POST http://localhost:3001/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.opened",
    "data": {
      "email_id": "YOUR_RESEND_MESSAGE_ID",
      "subject": "Test outreach"
    }
  }'
```

Replace `YOUR_RESEND_MESSAGE_ID` with the `messageId` returned from `POST /api/outreach/send`.

## Verify

1. Send outreach to a lead via CRM
2. Check `outreach_logs` — should have `resend_message_id`
3. When Resend fires webhook, log status updates and lead stage advances
