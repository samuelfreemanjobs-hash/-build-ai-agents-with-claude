<?php
return [
    // ESP webhook (ConvertKit / Beehiiv / Zapier)
    'webhook_url' => null,
    'checkout_url' => null,

    // Outbound email (Hostinger hPanel)
    'mail_from' => 'briefings@freemanintelligence.com',
    'mail_from_name' => 'Freeman Intelligence',
    'mail_reply_to' => 'samuel@freemanintelligence.com',

    // Revenue Intel Agent — Gemini (required for full agent briefings)
    'gemini_api_key' => null,
    'gemini_model' => 'gemini-2.0-flash',
];
