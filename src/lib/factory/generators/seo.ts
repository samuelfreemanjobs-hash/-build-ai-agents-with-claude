import type { BusinessProfile, SEOPlan } from "../types";
import { BUSINESS_TYPE_TEMPLATES } from "../templates/business-types";

export function generateSEOPlan(profile: BusinessProfile): SEOPlan {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];
  const locationModifier =
    profile.geographicScope === "local" || profile.geographicScope === "regional"
      ? profile.serviceAreas[0] || "near me"
      : profile.geographicScope;

  return {
    primaryKeywords: [
      {
        keyword: `${template.name.toLowerCase()} services`,
        volume: "2,400/mo",
        difficulty: "Medium",
      },
      {
        keyword: `${template.industryKeywords[0]} ${locationModifier}`,
        volume: "1,800/mo",
        difficulty: profile.geographicScope === "local" ? "Low" : "Medium",
      },
      {
        keyword: `best ${template.name.toLowerCase()} company`,
        volume: "880/mo",
        difficulty: "High",
      },
      {
        keyword: template.industryKeywords[1] || template.industryKeywords[0],
        volume: "3,200/mo",
        difficulty: "Medium",
      },
      {
        keyword: `${profile.services[0]?.toLowerCase() || template.defaultServices[0].toLowerCase()} provider`,
        volume: "720/mo",
        difficulty: "Low",
      },
    ],
    localSEO: [
      `Claim and optimize Google Business Profile for each location (${profile.serviceAreas.join(", ") || "primary market"})`,
      "Build consistent NAP citations across 50+ directories (Yelp, Yellow Pages, industry-specific)",
      "Generate and respond to Google reviews (target: 4.5+ stars, 50+ reviews in 6 months)",
      "Create location-specific landing pages for each service area",
      "Join local business associations and chamber of commerce for backlinks",
      "Implement LocalBusiness schema markup on all location pages",
    ],
    contentPillars: [
      `${template.name} Best Practices & Guides`,
      `${profile.targetMarket.replace(/-/g, " ")} Logistics Solutions`,
      "Industry Trends & Market Analysis",
      "Cost Optimization & ROI Calculators",
      "Compliance & Regulatory Updates",
    ],
    technicalChecklist: [
      "Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)",
      "Mobile-responsive design with touch-friendly CTAs",
      "XML sitemap and robots.txt configuration",
      "SSL certificate and HTTPS enforcement",
      "Structured data: Organization, LocalBusiness, Service schemas",
      "Internal linking strategy connecting service → industry → blog pages",
      "Image optimization with descriptive alt text",
      "Page speed optimization (target: 90+ Lighthouse score)",
    ],
    linkBuildingTactics: [
      "Guest posts on supply chain and logistics industry publications",
      "Partner page links from technology/integration partners",
      "Industry association membership directories",
      "HARO (Help a Reporter Out) responses for logistics topics",
      "Original research/data reports that earn natural backlinks",
      "Sponsor and speak at regional logistics events for event backlinks",
    ],
  };
}
