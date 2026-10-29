'use client';

import React from 'react';
import { EvaRecord } from '../types/eva';
import { 
  PhoneCall, 
  User, 
  AlertTriangle, 
  Flame, 
  Trash2, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  HeartPulse
} from 'lucide-react';

interface HeaderProps {
  record: EvaRecord;
  onLoadSample: (key: string) => void;
  onClear: () => void;
  onExportJson: () => void;
  onCopySummary: () => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  record,
  onLoadSample,
  onClear,
  onExportJson,
  onCopySummary,
  activeSection,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopySummary();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'sec-metadata', label: '1. Kopf & Anrufer', shortcut: 'Alt+1' },
    { id: 'sec-patient', label: '2. Patient', shortcut: 'Alt+2' },
    { id: 'sec-noxe', label: '3. Exposition & Noxe', shortcut: 'Alt+3' },
    { id: 'sec-substanzen', label: '4. Substanzen (7)', shortcut: 'Alt+4' },
    { id: 'sec-anamnese', label: '5. Anamnese & VE/VM', shortcut: 'Alt+5' },
    { id: 'sec-vitals', label: '6. Symptome & Vitals', shortcut: 'Alt+6' },
    { id: 'sec-therapien', label: '7. Therapien & Antidote', shortcut: 'Alt+7' },
    { id: 'sec-pss', label: '8. PSS & Prozedere', shortcut: 'Alt+8' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -130; // offset for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Determine PSS color
  const getPssBadgeColor = (val: string) => {
    switch (val) {
      case '0':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case '1':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case '2':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case '3':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse';
      case '4':
        return 'bg-purple-900 text-white border-purple-950 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const primarySubstance = record.substanzen.find((s) => s.noxeName.trim() !== '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all no-print">
      {/* Upper Bar: Branding, Live Core Case Badge & Action Buttons */}
      <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Core File Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-600 to-sky-600 text-white font-extrabold shadow-sm ring-2 ring-blue-100">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                GIZ BONN <span className="text-blue-600">EVA 5.26</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Giftnotruf
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                AZ: {record.az || 'BN-2026-NEU'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>{record.datum || 'Heute'} &bull; {record.uhrzeit || '--:--'} Uhr</span>
              <span>&bull;</span>
              <span className="text-slate-600 font-medium">Berater: {record.berater}</span>
            </p>
          </div>
        </div>

        {/* Center: Live Sticky Clinical Summary Badges */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 pr-2 border-r border-slate-200">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{record.patientName || 'Patient unbekannt'}</span>
            <span className="text-slate-400">
              ({record.alterWert ? `${record.alterWert} ${record.alterEinheit}` : 'Alter n.a.'}
              {record.geschlecht ? `, ${record.geschlecht}` : ''}
              {record.gewichtKg ? `, ${record.gewichtKg}kg` : ''})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 px-2 border-r border-slate-200 max-w-[280px] truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate text-slate-900 font-medium">
              {primarySubstance?.noxeName || 'Keine Substanz erfasst'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-[11px] text-slate-500">PSS Ist:</span>
            <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getPssBadgeColor(record.pssVor)}`}>
              {record.pssVor === 'U' ? 'Unbekannt' : `Grad ${record.pssVor}`}
            </span>
            <span className="text-[11px] text-slate-500 ml-1">Potentiell:</span>
            <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getPssBadgeColor(record.pssPot)}`}>
              {record.pssPot === 'U' ? 'Unbekannt' : `Grad ${record.pssPot}`}
            </span>
          </div>
        </div>

        {/* Right: Quick Actions & Sample Loaders */}
        <div className="flex items-center gap-1.5">
          {/* Sample Cases Button Group */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="px-2 text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Szenario:
            </span>
            <button
              type="button"
              onClick={() => onLoadSample('fall1')}
              className="text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 shadow-xs border border-slate-200/60 transition-colors"
              title="1-Klick Beispieldaten: Kleinkind Spülmaschinentab"
            >
              1: Spültab (Kind)
            </button>
            <button
              type="button"
              onClick={() => onLoadSample('fall2')}
              className="text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 shadow-xs border border-slate-200/60 transition-colors"
              title="1-Klick Beispieldaten: Suizidales Paracetamol"
            >
              2: Paracetamol
            </button>
            <button
              type="button"
              onClick={() => onLoadSample('fall3')}
              className="text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 shadow-xs border border-slate-200/60 transition-colors"
              title="1-Klick Beispieldaten: Knollenblätterpilz Intensiv"
            >
              3: Knollenblätterpilz
            </button>
          </div>

          {/* Action Toolbar */}
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
            title="Formular leeren (Alt+R)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leeren</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            title="Klinische Kurzzusammenfassung in Zwischenablage kopieren"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            title="Datensatz als JSON exportieren"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">JSON</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
            title="Drucken / PDF-Export (Strg+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Drucken</span>
          </button>
        </div>
      </div>

      {/* Lower Bar: Continuous Smooth-Scroll Quick-Jump Anchor Pills (NO TABS!) */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 lg:px-6 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-[1700px] mx-auto flex items-center gap-1.5 text-xs whitespace-nowrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Sprungmarken:
          </span>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 border border-slate-200/80'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isActive ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
