'use client';

import React from 'react';
import { EvaRecord, PssLevel, ProcedureOption } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { ShieldCheck, AlertTriangle, ArrowRightCircle, Check } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const PssProcedureSection: React.FC<Props> = ({ record, onChange }) => {
  const pssLevels: {
    level: PssLevel;
    title: string;
    description: string;
    activeClass: string;
  }[] = [
    {
      level: '0',
      title: 'Grad 0: Keine Symptome',
      description: 'Keine Symptome oder Befunde bezogen auf die Vergiftung (Asymptomatisch)',
      activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-md',
    },
    {
      level: '1',
      title: 'Grad 1: Leicht / Mild',
      description: 'Milde, vorübergehende und spontan abklingende Symptome (Übelkeit, Schleimhautreizung)',
      activeClass: 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md',
    },
    {
      level: '2',
      title: 'Grad 2: Mittelschwer',
      description: 'Ausgeprägte, langanhaltende oder behandlungsbedürftige Symptome (Somnolenz, Tachykardie)',
      activeClass: 'bg-amber-600 text-white ring-2 ring-amber-300 shadow-md',
    },
    {
      level: '3',
      title: 'Grad 3: Schwer / Vitalbedrohung',
      description: 'Schwere oder lebensbedrohliche Symptome (Koma GCS < 8, Atemdepression, Kreislaufschock)',
      activeClass: 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-md',
    },
    {
      level: '4',
      title: 'Grad 4: Letal (Todesfolge)',
      description: 'Tod unmittelbar infolge der Vergiftung / Intoxikationsfolge',
      activeClass: 'bg-purple-950 text-white ring-2 ring-purple-400 shadow-md',
    },
    {
      level: 'U',
      title: 'Grad U: Unbekannt',
      description: 'Schweregrad zum Beratungszeitpunkt nicht beurteilbar oder unklarer Sachverhalt',
      activeClass: 'bg-slate-700 text-white ring-2 ring-slate-400 shadow-md',
    },
  ];

  const procedures: {
    option: ProcedureOption;
    title: string;
    hint: string;
    color: string;
  }[] = [
    {
      option: 'keines',
      title: 'Keines',
      hint: 'Keine spezifische Intervention',
      color: 'hover:border-slate-400',
    },
    {
      option: 'Laie',
      title: 'Laie (häuslich)',
      hint: 'Zu Hause belassen, häusliche Überwachung durch Angehörige',
      color: 'hover:border-emerald-400',
    },
    {
      option: 'ambulant',
      title: 'Ambulant',
      hint: 'Vorstellung beim Hausarzt, Pädiater oder Notfallpraxis',
      color: 'hover:border-blue-400',
    },
    {
      option: 'stationär',
      title: 'Stationär',
      hint: 'Stationäre Aufnahme (Normalstation / Pädiatrie)',
      color: 'hover:border-indigo-400',
    },
    {
      option: 'Intensiv / IMC',
      title: 'Intensiv / IMC',
      hint: 'Intensivstation, Intermediate Care oder Reanimation',
      color: 'hover:border-rose-400',
    },
    {
      option: 'nicht zu entsch.',
      title: 'Nicht zu entscheiden',
      hint: 'Verlauf abwarten, Rückruf vereinbaren',
      color: 'hover:border-amber-400',
    },
    {
      option: 'Beiblatt',
      title: 'Beiblatt',
      hint: 'Ausführliches Dokumentationsbeiblatt',
      color: 'hover:border-slate-400',
    },
  ];

  const isComplete = !!record.prozedere;

  return (
    <div id="sec-pss" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={8}
        title="Schweregrad (PSS) & Empfohlenes Prozedere"
        subtitle="Standardisierter Poisoning Severity Score (EAPCCT / WHO) und abschließende klinische Versorgungsempfehlung"
        badge="Sektion 10"
        isComplete={isComplete}
      />

      {/* Row 1: PSS vor/bei Anruf (Ist-Zustand) */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            10.1 PSS vor / bei Anruf (Ist-Zustand des Patienten)
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            Aktuell gewählt:{' '}
            <strong className="text-blue-700">
              {record.pssVor === 'U' ? 'Unbekannt' : `Grad ${record.pssVor}`}
            </strong>
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pssLevels.map((p) => {
            const isSelected = record.pssVor === p.level;
            return (
              <button
                key={p.level}
                type="button"
                onClick={() => onChange('pssVor', p.level)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? p.activeClass
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">{p.level}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </div>
                <div>
                  <div className="font-bold text-xs leading-tight mb-0.5">{p.title}</div>
                  <div className={`text-[10px] line-clamp-2 leading-tight ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {p.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Max. PSS potentiell (Prognose) */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            10.2 Max. PSS potentiell (Worst-Case Prognose basierend auf Substanz & Dosis)
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            Maximaler Score:{' '}
            <strong className="text-rose-700">
              {record.pssPot === 'U' ? 'Unbekannt' : `Grad ${record.pssPot}`}
            </strong>
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pssLevels.map((p) => {
            const isSelected = record.pssPot === p.level;
            return (
              <button
                key={p.level}
                type="button"
                onClick={() => onChange('pssPot', p.level)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[76px] ${
                  isSelected
                    ? p.activeClass
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Potentiell {p.level}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </div>
                <div className="font-semibold text-[11px] leading-tight">{p.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Wegen Noxe empfohlenes Prozedere */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
          10.3 Wegen Noxe empfohlenes Prozedere
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {procedures.map((proc) => {
            const isSelected = record.prozedere === proc.option;
            return (
              <button
                key={proc.option}
                type="button"
                onClick={() => onChange('prozedere', proc.option)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md font-bold'
                    : `bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100 ${proc.color}`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold">{proc.title}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
                <div className={`text-[11px] leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {proc.hint}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
