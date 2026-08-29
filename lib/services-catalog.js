const SERVICES = [
  {
    id: 'spreadsheet-elimination',
    name: 'Spreadsheet Elimination System',
    tagline: 'Replace 12+ spreadsheets with one live operational system',
    price: 18500,
    priceRange: '$16,500 – $22,000',
    duration: '2 weeks',
    industries: ['CNC Machining', 'Heavy Steel Fabrication', 'Precision Injection Molding'],
    deliverables: [
      'Process audit & spreadsheet inventory',
      'Unified data model design',
      'Live dashboard with real-time inputs',
      'Team training & handoff documentation',
      '30-day post-launch support'
    ],
    roi: 'Eliminates 15+ hrs/week of manual data entry. Pays for itself in 6 weeks.',
    upsell: 'kpi-command-center'
  },
  {
    id: 'kpi-command-center',
    name: 'KPI Command Center & Executive Dashboard Sprint',
    tagline: 'Real-time plant performance visible to leadership in one screen',
    price: 24000,
    priceRange: '$20,000 – $28,000',
    duration: '3 weeks',
    industries: ['CNC Machining', 'Tier II Automotive Stamping', 'Aerospace Components'],
    deliverables: [
      'KPI framework design (OEE, throughput, quality, downtime)',
      'Executive dashboard (mobile-ready)',
      'Automated data pulls from existing systems',
      'Weekly auto-report to leadership',
      'Alert thresholds for critical metrics'
    ],
    roi: 'Leadership saves 5 hrs/week on reporting. Decisions 3x faster.',
    upsell: 'cnc-telemetry'
  },
  {
    id: 'cnc-telemetry',
    name: 'CNC Spindle Telemetry & CMM Queue Bridge',
    tagline: 'Machine data flows directly into quality queue — no manual handoffs',
    price: 35000,
    priceRange: '$30,000 – $42,000',
    duration: '4 weeks',
    industries: ['CNC Machining', 'Aerospace Components'],
    deliverables: [
      'Spindle/load telemetry integration',
      'CMM queue automation bridge',
      'Exception alerting system',
      'Operator-facing status board',
      'Historical trend analysis module'
    ],
    roi: 'Reduces CMM queue wait by 40%. Catches spindle issues before scrap.',
    upsell: 'kpi-command-center'
  },
  {
    id: 'die-tryout',
    name: 'Die Tryout Milestone & Tooling Validation Bridge',
    tagline: 'Track every die tryout milestone from design to production approval',
    price: 28000,
    priceRange: '$24,000 – $34,000',
    duration: '3 weeks',
    industries: ['Tool & Die Validation', 'Tier II Automotive Stamping'],
    deliverables: [
      'Tryout milestone tracking system',
      'Photo/document capture per stage',
      'Approval workflow with sign-offs',
      'Customer-facing progress portal',
      'Historical tryout database'
    ],
    roi: 'Cuts tryout cycle time by 25%. Eliminates lost approval paperwork.',
    upsell: 'spreadsheet-elimination'
  },
  {
    id: 'wire-harness',
    name: 'Wire Harness Continuity & QA Ingestion Engine',
    tagline: 'Test results flow from bench to dashboard — zero manual transcription',
    price: 22000,
    priceRange: '$18,000 – $26,000',
    duration: '3 weeks',
    industries: ['Wire Harness Assembly'],
    deliverables: [
      'Continuity test data ingestion',
      'Pass/fail dashboard with lot tracking',
      'Defect pattern analysis',
      'Customer COA auto-generation',
      'Integration with existing test equipment'
    ],
    roi: 'Eliminates 20 hrs/week of QA data entry. Zero transcription errors.',
    upsell: 'kpi-command-center'
  },
  {
    id: '3pl-dashboard',
    name: '3PL Cross-Dock & VMI Buffer Exception Dashboard',
    tagline: 'See every cross-dock exception and VMI buffer breach in real time',
    price: 32000,
    priceRange: '$28,000 – $38,000',
    duration: '4 weeks',
    industries: ['3PL Warehousing'],
    deliverables: [
      'Cross-dock exception monitoring',
      'VMI buffer level tracking',
      'Carrier delay alerting',
      'Customer SLA compliance dashboard',
      'Weekly performance auto-reports'
    ],
    roi: 'Reduces SLA breaches by 60%. Saves 1 FTE of exception management.',
    upsell: 'spreadsheet-elimination'
  },
  {
    id: 'website-sprint',
    name: 'Conversion Website Sprint + RFQ Spec Ingestion Engine',
    tagline: 'Modern RFQ-ready website that captures specs and routes quotes automatically',
    price: 15000,
    priceRange: '$12,000 – $18,000',
    duration: '2 weeks',
    industries: ['CNC Machining', 'Heavy Steel Fabrication', 'Precision Injection Molding'],
    deliverables: [
      'Conversion-optimized website (5 pages)',
      'RFQ spec ingestion form with file upload',
      'Auto-routing to quoting team',
      'SEO foundation for local manufacturing searches',
      'Analytics & conversion tracking'
    ],
    roi: 'Increases qualified RFQ volume by 3x. First impression wins deals.',
    upsell: 'kpi-command-center'
  }
];

