"use client";

import { useState } from "react";
import type { MarketingSystem } from "@/lib/factory/types";
import {
  Palette,
  Globe,
  Mail,
  FileText,
  Megaphone,
  Search,
  Handshake,
  BarChart3,
  Map,
  Download,
  Copy,
  Check,
} from "lucide-react";
import clsx from "clsx";

interface SystemDashboardProps {
  system: MarketingSystem;
  onReset: () => void;
}

type Tab =
  | "overview"
  | "brand"
  | "website"
  | "email"
  | "content"
  | "campaigns"
  | "seo"
  | "sales"
  | "analytics"
  | "roadmap";

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "website", label: "Website", icon: Globe },
  { id: "email", label: "Email", icon: Mail },
  { id: "content", label: "Content", icon: FileText },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "seo", label: "SEO", icon: Search },
  { id: "sales", label: "Sales", icon: Handshake },
  { id: "analytics", label: "KPIs", icon: BarChart3 },
  { id: "roadmap", label: "Roadmap", icon: Map },
];

export default function SystemDashboard({ system, onReset }: SystemDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(system, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${system.profile.companyName.replace(/\s+/g, "-").toLowerCase()}-marketing-system.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(system, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {system.profile.companyName}
          </h2>
          <p className="text-navy-400 mt-1">
            Marketing System · Generated{" "}
            {new Date(system.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-secondary inline-flex items-center gap-2 text-sm">
            {copied ? <Check className="w-4 h-4 text-factory-green" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button onClick={handleExport} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export System
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-navy-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "text-accent-400 border-b-2 border-accent-400 bg-accent-500/5"
                : "text-navy-400 hover:text-navy-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === "overview" && <OverviewTab system={system} />}
        {activeTab === "brand" && <BrandTab system={system} />}
        {activeTab === "website" && <WebsiteTab system={system} />}
        {activeTab === "email" && <EmailTab system={system} />}
        {activeTab === "content" && <ContentTab system={system} />}
        {activeTab === "campaigns" && <CampaignsTab system={system} />}
        {activeTab === "seo" && <SEOTab system={system} />}
        {activeTab === "sales" && <SalesTab system={system} />}
        {activeTab === "analytics" && <AnalyticsTab system={system} />}
        {activeTab === "roadmap" && <RoadmapTab system={system} />}
      </div>
    </div>
  );
}

function OverviewTab({ system }: { system: MarketingSystem }) {
  const stats = [
    { label: "Website Pages", value: system.website.pages.length },
    { label: "Email Sequences", value: system.emailSequences.length },
    { label: "Content Weeks", value: system.contentCalendar.length },
    { label: "Lead Funnels", value: system.leadFunnels.length },
    { label: "Channel Playbooks", value: system.channelPlaybooks.length },
    { label: "SEO Keywords", value: system.seoPlan.primaryKeywords.length },
    { label: "KPI Categories", value: system.kpiFramework.length },
    { label: "Roadmap Phases", value: system.implementationRoadmap.length },
  ];

  return (
    <div>
      <div className="card p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          &ldquo;{system.brand.tagline}&rdquo;
        </h3>
        <p className="text-navy-300">{system.brand.valueProposition}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-accent-400">{s.value}</div>
            <div className="text-xs text-navy-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h4 className="font-semibold text-white mb-3">Key Messages</h4>
          <ul className="space-y-2">
            {system.brand.keyMessages.map((m, i) => (
              <li key={i} className="text-sm text-navy-300 flex items-start gap-2">
                <span className="text-accent-400 mt-0.5">→</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h4 className="font-semibold text-white mb-3">Elevator Pitch</h4>
          <p className="text-sm text-navy-300 leading-relaxed">
            {system.brand.elevatorPitch}
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandTab({ system }: { system: MarketingSystem }) {
  const { brand } = system;
  return (
    <div className="space-y-4">
      <Section title="Tagline" content={brand.tagline} />
      <Section title="Value Proposition" content={brand.valueProposition} />
      <Section title="Mission Statement" content={brand.missionStatement} />
      <Section title="Positioning Statement" content={brand.positioningStatement} />
      <div className="card p-5">
        <h4 className="font-semibold text-white mb-3">Tone of Voice</h4>
        <div className="flex flex-wrap gap-2">
          {brand.toneOfVoice.map((t) => (
            <span key={t} className="badge bg-navy-800 text-navy-300">{t}</span>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <h4 className="font-semibold text-white mb-3">Brand Colors</h4>
        <div className="flex gap-4">
          {Object.entries(brand.brandColors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className="w-12 h-12 rounded-lg border border-navy-600 mb-1"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-navy-400 capitalize">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebsiteTab({ system }: { system: MarketingSystem }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h4 className="font-semibold text-white mb-2">SEO Meta</h4>
        <p className="text-sm text-navy-300"><strong className="text-navy-200">Title:</strong> {system.website.seoMeta.title}</p>
        <p className="text-sm text-navy-300 mt-1"><strong className="text-navy-200">Description:</strong> {system.website.seoMeta.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {system.website.seoMeta.keywords.map((k) => (
            <span key={k} className="badge bg-navy-800 text-navy-400">{k}</span>
          ))}
        </div>
      </div>
      {system.website.pages.map((page) => (
        <div key={page.name} className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">{page.name}</h4>
            <span className="badge bg-accent-500/20 text-accent-400">{page.cta}</span>
          </div>
          <p className="text-lg font-medium text-accent-300 mb-1">{page.headline}</p>
          <p className="text-sm text-navy-400 mb-2">{page.subheadline}</p>
          <p className="text-sm text-navy-300 whitespace-pre-line">{page.bodyCopy}</p>
        </div>
      ))}
    </div>
  );
}

function EmailTab({ system }: { system: MarketingSystem }) {
  return (
    <div className="space-y-4">
      {system.emailSequences.map((seq) => (
        <div key={seq.name} className="card p-5">
          <h4 className="font-semibold text-white mb-1">{seq.name}</h4>
          <p className="text-sm text-navy-400 mb-4">{seq.purpose}</p>
          <div className="space-y-3">
            {seq.emails.map((email) => (
              <div key={email.day} className="border-l-2 border-accent-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-navy-800 text-navy-300">Day {email.day}</span>
                  <span className="text-sm font-medium text-white">{email.subject}</span>
                </div>
                <p className="text-xs text-navy-400">{email.preview}</p>
                <p className="text-sm text-navy-300 mt-1">{email.bodyOutline}</p>
                <span className="text-xs text-accent-400 mt-1 inline-block">CTA: {email.cta}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentTab({ system }: { system: MarketingSystem }) {
  return (
    <div className="space-y-4">
      {system.contentCalendar.map((week) => (
        <div key={week.week} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-accent-500/20 text-accent-400">Week {week.week}</span>
            <h4 className="font-semibold text-white">{week.theme}</h4>
          </div>
          <p className="text-sm text-navy-300 mb-3">
            <strong className="text-navy-200">Blog:</strong> {week.blogTopic}
          </p>
          {week.emailTopic && (
            <p className="text-sm text-navy-400 mb-3">
              <strong className="text-navy-300">Email:</strong> {week.emailTopic}
            </p>
          )}
          <div className="space-y-2">
            {week.socialPosts.map((post, i) => (
              <div key={i} className="bg-navy-900/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-navy-800 text-navy-300">{post.platform}</span>
                  <span className="text-xs text-navy-500">{post.type} · {post.bestTime}</span>
                </div>
                <p className="text-sm text-navy-300 whitespace-pre-line">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CampaignsTab({ system }: { system: MarketingSystem }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="section-title">Lead Funnels</h3>
        {system.leadFunnels.map((funnel) => (
          <div key={funnel.name} className="card p-5 mb-4">
            <h4 className="font-semibold text-white mb-3">{funnel.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {funnel.stages.map((stage) => (
                <div key={stage.stage} className="bg-navy-900/60 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-accent-400 mb-1">{stage.stage}</h5>
                  <p className="text-xs text-navy-400 mb-2">Goal: {stage.conversionGoal}</p>
                  <ul className="text-xs text-navy-500 space-y-0.5">
                    {stage.touchpoints.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <h5 className="text-sm font-medium text-navy-300 mb-2">Lead Magnets</h5>
            {funnel.leadMagnets.map((lm) => (
              <div key={lm.title} className="text-sm text-navy-400 mb-1">
                <strong className="text-navy-200">{lm.title}</strong> — {lm.description} ({lm.format})
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <h3 className="section-title">Channel Playbooks</h3>
        {system.channelPlaybooks.map((pb) => (
          <div key={pb.channel} className="card p-5 mb-4">
            <h4 className="font-semibold text-white mb-1 capitalize">
              {pb.channel.replace(/-/g, " ")}
            </h4>
            <p className="text-sm text-navy-400 mb-3">{pb.objective}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium text-navy-300 mb-1">Tactics</h5>
                <ul className="text-sm text-navy-400 space-y-0.5">
                  {pb.tactics.map((t) => <li key={t}>• {t}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm text-navy-400"><strong className="text-navy-300">Budget:</strong> {pb.budget}</p>
                <p className="text-sm text-navy-400 mt-1"><strong className="text-navy-300">Cadence:</strong> {pb.cadence}</p>
                <h5 className="text-xs font-medium text-navy-300 mt-2 mb-1">KPIs</h5>
                <div className="flex flex-wrap gap-1">
                  {pb.kpis.map((k) => (
                    <span key={k} className="badge bg-navy-800 text-navy-400">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SEOTab({ system }: { system: MarketingSystem }) {
  const { seoPlan } = system;
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h4 className="font-semibold text-white mb-3">Primary Keywords</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-navy-400 border-b border-navy-700">
                <th className="text-left py-2">Keyword</th>
                <th className="text-left py-2">Volume</th>
                <th className="text-left py-2">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {seoPlan.primaryKeywords.map((kw) => (
                <tr key={kw.keyword} className="border-b border-navy-800">
                  <td className="py-2 text-navy-200">{kw.keyword}</td>
                  <td className="py-2 text-navy-400">{kw.volume}</td>
                  <td className="py-2">
                    <span className={clsx(
                      "badge",
                      kw.difficulty === "Low" ? "bg-factory-green/20 text-factory-green" :
                      kw.difficulty === "Medium" ? "bg-factory-amber/20 text-factory-amber" :
                      "bg-factory-red/20 text-factory-red"
                    )}>
                      {kw.difficulty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ListSection title="Content Pillars" items={seoPlan.contentPillars} />
      <ListSection title="Local SEO Actions" items={seoPlan.localSEO} />
      <ListSection title="Technical Checklist" items={seoPlan.technicalChecklist} />
      <ListSection title="Link Building Tactics" items={seoPlan.linkBuildingTactics} />
    </div>
  );
}

function SalesTab({ system }: { system: MarketingSystem }) {
  const { salesEnablement } = system;
  return (
    <div className="space-y-4">
      <ListSection title="Pitch Deck Outline" items={salesEnablement.pitchDeckOutline} numbered />
      <div className="card p-5">
        <h4 className="font-semibold text-white mb-3">Proposal Template</h4>
        {salesEnablement.proposalTemplate.map((s) => (
          <div key={s.section} className="mb-3">
            <h5 className="text-sm font-medium text-accent-400">{s.section}</h5>
            <p className="text-sm text-navy-300">{s.content}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h4 className="font-semibold text-white mb-3">Objection Handlers</h4>
        {salesEnablement.objectionHandlers.map((oh) => (
          <div key={oh.objection} className="mb-3 border-l-2 border-navy-600 pl-3">
            <p className="text-sm font-medium text-navy-200">&ldquo;{oh.objection}&rdquo;</p>
            <p className="text-sm text-navy-400 mt-1">{oh.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab({ system }: { system: MarketingSystem }) {
  return (
    <div className="space-y-4">
      {system.kpiFramework.map((cat) => (
        <div key={cat.category} className="card p-5">
          <h4 className="font-semibold text-white mb-3">{cat.category}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-navy-400 border-b border-navy-700">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Frequency</th>
                  <th className="text-left py-2">Tool</th>
                </tr>
              </thead>
              <tbody>
                {cat.metrics.map((m) => (
                  <tr key={m.name} className="border-b border-navy-800">
                    <td className="py-2 text-navy-200">{m.name}</td>
                    <td className="py-2 text-accent-400 font-medium">{m.target}</td>
                    <td className="py-2 text-navy-400">{m.frequency}</td>
                    <td className="py-2 text-navy-500">{m.tool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoadmapTab({ system }: { system: MarketingSystem }) {
  return (
    <div className="space-y-4">
      {system.implementationRoadmap.map((phase, i) => (
        <div key={phase.phase} className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-sm font-bold">
              {i + 1}
            </span>
            <div>
              <h4 className="font-semibold text-white">{phase.phase}</h4>
              <p className="text-xs text-navy-400">{phase.duration}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-medium text-navy-300 mb-2">Tasks</h5>
              <ul className="text-sm text-navy-400 space-y-1">
                {phase.tasks.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-medium text-navy-300 mb-2">Deliverables</h5>
              <ul className="text-sm text-navy-400 space-y-1">
                {phase.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-factory-green mt-1 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="card p-5">
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-navy-300 leading-relaxed">{content}</p>
    </div>
  );
}

function ListSection({
  title,
  items,
  numbered,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <div className="card p-5">
      <h4 className="font-semibold text-white mb-3">{title}</h4>
      <ul className="text-sm text-navy-300 space-y-1.5">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-accent-400 flex-shrink-0">
              {numbered ? `${i + 1}.` : "→"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
