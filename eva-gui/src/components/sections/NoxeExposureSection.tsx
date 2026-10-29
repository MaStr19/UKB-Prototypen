'use client';

import React from 'react';
import { EvaRecord, ExposurePattern } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { Clock, HelpCircle, MapPin, Route } from 'lucide-react';

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

  const isComplete = !!(record.zeitWert && record.aetiologie.length > 0 && record.routeStandard.length > 0);

  return (
    <div id="sec-noxe" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={3}
        title="Expositionsparameter & Modalitäten"
        subtitle="Zeitpunkt/Latenz, Expositionsmuster (A/S/C/B/U), Ätiologie, Ort und Inkorporationswege"
        badge="Sektion 5"
        isComplete={isComplete}
      />

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
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Zeitbezug (Präfix)
                </label>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200">
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

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Dauer / Latenzzeit
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={record.zeitWert}
                    onChange={(e) => onChange('zeitWert', e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="z.B. 20"
                  />
                  <select
                    value={record.zeitEinheit}
                    onChange={(e) => onChange('zeitEinheit', e.target.value as any)}
                    className="flex-1 bg-white px-2 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
    </div>
  );
};
