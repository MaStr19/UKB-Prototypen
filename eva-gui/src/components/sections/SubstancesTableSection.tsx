'use client';

import React from 'react';
import { EvaRecord, SubstanceRow } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { FlaskConical, Trash2, Info } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const SubstancesTableSection: React.FC<Props> = ({ record, onChange }) => {
  const updateRow = (index: number, updates: Partial<SubstanceRow>) => {
    const updated = [...record.substanzen];
    updated[index] = { ...updated[index], ...updates };
    onChange('substanzen', updated);
  };

  const clearRow = (index: number) => {
    updateRow(index, {
      expoFlag: '',
      noxeName: '',
      noxeFlag: '',
      mengeVal: '',
      mengeFlag: '',
    });
  };

  const isComplete = record.substanzen.some((s) => s.noxeName.trim().length > 0);

  return (
    <div id="sec-substanzen" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={4}
        title="Substanztabelle (7 Agenzien-Matrix)"
        subtitle="Erfassung aller toxischen Agentien mit Expositionssicherheit (G/N/K), Toxizität (G/N/K/T) und Mengeneinstufung (G/N/U/max)"
        badge="Sektion 6"
        isComplete={isComplete}
      />

      {/* Table Legend */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">Klinische Flag-Nomenklatur:</span>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] text-slate-600">
          <div>
            <strong className="text-blue-800">Exposition:</strong> G (Gesichert), N (Nicht gesichert), K (Keine Expo)
          </div>
          <div>
            <strong className="text-rose-800">Noxe:</strong> G (Giftig), N (Nicht giftig), K (Kontaminiert), T (Toxische Dosis)
          </div>
          <div>
            <strong className="text-amber-800">Menge:</strong> G (Gesichert), N (Nicht gesichert), U (Unbekannt), max (Worst-Case)
          </div>
        </div>
      </div>

      {/* 7-Row High-Density Medical Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 w-48 text-center border-r border-slate-200">
                <div className="leading-tight">Exposition</div>
                <div className="text-[10px] font-normal text-slate-500">G &bull; N &bull; K</div>
              </th>
              <th className="py-2.5 px-4 min-w-[280px] border-r border-slate-200">
                <div className="flex items-center justify-between">
                  <span>Noxe / Handelsname / Wirkstoff</span>
                  <span className="text-[10px] font-normal text-slate-500">G &bull; N &bull; K &bull; T</span>
                </div>
              </th>
              <th className="py-2.5 px-4 min-w-[240px] border-r border-slate-200">
                <div className="flex items-center justify-between">
                  <span>Menge / Dosis</span>
                  <span className="text-[10px] font-normal text-slate-500">G &bull; N &bull; U &bull; max</span>
                </div>
              </th>
              <th className="py-2.5 px-3 w-16 text-center">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {record.substanzen.map((row, idx) => {
              const hasData = !!(row.noxeName || row.mengeVal || row.expoFlag);
              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    hasData ? 'bg-blue-50/20' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  } hover:bg-blue-50/40`}
                >
                  {/* Row Number */}
                  <td className="py-2 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Exposition Flags (G / N / K) */}
                  <td className="py-2 px-2 border-r border-slate-200">
                    <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      {[
                        { flag: 'G', label: 'G', title: 'Gesichert' },
                        { flag: 'N', label: 'N', title: 'Nicht gesichert' },
                        { flag: 'K', label: 'K', title: 'Keine Exposition' },
                      ].map((f) => {
                        const isSelected = row.expoFlag === f.flag;
                        return (
                          <button
                            key={f.flag}
                            type="button"
                            title={f.title}
                            onClick={() => updateRow(idx, { expoFlag: isSelected ? '' : (f.flag as any) })}
                            className={`w-8 py-1 rounded text-xs font-bold transition-all ${
                              isSelected
                                ? f.flag === 'G'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : f.flag === 'N'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Noxe Text + Flags (G / N / K / T) */}
                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.noxeName}
                        onChange={(e) => updateRow(idx, { noxeName: e.target.value })}
                        placeholder={idx === 0 ? 'Leitnoxe: z.B. Paracetamol 500mg oder Somat Tab' : 'Weitere Noxe...'}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-900 bg-white"
                      />
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shrink-0">
                        {[
                          { flag: 'G', title: 'Giftig', color: 'bg-emerald-600 text-white' },
                          { flag: 'N', title: 'Nicht giftig', color: 'bg-slate-600 text-white' },
                          { flag: 'K', title: 'Kontaminiert', color: 'bg-amber-600 text-white' },
                          { flag: 'T', title: 'Toxische Dosis erreicht', color: 'bg-rose-600 text-white font-black animate-pulse' },
                        ].map((f) => {
                          const isSelected = row.noxeFlag === f.flag;
                          return (
                            <button
                              key={f.flag}
                              type="button"
                              title={f.title}
                              onClick={() => updateRow(idx, { noxeFlag: isSelected ? '' : (f.flag as any) })}
                              className={`w-6 py-1 text-[11px] font-bold rounded ${
                                isSelected ? f.color : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {f.flag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </td>

                  {/* Menge Text + Flags (G / N / U / max) */}
                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.mengeVal}
                        onChange={(e) => updateRow(idx, { mengeVal: e.target.value })}
                        placeholder={idx === 0 ? 'z.B. 10 Tabletten, 1 Schluck' : 'Menge...'}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-900 bg-white"
                      />
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shrink-0">
                        {[
                          { flag: 'G', title: 'Gesichert abgezählt', color: 'bg-emerald-600 text-white' },
                          { flag: 'N', title: 'Nicht gesichert / geschätzt', color: 'bg-amber-500 text-white' },
                          { flag: 'U', title: 'Unbekannt', color: 'bg-slate-600 text-white' },
                          { flag: 'max', title: 'Worst-Case / Maximaldosis', color: 'bg-rose-600 text-white font-bold' },
                        ].map((f) => {
                          const isSelected = row.mengeFlag === f.flag;
                          return (
                            <button
                              key={f.flag}
                              type="button"
                              title={f.title}
                              onClick={() => updateRow(idx, { mengeFlag: isSelected ? '' : (f.flag as any) })}
                              className={`px-1.5 py-1 text-[10px] font-bold rounded ${
                                isSelected ? f.color : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {f.flag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </td>

                  {/* Clear button */}
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => clearRow(idx)}
                      disabled={!hasData}
                      title="Zeile leeren"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
