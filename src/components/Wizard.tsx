"use client";

import { useState } from "react";
import type { BusinessProfile, LogisticsBusinessType, MarketingChannel } from "@/lib/factory/types";
import {
  BUSINESS_TYPE_TEMPLATES,
  TARGET_MARKET_LABELS,
  CHANNEL_LABELS,
} from "@/lib/factory/templates/business-types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import clsx from "clsx";

interface WizardProps {
  onComplete: (profile: BusinessProfile) => void;
  onBack: () => void;
}

const STEPS = ["Business Type", "Company Details", "Services & Market", "Channels & Goals"];

export default function Wizard({ onComplete, onBack }: WizardProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({
    services: [],
    differentiators: [],
    serviceAreas: [],
    channels: [],
    monthlyBudget: 5000,
    primaryGoal: "lead-generation",
    companySize: "smb",
    geographicScope: "regional",
    targetMarket: "general",
  });

  const update = (fields: Partial<BusinessProfile>) =>
    setProfile((p) => ({ ...p, ...fields }));

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!profile.businessType;
      case 1:
        return !!profile.companyName && profile.companyName.length >= 2;
      case 2:
        return (profile.services?.length ?? 0) > 0;
      case 3:
        return (profile.channels?.length ?? 0) > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(profile as BusinessProfile);
    }
  };

  const selectBusinessType = (type: LogisticsBusinessType) => {
    const template = BUSINESS_TYPE_TEMPLATES[type];
    update({
      businessType: type,
      services: [...template.defaultServices.slice(0, 3)],
      differentiators: [...template.competitiveAdvantages.slice(0, 2)],
    });
  };

  const toggleChannel = (ch: MarketingChannel) => {
    const current = profile.channels || [];
    update({
      channels: current.includes(ch)
        ? current.filter((c) => c !== ch)
        : [...current, ch],
    });
  };

  const toggleService = (service: string) => {
    const current = profile.services || [];
    update({
      services: current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service],
    });
  };

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  i < step
                    ? "bg-factory-green text-white"
                    : i === step
                    ? "bg-accent-500 text-white"
                    : "bg-navy-800 text-navy-400"
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={clsx(
                  "text-sm hidden sm:inline",
                  i === step ? "text-white font-medium" : "text-navy-400"
                )}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-navy-700 mx-1 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 md:p-8 animate-slide-up">
        {/* Step 0: Business Type */}
        {step === 0 && (
          <div>
            <h2 className="section-title">Select Your Logistics Business Type</h2>
            <p className="section-subtitle">
              Choose the category that best describes your operations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(BUSINESS_TYPE_TEMPLATES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectBusinessType(t.id)}
                  className={clsx(
                    "text-left p-4 rounded-lg border transition-all",
                    profile.businessType === t.id
                      ? "border-accent-500 bg-accent-500/10"
                      : "border-navy-700 hover:border-navy-500 bg-navy-900/40"
                  )}
                >
                  <span className="text-2xl mb-2 block">{t.icon}</span>
                  <h3 className="font-semibold text-white text-sm">{t.name}</h3>
                  <p className="text-xs text-navy-400 mt-1">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Company Details */}
        {step === 1 && (
          <div>
            <h2 className="section-title">Company Details</h2>
            <p className="section-subtitle">Tell us about your business</p>
            <div className="space-y-5">
              <div>
                <label className="label">Company Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Apex Freight Solutions"
                  value={profile.companyName || ""}
                  onChange={(e) => update({ companyName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Size</label>
                  <select
                    className="input-field"
                    value={profile.companySize}
                    onChange={(e) =>
                      update({ companySize: e.target.value as BusinessProfile["companySize"] })
                    }
                  >
                    <option value="startup">Startup (1-10 employees)</option>
                    <option value="smb">SMB (11-50 employees)</option>
                    <option value="mid-market">Mid-Market (51-250)</option>
                    <option value="enterprise">Enterprise (250+)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Geographic Scope</label>
                  <select
                    className="input-field"
                    value={profile.geographicScope}
                    onChange={(e) =>
                      update({
                        geographicScope: e.target.value as BusinessProfile["geographicScope"],
                      })
                    }
                  >
                    <option value="local">Local</option>
                    <option value="regional">Regional</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Service Areas (comma-separated)</label>
                <input
                  className="input-field"
                  placeholder="e.g. Chicago, Dallas, Atlanta"
                  value={profile.serviceAreas?.join(", ") || ""}
                  onChange={(e) =>
                    update({
                      serviceAreas: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services & Market */}
        {step === 2 && (
          <div>
            <h2 className="section-title">Services & Target Market</h2>
            <p className="section-subtitle">
              Select your services and define your differentiators
            </p>
            <div className="space-y-5">
              <div>
                <label className="label">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {(profile.businessType
                    ? BUSINESS_TYPE_TEMPLATES[profile.businessType].defaultServices
                    : []
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleService(s)}
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-sm border transition-all",
                        profile.services?.includes(s)
                          ? "border-accent-500 bg-accent-500/20 text-accent-300"
                          : "border-navy-600 text-navy-300 hover:border-navy-400"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Target Market</label>
                <select
                  className="input-field"
                  value={profile.targetMarket}
                  onChange={(e) =>
                    update({
                      targetMarket: e.target.value as BusinessProfile["targetMarket"],
                    })
                  }
                >
                  {Object.entries(TARGET_MARKET_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Key Differentiators (comma-separated)</label>
                <input
                  className="input-field"
                  placeholder="e.g. Real-time tracking, 99% on-time delivery"
                  value={profile.differentiators?.join(", ") || ""}
                  onChange={(e) =>
                    update({
                      differentiators: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Channels & Goals */}
        {step === 3 && (
          <div>
            <h2 className="section-title">Marketing Channels & Budget</h2>
            <p className="section-subtitle">
              Choose your marketing channels and set your budget
            </p>
            <div className="space-y-5">
              <div>
                <label className="label">Marketing Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => toggleChannel(k as MarketingChannel)}
                      className={clsx(
                        "px-3 py-2.5 rounded-lg text-sm border transition-all text-center",
                        profile.channels?.includes(k as MarketingChannel)
                          ? "border-accent-500 bg-accent-500/20 text-accent-300"
                          : "border-navy-600 text-navy-300 hover:border-navy-400"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Monthly Marketing Budget: ${(profile.monthlyBudget || 5000).toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={1000}
                    max={50000}
                    step={500}
                    className="w-full accent-accent-500"
                    value={profile.monthlyBudget || 5000}
                    onChange={(e) =>
                      update({ monthlyBudget: parseInt(e.target.value) })
                    }
                  />
                  <div className="flex justify-between text-xs text-navy-500 mt-1">
                    <span>$1,000</span>
                    <span>$50,000</span>
                  </div>
                </div>
                <div>
                  <label className="label">Primary Goal</label>
                  <select
                    className="input-field"
                    value={profile.primaryGoal}
                    onChange={(e) =>
                      update({
                        primaryGoal: e.target.value as BusinessProfile["primaryGoal"],
                      })
                    }
                  >
                    <option value="lead-generation">Lead Generation</option>
                    <option value="brand-awareness">Brand Awareness</option>
                    <option value="customer-retention">Customer Retention</option>
                    <option value="market-expansion">Market Expansion</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-navy-700/50">
          <button
            onClick={step === 0 ? onBack : () => setStep(step - 1)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Back to Home" : "Previous"}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={clsx(
              "btn-primary inline-flex items-center gap-2",
              !canProceed() && "opacity-50 cursor-not-allowed"
            )}
          >
            {step === STEPS.length - 1 ? "Build My System" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
