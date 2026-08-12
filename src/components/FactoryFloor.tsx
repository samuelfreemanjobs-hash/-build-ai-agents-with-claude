"use client";

import type { BusinessProfile, FactoryStage } from "@/lib/factory/types";
import type { BusinessTypeTemplate } from "@/lib/factory/templates/business-types";
import {
  Palette,
  Globe,
  FileText,
  Megaphone,
  Search,
  Handshake,
  BarChart3,
  Package,
  Check,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

interface FactoryFloorProps {
  profile: BusinessProfile;
  currentStage: FactoryStage;
  completedStages: FactoryStage[];
  template: BusinessTypeTemplate;
}

const STAGES: {
  id: FactoryStage;
  label: string;
  icon: typeof Palette;
  description: string;
}[] = [
  { id: "brand", label: "Brand Identity", icon: Palette, description: "Generating taglines, positioning, and messaging" },
  { id: "website", label: "Website Architecture", icon: Globe, description: "Building page copy and SEO structure" },
  { id: "content", label: "Content Calendar", icon: FileText, description: "Creating blog topics and social posts" },
  { id: "campaigns", label: "Campaign Playbooks", icon: Megaphone, description: "Assembling channel strategies and funnels" },
  { id: "seo", label: "SEO Plan", icon: Search, description: "Mapping keywords and technical checklist" },
  { id: "sales", label: "Sales Enablement", icon: Handshake, description: "Building pitch decks and objection handlers" },
  { id: "analytics", label: "KPI Framework", icon: BarChart3, description: "Setting targets and implementation roadmap" },
  { id: "assembly", label: "Final Assembly", icon: Package, description: "Packaging your complete marketing system" },
];

export default function FactoryFloor({
  profile,
  currentStage,
  completedStages,
  template,
}: FactoryFloorProps) {
  const progress = Math.round(
    (completedStages.length / STAGES.length) * 100
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">
          Factory Floor
        </h2>
        <p className="text-navy-400">
          Assembling marketing system for{" "}
          <span className="text-accent-400 font-medium">{profile.companyName}</span>
          {" "}— {template.icon} {template.name}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-navy-400">Assembly Progress</span>
          <span className="text-accent-400 font-semibold">{progress}%</span>
        </div>
        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Assembly Line */}
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const isComplete = completedStages.includes(stage.id);
          const isActive = currentStage === stage.id;
          const isPending = !isComplete && !isActive;

          return (
            <div
              key={stage.id}
              className={clsx(
                "card p-4 flex items-center gap-4 transition-all duration-300",
                isActive && "stage-active border-accent-500/50",
                isComplete && "border-factory-green/30"
              )}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isComplete
                    ? "bg-factory-green/20 text-factory-green"
                    : isActive
                    ? "bg-accent-500/20 text-accent-400"
                    : "bg-navy-800 text-navy-500"
                )}
              >
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <stage.icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={clsx(
                    "font-semibold text-sm",
                    isComplete || isActive ? "text-white" : "text-navy-500"
                  )}
                >
                  {stage.label}
                </h3>
                <p
                  className={clsx(
                    "text-xs",
                    isActive ? "text-accent-400" : "text-navy-500"
                  )}
                >
                  {isActive
                    ? stage.description + "..."
                    : isComplete
                    ? "Complete"
                    : "Waiting"}
                </p>
              </div>

              {isComplete && (
                <span className="badge bg-factory-green/20 text-factory-green">
                  Done
                </span>
              )}
              {isActive && (
                <span className="badge bg-accent-500/20 text-accent-400 animate-pulse">
                  Building
                </span>
              )}
            </div>
          );
        })}
      </div>

      {currentStage === "complete" && (
        <div className="text-center mt-8 animate-slide-up">
          <p className="text-factory-green font-semibold text-lg">
            Marketing system assembled successfully!
          </p>
          <p className="text-navy-400 text-sm mt-1">Loading dashboard...</p>
        </div>
      )}
    </div>
  );
}
