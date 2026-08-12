import type {
  BusinessProfile,
  MarketingSystem,
  FactoryProgress,
  FactoryStage,
} from "./types";
import { generateBrandIdentity } from "./generators/brand";
import { generateWebsiteArchitecture } from "./generators/website";
import { generateEmailSequences } from "./generators/email";
import { generateContentCalendar } from "./generators/content";
import { generateSEOPlan } from "./generators/seo";
import { generateLeadFunnels, generateChannelPlaybooks } from "./generators/campaigns";
import { generateKPIFramework, generateImplementationRoadmap } from "./generators/analytics";
import { generateSalesEnablement } from "./generators/sales";

const STAGE_ORDER: FactoryStage[] = [
  "intake",
  "brand",
  "website",
  "content",
  "campaigns",
  "seo",
  "sales",
  "analytics",
  "assembly",
  "complete",
];

export function getFactoryProgress(completedStages: FactoryStage[]): FactoryProgress {
  const completed = completedStages.length;
  const total = STAGE_ORDER.length - 1; // exclude 'intake'
  const percentComplete = Math.round((completed / total) * 100);
  const currentStage = STAGE_ORDER[Math.min(completed, STAGE_ORDER.length - 1)];

  return {
    stage: currentStage,
    completedStages,
    percentComplete,
  };
}

export function assembleMarketingSystem(profile: BusinessProfile): MarketingSystem {
  const brand = generateBrandIdentity(profile);
  const website = generateWebsiteArchitecture(profile, brand);
  const emailSequences = generateEmailSequences(profile);
  const contentCalendar = generateContentCalendar(profile);
  const leadFunnels = generateLeadFunnels(profile);
  const seoPlan = generateSEOPlan(profile);
  const channelPlaybooks = generateChannelPlaybooks(profile);
  const kpiFramework = generateKPIFramework(profile);
  const salesEnablement = generateSalesEnablement(profile);
  const implementationRoadmap = generateImplementationRoadmap(profile);

  return {
    id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    generatedAt: new Date().toISOString(),
    profile,
    brand,
    website,
    emailSequences,
    contentCalendar,
    leadFunnels,
    seoPlan,
    channelPlaybooks,
    kpiFramework,
    salesEnablement,
    implementationRoadmap,
  };
}

export async function runFactoryPipeline(
  profile: BusinessProfile,
  onStageComplete?: (stage: FactoryStage) => void
): Promise<MarketingSystem> {
  const stages: FactoryStage[] = [
    "brand",
    "website",
    "content",
    "campaigns",
    "seo",
    "sales",
    "analytics",
    "assembly",
  ];

  for (const stage of stages) {
    await delay(400);
    onStageComplete?.(stage);
  }

  onStageComplete?.("complete");
  return assembleMarketingSystem(profile);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { STAGE_ORDER };
