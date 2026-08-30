<?php
/**
 * Shared save handler for ops portal JSON files on Hostinger.
 * Writes to ../data/{filename} — requires data/ writable by PHP (chmod 755 or 775).
 */
header('Content-Type: application/json');
header('X-Robots-Tag: noindex');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$allowed = [
    'ops-tasks.json',
    'ops-metrics.json',
];

$target = basename($_GET['file'] ?? '');
if (!in_array($target, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file', 'allowed' => $allowed]);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

$dir = dirname(__DIR__) . '/data';
$file = $dir . '/' . $target;

if (!is_dir($dir)) {
    http_response_code(500);
    echo json_encode(['error' => 'data/ directory missing']);
    exit;
}

if (!is_writable($dir)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'data/ not writable',
        'fix' => 'hPanel File Manager → public_html/ops/data → Permissions → 755 or 775',
    ]);
    exit;
}

$data['updated'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    http_response_code(500);
    echo json_encode(['error' => 'JSON encode failed']);
    exit;
}

// Backup previous version
if (file_exists($file)) {
    @copy($file, $file . '.bak');
}

$ok = file_put_contents($file, $json, LOCK_EX);

if ($ok === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Write failed',
        'file' => $target,
        'fix' => 'Set ops/data/ and ops/data/' . $target . ' to writable (664/666) on Hostinger',
    ]);
    exit;
}

@chmod($file, 0644);

echo json_encode([
    'ok' => true,
    'file' => $target,
    'updated' => $data['updated'],
    'bytes' => $ok,
]);
