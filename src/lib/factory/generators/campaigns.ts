import type { BusinessProfile, LeadFunnel, ChannelPlaybook } from "../types";
import { BUSINESS_TYPE_TEMPLATES, CHANNEL_LABELS } from "../templates/business-types";

export function generateLeadFunnels(profile: BusinessProfile): LeadFunnel[] {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];

  return [
    {
      name: "Inbound Quote Request Funnel",
      stages: [
        {
          stage: "Awareness",
          touchpoints: [
            "SEO-optimized blog content",
            "Google Ads search campaigns",
            "LinkedIn thought leadership posts",
            "Industry directory listings",
          ],
          conversionGoal: "Website visit",
          metrics: ["Organic traffic", "Paid click-through rate", "Bounce rate"],
        },
        {
          stage: "Interest",
          touchpoints: [
            "Service pages with clear value props",
            "Free resource downloads (guides, checklists)",
            "Case study pages",
            "Live chat / chatbot engagement",
          ],
          conversionGoal: "Lead magnet download or quote form start",
          metrics: ["Pages per session", "Time on site", "Form start rate"],
        },
        {
          stage: "Consideration",
          touchpoints: [
            "Email nurture sequence (5 emails over 14 days)",
            "Retargeting ads with case study creative",
            "Sales discovery call",
            "Custom proposal delivery",
          ],
          conversionGoal: "Qualified sales meeting booked",
          metrics: ["Email open/click rates", "Meeting booking rate", "Proposal acceptance rate"],
        },
        {
          stage: "Decision",
          touchpoints: [
            "Personalized proposal presentation",
            "Reference calls with existing clients",
            "Pilot/trial program offer",
            "Contract negotiation",
          ],
          conversionGoal: "Signed contract",
          metrics: ["Close rate", "Sales cycle length", "Average contract value"],
        },
      ],
      leadMagnets: [
        {
          title: `${template.name} Cost Calculator`,
          description: `Interactive tool that estimates ${template.name.toLowerCase()} costs based on shipment volume, distance, and service level`,
          format: "Web calculator + PDF report",
        },
        {
          title: `The ${profile.targetMarket.replace(/-/g, " ")} Logistics Playbook`,
          description: `Comprehensive guide covering ${template.painPoints.slice(0, 3).join(", ").toLowerCase()} with actionable solutions`,
          format: "PDF guide (15-20 pages)",
        },
        {
          title: `${template.name} RFP Template`,
          description: "Ready-to-use RFP template with evaluation criteria for selecting a logistics partner",
          format: "Word/PDF template",
        },
      ],
    },
    {
      name: "ABM / Direct Outreach Funnel",
      stages: [
        {
          stage: "Target Identification",
          touchpoints: [
            "Ideal Customer Profile (ICP) definition",
            "Account list building (LinkedIn Sales Navigator, ZoomInfo)",
            "Intent data monitoring",
          ],
          conversionGoal: "50 target accounts identified",
          metrics: ["Account list quality score", "Decision-maker contacts identified"],
        },
        {
          stage: "Multi-Channel Engagement",
          touchpoints: [
            "Personalized LinkedIn connection requests",
            "Direct mail packages with industry insights",
            "Targeted email sequences (3-touch)",
            "LinkedIn InMail campaigns",
          ],
          conversionGoal: "30% account engagement rate",
          metrics: ["Connection acceptance rate", "Email reply rate", "Meeting requests"],
        },
        {
          stage: "Executive Meeting",
          touchpoints: [
            "Executive briefing presentation",
            "Custom ROI analysis for their business",
            "Site visit / facility tour invitation",
          ],
          conversionGoal: "Executive sponsor identified",
          metrics: ["Meeting-to-opportunity rate", "Pipeline value created"],
        },
      ],
      leadMagnets: [
        {
          title: `Custom Supply Chain Assessment for [Company Name]`,
          description: "Personalized analysis of their current logistics operations with specific improvement recommendations",
          format: "Custom PDF report",
        },
      ],
    },
  ];
}

