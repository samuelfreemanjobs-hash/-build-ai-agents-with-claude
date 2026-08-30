#!/usr/bin/env php
<?php
/** Local test: generate Revenue Intel Briefing HTML without sending email. */
require __DIR__ . '/../website/public/api/lib/briefing-generator.php';

$name = $argv[1] ?? 'Samuel';
$icp = $argv[2] ?? 'B2B SaaS founders at $1-5M ARR who need pipeline without hiring SDRs';
$niche = $argv[3] ?? 'B2B content agency';

$result = fi_generate_revenue_intel_briefing($name, $icp, $niche);
$out = __DIR__ . '/../website/public/data/briefings/test-preview.html';
@mkdir(dirname($out), 0755, true);
file_put_contents($out, $result['html']);

echo "Subject: {$result['subject']}\n";
echo "Profile: {$result['profile_key']}\n";
echo "Preview: $out\n";
