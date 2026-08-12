import type { LogisticsBusinessType, TargetMarket } from "../types";

export interface BusinessTypeTemplate {
  id: LogisticsBusinessType;
  name: string;
  description: string;
  icon: string;
  defaultServices: string[];
  painPoints: string[];
  buyerPersonas: string[];
  competitiveAdvantages: string[];
  industryKeywords: string[];
}

export const BUSINESS_TYPE_TEMPLATES: Record<LogisticsBusinessType, BusinessTypeTemplate> = {
  "freight-forwarding": {
    id: "freight-forwarding",
    name: "Freight Forwarding",
    description: "International and domestic freight coordination, customs, and multi-modal shipping",
    icon: "🚢",
    defaultServices: [
      "Ocean freight",
      "Air freight",
      "Customs clearance",
      "Cargo insurance",
      "Documentation management",
    ],
    painPoints: [
      "Unpredictable transit times",
      "Complex customs regulations",
      "Lack of shipment visibility",
      "Hidden fees and surcharges",
    ],
    buyerPersonas: [
      "Import/Export Manager",
      "Supply Chain Director",
      "Procurement Lead",
    ],
    competitiveAdvantages: [
      "Global carrier network",
      "Real-time tracking",
      "Customs expertise",
      "Competitive rates",
    ],
    industryKeywords: [
      "freight forwarder",
      "international shipping",
      "customs broker",
      "ocean freight",
      "air cargo",
    ],
  },
  "last-mile-delivery": {
    id: "last-mile-delivery",
    name: "Last-Mile Delivery",
    description: "Final-mile logistics for e-commerce, retail, and on-demand delivery",
    icon: "📦",
    defaultServices: [
      "Same-day delivery",
      "Next-day delivery",
      "White-glove delivery",
      "Returns management",
      "Proof of delivery",
    ],
    painPoints: [
      "Failed delivery attempts",
      "High last-mile costs",
      "Customer communication gaps",
      "Returns complexity",
    ],
    buyerPersonas: [
      "E-commerce Operations Manager",
      "Retail Logistics Director",
      "Fulfillment Manager",
    ],
    competitiveAdvantages: [
      "98%+ on-time delivery",
      "Real-time customer notifications",
      "Flexible delivery windows",
      "Returns optimization",
    ],
    industryKeywords: [
      "last mile delivery",
      "same day delivery",
      "final mile logistics",
      "ecommerce delivery",
    ],
  },
  "warehousing-3pl": {
    id: "warehousing-3pl",
    name: "Warehousing & 3PL",
    description: "Third-party logistics, fulfillment, and warehouse management services",
    icon: "🏭",
    defaultServices: [
      "Warehousing",
      "Pick & pack",
      "Inventory management",
      "Kitting & assembly",
      "Cross-docking",
    ],
    painPoints: [
      "Inventory inaccuracy",
      "Slow fulfillment times",
      "Scaling challenges",
      "Integration with sales channels",
    ],
    buyerPersonas: [
      "VP of Operations",
      "E-commerce Founder",
      "Supply Chain Manager",
    ],
    competitiveAdvantages: [
      "99.9% inventory accuracy",
      "Same-day fulfillment",
      "Multi-channel integration",
      "Scalable capacity",
    ],
    industryKeywords: [
      "3PL provider",
      "fulfillment center",
      "warehouse management",
      "order fulfillment",
    ],
  },
  "fleet-management": {
    id: "fleet-management",
    name: "Fleet Management",
    description: "Vehicle fleet operations, maintenance, routing, and driver management",
    icon: "🚛",
    defaultServices: [
      "Fleet routing optimization",
      "Vehicle maintenance",
      "Driver management",
      "Fuel management",
      "Compliance & safety",
    ],
    painPoints: [
      "Rising fuel costs",
      "Driver shortages",
      "Regulatory compliance",
      "Vehicle downtime",
    ],
    buyerPersonas: [
      "Fleet Operations Manager",
      "Transportation Director",
      "Safety & Compliance Officer",
    ],
    competitiveAdvantages: [
      "Route optimization AI",
      "Predictive maintenance",
      "Driver retention programs",
      "Compliance automation",
    ],
    industryKeywords: [
      "fleet management",
      "truck routing",
      "fleet optimization",
      "transportation management",
    ],
  },
  "cold-chain": {
    id: "cold-chain",
    name: "Cold Chain Logistics",
    description: "Temperature-controlled transport and storage for perishables and pharmaceuticals",
    icon: "❄️",
    defaultServices: [
      "Refrigerated transport",
      "Cold storage",
      "Temperature monitoring",
      "Pharma logistics",
      "Food safety compliance",
    ],
    painPoints: [
      "Temperature excursions",
      "Regulatory compliance (FDA, HACCP)",
      "Product spoilage risk",
      "Chain of custody documentation",
    ],
    buyerPersonas: [
      "Quality Assurance Director",
      "Pharma Supply Chain Manager",
      "Food Safety Officer",
    ],
    competitiveAdvantages: [
      "24/7 temperature monitoring",
      "Validated cold chain",
      "Regulatory expertise",
      "Zero-excursion track record",
    ],
    industryKeywords: [
      "cold chain logistics",
      "refrigerated transport",
      "pharma logistics",
      "temperature controlled",
    ],
  },
  "customs-brokerage": {
    id: "customs-brokerage",
    name: "Customs Brokerage",
    description: "Import/export compliance, duty optimization, and customs clearance",
    icon: "📋",
    defaultServices: [
      "Customs clearance",
      "Duty drawback",
      "Trade compliance consulting",
      "Classification services",
      "Bonded warehousing",
    ],
    painPoints: [
      "Customs delays",
      "Tariff uncertainty",
      "Classification errors",
      "Penalty risks",
    ],
    buyerPersonas: [
      "Trade Compliance Manager",
      "Import Manager",
      "CFO / Finance Director",
    ],
    competitiveAdvantages: [
      "Licensed customs experts",
      "Duty optimization",
      "Rapid clearance times",
      "Trade agreement expertise",
    ],
    industryKeywords: [
      "customs broker",
      "import clearance",
      "trade compliance",
      "duty optimization",
    ],
  },
  intermodal: {
    id: "intermodal",
    name: "Intermodal Transport",
    description: "Multi-modal freight combining rail, truck, and ocean for cost-efficient shipping",
    icon: "🚂",
    defaultServices: [
      "Rail-truck intermodal",
      "Container drayage",
      "Intermodal terminal services",
      "Load optimization",
      "Intermodal tracking",
    ],
    painPoints: [
      "Mode transition delays",
      "Container availability",
      "Cost vs. speed tradeoffs",
      "Visibility across modes",
    ],
    buyerPersonas: [
      "Logistics Manager",
      "Transportation Planner",
      "Supply Chain Analyst",
    ],
    competitiveAdvantages: [
      "30% cost savings vs. truckload",
      "Reduced carbon footprint",
      "Nationwide terminal network",
      "End-to-end visibility",
    ],
    industryKeywords: [
      "intermodal shipping",
      "rail freight",
      "container drayage",
      "multimodal logistics",
    ],
  },
  "courier-express": {
    id: "courier-express",
    name: "Courier & Express",
    description: "Time-critical document and parcel delivery services",
    icon: "⚡",
    defaultServices: [
      "Same-day courier",
      "Medical courier",
      "Legal document delivery",
      "Scheduled routes",
      "On-demand dispatch",
    ],
    painPoints: [
      "Missed deadlines",
      "Chain of custody concerns",
      "Unreliable couriers",
      "No real-time tracking",
    ],
    buyerPersonas: [
      "Office Manager",
      "Legal Operations Director",
      "Healthcare Administrator",
    ],
    competitiveAdvantages: [
      "Guaranteed delivery windows",
      "GPS-tracked couriers",
      "HIPAA-compliant medical delivery",
      "24/7 dispatch",
    ],
    industryKeywords: [
      "courier service",
      "express delivery",
      "same day courier",
      "medical courier",
    ],
  },
};

export const TARGET_MARKET_LABELS: Record<TargetMarket, string> = {
  "b2b-manufacturing": "B2B Manufacturing",
  "b2b-retail": "B2B Retail & Distribution",
  ecommerce: "E-Commerce & DTC",
  healthcare: "Healthcare & Pharma",
  "food-beverage": "Food & Beverage",
  automotive: "Automotive",
  construction: "Construction & Heavy Industry",
  general: "General / Multi-Industry",
};

export const CHANNEL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  "google-ads": "Google Ads",
  seo: "SEO & Content",
  email: "Email Marketing",
  "trade-shows": "Trade Shows & Events",
  referrals: "Referral Programs",
  "content-marketing": "Content Marketing",
  "direct-sales": "Direct Sales / ABM",
};

export const DEFAULT_SERVICES_BY_TYPE = Object.fromEntries(
  Object.entries(BUSINESS_TYPE_TEMPLATES).map(([key, val]) => [key, val.defaultServices])
);
