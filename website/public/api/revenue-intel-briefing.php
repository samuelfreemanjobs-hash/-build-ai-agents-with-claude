<?php
/**
 * Revenue Intel Briefing — Revenue Intel Agent (Gemini) + email delivery.
 * POST JSON: { name, email, icp, niche, region?, date?, constraints?, source? }
 */
header('Content-Type: application/json');
header('X-Robots-Tag: noindex');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

require __DIR__ . '/lib/briefing-generator.php';
require __DIR__ . '/lib/briefing-mail.php';

$config = fi_load_config();
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$name = trim(strip_tags($input['name'] ?? ''));
$icp = trim(strip_tags($input['icp'] ?? ''));
$niche = trim(strip_tags($input['niche'] ?? ''));
$region = trim(strip_tags($input['region'] ?? 'US'));
$date = trim(strip_tags($input['date'] ?? gmdate('Y-m-d')));
$constraints = trim(strip_tags($input['constraints'] ?? ''));
$source = trim(strip_tags($input['source'] ?? '/'));

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email required']);
    exit;
}

if ($icp === '' || mb_strlen($icp) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Describe your ICP (at least 10 characters)']);
    exit;
}

if ($niche === '' || mb_strlen($niche) < 2) {
    http_response_code(400);
    echo json_encode(['error' => 'Enter your market or niche']);
    exit;
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid date — use YYYY-MM-DD']);
    exit;
}

$options = [
    'date' => $date,
    'region' => $region !== '' ? $region : 'US',
    'constraints' => $constraints !== '' ? $constraints : 'Solo operator · manual delivery · act within 90 days',
    'mode' => 'Scan',
];

$briefing = fi_generate_revenue_intel_briefing($name, $icp, $niche, $options, $config);
$mailResult = fi_send_html_mail($email, $briefing['subject'], $briefing['html'], $config);

$leadId = bin2hex(random_bytes(8));
$lead = [
    'id' => $leadId,
    'email' => $email,
    'name' => $name,
    'tag' => 'revenue_intel_briefing',
    'source' => $source,
    'fields' => [
        'icp' => $icp,
        'niche' => $niche,
        'region' => $options['region'],
        'date' => $date,
        'constraints' => $options['constraints'],
        'profile_key' => $briefing['profile_key'],
        'engine' => $briefing['engine'] ?? 'template',
        'emailed' => $mailResult['ok'],
    ],
    'created_at' => gmdate('c'),
];

fi_save_lead($lead, 'revenue_intel_briefing');

fi_webhook_notify([
    'event' => 'revenue_intel_briefing',
    'email' => $email,
    'name' => $name,
    'icp' => $icp,
    'niche' => $niche,
    'region' => $options['region'],
    'engine' => $briefing['engine'] ?? 'template',
    'profile' => $briefing['profile_key'],
], $config);

$archiveDir = dirname(__DIR__, 2) . '/data/briefings';
if (!is_dir($archiveDir)) {
    @mkdir($archiveDir, 0755, true);
}
if (is_dir($archiveDir) && is_writable($archiveDir)) {
    file_put_contents($archiveDir . '/' . $leadId . '.html', $briefing['html'], LOCK_EX);
}

if (!$mailResult['ok']) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Briefing generated but email failed — check Hostinger mail settings',
        'id' => $leadId,
        'engine' => $briefing['engine'] ?? 'template',
        'fix' => 'Set mail_from in api/config.php · create email account in hPanel',
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'id' => $leadId,
    'tag' => 'revenue_intel_briefing',
    'message' => 'Revenue Intel Briefing sent — check your inbox (allow 1–2 min for agent research)',
    'profile' => $briefing['profile_key'],
    'engine' => $briefing['engine'] ?? 'template',
]);
