'use client';

import React from 'react';
import { EvaRecord } from '../../types/eva';
import { SectionHeader } from '../SectionHeader';
import { HeartPulse, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const SymptomsVitalsSection: React.FC<Props> = ({ record, onChange }) => {
  // Helper to detect critical vital abnormalities
  const gcsNum = parseInt(record.vitalGcs, 10);
  const spo2Num = parseFloat(record.vitalSpo2);
  const hfNum = parseFloat(record.vitalHf);
  const qtcNum = parseFloat(record.vitalQtc);
  const phNum = parseFloat(record.vitalPh);

  const isSpo2Critical = !isNaN(spo2Num) && spo2Num < 92;
  const isGcsCritical = !isNaN(gcsNum) && gcsNum < 9;
  const isHfCritical = !isNaN(hfNum) && (hfNum < 50 || hfNum > 130);
  const isQtcCritical = !isNaN(qtcNum) && qtcNum > 460;
  const isPhCritical = !isNaN(phNum) && (phNum < 7.25 || phNum > 7.55);

  const isComplete = record.sympKeine || record.sympWachOrientiert || !!record.vitalGcs || !!record.vitalHf;

  return (
    <div id="sec-vitals" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <SectionHeader
        number={6}
        title="Symptome & Klinische Vitalbefunde"
        subtitle="Sofort-Status, neurologischer Zustand (GCS), Kreislauf, respiratorische Parameter und Tox-Labor"
        badge="Sektion 8"
        isComplete={isComplete}
      />

      {/* 8.1 Symptome Schnell-Status */}
      <div className="mb-6 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          8.1 Symptome Schnell-Status
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const nextVal = !record.sympKeine;
              onChange('sympKeine', nextVal);
              if (nextVal) onChange('sympWachOrientiert', true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              record.sympKeine
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ✓ Keine Symptome (Asymptomatisch)
          </button>

          <button
            type="button"
            onClick={() => onChange('sympWachOrientiert', !record.sympWachOrientiert)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              record.sympWachOrientiert
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ✓ Wach und voll orientiert
          </button>

          <button
            type="button"
            onClick={() => onChange('sympZusammenhangFraglich', !record.sympZusammenhangFraglich)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              record.sympZusammenhangFraglich
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ? Zusammenhang mit Noxe fraglich
          </button>
        </div>
      </div>

      {/* 8.2 Vitalparameter Gitter (2 Spalten / 4x2 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
        {/* GCS */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isGcsCritical
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
              : 'bg-slate-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">GCS (3 – 15)</span>
            {isGcsCritical && <span className="text-[10px] text-rose-700 font-extrabold uppercase">Koma!</span>}
          </div>
          <input
            type="number"
            min="3"
            max="15"
            value={record.vitalGcs}
            onChange={(e) => onChange('vitalGcs', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="15"
          />
          <div className="text-[10px] text-slate-400 mt-1">Glasgow Coma Scale</div>
        </div>

        {/* SpO2 */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isSpo2Critical
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
              : 'bg-slate-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">SpO₂ (%)</span>
            {isSpo2Critical && <span className="text-[10px] text-rose-700 font-extrabold uppercase">Hypoxie</span>}
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={record.vitalSpo2}
              onChange={(e) => onChange('vitalSpo2', e.target.value)}
              className="w-full px-2.5 py-1.5 pr-8 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="98"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-semibold">%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Sauerstoffsättigung</div>
        </div>

        {/* HF */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isHfCritical
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
              : 'bg-slate-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Herzfrequenz (HF)</span>
            {isHfCritical && (
              <span className="text-[10px] text-rose-700 font-extrabold uppercase">
                {hfNum < 50 ? 'Bradykardie' : 'Tachykardie'}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={record.vitalHf}
              onChange={(e) => onChange('vitalHf', e.target.value)}
              className="w-full px-2.5 py-1.5 pr-10 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="76"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-semibold">bpm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pulsfrequenz</div>
        </div>

        {/* RR */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Blutdruck (RR)</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={record.vitalRr}
              onChange={(e) => onChange('vitalRr', e.target.value)}
              className="w-full px-2.5 py-1.5 pr-12 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="120/80"
            />
            <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-semibold">mmHg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">systolisch / diastolisch</div>
        </div>

        {/* QTc */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isQtcCritical
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
              : 'bg-slate-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">QTc-Zeit (EKG)</span>
            {isQtcCritical && <span className="text-[10px] text-rose-700 font-extrabold uppercase">&gt; 460ms</span>}
          </div>
          <div className="relative">
            <input
              type="number"
              value={record.vitalQtc}
              onChange={(e) => onChange('vitalQtc', e.target.value)}
              className="w-full px-2.5 py-1.5 pr-8 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="410"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-semibold">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Frequenzkorrigierte QT-Zeit</div>
        </div>

        {/* pH */}
        <div
          className={`p-3 rounded-xl border transition-colors ${
            isPhCritical
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
              : 'bg-slate-50/50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">pH-Wert (BGA)</span>
            {isPhCritical && <span className="text-[10px] text-rose-700 font-extrabold uppercase">Azidose/Alk.</span>}
          </div>
          <input
            type="number"
            step="0.01"
            value={record.vitalPh}
            onChange={(e) => onChange('vitalPh', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="7.38"
          />
          <div className="text-[10px] text-slate-400 mt-1">Blut-pH-Wert</div>
        </div>

        {/* Temp */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Körpertemp.</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={record.vitalTemp}
              onChange={(e) => onChange('vitalTemp', e.target.value)}
              className="w-full px-2.5 py-1.5 pr-8 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="36.8"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-semibold">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Temperatur</div>
        </div>

        {/* BZ */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Blutzucker (BZ)</span>
            <div className="flex gap-1 text-[10px]">
              {(['mg/dl', 'mmol/l'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onChange('vitalBzEinheit', unit)}
                  className={`px-1 rounded ${
                    record.vitalBzEinheit === unit ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            value={record.vitalBz}
            onChange={(e) => onChange('vitalBz', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="100"
          />
          <div className="text-[10px] text-slate-400 mt-1">Glukose ({record.vitalBzEinheit})</div>
        </div>

        {/* Ethanol */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-4 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">Ethanol / Blutalkoholspiegel</span>
            <div className="flex gap-1 text-xs">
              {(['‰', 'mg/L'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onChange('vitalEthanolEinheit', unit)}
                  className={`px-2 py-0.5 rounded text-xs ${
                    record.vitalEthanolEinheit === unit
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={record.vitalEthanol}
              onChange={(e) => onChange('vitalEthanol', e.target.value)}
              className="w-48 px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="z.B. 1.2"
            />
            <span className="text-xs text-slate-500 flex items-center">
              Einheit: {record.vitalEthanolEinheit === '‰' ? 'Promille (o/oo)' : 'mg pro Liter'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
