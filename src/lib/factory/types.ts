export type LogisticsBusinessType =
  | "freight-forwarding"
  | "last-mile-delivery"
  | "warehousing-3pl"
  | "fleet-management"
  | "cold-chain"
  | "customs-brokerage"
  | "intermodal"
  | "courier-express";

export type CompanySize = "startup" | "smb" | "mid-market" | "enterprise";

export type TargetMarket =
  | "b2b-manufacturing"
  | "b2b-retail"
  | "ecommerce"
  | "healthcare"
  | "food-beverage"
  | "automotive"
  | "construction"
  | "general";

export type GeographicScope = "local" | "regional" | "national" | "international";

export type MarketingChannel =
  | "linkedin"
  | "google-ads"
  | "seo"
  | "email"
  | "trade-shows"
  | "referrals"
  | "content-marketing"
  | "direct-sales";

export interface BusinessProfile {
  companyName: string;
  businessType: LogisticsBusinessType;
  companySize: CompanySize;
  targetMarket: TargetMarket;
  geographicScope: GeographicScope;
  services: string[];
  differentiators: string[];
  serviceAreas: string[];
  channels: MarketingChannel[];
  monthlyBudget: number;
  primaryGoal: "lead-generation" | "brand-awareness" | "customer-retention" | "market-expansion";
}

export interface BrandIdentity {
  tagline: string;
  valueProposition: string;
  missionStatement: string;
  toneOfVoice: string[];
  keyMessages: string[];
  elevatorPitch: string;
  brandColors: { primary: string; secondary: string; accent: string };
  positioningStatement: string;
}

export interface WebsiteSection {
  name: string;
  headline: string;
  subheadline: string;
  bodyCopy: string;
  cta: string;
}

export interface WebsiteArchitecture {
  pages: WebsiteSection[];
  navigationStructure: string[];
  seoMeta: { title: string; description: string; keywords: string[] };
}

export interface EmailSequence {
  name: string;
  purpose: string;
  emails: {
    day: number;
    subject: string;
    preview: string;
    bodyOutline: string;
    cta: string;
  }[];
}

export interface SocialPost {
  platform: string;
  type: string;
  content: string;
  hashtags: string[];
  bestTime: string;
}

export interface ContentCalendarEntry {
  week: number;
  theme: string;
  blogTopic: string;
  socialPosts: SocialPost[];
  emailTopic?: string;
}

export interface LeadFunnel {
  name: string;
  stages: {
    stage: string;
    touchpoints: string[];
    conversionGoal: string;
    metrics: string[];
  }[];
  leadMagnets: { title: string; description: string; format: string }[];
}

export interface SEOPlan {
  primaryKeywords: { keyword: string; volume: string; difficulty: string }[];
  localSEO: string[];
  contentPillars: string[];
  technicalChecklist: string[];
  linkBuildingTactics: string[];
}

export interface ChannelPlaybook {
  channel: MarketingChannel;
  objective: string;
  tactics: string[];
  budget: string;
  kpis: string[];
  cadence: string;
  sampleCopy: string[];
}

export interface KPIFramework {
  category: string;
  metrics: {
    name: string;
    target: string;
    frequency: string;
    tool: string;
  }[];
}

export interface SalesEnablement {
  pitchDeckOutline: string[];
  proposalTemplate: { section: string; content: string }[];
  objectionHandlers: { objection: string; response: string }[];
  caseStudyFramework: { title: string; structure: string[] };
}

export interface MarketingSystem {
  id: string;
  generatedAt: string;
  profile: BusinessProfile;
  brand: BrandIdentity;
  website: WebsiteArchitecture;
  emailSequences: EmailSequence[];
  contentCalendar: ContentCalendarEntry[];
  leadFunnels: LeadFunnel[];
  seoPlan: SEOPlan;
  channelPlaybooks: ChannelPlaybook[];
  kpiFramework: KPIFramework[];
  salesEnablement: SalesEnablement;
  implementationRoadmap: {
    phase: string;
    duration: string;
    tasks: string[];
    deliverables: string[];
  }[];
}

export type FactoryStage =
  | "intake"
  | "brand"
  | "website"
  | "content"
  | "campaigns"
  | "seo"
  | "sales"
  | "analytics"
  | "assembly"
  | "complete";

export interface FactoryProgress {
  stage: FactoryStage;
  completedStages: FactoryStage[];
  percentComplete: number;
}
