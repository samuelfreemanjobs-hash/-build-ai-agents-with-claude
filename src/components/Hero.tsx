"use client";

import {
  Factory,
  Zap,
  Target,
  BarChart3,
  Mail,
  Globe,
  ArrowRight,
} from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

const features = [
  {
    icon: Target,
    title: "Brand Identity",
    desc: "Taglines, positioning, messaging frameworks",
  },
  {
    icon: Globe,
    title: "Website Architecture",
    desc: "Full site copy, SEO meta, navigation structure",
  },
  {
    icon: Mail,
    title: "Email Sequences",
    desc: "Nurture, onboarding, and win-back campaigns",
  },
  {
    icon: BarChart3,
    title: "KPI Framework",
    desc: "Metrics, targets, and reporting dashboards",
  },
];

export default function Hero({ onStart }: HeroProps) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-8">
            <Factory className="w-4 h-4" />
            Marketing System Factory for Logistics
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Build Your Complete
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">
              Marketing System
            </span>
          </h2>

          <p className="text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Configure your logistics business profile and our factory assembles a
            complete marketing system — brand, website, campaigns, SEO, email
            sequences, and sales enablement.
          </p>

          <button onClick={onStart} className="btn-primary text-lg inline-flex items-center gap-2">
            Start Building
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-navy-500 mt-4">
            8 business types · 8 marketing channels · 16-week roadmap
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-5">
              <f.icon className="w-8 h-8 text-accent-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-navy-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h3 className="text-2xl font-bold text-white text-center mb-10">
          How the Factory Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Configure Your Business",
              desc: "Select your logistics type, services, target market, and marketing channels.",
              icon: Zap,
            },
            {
              step: "02",
              title: "Factory Assembly",
              desc: "Watch as 8 specialized generators build each subsystem of your marketing system.",
              icon: Factory,
            },
            {
              step: "03",
              title: "Export & Execute",
              desc: "Review your complete marketing system and export it as JSON for implementation.",
              icon: Target,
            },
          ].map((s) => (
            <div key={s.step} className="card p-6 relative">
              <span className="text-4xl font-extrabold text-navy-800 absolute top-4 right-4">
                {s.step}
              </span>
              <s.icon className="w-8 h-8 text-accent-400 mb-4" />
              <h4 className="font-semibold text-white mb-2">{s.title}</h4>
              <p className="text-sm text-navy-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
