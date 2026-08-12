"use client";

import { useState, useCallback } from "react";
import type { BusinessProfile, MarketingSystem, FactoryStage } from "@/lib/factory/types";
import { runFactoryPipeline } from "@/lib/factory";
import { BUSINESS_TYPE_TEMPLATES } from "@/lib/factory/templates/business-types";
import Header from "@/components/Header";
import Wizard from "@/components/Wizard";
import FactoryFloor from "@/components/FactoryFloor";
import SystemDashboard from "@/components/SystemDashboard";
import Hero from "@/components/Hero";

type AppView = "home" | "wizard" | "factory" | "dashboard";

export default function Home() {
  const [view, setView] = useState<AppView>("home");
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [system, setSystem] = useState<MarketingSystem | null>(null);
  const [factoryStage, setFactoryStage] = useState<FactoryStage>("intake");
  const [completedStages, setCompletedStages] = useState<FactoryStage[]>([]);

  const handleStart = () => setView("wizard");

  const handleProfileComplete = useCallback(async (p: BusinessProfile) => {
    setProfile(p);
    setView("factory");
    setCompletedStages([]);
    setFactoryStage("brand");

    const result = await runFactoryPipeline(p, (stage) => {
      setFactoryStage(stage);
      if (stage !== "complete") {
        setCompletedStages((prev) => [...prev, stage]);
      }
    });

    setSystem(result);
    setTimeout(() => setView("dashboard"), 800);
  }, []);

  const handleReset = () => {
    setView("home");
    setProfile(null);
    setSystem(null);
    setFactoryStage("intake");
    setCompletedStages([]);
  };

  return (
    <main className="min-h-screen">
      <Header onReset={handleReset} showNav={view === "dashboard"} />

      {view === "home" && <Hero onStart={handleStart} />}

      {view === "wizard" && (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
          <Wizard onComplete={handleProfileComplete} onBack={() => setView("home")} />
        </div>
      )}

      {view === "factory" && profile && (
        <FactoryFloor
          profile={profile}
          currentStage={factoryStage}
          completedStages={completedStages}
          template={BUSINESS_TYPE_TEMPLATES[profile.businessType]}
        />
      )}

      {view === "dashboard" && system && (
        <SystemDashboard system={system} onReset={handleReset} />
      )}
    </main>
  );
}
