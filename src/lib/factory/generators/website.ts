import type { BusinessProfile, WebsiteArchitecture } from "../types";
import { BUSINESS_TYPE_TEMPLATES } from "../templates/business-types";
import type { BrandIdentity } from "../types";

export function generateWebsiteArchitecture(
  profile: BusinessProfile,
  brand: BrandIdentity
): WebsiteArchitecture {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];

  const pages: WebsiteArchitecture["pages"] = [
    {
      name: "Home",
      headline: brand.tagline,
      subheadline: brand.valueProposition,
      bodyCopy: `${profile.companyName} is your trusted partner for ${template.name.toLowerCase()}. We combine industry expertise with cutting-edge technology to deliver logistics solutions that drive real business results. Whether you need ${profile.services.slice(0, 2).join(" or ")}, our team is ready to optimize your supply chain.`,
      cta: "Get a Free Quote",
    },
    {
      name: "Services",
      headline: `Comprehensive ${template.name} Services`,
      subheadline: "End-to-end solutions tailored to your supply chain needs",
      bodyCopy: profile.services
        .map(
          (s) =>
            `**${s}** — Professional ${s.toLowerCase()} services designed to reduce costs, improve visibility, and accelerate delivery times for ${profile.targetMarket.replace(/-/g, " ")} clients.`
        )
        .join("\n\n"),
      cta: "Explore Our Services",
    },
    {
      name: "About",
      headline: `Why ${profile.companyName}?`,
      subheadline: brand.positioningStatement,
      bodyCopy: `${brand.missionStatement}\n\nOur team brings decades of combined experience in ${template.name.toLowerCase()}, serving clients across ${profile.geographicScope} markets. We understand the unique challenges facing ${template.buyerPersonas.join(", ")}s — and we've built our operations to solve them.`,
      cta: "Meet Our Team",
    },
    {
      name: "Industries",
      headline: "Industries We Serve",
      subheadline: `Specialized ${template.name.toLowerCase()} for your sector`,
      bodyCopy: `We serve ${profile.targetMarket.replace(/-/g, " ")} with deep vertical expertise. Our solutions address industry-specific challenges including ${template.painPoints.slice(0, 3).join(", ").toLowerCase()}.`,
      cta: "See Industry Solutions",
    },
    {
      name: "Resources",
      headline: "Logistics Insights & Resources",
      subheadline: "Expert guides, case studies, and industry reports",
      bodyCopy:
        "Access our library of logistics resources including shipping guides, compliance checklists, cost calculators, and success stories from clients like you.",
      cta: "Download Free Resources",
    },
    {
      name: "Contact",
      headline: "Let's Move Your Business Forward",
      subheadline: "Get a customized logistics solution in 24 hours",
      bodyCopy:
        "Ready to optimize your supply chain? Fill out our quick form and a logistics specialist will contact you within one business day with a tailored proposal.",
      cta: "Request a Quote",
    },
  ];

  return {
    pages,
    navigationStructure: [
      "Home",
      "Services",
      "Industries",
      "About",
      "Resources",
      "Contact",
    ],
    seoMeta: {
      title: `${profile.companyName} | ${template.name} Services | ${profile.geographicScope === "local" ? profile.serviceAreas[0] || "Local" : profile.geographicScope.charAt(0).toUpperCase() + profile.geographicScope.slice(1)}`,
      description: `${brand.valueProposition} Contact ${profile.companyName} for a free consultation on ${profile.services.slice(0, 3).join(", ")}.`,
      keywords: [
        ...template.industryKeywords,
        profile.companyName.toLowerCase(),
        ...profile.serviceAreas.map((a) => `${a} logistics`),
      ],
    },
  };
}
