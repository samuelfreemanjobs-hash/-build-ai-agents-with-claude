import type { BusinessProfile, ContentCalendarEntry } from "../types";
import { BUSINESS_TYPE_TEMPLATES } from "../templates/business-types";

const BLOG_TOPICS: Record<string, string[]> = {
  "freight-forwarding": [
    "2026 Global Shipping Rate Trends: What Importers Need to Know",
    "How to Choose the Right Incoterms for Your Business",
    "5 Customs Clearance Mistakes That Cost Thousands",
    "Air vs. Ocean Freight: A Decision Framework",
  ],
  "last-mile-delivery": [
    "The True Cost of Failed Deliveries (And How to Fix It)",
    "Same-Day Delivery: When It Makes Sense for Your Business",
    "Returns Management: Turning a Cost Center into a Competitive Advantage",
    "How Top E-commerce Brands Nail the Last Mile",
  ],
  "warehousing-3pl": [
    "In-House vs. 3PL: A Total Cost Analysis",
    "Peak Season Fulfillment: Planning Guide for Q4",
    "Inventory Management Best Practices for Multi-Channel Sellers",
    "How to Evaluate 3PL Partners: A 10-Point Checklist",
  ],
  "fleet-management": [
    "Route Optimization ROI: Real Numbers from Real Fleets",
    "Driver Retention Strategies That Actually Work",
    "ELD Compliance: Beyond the Basics",
    "Electric Fleet Transition: Planning Your Roadmap",
  ],
  "cold-chain": [
    "FDA Cold Chain Requirements: 2026 Compliance Guide",
    "Temperature Monitoring Technology: Buyer's Guide",
    "Reducing Spoilage: Cold Chain Best Practices",
    "Pharma Logistics: GDP Compliance Essentials",
  ],
  "customs-brokerage": [
    "Tariff Changes: How to Protect Your Margins",
    "HS Classification Errors: Top 10 Costly Mistakes",
    "Free Trade Agreements: Are You Leaving Money on the Table?",
    "Import Compliance Audit Checklist",
  ],
  intermodal: [
    "Intermodal vs. Truckload: Cost Comparison Analysis",
    "Reducing Carbon Footprint Through Mode Shift",
    "Container Drayage: Optimizing the First and Last Mile",
    "Intermodal Capacity Planning for 2026",
  ],
  "courier-express": [
    "Medical Courier Compliance: HIPAA Essentials",
    "Same-Day vs. Next-Day: Choosing the Right Service Level",
    "Chain of Custody: Why It Matters for Legal Documents",
    "Building a Reliable Courier Partnership",
  ],
};

export function generateContentCalendar(profile: BusinessProfile): ContentCalendarEntry[] {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];
  const topics = BLOG_TOPICS[profile.businessType] || BLOG_TOPICS["freight-forwarding"];

  const themes = [
    "Industry Insights",
    "How-To Guides",
    "Client Success",
    "Thought Leadership",
  ];

  return themes.map((theme, i) => ({
    week: i + 1,
    theme,
    blogTopic: topics[i] || topics[0],
    socialPosts: [
      {
        platform: "LinkedIn",
        type: "Thought Leadership",
        content: `📊 ${topics[i]}\n\nAt ${profile.companyName}, we see this challenge daily with ${template.buyerPersonas[0]}s. Here's what the data tells us...\n\n[Key insight teaser]\n\nRead the full analysis → [link]`,
        hashtags: ["#logistics", "#supplychain", `#${profile.businessType.replace(/-/g, "")}`, "#B2B"],
        bestTime: "Tuesday 8:00 AM",
      },
      {
        platform: "LinkedIn",
        type: "Company Update",
        content: `🚛 Proud to serve the ${profile.targetMarket.replace(/-/g, " ")} sector with ${profile.services[0] || template.defaultServices[0]}.\n\n${profile.differentiators[0] || template.competitiveAdvantages[0]} — that's the ${profile.companyName} difference.\n\n#logistics #${profile.businessType.replace(/-/g, "")}`,
        hashtags: ["#logistics", "#B2B", "#supplychain"],
        bestTime: "Thursday 12:00 PM",
      },
      {
        platform: "Twitter/X",
        type: "Quick Tip",
        content: `💡 Logistics tip: ${template.painPoints[i % template.painPoints.length]}? Start by auditing your ${profile.services[0]?.toLowerCase() || "operations"}. Most companies find 15-20% savings in the first 90 days. — ${profile.companyName}`,
        hashtags: ["#logisticstips", "#supplychain"],
        bestTime: "Wednesday 10:00 AM",
      },
    ],
    emailTopic: i === 0 ? "Monthly Industry Newsletter" : i === 2 ? "Client Spotlight Feature" : undefined,
  }));
}
