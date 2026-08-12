import type { BusinessProfile, KPIFramework } from "../types";

export function generateKPIFramework(profile: BusinessProfile): KPIFramework[] {
  const monthlyLeadTarget = profile.companySize === "enterprise" ? 50 : profile.companySize === "mid-market" ? 30 : profile.companySize === "smb" ? 15 : 8;

  return [
    {
      category: "Lead Generation",
      metrics: [
        { name: "Marketing Qualified Leads (MQLs)", target: `${monthlyLeadTarget}/month`, frequency: "Monthly", tool: "CRM (HubSpot/Salesforce)" },
        { name: "Cost Per Lead (CPL)", target: `<$${Math.round(profile.monthlyBudget / monthlyLeadTarget)}`, frequency: "Monthly", tool: "Marketing analytics platform" },
        { name: "Lead-to-Opportunity Rate", target: "25%+", frequency: "Monthly", tool: "CRM pipeline reports" },
        { name: "Website Conversion Rate", target: "3-5%", frequency: "Weekly", tool: "Google Analytics 4" },
      ],
    },
    {
      category: "Brand & Awareness",
      metrics: [
        { name: "Organic Search Traffic", target: "+15% QoQ growth", frequency: "Monthly", tool: "Google Search Console" },
        { name: "LinkedIn Follower Growth", target: "+10%/month", frequency: "Monthly", tool: "LinkedIn Analytics" },
        { name: "Brand Search Volume", target: "+20% YoY", frequency: "Quarterly", tool: "Google Trends / SEMrush" },
        { name: "Share of Voice", target: "Top 3 in category", frequency: "Quarterly", tool: "Brand monitoring tool" },
      ],
    },
    {
      category: "Content Performance",
      metrics: [
        { name: "Blog Traffic", target: "5,000+ monthly visits", frequency: "Monthly", tool: "Google Analytics 4" },
        { name: "Content Downloads", target: "50+/month", frequency: "Monthly", tool: "Marketing automation" },
        { name: "Email Open Rate", target: "25%+", frequency: "Per campaign", tool: "Email platform" },
        { name: "Social Engagement Rate", target: "3%+", frequency: "Weekly", tool: "Social media analytics" },
      ],
    },
    {
      category: "Revenue Impact",
      metrics: [
        { name: "Marketing-Sourced Revenue", target: "30%+ of new revenue", frequency: "Monthly", tool: "CRM attribution" },
        { name: "Customer Acquisition Cost (CAC)", target: "<3x LTV", frequency: "Quarterly", tool: "Finance + CRM" },
        { name: "Sales Cycle Length", target: "<60 days", frequency: "Monthly", tool: "CRM pipeline" },
        { name: "Win Rate", target: "25%+", frequency: "Monthly", tool: "CRM" },
      ],
    },
    {
      category: "Customer Retention",
      metrics: [
        { name: "Net Promoter Score (NPS)", target: "50+", frequency: "Quarterly", tool: "Survey platform" },
        { name: "Client Retention Rate", target: "95%+", frequency: "Annual", tool: "CRM / billing system" },
        { name: "Upsell/Cross-sell Rate", target: "20%+ of clients", frequency: "Quarterly", tool: "CRM" },
        { name: "Referral Rate", target: "15%+ of new clients", frequency: "Quarterly", tool: "CRM attribution" },
      ],
    },
  ];
}

export function generateImplementationRoadmap(profile: BusinessProfile) {
  return [
    {
      phase: "Phase 1: Foundation",
      duration: "Weeks 1-4",
      tasks: [
        "Finalize brand identity and messaging framework",
        "Build/optimize core website pages (Home, Services, About, Contact)",
        "Set up CRM and marketing automation platform",
        "Configure Google Analytics 4 and conversion tracking",
        "Claim and optimize Google Business Profile",
        "Create email templates for nurture sequences",
      ],
      deliverables: [
        "Brand guidelines document",
        "Live website with 6 core pages",
        "CRM with lead capture forms integrated",
        "Analytics dashboard configured",
        "3 email nurture sequences loaded",
      ],
    },
    {
      phase: "Phase 2: Content Engine",
      duration: "Weeks 5-8",
      tasks: [
        "Publish first 4 blog posts targeting primary SEO keywords",
        "Create 2 lead magnets (calculator + guide)",
        "Launch LinkedIn company page content calendar",
        "Set up Google Ads campaigns for top 3 services",
        "Build location-specific landing pages",
        "Implement technical SEO improvements",
      ],
      deliverables: [
        "Content hub with 4+ articles",
        "2 downloadable lead magnets live",
        "Active LinkedIn presence (12+ posts)",
        "Google Ads campaigns running",
        "Location pages for each service area",
      ],
    },
    {
      phase: "Phase 3: Demand Generation",
      duration: "Weeks 9-12",
      tasks: [
        "Launch full lead nurture automation",
        "Activate retargeting campaigns",
        "Begin ABM outreach to top 50 accounts",
        "Launch referral program",
        "Create first case study and video testimonial",
        "Set up monthly reporting dashboard",
      ],
      deliverables: [
        "Automated lead nurture converting at 3%+",
        "Retargeting campaigns active",
        "ABM pipeline with 10+ engaged accounts",
        "Referral program launched",
        "1 published case study + video",
        "Monthly marketing report template",
      ],
    },
    {
      phase: "Phase 4: Scale & Optimize",
      duration: "Weeks 13-16",
      tasks: [
        "Analyze channel performance and reallocate budget",
        "A/B test landing pages and email subject lines",
        "Expand content to video and podcast formats",
        "Plan first trade show or industry event presence",
        "Implement client onboarding marketing touchpoints",
        "Quarterly business review with sales team",
      ],
      deliverables: [
        "Optimized channel mix with documented ROI",
        "A/B test results and winning variants deployed",
        "Multi-format content library",
        "Event marketing plan for next quarter",
        "Client marketing automation active",
        "Q1 marketing performance report",
      ],
    },
  ];
}
