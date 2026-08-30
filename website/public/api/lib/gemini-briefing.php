<?php
declare(strict_types=1);

function fi_gemini_generate_briefing(array $input, array $config): ?array
{
    $apiKey = $config['gemini_api_key'] ?? getenv('GEMINI_API_KEY') ?: null;
    if (!$apiKey) {
        return null;
    }

    $model = $config['gemini_model'] ?? 'gemini-2.0-flash';
    $promptPath = __DIR__ . '/REVENUE-INTEL-AGENT-GEM.md';
    if (!file_exists($promptPath)) {
        return null;
    }
    $systemInstructions = file_get_contents($promptPath);

    $today = $input['date'] ?? gmdate('Y-m-d');
    $niche = $input['niche'] ?? '';
    $icp = $input['icp'] ?? '';
    $region = $input['region'] ?? 'US';
    $recency = (int) ($input['recency_days'] ?? 180);
    $constraints = $input['constraints'] ?? 'Solo operator · no existing list in this niche · manual delivery only';
    $mode = $input['mode'] ?? 'Scan';
    $name = $input['name'] ?? 'Operator';

    $userPrompt = <<<PROMPT
Run a Revenue Intel briefing for this operator. Use google search to find dated evidence where possible.

Today's Date: {$today}
Niche: {$niche}
ICP: {$icp}
Region: {$region}
Recency Window: {$recency} days
Operator Constraints: {$constraints}
Mode: {$mode}

Operator first name: {$name}

Follow STRICT OUTPUT FORMAT plus EMAIL OUTPUT ADDENDUM. Return HTML only (fragment, no html/body tags). Begin with a styled header div for Freeman Intelligence.
PROMPT;

    $payload = [
        'system_instruction' => [
            'parts' => [['text' => $systemInstructions]],
        ],
        'contents' => [
            ['role' => 'user', 'parts' => [['text' => $userPrompt]]],
        ],
        'tools' => [
            ['google_search' => new stdClass()],
        ],
        'generationConfig' => [
            'temperature' => 0.4,
            'maxOutputTokens' => 8192,
        ],
    ];

    $url = sprintf(
        'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
        rawurlencode($model),
        rawurlencode($apiKey)
    );

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
    ]);
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw === false || $code >= 400) {
        error_log('Gemini briefing failed: HTTP ' . $code . ' ' . substr((string) $raw, 0, 500));
        return null;
    }

    $data = json_decode($raw, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
    if (!$text) {
        return null;
    }

    $text = preg_replace('/^```html\s*/i', '', trim($text));
    $text = preg_replace('/```\s*$/', '', $text);

    $html = fi_wrap_briefing_email($text, $name, $today, $niche, $icp);

    return [
        'subject' => 'Your Revenue Intel Briefing — ' . $niche,
        'html' => $html,
        'profile_key' => 'agent_gemini',
        'engine' => 'gemini',
    ];
}

function fi_wrap_briefing_email(string $bodyHtml, string $name, string $date, string $niche, string $icp): string
{
    $first = fi_escape($name !== '' ? explode(' ', trim($name))[0] : 'Operator');
    $dateEsc = fi_escape($date);
    $nicheEsc = fi_escape($niche);
    $icpEsc = fi_escape($icp);

    if (stripos($bodyHtml, 'Freeman Intelligence') !== false && stripos($bodyHtml, '<h') !== false) {
        return <<<HTML
<div style="font-family:Georgia,serif;line-height:1.6;color:#1a1a2e;max-width:640px;margin:0 auto;background:#fff8f0;padding:16px">
{$bodyHtml}
<p style="font-size:11px;color:#888;text-align:center;margin-top:24px;border-top:1px solid #ddd;padding-top:12px">
Samuel Freeman · Freeman Intelligence · <a href="https://freemanintelligence.com/cohort/" style="color:#8a7020">Dual-Intel Systems Lab</a>
</p>
</div>
HTML;
    }

    return <<<HTML
<div style="font-family:Georgia,serif;line-height:1.6;color:#1a1a2e;max-width:640px;margin:0 auto;background:#fff8f0;padding:16px">
  <div style="background:#0f1a2e;color:#fff;padding:20px 24px;text-align:center;margin-bottom:16px">
    <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#c9a227">Freeman Intelligence</p>
    <h1 style="margin:8px 0 0;font-family:system-ui,sans-serif;font-size:22px;font-weight:800">Revenue Intel Briefing</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#8b9cb8">Prepared for {$first} · {$dateEsc}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#8b9cb8">ICP: {$icpEsc} · Niche: {$nicheEsc}</p>
  </div>
  <div style="background:#fff;border:1px solid #ddd;padding:24px">{$bodyHtml}</div>
  <p style="font-size:11px;color:#888;text-align:center;margin-top:16px">Samuel Freeman · Reply for a free teardown.</p>
</div>
HTML;
}
