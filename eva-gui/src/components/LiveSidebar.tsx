'use client';

import React from 'react';
import { EvaRecord } from '../types/eva';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Activity, 
  PhoneForwarded, 
  BookOpen, 
  Pill,
  User,
  Check,
  Stethoscope
} from 'lucide-react';

interface LiveSidebarProps {
  record: EvaRecord;
}

export const LiveSidebar: React.FC<LiveSidebarProps> = ({ record }) => {
  // Calculate clinical completeness
  const checks = [
    {
      id: 'caller',
      label: 'Anrufer & Rückrufnummer',
      isOk: !!(record.anruferKontakt && record.anruferKontakt.trim().length > 3),
      critical: true,
      hint: 'Lebensnotwendig bei Gesprächsabbruch!',
    },
    {
      id: 'patient',
      label: 'Patient (Name, Alter, Geschlecht)',
      isOk: !!(record.patientName && record.alterWert && record.geschlecht),
      critical: true,
      hint: 'Für Dosisberechnungen zwingend',
    },
    {
      id: 'substance',
      label: 'Leitnoxe in Tabelle erfasst',
      isOk: record.substanzen.some((s) => s.noxeName && s.noxeName.trim().length > 0),
      critical: true,
      hint: 'Mindestens 1 Agens erfassen',
    },
    {
      id: 'exposure',
      label: 'Expositionszeitpunkt & Ätiologie',
      isOk: !!(record.zeitWert && record.aetiologie.length > 0),
      critical: false,
      hint: 'Latenz & Ursache',
    },
    {
      id: 'anamnese',
      label: 'Anamnese / Hergang',
      isOk: !!(record.anamneseText && record.anamneseText.trim().length > 10),
      critical: false,
      hint: 'Notfallhergang & Auffindung',
    },
    {
      id: 'pss',
      label: 'PSS & empfohlenes Prozedere',
      isOk: Boolean(record.prozedere),
      critical: true,
      hint: 'Abschließende Risikobewertung',
    },
  ];

  const okCount = checks.filter((c) => c.isOk).length;
  const percentage = Math.round((okCount / checks.length) * 100);

  // Collect all recommended therapies [e: true]
  const recommendedTherapies = Object.values(record.therapien).filter((t) => t.e);
  const recommendedMeds = Object.values(record.notfallMeds).filter((m) => m.e);

  // Active databases
  const activeSources = Object.entries(record.quellen)
    .filter(([_, active]) => active)
    .map(([key]) => {
      const names: Record<string, string> = {
        bonnTox: 'BonnTox',
        muehlendahl: 'Mühlendahl',
        poisindex: 'Poisindex',
        toxinz: 'Toxinz',
        gestis: 'GESTIS',
        tdi: 'TDI',
        sdb: 'SDB',
        eva: 'EVA',
      };
      return names[key] || key;
    });

  const getPssBadge = (score: string) => {
    switch (score) {
      case '0':
        return { label: 'Grad 0: Keine Symptome', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case '1':
        return { label: 'Grad 1: Leicht / Mild', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case '2':
        return { label: 'Grad 2: Mittelschwer', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case '3':
        return { label: 'Grad 3: Schwer / Vitalbedrohung', bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
      case '4':
        return { label: 'Grad 4: Letal (Todesfolge)', bg: 'bg-purple-900 text-white border-purple-950 font-bold' };
      default:
        return { label: 'U: Unbekannt / Unbeurteilt', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const pssInfo = getPssBadge(record.pssVor);

  return (
    <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-4 sticky top-28 self-start no-print">
      {/* 1. Completeness Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Vollständigkeits-Index
          </span>
          <span className="text-xs font-extrabold text-blue-700">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentage < 50 ? 'bg-amber-500' : percentage < 85 ? 'bg-blue-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {checks.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-2 p-1.5 rounded-lg text-xs ${
                item.isOk
                  ? 'bg-emerald-50/50 text-emerald-900'
                  : item.critical
                  ? 'bg-rose-50/60 text-rose-900 border border-rose-200/60'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              {item.isOk ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : item.critical ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="font-semibold leading-tight">{item.label}</div>
                {!item.isOk && item.critical && (
                  <div className="text-[10px] text-rose-600 mt-0.5 font-medium">{item.hint}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Live Falldossier Summary */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            Live Falldossier
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {record.az}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Patient</div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {record.patientName || 'Noch nicht erfasst'}
            </div>
            <div className="text-slate-500 text-[11px]">
              {record.alterWert ? `${record.alterWert} ${record.alterEinheit}` : '-'}
              {record.geschlecht ? `, ${record.geschlecht === 'm' ? 'männlich' : record.geschlecht === 'w' ? 'weiblich' : 'divers'}` : ''}
              {record.gewichtKg ? `, ${record.gewichtKg} kg` : ''}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Anrufer</div>
            <div className="font-semibold text-slate-800">
              {record.anruferName || 'Name unbekannt'} ({record.anruferTyp})
            </div>
            <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <PhoneForwarded className="w-3 h-3" />
              {record.anruferKontakt || 'Keine Rückrufnummer!'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Schweregrad PSS</div>
            <div className={`mt-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${pssInfo.bg}`}>
              {pssInfo.label}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Empfohlenes Prozedere</div>
            <div className="mt-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs">
              {record.prozedere ? record.prozedere.toUpperCase() : 'NOCH OFFEN'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recommended Measures Phone Readout (Live Spickzettel für den Anruf) */}
      <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-200/80 shadow-xs p-4">
        <div className="flex items-center gap-2 mb-2 border-b border-blue-200/60 pb-2">
          <Stethoscope className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Empfohlene Sofortmaßnahmen
          </h3>
        </div>
        <p className="text-[11px] text-blue-700/80 mb-3">
          Direkter Spickzettel zur telefonischen Durchgabe:
        </p>

        {recommendedTherapies.length === 0 && recommendedMeds.length === 0 ? (
          <div className="text-xs text-slate-400 italic p-2 bg-white/70 rounded-lg border border-dashed border-blue-200 text-center">
            Noch keine Maßnahmen auf [e] (empfohlen) gesetzt.
          </div>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {recommendedTherapies.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-1.5 bg-white/90 p-1.5 rounded-md border border-blue-100 text-slate-800 font-medium shadow-2xs"
              >
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {t.label}
                  {t.subOptions &&
                    Object.entries(t.subOptions)
                      .filter(([_, on]) => on)
                      .map(([k]) => t.subOptionLabels?.[k])
                      .filter(Boolean).length > 0 && (
                      <span className="text-[10px] text-blue-700 font-bold ml-1">
                        (
                        {Object.entries(t.subOptions)
                          .filter(([_, on]) => on)
                          .map(([k]) => t.subOptionLabels?.[k])
                          .join(', ')}
                        )
                      </span>
                    )}
                </span>
              </li>
            ))}
            {recommendedMeds.map((m) => (
              <li
                key={m.id}
                className="flex items-start gap-1.5 bg-rose-50/90 p-1.5 rounded-md border border-rose-200 text-rose-900 font-medium shadow-2xs"
              >
                <Pill className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold">{m.label}</strong> ({m.subtitle})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. Active Consulted Sources */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          Konsultierte Quellen ({activeSources.length})
        </span>
        <div className="flex flex-wrap gap-1.5">
          {activeSources.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold"
            >
              {s}
            </span>
          ))}
          {activeSources.length === 0 && (
            <span className="text-xs text-slate-400 italic">Keine Recherchequellen markiert</span>
          )}
        </div>
      </div>
    </aside>
  );
};
