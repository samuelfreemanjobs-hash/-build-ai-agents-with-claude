<?php
/**
 * Stripe webhook — records backend revenue on checkout completion.
 * Configure in Stripe Dashboard → Webhooks → checkout.session.completed
 *
 * URL: https://freemanintelligence.com/ops/api/stripe-webhook.php
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
$webhookSecret = $config['stripe_webhook_secret'] ?? getenv('STRIPE_WEBHOOK_SECRET');

$payload = file_get_contents('php://input');
$sig = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

if ($webhookSecret) {
    $parts = [];
    foreach (explode(',', $sig) as $item) {
        $kv = explode('=', trim($item), 2);
        if (count($kv) === 2) {
            $parts[$kv[0]] = $kv[1];
        }
    }
    $timestamp = $parts['t'] ?? '';
    $v1 = $parts['v1'] ?? '';
    $signed = hash_hmac('sha256', $timestamp . '.' . $payload, $webhookSecret);
    if (!$v1 || !hash_equals($signed, $v1)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
}

$event = json_decode($payload, true);
if (!is_array($event)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$type = $event['type'] ?? '';
$data = $event['data']['object'] ?? [];

$amount = 0;
if ($type === 'checkout.session.completed') {
    $amount = ($data['amount_total'] ?? 0) / 100;
} elseif ($type === 'payment_intent.succeeded') {
    $amount = ($data['amount_received'] ?? $data['amount'] ?? 0) / 100;
} else {
    echo json_encode(['ok' => true, 'ignored' => $type]);
    exit;
}

if ($amount <= 0) {
    echo json_encode(['ok' => true, 'amount' => 0]);
    exit;
}

$dataDir = dirname(__DIR__) . '/data';
$integrationsFile = $dataDir . '/integrations.json';
$metricsFile = $dataDir . '/ops-metrics.json';

$integrations = file_exists($integrationsFile)
    ? json_decode(file_get_contents($integrationsFile), true)
    : ['version' => 1, 'sources' => [], 'sync_log' => []];

$metrics = file_exists($metricsFile)
    ? json_decode(file_get_contents($metricsFile), true)
    : ['version' => 1, 'actuals' => [], 'revenue' => []];

$now = gmdate('c');
$stripe = $integrations['sources']['stripe'] ?? [
    'status' => 'ok',
    'metrics' => ['backend_total' => 0, 'transaction_count' => 0, 'currency' => 'usd'],
];

$prev = (float) ($stripe['metrics']['backend_total'] ?? 0);
$newTotal = $prev + $amount;
$stripe['status'] = 'ok';
$stripe['last_sync'] = $now;
$stripe['metrics']['backend_total'] = round($newTotal, 2);
$stripe['metrics']['transaction_count'] = (int) ($stripe['metrics']['transaction_count'] ?? 0) + 1;
$stripe['metrics']['currency'] = strtolower($data['currency'] ?? 'usd');
$integrations['sources']['stripe'] = $stripe;
$integrations['updated'] = $now;
$integrations['sync_log'][] = [
    'at' => $now,
    'triggered_by' => 'stripe_webhook',
    'event' => $type,
    'amount' => $amount,
    'ok' => true,
];
$integrations['sync_log'] = array_slice($integrations['sync_log'], -30);

$metrics['revenue']['backend_total'] = $newTotal;
$metrics['auto_synced']['backend_total'] = 'stripe';
$kindle = (float) ($metrics['revenue']['kindle_royalties'] ?? 0);
$consulting = (float) ($metrics['revenue']['consulting'] ?? 0);
$total = $kindle + $newTotal + $consulting;
if ($total > 0) {
    $metrics['actuals']['backend_revenue_pct'] = round(($newTotal / $total) * 100, 1);
    $metrics['auto_synced']['backend_revenue_pct'] = 'stripe';
}
$metrics['updated'] = date('Y-m-d');
$metrics['integrations_updated'] = $now;

file_put_contents($integrationsFile, json_encode($integrations, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents($metricsFile, json_encode($metrics, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode(['ok' => true, 'backend_total' => $newTotal, 'added' => $amount]);
