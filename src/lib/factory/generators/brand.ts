import type { BrandIdentity, BusinessProfile } from "../types";
import { BUSINESS_TYPE_TEMPLATES } from "../templates/business-types";

export function generateBrandIdentity(profile: BusinessProfile): BrandIdentity {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];
  const scopeLabel = {
    local: "local",
    regional: "regional",
    national: "nationwide",
    international: "global",
  }[profile.geographicScope];

  const diffText =
    profile.differentiators.length > 0
      ? profile.differentiators.slice(0, 2).join(" and ")
      : template.competitiveAdvantages.slice(0, 2).join(" and ");

  const tagline = buildTagline(profile, template.name);
  const valueProposition = `${profile.companyName} delivers ${scopeLabel} ${template.name.toLowerCase()} solutions that eliminate ${template.painPoints[0].toLowerCase()} — powered by ${diffText}.`;

  return {
    tagline,
    valueProposition,
    missionStatement: `At ${profile.companyName}, we exist to transform how businesses move goods — making ${template.name.toLowerCase()} faster, more transparent, and more reliable for every client we serve.`,
    toneOfVoice: [
      "Professional yet approachable",
      "Data-driven and results-focused",
      "Confident without being arrogant",
      "Industry-expert with plain-language clarity",
    ],
    keyMessages: [
      `Trusted ${scopeLabel} ${template.name.toLowerCase()} partner`,
      `${diffText} — your competitive edge in logistics`,
      `Serving ${profile.targetMarket.replace(/-/g, " ")} with specialized expertise`,
      "Technology-enabled visibility from pickup to delivery",
      "Scalable solutions that grow with your business",
    ],
    elevatorPitch: `${profile.companyName} is a ${scopeLabel} ${template.name.toLowerCase()} company specializing in ${profile.services.slice(0, 3).join(", ")}. We help ${template.buyerPersonas[0]}s solve ${template.painPoints[0].toLowerCase()} through ${diffText}. With operations across ${profile.serviceAreas.length > 0 ? profile.serviceAreas.join(", ") : "key markets"}, we deliver measurable results — not just shipments.`,
    brandColors: {
      primary: "#102a43",
      secondary: "#334e68",
      accent: "#0ea5e9",
    },
    positioningStatement: `For ${template.buyerPersonas.join(" and ")}s who need reliable ${template.name.toLowerCase()}, ${profile.companyName} is the ${scopeLabel} logistics partner that delivers ${diffText} — unlike generic providers who treat every shipment the same.`,
  };
}

function buildTagline(profile: BusinessProfile, typeName: string): string {
  const taglines: Record<string, string[]> = {
    "freight-forwarding": [
      "Moving Your World, One Shipment at a Time",
      "Global Freight. Local Expertise.",
      "Your Cargo, Our Commitment",
    ],
    "last-mile-delivery": [
      "The Last Mile, Done Right",
      "Delivering Experiences, Not Just Packages",
      "Where Speed Meets Reliability",
    ],
    "warehousing-3pl": [
      "Fulfillment That Scales With You",
      "Your Inventory. Our Expertise.",
      "Warehousing Reimagined",
    ],
    "fleet-management": [
      "Drive Efficiency Across Every Mile",
      "Smarter Fleets. Stronger Bottom Lines.",
      "Fleet Operations, Optimized",
    ],
    "cold-chain": [
      "Zero Excursions. Total Confidence.",
      "Protecting What Matters Most",
      "Cold Chain Integrity, Guaranteed",
    ],
    "customs-brokerage": [
      "Clearing Borders. Clearing Doubts.",
      "Trade Compliance Made Simple",
      "Navigate Customs With Confidence",
    ],
    intermodal: [
      "Multiple Modes. One Seamless Solution.",
      "Intermodal Efficiency, Delivered",
      "Smart Routes. Lower Costs.",
    ],
    "courier-express": [
      "When Every Minute Counts",
      "Express Delivery. Exceptional Service.",
      "Speed You Can Trust",
    ],
  };

  const options = taglines[profile.businessType] || taglines["freight-forwarding"];
  const index = profile.companyName.length % options.length;
  return options[index];
}
