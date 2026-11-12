'use client';

import React from 'react';
import { EvaRecord, ExposurePattern, SubstanceRow } from '../../types/eva';
import { Clock, HelpCircle, MapPin, Route } from 'lucide-react';

import { FlaskConical, Trash2, Info } from 'lucide-react'; 

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const NoxeExposureSection: React.FC<Props> = ({ record, onChange }) => {
  const timeUnits = ['Min', 'Std', 'Tage', 'Monate', 'Jahre'] as const;

  const patterns: { key: ExposurePattern; label: string; desc: string }[] = [
    { key: 'A', label: 'A: Akut', desc: 'Einmalig / kurzzeitig' },
    { key: 'S', label: 'S: Subakut', desc: 'Über mehrere Tage' },
    { key: 'C', label: 'C: Chronisch', desc: 'Wochen / Monate' },
    { key: 'B', label: 'B: Akut auf chronisch', desc: 'Biphasischer Verlauf' },
    { key: 'U', label: 'U: Unbekannt', desc: 'Unklarer Zeitraum' },
  ];

  const aetiologies = [
    'akzidentiell',
    'suizidal',
    'Abusus',
    'gewerblich',
    'Nebenwirkung',
    'Umwelt',
    'Psychose',
    'Giftbeibringung',
    'Caregiver-Fehlgabe',
    'iatrogen (Arzt)',
    'unbekannt',
  ];

  const locations = [
    'Haus',
    'im Freien',
    'Spielplatz',
    'Garten',
    'KiGa-KiTa',
    'Schule',
    'Krankenhaus',
    'Altenheim',
    'Behind.heim',
    'unbekannt',
  ];

  const standardRoutes = ['oral', 'nasal', 'inhalativ', 'Auge', 'Haut', 'unbekannt'];

  const parenteralRoutes = ['Stich', 'Biss', 'rektal', 'i.v.', 'i.m.', 's.c.', 'para', 'Weichteile'];

  const toggleArrayItem = (key: 'aetiologie' | 'ort' | 'routeStandard' | 'routeParenteral', item: string) => {
    const list = [...record[key]];
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(item);
    }
    onChange(key, list);
  };

  {/* update- & clearRow sind für Expositionstabelle */}
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

  return (
    <div>
      {/* 4-Spalten klinisches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Spalte 1: Zeitpunkt & Latenz */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              5.1 Zeitpunkt Erstkontakt
            </span>

            {/* Präfix + Wert + Einheit */}
            <div className="grid grid-cols-12 gap-2 mb-4">

            {/* 1. Spalte: Zeitbezug (Präfix) - Nimmt 5 von 12 Spalten ein */}
              <div className="col-span-5">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Zeitbezug (Präfix)
                </label>
                <div className="grid grid-cols-3 bg-white p-1 rounded-lg border border-slate-200">
                  {(['vor', 'um', 'über'] as const).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => onChange('zeitPraefix', pref)}
                      className={`py-1 rounded text-xs font-semibold ${
                        record.zeitPraefix === pref
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Spalte: Dauer / Latenzzeit - Nimmt 7 von 12 Spalten ein */}
              <div className="col-span-7">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Dauer / Latenzzeit
                </label>
                <div className="flex gap-1">

                  {/* Eingabefeld (Dauer) kann sich mit flex-1 ausdehnt */}
                  <input
                    type="text"
                    value={record.zeitWert}
                    onChange={(e) => onChange('zeitWert', e.target.value)}
                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="z.B. 20"
                  />

                  {/* Dropdown (Min) hat eine feste, kompaktere Breite w-19 */}
                  <select
                    value={record.zeitEinheit}
                    onChange={(e) => onChange('zeitEinheit', e.target.value as EvaRecord['zeitEinheit'])}
                    className="w-19 shrink-0 bg-white px-2 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {timeUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Expositionsmuster (A / S / C / B / U) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Expositionsmuster (A/S/C/B/U)
              </label>
              <div className="space-y-1">
                {patterns.map((pat) => {
                  const isSelected = record.expositionsMuster === pat.key;
                  return (
                    <button
                      key={pat.key}
                      type="button"
                      onClick={() => onChange('expositionsMuster', pat.key)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200/70 hover:bg-slate-100'
                      }`}
                    >
                      <span>{pat.label}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {pat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Spalte 2: Ätiologie */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              5.2 Ätiologie (Ursache)
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {aetiologies.map((aet) => {
                const isSelected = record.aetiologie.includes(aet);
                return (
                  <button
                    key={aet}
                    type="button"
                    onClick={() => toggleArrayItem('aetiologie', aet)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-300'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {aet}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <input
              type="text"
              value={record.aetiologieBemerkung}
              onChange={(e) => onChange('aetiologieBemerkung', e.target.value)}
              className="w-full bg-white px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Bemerkung zur Ätiologie..."
            />
          </div>
        </div>

        {/* Spalte 3: Ort */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              5.3 Ort des Geschehens
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {locations.map((loc) => {
                const isSelected = record.ort.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleArrayItem('ort', loc)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-300'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <input
              type="text"
              value={record.ortBemerkung}
              onChange={(e) => onChange('ortBemerkung', e.target.value)}
              className="w-full bg-white px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Bemerkung zum Ort..."
            />
          </div>
        </div>

        {/* Spalte 4: Expositionsroute */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
              <Route className="w-3.5 h-3.5 text-blue-600" />
              5.4 Inkorporationsweg
            </span>

            {/* Standardwege */}
            <div className="mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Standard:
              </span>
              <div className="flex flex-wrap gap-1">
                {standardRoutes.map((rt) => {
                  const isSelected = record.routeStandard.includes(rt);
                  return (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => toggleArrayItem('routeStandard', rt)}
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      {rt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parenteral / Sonderwege */}
            <div className="mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Parenteral / Sonderwege:
              </span>
              <div className="flex flex-wrap gap-1">
                {parenteralRoutes.map((rt) => {
                  const isSelected = record.routeParenteral.includes(rt);
                  return (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => toggleArrayItem('routeParenteral', rt)}
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      {rt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <input
              type="text"
              value={record.routeBemerkung}
              onChange={(e) => onChange('routeBemerkung', e.target.value)}
              className="w-full bg-white px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Bemerkung zur Route..."
            />
          </div>
        </div>
      </div>

          {/************ Substanztabelle *************/}  
    <div>
      {/* Table Legend */}
      <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4 flex flex-wrap items-center justify-between gap-3">
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
                            onClick={() => updateRow(idx, { expoFlag: isSelected ? '' : (f.flag as EvaRecord['substanzen'][number]['expoFlag']) })}
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
                              onClick={() => updateRow(idx, { noxeFlag: isSelected ? '' : (f.flag as EvaRecord['substanzen'][number]['noxeFlag']) })}
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
                              onClick={() => updateRow(idx, { mengeFlag: isSelected ? '' : (f.flag as EvaRecord['substanzen'][number]['mengeFlag']) })}
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
    </div> {/* Ende Tabelle */}
        
    </div>
  );
};
