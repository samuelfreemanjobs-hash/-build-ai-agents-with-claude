<?php
header('Content-Type: application/json');
header('X-Robots-Tag: noindex');

$dir = dirname(__DIR__) . '/data';
$checks = [
    'php' => PHP_VERSION,
    'data_dir_exists' => is_dir($dir),
    'data_dir_writable' => is_writable($dir),
    'ops_tasks_writable' => is_writable($dir . '/ops-tasks.json') || is_writable($dir),
    'ops_metrics_writable' => is_writable($dir . '/ops-metrics.json') || is_writable($dir),
    'integrations_exists' => file_exists($dir . '/integrations.json'),
    'config_present' => file_exists(dirname(__DIR__) . '/api/config.php'),
];

echo json_encode([
    'ok' => $checks['data_dir_exists'] && $checks['data_dir_writable'],
    'checks' => $checks,
]);
