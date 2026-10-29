'use client';

import React from 'react';
import { EvaRecord, AgeCategory, Gender } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { User, Scale, Ruler, Sparkles, Baby } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const PatientSection: React.FC<Props> = ({ record, onChange }) => {
  const ageCategories: AgeCategory[] = [
    'Neugeb. (Tag 1-28)',
    'Säugling (Tag 29-365)',
    'Kleinkind (1 – <4 J.)',
    'Kind (4 bis <13 Jahre)',
    'Jugendliche (13 - <18 Jahre)',
    'Erwachsen (18 Jahre und älter)',
  ];

  // Helper to auto-categorize age based on input
  const autoCategorizeAge = (val: string, unit: 'Jahre' | 'Monate' | 'Tage') => {
    const num = parseFloat(val);
    if (isNaN(num)) return;

    if (unit === 'Tage') {
      if (num <= 28) onChange('alterskategorie', 'Neugeb. (Tag 1-28)');
      else onChange('alterskategorie', 'Säugling (Tag 29-365)');
    } else if (unit === 'Monate') {
      if (num < 1) onChange('alterskategorie', 'Neugeb. (Tag 1-28)');
      else if (num <= 12) onChange('alterskategorie', 'Säugling (Tag 29-365)');
      else if (num < 48) onChange('alterskategorie', 'Kleinkind (1 – <4 J.)');
      else onChange('alterskategorie', 'Kind (4 bis <13 Jahre)');
    } else {
      // Jahre
      if (num < 1) onChange('alterskategorie', 'Säugling (Tag 29-365)');
      else if (num < 4) onChange('alterskategorie', 'Kleinkind (1 – <4 J.)');
      else if (num < 13) onChange('alterskategorie', 'Kind (4 bis <13 Jahre)');
      else if (num < 18) onChange('alterskategorie', 'Jugendliche (13 - <18 Jahre)');
      else onChange('alterskategorie', 'Erwachsen (18 Jahre und älter)');
    }
  };

  const handleAgeChange = (val: string) => {
    onChange('alterWert', val);
    autoCategorizeAge(val, record.alterEinheit);
  };

  const handleUnitChange = (unit: 'Jahre' | 'Monate' | 'Tage') => {
    onChange('alterEinheit', unit);
    autoCategorizeAge(record.alterWert, unit);
  };

  // Calculate BMI if weight and height given
  const weight = parseFloat(record.gewichtKg);
  const heightM = parseFloat(record.groesseCm) / 100;
  const bmi = weight > 0 && heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : null;

  const isComplete = !!(record.patientName && record.alterWert && record.geschlecht);

  return (
    <div id="sec-patient" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={2}
        title="Patientendaten & Biometrie"
        subtitle="Identifikation, standardisierte Alterskategorie (EAPCCT) und anthropometrische Werte für Tox-Berechnungen"
        badge="Sektion 4"
        isComplete={isComplete}
      />

      {/* Row 1: Name, Fall-Nr, Geburtsdatum */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 text-xs mb-5">
        <div className="lg:col-span-5">
          <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-blue-600" />
              Patient Name, Vorname oder Tierart
            </span>
            <span className="text-[10px] text-rose-500 font-bold">*Pflichtfeld</span>
          </label>
          <input
            type="text"
            value={record.patientName}
            onChange={(e) => onChange('patientName', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-900"
            placeholder="z.B. Schneider, Jonas oder Hund, Labrador"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block font-semibold text-slate-700 mb-1">
            Fall-Nr. / Interne PID
          </label>
          <input
            type="text"
            value={record.fallNr}
            onChange={(e) => onChange('fallNr', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            placeholder="z.B. 2026-P-0819"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">Geburtsdatum</label>
          <input
            type="date"
            value={record.geburtsdatum}
            onChange={(e) => onChange('geburtsdatum', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>
      </div>

      {/* Row 2: Alter + Einheit, Geschlecht, Schwangerschaft / Stillzeit */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 text-xs mb-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
        {/* Alter Wert + Einheit */}
        <div className="lg:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">
            Alter (Wert & Einheit)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              value={record.alterWert}
              onChange={(e) => handleAgeChange(e.target.value)}
              className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm bg-white"
              placeholder="z.B. 2"
            />
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 flex-1">
              {(['Jahre', 'Monate', 'Tage'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => handleUnitChange(unit)}
                  className={`py-1 rounded text-center text-xs font-semibold transition-colors ${
                    record.alterEinheit === unit
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Geschlecht */}
        <div className="lg:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">Geschlecht</label>
          <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
            {[
              { val: 'm', label: '♂ Männlich' },
              { val: 'w', label: '♀ Weiblich' },
              { val: 'div', label: '⚧ Divers' },
            ].map((g) => (
              <button
                key={g.val}
                type="button"
                onClick={() => onChange('geschlecht', g.val as Gender)}
                className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors ${
                  record.geschlecht === g.val
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schwangerschaft / Stillzeit (nur relevant bei w/weiblich) */}
        <div className="lg:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">
            Sonderstatus Schwangerschaft / Stillzeit
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange('stillzeit', !record.stillzeit)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                record.stillzeit
                  ? 'bg-pink-100 border-pink-300 text-pink-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🍼 Stillzeit
            </button>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => onChange('schwanger', !record.schwanger)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  record.schwanger
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤰 Schwanger
              </button>
              {record.schwanger && (
                <div className="flex items-center gap-1 pr-1">
                  <span className="text-[10px] text-slate-500 font-bold">SSW:</span>
                  <input
                    type="number"
                    value={record.ssw}
                    onChange={(e) => onChange('ssw', e.target.value)}
                    className="w-12 px-1.5 py-0.5 text-xs font-bold border border-slate-200 rounded"
                    placeholder="28"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Standardisierte Alterskategorie (EAPCCT) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Baby className="w-3.5 h-3.5 text-blue-600" />
            Standardisierte Alterskategorie (EAPCCT / GDI)
          </label>
          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Automatische Zuordnung aktiv
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {ageCategories.map((cat) => {
            const isSelected = record.alterskategorie === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange('alterskategorie', cat)}
                className={`px-2.5 py-2 rounded-xl text-center text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Biometrie (Gewicht kg & Größe cm & BMI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Scale className="w-3 h-3 text-slate-500" />
            Körpergewicht (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={record.gewichtKg}
              onChange={(e) => onChange('gewichtKg', e.target.value)}
              className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900"
              placeholder="z.B. 13.5 oder 70"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">kg</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Ruler className="w-3 h-3 text-slate-500" />
            Körpergröße (cm)
          </label>
          <div className="relative">
            <input
              type="number"
              value={record.groesseCm}
              onChange={(e) => onChange('groesseCm', e.target.value)}
              className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900"
              placeholder="z.B. 88 oder 175"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">cm</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Berechnete Tox-Kennzahlen
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-slate-800">
              BMI: <strong className="text-blue-700">{bmi ? `${bmi} kg/m²` : '-'}</strong>
            </span>
            <span className="text-xs text-slate-500">
              mg/kg Bezug: {record.gewichtKg ? `${record.gewichtKg} kg` : 'Gewicht offen'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
