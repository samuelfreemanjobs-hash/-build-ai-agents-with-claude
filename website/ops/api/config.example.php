<?php
/**
 * Ops portal integration config — copy to config.php on Hostinger.
 * Never commit config.php (gitignored).
 */
return [
    // ESP: convertkit | beehiiv
    'esp_provider' => null,
    'convertkit_api_secret' => null,
    'beehiiv_api_key' => null,
    'beehiiv_publication_id' => null,

    // Stripe checkout webhook (real-time backend revenue)
    'stripe_webhook_secret' => null,

    // Optional: protect sync endpoint with shared token
    'sync_token' => null,
];
