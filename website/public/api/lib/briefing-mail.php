<?php
declare(strict_types=1);

function fi_load_config(): array
{
    $path = dirname(__DIR__) . '/config.php';
    if (file_exists($path)) {
        $cfg = require $path;
        return is_array($cfg) ? $cfg : [];
    }
    return [];
}

function fi_send_html_mail(string $to, string $subject, string $html, array $config): array
{
    $fromEmail = $config['mail_from'] ?? 'briefings@freemanintelligence.com';
    $fromName = $config['mail_from_name'] ?? 'Freeman Intelligence';
    $replyTo = $config['mail_reply_to'] ?? 'samuel@freemanintelligence.com';

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . sprintf('"%s" <%s>', addslashes($fromName), $fromEmail),
        'Reply-To: ' . $replyTo,
        'X-Mailer: FI-Revenue-Intel',
    ];

    $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, implode("\r\n", $headers));

    return ['ok' => $ok, 'method' => 'mail'];
}

function fi_save_lead(array $lead, string $tag): void
{
    $dataDir = dirname(__DIR__, 2) . '/data';
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
        if (strcasecmp($row['email'], $lead['email']) === 0 && ($row['tag'] ?? '') === $tag) {
            $row = array_merge($row, $lead);
            $found = true;
            break;
        }
    }
    unset($row);
    if (!$found) {
        $leads['leads'][] = $lead;
    }

    if (is_writable($dataDir) || (file_exists($file) && is_writable($file))) {
        file_put_contents($file, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    }
}

function fi_webhook_notify(array $payload, array $config): void
{
    $url = $config['webhook_url'] ?? null;
    if (!$url) {
        return;
    }
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($payload),
            'timeout' => 10,
        ],
    ]);
    @file_get_contents($url, false, $ctx);
}
