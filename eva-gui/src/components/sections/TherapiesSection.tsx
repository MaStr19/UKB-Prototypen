'use client';

import React from 'react';
import { EvaRecord, TherapyItem, EmergencyMedItem } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { Stethoscope, Pill, Shield, CheckSquare, Layers } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const TherapiesSection: React.FC<Props> = ({ record, onChange }) => {
  const toggleTherapyColumn = (id: string, col: 'v' | 'e' | 'g') => {
    const updated = { ...record.therapien };
    const current = updated[id];
    if (current) {
      updated[id] = { ...current, [col]: !current[col] };
      onChange('therapien', updated);
    }
  };

  const toggleSubOption = (id: string, subKey: string) => {
    const updated = { ...record.therapien };
    const current = updated[id];
    if (current && current.subOptions) {
      updated[id] = {
        ...current,
        subOptions: {
          ...current.subOptions,
          [subKey]: !current.subOptions[subKey],
        },
      };
      onChange('therapien', updated);
    }
  };

  const toggleMedColumn = (id: string, col: 'e' | 'g') => {
    const updated = { ...record.notfallMeds };
    const current = updated[id];
    if (current) {
      updated[id] = { ...current, [col]: !current[col] };
      onChange('notfallMeds', updated);
    }
  };

  const isComplete = Object.values(record.therapien).some((t) => t.v || t.e || t.g);

  return (
    <div id="sec-therapien" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={7}
        title="Therapien, Maßnahmen & Antidote"
        subtitle="3-Spalten-Interventionsmatrix (v: Vorher erfolgt | e: Empfohlen durch GIZ | g: Vor Ort gegeben) und Notfallmedikamente"
        badge="Sektion 9"
        isComplete={isComplete}
      />

      {/* Kontext-Zusatz: Caregiver, KH-Typ, Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Caregiver (Betreuungsperson)
          </label>
          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {(['Familie', 'Betreuungseinrichtung'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange('caregiver', record.caregiver === c ? '' : c)}
                className={`py-1.5 px-2 rounded-md font-semibold text-center transition-colors ${
                  record.caregiver === c ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Krankenhaus / Klinik Typ</label>
          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {(['somatisch', 'Psychiatrie'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChange('khKlinik', record.khKlinik === k ? '' : k)}
                className={`py-1.5 px-2 rounded-md font-semibold text-center transition-colors ${
                  record.khKlinik === k ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Monitoring-Level</label>
          <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {(['Klinik allg.', 'Notaufn.', 'Intensiv', 'IMC'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange('monitoring', record.monitoring === m ? '' : m)}
                className={`py-1 px-1 rounded-md text-[11px] font-semibold text-center transition-colors ${
                  record.monitoring === m ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left = 3-Spalten Hauptmaßnahmen Matrix, Right = Notfallmedikamente & Antidote Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Haupt-Maßnahmen Matrix (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                Maßnahme / Empfehlung
              </span>
              <div className="flex items-center gap-2">
                <span className="w-9 text-center text-slate-600 font-bold" title="Vor Anruf bereits erfolgt">
                  v (vor)
                </span>
                <span className="w-9 text-center text-blue-700 font-extrabold" title="Empfohlen durch GIZ Bonn">
                  e (empf)
                </span>
                <span className="w-9 text-center text-emerald-700 font-bold" title="Gegeben / vor Ort umgesetzt">
                  g (geg)
                </span>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {Object.values(record.therapien).map((item) => {
                const isAnyChecked = item.v || item.e || item.g;
                return (
                  <div
                    key={item.id}
                    className={`px-3 py-2 flex items-center justify-between transition-colors ${
                      isAnyChecked ? 'bg-blue-50/25' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Label & Sub-Options */}
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {item.label}
                      </div>

                      {/* Sub-options pills (e.g. Butter/Simeticon, Endoskopie/Intubation, repetitiv/prolongiert) */}
                      {item.subOptions && item.subOptionLabels && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.subOptions).map(([subKey, isSubActive]) => (
                            <button
                              key={subKey}
                              type="button"
                              onClick={() => toggleSubOption(item.id, subKey)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                isSubActive
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {item.subOptionLabels?.[subKey] || subKey}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Checkbox columns (v / e / g) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Column v */}
                      <button
                        type="button"
                        onClick={() => toggleTherapyColumn(item.id, 'v')}
                        className={`w-9 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                          item.v
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        v
                      </button>

                      {/* Column e (Empfohlen) */}
                      <button
                        type="button"
                        onClick={() => toggleTherapyColumn(item.id, 'e')}
                        className={`w-9 h-7 rounded-md font-extrabold text-xs flex items-center justify-center transition-colors ${
                          item.e
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                            : 'bg-white border border-blue-200 text-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        e
                      </button>

                      {/* Column g (Gegeben) */}
                      <button
                        type="button"
                        onClick={() => toggleTherapyColumn(item.id, 'g')}
                        className={`w-9 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                          item.g
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-emerald-200 text-emerald-500 hover:bg-emerald-50'
                        }`}
                      >
                        g
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* GIZ Kontaktempfehlung */}
            <div className="p-3 bg-slate-100/70 border-t border-slate-200 text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                GIZ empfiehlt Kontaktaufnahme durch:
              </label>
              <input
                type="text"
                value={record.kontaktEmpfehlungGIZ}
                onChange={(e) => onChange('kontaktEmpfehlungGIZ', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="z.B. Rechtsmedizin, externe Toxikologie, Fachabteilung..."
              />
            </div>
          </div>
        </div>

        {/* Right: Spezifische Notfall- und Antidot-Medikamenten-Matrix (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-rose-600" />
                Notfallmedikamente & Antidote
              </span>
              <div className="flex items-center gap-2">
                <span className="w-9 text-center text-blue-700 font-extrabold" title="Empfohlen">
                  e (empf)
                </span>
                <span className="w-9 text-center text-emerald-700 font-bold" title="Gegeben">
                  g (geg)
                </span>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {Object.values(record.notfallMeds).map((med) => {
                const isAnyChecked = med.e || med.g;
                return (
                  <div
                    key={med.id}
                    className={`px-3 py-2 flex items-center justify-between transition-colors ${
                      isAnyChecked ? 'bg-rose-50/30' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {med.label}
                      </div>
                      {med.subtitle && (
                        <div className="text-[10px] text-slate-500">{med.subtitle}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Column e */}
                      <button
                        type="button"
                        onClick={() => toggleMedColumn(med.id, 'e')}
                        className={`w-9 h-7 rounded-md font-extrabold text-xs flex items-center justify-center transition-colors ${
                          med.e
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                            : 'bg-white border border-blue-200 text-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        e
                      </button>

                      {/* Column g */}
                      <button
                        type="button"
                        onClick={() => toggleMedColumn(med.id, 'g')}
                        className={`w-9 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                          med.g
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-emerald-200 text-emerald-500 hover:bg-emerald-50'
                        }`}
                      >
                        g
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
