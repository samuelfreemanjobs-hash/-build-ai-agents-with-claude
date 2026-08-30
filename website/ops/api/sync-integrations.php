<?php
/**
 * Trigger server-side integration sync (ESP polling on Hostinger cron).
 * Requires config.php with API keys OR set env vars on VPS.
 *
 * Usage:
 *   curl -X POST "https://freemanintelligence.com/ops/api/sync-integrations.php?token=YOUR_SYNC_TOKEN"
 */
header('Content-Type: application/json');
header('X-Robots-Tag: noindex');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$configPath = __DIR__ . '/config.php';
$config = file_exists($configPath) ? require $configPath : [];

$token = $_GET['token'] ?? '';
$expected = $config['sync_token'] ?? getenv('OPS_SYNC_TOKEN');
if ($expected && !hash_equals((string) $expected, (string) $token)) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$root = dirname(__DIR__, 3);
$script = $root . '/scripts/sync-external-metrics.py';
if (!file_exists($script)) {
    http_response_code(500);
    echo json_encode(['error' => 'sync-external-metrics.py not found on server']);
    exit;
}

// Pass PHP config to Python via env for this request
foreach ([
    'esp_provider' => 'ESP_PROVIDER',
    'convertkit_api_secret' => 'CONVERTKIT_API_SECRET',
    'beehiiv_api_key' => 'BEEHIIV_API_KEY',
    'beehiiv_publication_id' => 'BEEHIIV_PUBLICATION_ID',
    'stripe_webhook_secret' => 'STRIPE_WEBHOOK_SECRET',
] as $key => $env) {
    if (!empty($config[$key])) {
        putenv("$env={$config[$key]}");
    }
}

$cmd = 'python3 ' . escapeshellarg($script) . ' --triggered-by=hostinger 2>&1';
$output = shell_exec($cmd);
$summary = json_decode(trim($output), true);

if (!is_array($summary)) {
    http_response_code(500);
    echo json_encode(['error' => 'Sync failed', 'output' => $output]);
    exit;
}

echo json_encode(['ok' => true, 'summary' => $summary]);
