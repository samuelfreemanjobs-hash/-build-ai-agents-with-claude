"use client";

import { Factory, RotateCcw } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  showNav?: boolean;
}

export default function Header({ onReset, showNav }: HeaderProps) {
  return (
    <header className="border-b border-navy-800/60 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
            <Factory className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Logistics Marketing Factory
            </h1>
            <p className="text-xs text-navy-400 leading-tight">
              Marketing System Generator
            </p>
          </div>
        </div>

        {showNav && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-navy-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            New System
          </button>
        )}
      </div>
    </header>
  );
}
