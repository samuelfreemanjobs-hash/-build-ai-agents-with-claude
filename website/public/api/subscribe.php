<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$allowed_tags = ['waitlist', 'lead_rubric', 'cohort_interest', 'general'];

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email required']);
    exit;
}

$tag = in_array($input['tag'] ?? '', $allowed_tags, true) ? $input['tag'] : 'general';
$name = trim(strip_tags($input['name'] ?? ''));
$source = trim(strip_tags($input['source'] ?? ''));
$fields = is_array($input['fields'] ?? null) ? $input['fields'] : [];

$lead = [
    'id' => bin2hex(random_bytes(8)),
    'email' => $email,
    'name' => $name,
    'tag' => $tag,
    'source' => $source,
    'fields' => $fields,
    'created_at' => gmdate('c'),
];

$dataDir = dirname(__DIR__) . '/data';
$file = $dataDir . '/leads.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$leads = ['version' => 1, 'leads' => []];
if (file_exists($file)) {
    $existing = json_decode(file_get_contents($file), true);
    if (is_array($existing) && isset($existing['leads'])) {
        $leads = $existing;
    }
}

$found = false;
foreach ($leads['leads'] as &$row) {
    if (strcasecmp($row['email'], $email) === 0 && ($row['tag'] ?? '') === $tag) {
        $row = array_merge($row, $lead);
        $found = true;
        break;
    }
}
unset($row);
if (!$found) {
    $leads['leads'][] = $lead;
}

if (!is_writable($dataDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'data/ not writable', 'fix' => 'chmod 755 public_html/data']);
    exit;
}

file_put_contents($file, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);

$response = ['ok' => true, 'tag' => $tag, 'id' => $lead['id']];

if ($tag === 'lead_rubric') {
    $response['download'] = '/downloads/dr-rubric-install.html';
}

echo json_encode($response);
