<?php
/**
 * Upload KDP sales CSV — updates integrations.json and ops-metrics.json.
 * POST multipart/form-data with field "csv"
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

if (empty($_FILES['csv']['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing csv file upload']);
    exit;
}

$tmp = $_FILES['csv']['tmp_name'];
$rows = 0;
$units = 0;
$royalties = 0.0;
$kenp = 0;

if (($handle = fopen($tmp, 'r')) !== false) {
    $header = fgetcsv($handle);
    if (!$header) {
        http_response_code(400);
        echo json_encode(['error' => 'Empty CSV']);
        exit;
    }
    $map = [];
    foreach ($header as $i => $col) {
        $map[strtolower(trim($col))] = $i;
    }
    $find = function (array $row, array $names) use ($map) {
        foreach ($names as $n) {
            $k = strtolower($n);
            if (isset($map[$k]) && isset($row[$map[$k]])) {
                return trim($row[$map[$k]]);
            }
        }
        return null;
    };
    while (($row = fgetcsv($handle)) !== false) {
        $rows++;
        $u = $find($row, ['Units Sold', 'Units', 'Net Units Sold', 'Quantity']);
        $r = $find($row, ['Royalty', 'Royalties', 'Estimated Royalty', 'Royalty (USD)', 'Earnings']);
        $k = $find($row, ['KENP Read', 'KENP', 'Kindle Edition Normalized Pages (KENP) Read']);
        if ($u !== null && $u !== '') {
            $units += (int) str_replace(',', '', $u);
        }
        if ($r !== null && $r !== '') {
            $royalties += (float) str_replace(['$', ','], '', $r);
        }
        if ($k !== null && $k !== '') {
            $kenp += (int) str_replace(',', '', $k);
        }
    }
    fclose($handle);
}

if ($rows === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'No data rows']);
    exit;
}

$dataDir = dirname(__DIR__) . '/data';
$integrationsFile = $dataDir . '/integrations.json';
$metricsFile = $dataDir . '/ops-metrics.json';
$now = gmdate('c');

$integrations = file_exists($integrationsFile)
    ? json_decode(file_get_contents($integrationsFile), true)
    : ['version' => 1, 'sources' => [], 'sync_log' => []];

$integrations['sources']['kdp'] = [
    'status' => 'ok',
    'error' => null,
    'last_sync' => $now,
    'source_file' => $_FILES['csv']['name'] ?? 'upload.csv',
    'metrics' => [
        'units_sold' => $units,
        'royalties' => round($royalties, 2),
        'kenp_read' => $kenp ?: null,
    ],
];
$integrations['updated'] = $now;
$integrations['sync_log'][] = ['at' => $now, 'triggered_by' => 'kdp_upload', 'ok' => true];
$integrations['sync_log'] = array_slice($integrations['sync_log'], -30);

$metrics = file_exists($metricsFile)
    ? json_decode(file_get_contents($metricsFile), true)
    : ['version' => 1, 'actuals' => [], 'revenue' => []];

$metrics['actuals']['kindle_units'] = $units;
$metrics['revenue']['kindle_royalties'] = round($royalties, 2);
$metrics['auto_synced']['kindle_units'] = 'kdp';
$metrics['auto_synced']['kindle_royalties'] = 'kdp';
$metrics['updated'] = date('Y-m-d');
$metrics['integrations_updated'] = $now;

file_put_contents($integrationsFile, json_encode($integrations, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents($metricsFile, json_encode($metrics, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode([
    'ok' => true,
    'units_sold' => $units,
    'royalties' => round($royalties, 2),
    'rows' => $rows,
]);