const RETAINER = {
  id: 'ops-retainer',
  name: 'HUNTER Operations Retainer',
  tagline: 'Ongoing optimization, monitoring, and iteration',
  price: 4500,
  priceRange: '$3,500 – $6,000/mo',
  duration: 'Monthly',
  deliverables: [
    'Monthly system health review',
    '2 optimization sprints per month',
    'Priority support (4hr response)',
    'Quarterly ROI reporting',
    'New feature requests (scoped monthly)'
  ]
};

const DIAGNOSTIC = {
  id: 'ops-diagnostic',
  name: 'Operational Intelligence Diagnostic',
  tagline: 'Free 15-min call + custom diagnostic report — your give-before-ask',
  price: 0,
  duration: '48 hours',
  deliverables: [
    '15-minute discovery call',
    'Custom operational friction report',
    '3 prioritized improvement opportunities',
    'ROI estimate per opportunity',
    'Recommended service match'
  ]
};

const INDUSTRIES = [
  'CNC Machining', 'Tier II Automotive Stamping', '3PL Warehousing',
  'Tool & Die Validation', 'Wire Harness Assembly', 'Heavy Steel Fabrication',
  'Precision Injection Molding', 'Aerospace Components'
];

const STRATEGIES = [
  { id: 'A', label: 'Diagnostic', prefix: 'I noticed something...' },
  { id: 'B', label: 'Opportunity', prefix: 'I found an opportunity...' },
  { id: 'C', label: 'Competitive', prefix: 'Your competitors are doing...' },
  { id: 'D', label: 'Build', prefix: 'I mocked up what this could look like...' },
  { id: 'E', label: 'Audit', prefix: 'I ran a quick audit...' },
  { id: 'F', label: 'Intelligence', prefix: 'I found three things you may want to know...' }
];

const SCORING_DIMENSIONS = {
  problemSeverity: { max: 25, label: 'Problem Severity' },
  buyingSignal: { max: 20, label: 'Buying Signal' },
  abilityToPay: { max: 15, label: 'Ability to Pay' },
  serviceFit: { max: 15, label: 'Service Fit' },
  accessibility: { max: 10, label: 'Accessibility' },
  urgency: { max: 10, label: 'Urgency' },
  competitivePressure: { max: 5, label: 'Competitive Pressure' }
};

function getServiceById(id) {
  return SERVICES.find(s => s.id === id) || SERVICES.find(s => s.name === id);
}

function getServiceByName(name) {
  return SERVICES.find(s => s.name === name);
}

function matchService(industry, problems = []) {
  const industryMatch = SERVICES.find(s => s.industries.includes(industry));
  if (industryMatch) return industryMatch;
  if (problems.some(p => /spreadsheet|manual|excel/i.test(p))) return getServiceById('spreadsheet-elimination');
  if (problems.some(p => /dashboard|kpi|report/i.test(p))) return getServiceById('kpi-command-center');
  return SERVICES[0];
}

module.exports = {
  SERVICES, RETAINER, DIAGNOSTIC, INDUSTRIES, STRATEGIES, SCORING_DIMENSIONS,
  getServiceById, getServiceByName, matchService
};