export function generateChannelPlaybooks(profile: BusinessProfile): ChannelPlaybook[] {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];
  const budgetPerChannel = Math.round(profile.monthlyBudget / Math.max(profile.channels.length, 1));

  return profile.channels.map((channel) => {
    const playbooks: Record<string, Omit<ChannelPlaybook, "channel">> = {
      linkedin: {
        objective: "Establish thought leadership and generate B2B leads from decision-makers",
        tactics: [
          "Post 3-4x per week (mix of insights, company news, employee spotlights)",
          "Run Sponsored Content campaigns targeting " + template.buyerPersonas.join(", "),
          "Engage in relevant LinkedIn Groups (Supply Chain, Logistics Professionals)",
          "Publish long-form articles monthly on industry trends",
          "Employee advocacy program — team shares company content",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.4)}/mo (ads) + time investment`,
        kpis: ["Follower growth rate", "Post engagement rate", "LinkedIn lead gen form submissions", "InMail response rate"],
        cadence: "3-4 posts/week, 1 article/month, ongoing ad campaigns",
        sampleCopy: [
          `📦 ${template.painPoints[0]} costs companies an average of 12% of revenue. At ${profile.companyName}, we've helped ${profile.targetMarket.replace(/-/g, " ")} clients cut that by 30%. Here's how →`,
          `We're hiring! Join ${profile.companyName}'s growing team of logistics professionals. If you're passionate about ${template.name.toLowerCase()}, we want to hear from you.`,
        ],
      },
      "google-ads": {
        objective: "Capture high-intent search traffic for logistics services",
        tactics: [
          `Search campaigns for "${template.industryKeywords[0]}", "${template.industryKeywords[1]}"`,
          "Location-targeted campaigns for each service area",
          "Competitor conquest campaigns (careful bidding)",
          "Call-only ads for mobile searchers",
          "Remarketing to website visitors with case study ads",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.8)}/mo`,
        kpis: ["Cost per lead", "Click-through rate", "Conversion rate", "Quality score", "ROAS"],
        cadence: "Always-on campaigns with weekly optimization",
        sampleCopy: [
          `${template.name} Services | ${profile.companyName} — Get a Free Quote in 24 Hours. ${profile.differentiators[0] || template.competitiveAdvantages[0]}. Call Now.`,
          `Save 20% on ${profile.services[0] || template.defaultServices[0]} — Trusted by 500+ ${profile.targetMarket.replace(/-/g, " ")} Companies. Free Assessment.`,
        ],
      },
      seo: {
        objective: "Build organic visibility for high-intent logistics keywords",
        tactics: [
          "Publish 2 blog posts per month targeting primary keywords",
          "Optimize all service and location pages",
          "Build 5-10 quality backlinks per month",
          "Create pillar content pages for each service line",
          "Implement technical SEO improvements quarterly",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.6)}/mo (content + tools)`,
        kpis: ["Organic traffic growth", "Keyword ranking positions", "Organic leads per month", "Domain authority"],
        cadence: "2 blog posts/month, ongoing optimization",
        sampleCopy: [],
      },
      email: {
        objective: "Nurture leads and retain existing clients through targeted email communication",
        tactics: [
          "Automated lead nurture sequences (5-email series)",
          "Monthly newsletter with industry insights",
          "Client onboarding email series",
          "Quarterly business review email invitations",
          "Re-engagement campaigns for dormant leads",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.3)}/mo (ESP platform)`,
        kpis: ["Open rate (target: 25%+)", "Click rate (target: 3%+)", "Unsubscribe rate (<0.5%)", "Email-attributed revenue"],
        cadence: "Automated sequences + 1 newsletter/month",
        sampleCopy: [
          `Subject: ${template.painPoints[0]}? Here's what top ${profile.targetMarket.replace(/-/g, " ")} companies are doing differently`,
        ],
      },
      "trade-shows": {
        objective: "Generate qualified leads and strengthen industry relationships at key events",
        tactics: [
          "Exhibit at 2-3 major industry trade shows per year",
          "Pre-show email outreach to attendee lists",
          "Live demo or presentation at booth",
          "Post-show follow-up sequence within 48 hours",
          "Speaking opportunities at industry conferences",
        ],
        budget: `$${Math.round(budgetPerChannel * 2)}/mo (amortized across events)`,
        kpis: ["Leads collected per event", "Post-show meeting conversion rate", "Pipeline generated", "Brand impressions"],
        cadence: "2-3 major events/year + quarterly regional events",
        sampleCopy: [
          `Visit ${profile.companyName} at Booth #[X] — See live demo of our ${profile.services[0] || template.defaultServices[0]} platform. Book a meeting →`,
        ],
      },
      referrals: {
        objective: "Leverage satisfied clients and partners to generate warm introductions",
        tactics: [
          "Structured referral program with incentives ($500 credit per qualified referral)",
          "Quarterly NPS surveys with referral ask",
          "Partner co-marketing with complementary service providers",
          "Client advisory board for testimonials and introductions",
          "Automated referral request after positive service interactions",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.5)}/mo (incentives)`,
        kpis: ["Referral rate", "Referred lead conversion rate", "Cost per referred acquisition", "NPS score"],
        cadence: "Ongoing program with quarterly campaigns",
        sampleCopy: [
          `Know a ${template.buyerPersonas[0]} who could benefit from better ${template.name.toLowerCase()}? Refer them to ${profile.companyName} and earn $500 credit.`,
        ],
      },
      "content-marketing": {
        objective: "Build authority and attract organic traffic through valuable logistics content",
        tactics: [
          "Weekly blog posts on industry topics",
          "Monthly downloadable guides and whitepapers",
          "Quarterly original research/data reports",
          "Video content: facility tours, client testimonials, how-to guides",
          "Podcast appearances and guest articles",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.7)}/mo`,
        kpis: ["Content downloads", "Blog traffic", "Time on page", "Content-attributed leads"],
        cadence: "1 blog/week, 1 guide/month, 1 video/month",
        sampleCopy: [],
      },
      "direct-sales": {
        objective: "Proactively target and convert high-value accounts through personalized outreach",
        tactics: [
          "Build target account list of 100 ideal companies",
          "Multi-touch outreach sequences (email + LinkedIn + phone)",
          "Custom ROI proposals for top 20 accounts",
          "Executive dinner events for C-suite prospects",
          "Quarterly account review and expansion conversations",
        ],
        budget: `$${Math.round(budgetPerChannel * 0.4)}/mo (tools + events)`,
        kpis: ["Meetings booked per rep/month", "Pipeline created", "Win rate", "Average deal size"],
        cadence: "Daily outreach, weekly pipeline reviews",
        sampleCopy: [
          `Hi [Name], I noticed [Company] is expanding into [market]. ${profile.companyName} specializes in ${template.name.toLowerCase()} for ${profile.targetMarket.replace(/-/g, " ")} — we've helped similar companies reduce logistics costs by 20%. Worth a 15-min call?`,
        ],
      },
    };

    const playbook = playbooks[channel] || playbooks["content-marketing"];
    return { channel, ...playbook };
  });
}
