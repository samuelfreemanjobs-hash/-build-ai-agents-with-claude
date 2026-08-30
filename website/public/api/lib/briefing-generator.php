<?php
/**
 * Generate personalized Revenue Intel Briefing HTML from ICP + niche inputs.
 */

declare(strict_types=1);

function fi_escape(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function fi_detect_niche_profile(string $niche): array
{
    $n = strtolower($niche);
    $profiles = [
        'agency' => [
            'label' => 'B2B service / agency',
            'churn_triggers' => [
                'Scope creep without change orders — margin erodes before the client notices',
                'Results reporting that shows activity, not revenue impact',
                'Single point of contact leaves the client org',
                'Competitor pitches "AI-powered delivery at half the price"',
            ],
            'funnel_leaks' => 'Proposal → close (long sales cycles) and client → backend attach (no ascension offer)',
            'attach_offer' => 'Implementation sprint, retainer tier-up, or proprietary audit product',
            'opportunity' => 'Productize one repeatable deliverable as a fixed-scope "Intel Sprint" — stops trading hours for dollars',
        ],
        'saas' => [
            'label' => 'B2B SaaS',
            'churn_triggers' => [
                'Login velocity drops 30+ days before cancellation',
                'Champion goes quiet — replies shift from strategic to transactional',
                'Feature usage narrows to one module (single-threaded value)',
                'Renewal conversation starts with procurement, not your champion',
            ],
            'funnel_leaks' => 'Trial → activated user and demo → paid (onboarding gap)',
            'attach_offer' => 'Annual plan, services tier, or usage-based expansion SKU',
            'opportunity' => 'Instrument one leading churn signal in-product and trigger save playbook at day 21, not day 89',
        ],
        'coaching' => [
            'label' => 'Coaching / info product',
            'churn_triggers' => [
                'Buyer consumes content but never implements — guilt → refund request',
                'Community engagement drops after week 2',
                'No ascension path after core program ends',
                'Testimonials come from 5% of buyers — silent majority at risk',
            ],
            'funnel_leaks' => 'Webinar → checkout and buyer → backend (no tripwire or cohort bridge)',
            'attach_offer' => 'Implementation cohort, done-with-you sprint, or certification tier',
            'opportunity' => 'Add a 10-minute "first win" install in week 1 — completion rate is your retention lever',
        ],
        'ecommerce' => [
            'label' => 'E-commerce / DTC',
            'churn_triggers' => [
                'CAC rises while LTV flatlines — unit economics compress silently',
                'Repeat purchase rate drops quarter over quarter',
                'Email list grows but revenue per send falls',
                'Creative fatigue — same angles, declining CTR',
            ],
            'funnel_leaks' => 'Click → add-to-cart and first purchase → second purchase',
            'attach_offer' => 'Subscription box, membership, or premium bundle',
            'opportunity' => 'Score creative by margin contribution, not ROAS alone — one angle may scale revenue while killing profit',
        ],
        'freelance' => [
            'label' => 'Freelance / solo operator',
            'churn_triggers' => [
                'Project ends with no retainer bridge — revenue cliff every 4–8 weeks',
                'One client exceeds 40% of income',
                'Pipeline only refilled when already desperate',
                'Pricing by hour instead of outcome — race to the bottom',
            ],
            'funnel_leaks' => 'Referral → scoped proposal and project → repeat (no productized offer)',
            'attach_offer' => 'Monthly advisory retainer or productized audit at fixed price',
            'opportunity' => 'Convert your best project deliverable into a 48-hour fixed-scope offer — same work, 3× margin',
        ],
    ];

    if (str_contains($n, 'saas') || str_contains($n, 'software')) {
        return $profiles['saas'] + ['key' => 'saas'];
    }
    if (str_contains($n, 'coach') || str_contains($n, 'course') || str_contains($n, 'info')) {
        return $profiles['coaching'] + ['key' => 'coaching'];
    }
    if (str_contains($n, 'ecom') || str_contains($n, 'dtc') || str_contains($n, 'shop')) {
        return $profiles['ecommerce'] + ['key' => 'ecommerce'];
    }
    if (str_contains($n, 'freelanc') || str_contains($n, 'solo') || str_contains($n, 'consult')) {
        return $profiles['freelance'] + ['key' => 'freelance'];
    }
    if (str_contains($n, 'agency') || str_contains($n, 'marketing') || str_contains($n, 'content')) {
        return $profiles['agency'] + ['key' => 'agency'];
    }

    return [
        'key' => 'general',
        'label' => 'Growth operator',
        'churn_triggers' => [
            'Revenue concentrated in too few clients or one offer',
            'No leading indicators — you react to P&L, not signals',
            'Marketing spend scales before intel confirms what converts',
            'Backend offer missing — every sale starts from zero',
        ],
        'funnel_leaks' => 'Traffic → capture and lead → close (fix the node with worst conversion)',
        'attach_offer' => 'Implementation layer between entry offer and high-ticket',
        'opportunity' => 'Run Revenue Intel weekly: score top relationships + one funnel node — 30 minutes prevents the rollercoaster',
    ];
}

function fi_build_briefing_html(
    string $first,
    string $icpClean,
    string $nicheClean,
    string $date,
    array $profile,
    string $churnListHtml
): string {
    $label = fi_escape($profile['label']);
    $funnel = fi_escape($profile['funnel_leaks']);
    $attach = fi_escape($profile['attach_offer']);
    $opp = fi_escape($profile['opportunity']);

    return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Georgia,serif;line-height:1.6;color:#1a1a2e;max-width:640px;margin:0 auto;padding:24px;background:#fff8f0">
  <div style="background:#0f1a2e;color:#fff;padding:20px 24px;text-align:center">
    <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#c9a227">Freeman Intelligence</p>
    <h1 style="margin:8px 0 0;font-family:system-ui,sans-serif;font-size:22px;font-weight:800">Revenue Intel Briefing</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#8b9cb8">Prepared for {$first} · {$date}</p>
  </div>
  <div style="background:#fff;border:1px solid #ddd;padding:24px;margin-top:16px">
    <p style="font-size:14px;color:#666;margin-top:0"><strong>ICP:</strong> {$icpClean}<br><strong>Market / Niche:</strong> {$nicheClean}<br><strong>Profile:</strong> {$label}</p>
    <h2 style="font-family:system-ui,sans-serif;color:#8a7020;font-size:16px;border-bottom:2px solid #c9a227;padding-bottom:6px">1 · Retainer &amp; Revenue Health</h2>
    <p>For operators selling to <em>{$icpClean}</em> in <em>{$nicheClean}</em>:</p>
    <ul style="font-size:14px;padding-left:20px">{$churnListHtml}</ul>
    <p style="background:#fff5f5;border-left:4px solid #cc0000;padding:12px;font-size:14px"><strong>Action:</strong> Score top 3 clients against these signals. 3+ flags = save call this week.</p>
    <h2 style="font-family:system-ui,sans-serif;color:#8a7020;font-size:16px;border-bottom:2px solid #c9a227;padding-bottom:6px;margin-top:28px">2 · Funnel Leak</h2>
    <p style="background:#f8f9fb;padding:12px;font-size:14px"><strong>Primary leak:</strong> {$funnel}</p>
    <h2 style="font-family:system-ui,sans-serif;color:#8a7020;font-size:16px;border-bottom:2px solid #c9a227;padding-bottom:6px;margin-top:28px">3 · Backend Attach</h2>
    <p style="background:#fffef5;border:2px dashed #c9a227;padding:12px;font-size:14px">{$attach}</p>
    <h2 style="font-family:system-ui,sans-serif;color:#cc0000;font-size:16px;border-bottom:2px solid #cc0000;padding-bottom:6px;margin-top:28px">★ Discovered Opportunity</h2>
    <p style="font-size:15px;font-weight:700;background:#ffcc00;display:inline;padding:2px 6px">{$opp}</p>
    <h2 style="font-family:system-ui,sans-serif;color:#8a7020;font-size:16px;border-bottom:2px solid #c9a227;padding-bottom:6px;margin-top:28px">4 · 48-Hour Checklist</h2>
    <ol style="font-size:14px"><li>Score 3 clients against churn signals</li><li>Name worst funnel node + metric</li><li>Write backend attach in one sentence</li><li>Execute discovered opportunity — block 2 hours</li></ol>
    <div style="background:#0f1a2e;color:#fff;padding:20px;margin-top:28px;text-align:center;font-family:system-ui,sans-serif">
      <p style="margin:0;font-size:13px"><a href="https://freemanintelligence.com/waitlist/" style="color:#c9a227">FI-001 Waitlist</a> · <a href="https://freemanintelligence.com/cohort/" style="color:#c9a227">Dual-Intel Systems Lab</a></p>
    </div>
  </div>
  <p style="font-size:11px;color:#888;text-align:center">Samuel Freeman · Freeman Intelligence · Reply for a free teardown.</p>
</body>
</html>
HTML;
}

function fi_generate_revenue_intel_briefing(string $name, string $icp, string $niche): array
{
    $profile = fi_detect_niche_profile($niche);
    $first = fi_escape($name !== '' ? explode(' ', trim($name))[0] : 'Operator');
    $icpClean = fi_escape(trim($icp) !== '' ? trim($icp) : 'your ideal client');
    $nicheClean = fi_escape(trim($niche) !== '' ? trim($niche) : 'your market');
    $date = fi_escape(gmdate('F j, Y'));

    $churnList = '';
    foreach ($profile['churn_triggers'] as $i => $t) {
        $churnList .= '<li><strong>Signal ' . ($i + 1) . ':</strong> ' . fi_escape($t) . '</li>';
    }

    $subject = 'Your Revenue Intel Briefing — ' . trim($niche);

    return [
        'subject' => $subject,
        'html' => fi_build_briefing_html($first, $icpClean, $nicheClean, $date, $profile, $churnList),
        'profile_key' => $profile['key'],
    ];
}
