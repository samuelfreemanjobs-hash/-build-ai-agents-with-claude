import type { BusinessProfile, SalesEnablement } from "../types";
import { BUSINESS_TYPE_TEMPLATES } from "../templates/business-types";

export function generateSalesEnablement(profile: BusinessProfile): SalesEnablement {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];

  return {
    pitchDeckOutline: [
      `Slide 1: Title — ${profile.companyName}: Your ${template.name} Partner`,
      `Slide 2: The Challenge — ${template.painPoints.slice(0, 3).join(", ")}`,
      `Slide 3: Market Context — ${profile.targetMarket.replace(/-/g, " ")} logistics landscape`,
      `Slide 4: Our Solution — ${profile.services.slice(0, 4).join(", ")}`,
      `Slide 5: How We're Different — ${profile.differentiators.join(", ") || template.competitiveAdvantages.join(", ")}`,
      "Slide 6: Technology & Visibility — Real-time tracking, reporting, integrations",
      "Slide 7: Case Study — [Client] achieved [X]% improvement in [metric]",
      "Slide 8: Our Team — Key leadership and certifications",
      "Slide 9: Implementation Timeline — 30-60-90 day onboarding plan",
      "Slide 10: Investment & ROI — Pricing model and projected savings",
      "Slide 11: Next Steps — Pilot program, assessment, or contract",
    ],
    proposalTemplate: [
      {
        section: "Executive Summary",
        content: `Overview of ${profile.companyName}'s proposed ${template.name.toLowerCase()} solution for [Client Name], including scope, timeline, and expected outcomes.`,
      },
      {
        section: "Understanding Your Needs",
        content: `Summary of discovery findings: current challenges (${template.painPoints[0]}), volume requirements, service areas, and growth projections.`,
      },
      {
        section: "Proposed Solution",
        content: `Detailed scope of ${profile.services.join(", ")} services, including service levels, coverage areas, and technology platform access.`,
      },
      {
        section: "Implementation Plan",
        content: "30-day onboarding timeline: Week 1 (account setup), Week 2 (system integration), Week 3 (pilot shipments), Week 4 (full operations + review).",
      },
      {
        section: "Pricing & Terms",
        content: "Transparent pricing model with volume tiers, included services, and optional add-ons. Payment terms and contract length.",
      },
      {
        section: "ROI Projection",
        content: "Estimated cost savings, efficiency gains, and service level improvements based on client's current volumes and our benchmark data.",
      },
      {
        section: "Why " + profile.companyName,
        content: `${profile.differentiators.join(". ")}. References available upon request.`,
      },
    ],
    objectionHandlers: [
      {
        objection: "Your pricing is higher than competitors",
        response: `We understand cost is critical. Our pricing reflects ${profile.differentiators[0] || template.competitiveAdvantages[0]}, which typically saves clients 15-20% in total cost of ownership when you factor in reduced delays, fewer claims, and operational efficiency. Let's do a total cost comparison.`,
      },
      {
        objection: "We're happy with our current provider",
        response: `That's great to hear. Many of our best clients came to us after a free assessment revealed 20-30% optimization opportunities they didn't know existed. Would a no-obligation logistics audit be valuable?`,
      },
      {
        objection: "We need to think about it",
        response: `Absolutely — this is an important decision. To help your evaluation, I can provide a customized ROI analysis and connect you with a similar ${profile.targetMarket.replace(/-/g, " ")} client for a reference call. What specific concerns should we address?`,
      },
      {
        objection: "We're too small for your services",
        response: `We work with businesses of all sizes and offer scalable solutions that grow with you. Our ${profile.companySize === "startup" ? "starter" : "flexible"} programs are designed specifically for companies at your stage. Let's explore what a right-sized solution looks like.`,
      },
      {
        objection: "We had a bad experience with a previous provider",
        response: `I hear that often, and it's exactly why we built our onboarding around transparency and accountability. We offer a 30-day pilot with clear KPIs so you can evaluate our performance risk-free before committing long-term.`,
      },
    ],
    caseStudyFramework: {
      title: `[Client Name]: How ${profile.companyName} Transformed Their ${template.name}`,
      structure: [
        "Client Background: Industry, size, geography, and previous logistics setup",
        `Challenge: Specific pain points (${template.painPoints[0]}, ${template.painPoints[1]})`,
        `Solution: ${profile.services.slice(0, 3).join(", ")} implementation details`,
        "Results: Quantified outcomes (cost savings %, on-time %, volume handled)",
        "Client Quote: Testimonial from " + template.buyerPersonas[0],
        "Key Takeaway: One-line summary of the transformation",
      ],
    },
  };
}
