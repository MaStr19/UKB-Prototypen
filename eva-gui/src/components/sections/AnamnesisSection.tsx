'use client';

import React from 'react';
import { EvaRecord } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { FileText, PlusCircle, Paperclip } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const AnamnesisSection: React.FC<Props> = ({ record, onChange }) => {
  const snippets = [
    'Mund unmittelbar mit Wasser ausgespült.',
    'Einmaliges schwallartiges Erbrechen.',
    'Kein Erbrechen, keine Dyspnoe.',
    'Patient wach, ansprechbar und orientiert.',
    'Auffindesituation: Leere Blisterpackungen am Bett.',
    'Keine Vorerkrankungen bekannt.',
    'Keine Dauermedikation.',
  ];

  const appendSnippet = (snip: string) => {
    const prev = record.anamneseText.trim();
    const updated = prev ? `${prev} ${snip}` : snip;
    onChange('anamneseText', updated);
  };

  const isComplete = record.anamneseText.trim().length > 5;

  return (
    <div id="sec-anamnese" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={5}
        title="Anamnese, Vorerkrankungen & Vormedikation"
        subtitle="Detaillierte Schilderung des Notfallhergangs, Auffindesituation, Zeugenaussagen und chronische Medikation"
        badge="Sektion 7"
        isComplete={isComplete}
      />

      {/* Row 1: Quick Snippets */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1 mr-1">
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          Textbausteine:
        </span>
        {snippets.map((snip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => appendSnippet(snip)}
            className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
          >
            + {snip}
          </button>
        ))}
      </div>

      {/* Row 2: Anamnese Großtextfeld */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <label className="font-semibold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Anamnese (aktuelles Ereignis, Vorgeschichte, Auffindesituation)
          </label>
          <button
            type="button"
            onClick={() => onChange('anamneseBeiblatt', !record.anamneseBeiblatt)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
              record.anamneseBeiblatt
                ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            📎 {record.anamneseBeiblatt ? 'Beiblatt markiert' : 'Beiblatt anhängen'}
          </button>
        </div>
        <textarea
          rows={4}
          value={record.anamneseText}
          onChange={(e) => onChange('anamneseText', e.target.value)}
          placeholder="Detaillierte Schilderung des Notfalls: Wann genau, welcher Auslöser, wer fand den Patienten auf, welche Erstmaßnahmen wurden durch Laien/Rettungsdienst bereits unternommen..."
          className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
        />
      </div>

      {/* Row 3: VE (Vorerkrankungen) und VM (Vormedikation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* VE */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold text-slate-700">
              VE: Vorerkrankungen / Vorereignisse
            </label>
            <button
              type="button"
              onClick={() => onChange('veBeiblatt', !record.veBeiblatt)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                record.veBeiblatt
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              Rückseite / Beiblatt
            </button>
          </div>
          <textarea
            rows={2}
            value={record.veText}
            onChange={(e) => onChange('veText', e.target.value)}
            placeholder="z.B. Chronische Niereninsuffizienz, Epilepsie, COPD, Herzrhythmusstörungen..."
            className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          />
        </div>

        {/* VM */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold text-slate-700">
              VM: Vormedikation / Dauermedikation
            </label>
            <button
              type="button"
              onClick={() => onChange('vmBeiblatt', !record.vmBeiblatt)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                record.vmBeiblatt
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              Rückseite / Beiblatt
            </button>
          </div>
          <textarea
            rows={2}
            value={record.vmText}
            onChange={(e) => onChange('vmText', e.target.value)}
            placeholder="Dauermedikamente (Interaktionsgefahr! z.B. Antikoagulantien, Psychopharmaka, Antihypertensiva)..."
            className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
