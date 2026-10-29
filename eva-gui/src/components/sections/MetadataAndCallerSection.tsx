'use client';

import React from 'react';
import { EvaRecord, CallerType, DepartmentType } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { Phone, Building, UserCheck, ShieldCheck } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const MetadataAndCallerSection: React.FC<Props> = ({ record, onChange }) => {
  const callerTypes: CallerType[] = [
    'Laie',
    'Klinik / KH',
    'Praxis',
    'RTW',
    'Notarzt',
    'KV-Notdienst',
    'Leitstelle',
    'Veterinär',
    'Sonstige',
  ];

  const departmentTypes: DepartmentType[] = [
    'ZNA',
    'Intensiv',
    'Innere',
    'Kinderklinik/Pädiatrie',
    'Psychiatrie',
    'Chirurgie',
    'D-Arzt',
    'Sonstige',
  ];

  const sourceList = [
    { key: 'bonnTox', label: 'BonnTox' },
    { key: 'muehlendahl', label: 'Mühlendahl' },
    { key: 'poisindex', label: 'Poisindex' },
    { key: 'toxinz', label: 'Toxinz' },
    { key: 'gestis', label: 'GESTIS' },
    { key: 'tdi', label: 'TDI' },
    { key: 'sdb', label: 'SDB' },
    { key: 'eva', label: 'EVA' },
  ] as const;

  const toggleSource = (sourceKey: keyof EvaRecord['quellen']) => {
    onChange('quellen', {
      ...record.quellen,
      [sourceKey]: !record.quellen[sourceKey],
    });
  };

  const isComplete = !!(record.anruferKontakt && record.anruferName && record.anruferTyp);

  return (
    <div id="sec-metadata" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={1}
        title="Kopfbereich, Anrufer & Quellen"
        subtitle="Stammdaten des Notrufs, Identifikation des Anrufers und konsultierte Tox-Datenbanken"
        badge="Sektion 1 - 3"
        isComplete={isComplete}
      />

      {/* Row 1: Header Meta (Berater, Datum, Uhrzeit, Anruftyp, Flags, AZ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 pb-5 border-b border-slate-100 mb-6 text-xs">
        {/* Berater */}
        <div className="lg:col-span-3">
          <label className="block font-semibold text-slate-700 mb-1">
            Berater/in (Name / ID)
          </label>
          <input
            type="text"
            value={record.berater}
            onChange={(e) => onChange('berater', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            placeholder="z.B. Dr. Petra Förster (Nr. 14)"
          />
        </div>

        {/* Datum & Zeit */}
        <div className="lg:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">Datum</label>
          <input
            type="date"
            value={record.datum}
            onChange={(e) => onChange('datum', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">Uhrzeit</label>
          <input
            type="time"
            value={record.uhrzeit}
            onChange={(e) => onChange('uhrzeit', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>

        {/* Anruf-Typ (Anfrage / Folgeanruf) */}
        <div className="lg:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">Anruftyp</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onChange('anrufTyp', 'Anfrage')}
              className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors ${
                record.anrufTyp === 'Anfrage'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anfrage
            </button>
            <button
              type="button"
              onClick={() => onChange('anrufTyp', 'Folgeanruf')}
              className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors ${
                record.anrufTyp === 'Folgeanruf'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Folgeanruf
            </button>
          </div>
        </div>

        {/* Flags (Tier, FU-B, FU-Tel) */}
        <div className="lg:col-span-3">
          <label className="block font-semibold text-slate-700 mb-1">Sonder-Flags</label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChange('flagTier', !record.flagTier)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${
                record.flagTier
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🐾 Tier
            </button>
            <button
              type="button"
              onClick={() => onChange('flagFuB', !record.flagFuB)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${
                record.flagFuB
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Follow-up schriftlicher Befund"
            >
              📄 FU-B
            </button>
            <button
              type="button"
              onClick={() => onChange('flagFuTel', !record.flagFuTel)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${
                record.flagFuTel
                  ? 'bg-sky-100 border-sky-300 text-sky-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Follow-up Telefonat"
            >
              📞 FU-Tel
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Anrufertyp (Segmented Pills) */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          Anrufertyp (Triage: Laien- vs. Fachberatung)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {callerTypes.map((type) => {
            const isSelected = record.anruferTyp === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange('anruferTyp', type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
        {record.anruferTyp === 'Sonstige' && (
          <input
            type="text"
            value={record.anruferTypSonstiges}
            onChange={(e) => onChange('anruferTypSonstiges', e.target.value)}
            className="mt-2 w-full max-w-sm px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Genauere Bezeichnung des Anrufertyps..."
          />
        )}
      </div>

      {/* Row 3: Anrufer Details (Anrede, Name, Telefon/E-Mail, Ort) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 text-xs mb-6">
        {/* Anrede */}
        <div className="lg:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">Anrede</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onChange('anrede', 'Frau')}
              className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors ${
                record.anrede === 'Frau' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frau
            </button>
            <button
              type="button"
              onClick={() => onChange('anrede', 'Herr')}
              className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors ${
                record.anrede === 'Herr' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Herr
            </button>
          </div>
        </div>

        {/* Anrufer Name */}
        <div className="lg:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">
            Name des Anrufers / Gesprächspartners
          </label>
          <input
            type="text"
            value={record.anruferName}
            onChange={(e) => onChange('anruferName', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            placeholder="z.B. Schneider, Melanie (Mutter) oder Dr. med. Hartmann"
          />
        </div>

        {/* Telefon / E-Mail (Kritisch!) */}
        <div className="lg:col-span-3">
          <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-blue-700">
              <Phone className="w-3 h-3" />
              TELEFON / E-Mail (Rückruf!)
            </span>
            <span className="text-[10px] text-rose-500 font-bold">*Pflichtfeld</span>
          </label>
          <input
            type="text"
            value={record.anruferKontakt}
            onChange={(e) => onChange('anruferKontakt', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border font-semibold focus:outline-none focus:ring-2 ${
              !record.anruferKontakt
                ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400/20'
                : 'border-slate-200 focus:ring-blue-500/20 text-slate-900'
            }`}
            placeholder="0171-8849201 / station@ukb.de"
          />
        </div>

        {/* Ort / PLZ / Klinik */}
        <div className="lg:col-span-3">
          <label className="block font-semibold text-slate-700 mb-1">
            PLZ / Ort / Klinik / Krankenhaus / Land
          </label>
          <input
            type="text"
            value={record.anruferOrt}
            onChange={(e) => onChange('anruferOrt', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            placeholder="z.B. 53115 Bonn, Reuterstr. 44 oder UKB Venusberg"
          />
        </div>
      </div>

      {/* Row 4: Abteilung (für Kliniken) & Quellen-Rechercheleiste */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 border-t border-slate-100">
        {/* Klinik-Abteilung */}
        <div className="lg:col-span-7">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            Abteilung / Station (bei Klinik-Anrufern)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {departmentTypes.map((dept) => {
              const isSelected = record.abteilung === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => onChange('abteilung', dept)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sektion 3: Quellen-Toolbar */}
        <div className="lg:col-span-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Sektion 3: Konsultierte Quellen
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sourceList.map((src) => {
              const isChecked = record.quellen[src.key as keyof EvaRecord['quellen']];
              return (
                <button
                  key={src.key}
                  type="button"
                  onClick={() => toggleSource(src.key as keyof EvaRecord['quellen'])}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    isChecked
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isChecked ? '✓ ' : ''}
                  {src.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
