'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EvaRecord } from '../types/eva';
import { createEmptyRecord, sampleCases } from '../data/sampleCases';
import { Header } from '../components/Header';
import { LiveSidebar } from '../components/LiveSidebar';
import { MetadataAndCallerSection } from '../components/sections/MetadataAndCallerSection';
import { PatientSection } from '../components/sections/PatientSection';
import { NoxeExposureSection } from '../components/sections/NoxeExposureSection';
import { SubstancesTableSection } from '../components/sections/SubstancesTableSection';
import { AnamnesisSection } from '../components/sections/AnamnesisSection';
import { SymptomsVitalsSection } from '../components/sections/SymptomsVitalsSection';
import { TherapiesSection } from '../components/sections/TherapiesSection';
import { PssProcedureSection } from '../components/sections/PssProcedureSection';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [record, setRecord] = useState<EvaRecord>(() => createEmptyRecord());
  const [activeSection, setActiveSection] = useState<string>('sec-metadata');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleFieldChange = <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => {
    setRecord((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLoadSample = (key: string) => {
    const sample = sampleCases[key];
    if (!sample) return;

    const base = createEmptyRecord();
    const updated: EvaRecord = {
      ...base,
      ...sample.data,
      // preserve current date & time if desired, or use sample
      datum: new Date().toISOString().split('T')[0],
      uhrzeit: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

    // Specific therapy setups for sample cases
    if (key === 'fall1') {
      updated.therapien.spuelen.v = true;
      updated.therapien.spuelen.e = true;
      updated.therapien.fluessigkeit.e = true;
      updated.therapien.entschaeumen.e = true;
      if (updated.therapien.entschaeumen.subOptions) {
        updated.therapien.entschaeumen.subOptions.simeticon = true;
      }
      updated.therapien.ueberwachung.e = true;
    } else if (key === 'fall2') {
      updated.therapien.labor.e = true;
      updated.therapien.blutspiegel.e = true;
      if (updated.therapien.blutspiegel.subOptions) {
        updated.therapien.blutspiegel.subOptions.noxe = true;
      }
      updated.therapien.antidot.e = true;
      if (updated.therapien.antidot.subOptions) {
        updated.therapien.antidot.subOptions.acc = true;
        updated.therapien.antidot.subOptions.acc_prol = true;
      }
      updated.notfallMeds.elyt.e = true;
    } else if (key === 'fall3') {
      updated.therapien.volumen.e = true;
      updated.therapien.volumen.g = true;
      updated.therapien.labor.e = true;
      updated.therapien.giftelimination.e = true;
      if (updated.therapien.giftelimination.subOptions) {
        updated.therapien.giftelimination.subOptions.hd = true;
      }
      updated.therapien.psv.e = true;
      updated.notfallMeds.katecholamin.e = true;
      updated.notfallMeds.katecholamin.g = true;
      updated.notfallMeds.elyt.e = true;
    }

    setRecord(updated);
    showToast(`⚡ ${sample.title} erfolgreich geladen!`);
  };

  const handleClear = () => {
    if (confirm('Möchten Sie das Formular wirklich vollständig zurücksetzen? Alle Eingaben werden gelöscht.')) {
      setRecord(createEmptyRecord());
      showToast('🗑️ Formular vollständig geleert.');
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EVA-Protokoll_${record.az || 'Fall'}_${record.datum}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Fall als JSON heruntergeladen.');
  };

  const handleCopySummary = () => {
    const primaryNoxe = record.substanzen.find((s) => s.noxeName.trim() !== '');
    const summary = [
      `GIZ BONN &bull; NOTRUF-DOKUMENTATION EVA 5.26`,
      `Aktenzeichen: ${record.az} (${record.datum} ${record.uhrzeit} Uhr)`,
      `Berater/in: ${record.berater}`,
      `--------------------------------------------------`,
      `ANRUFER: ${record.anruferName || 'Unbekannt'} (${record.anruferTyp}) | Tel: ${record.anruferKontakt || '-'}`,
      `PATIENT: ${record.patientName || 'Unbekannt'} (${record.alterWert} ${record.alterEinheit}, ${record.geschlecht || '-'}, ${record.gewichtKg ? record.gewichtKg + 'kg' : '-'})`,
      `NOXE: ${primaryNoxe?.noxeName || 'Keine Angabe'} | Dosis: ${primaryNoxe?.mengeVal || '-'}`,
      `EXPOSITION: vor ${record.zeitWert} ${record.zeitEinheit} (${record.aetiologie.join(', ')}) | Route: ${record.routeStandard.join(', ')}`,
      `PSS: Vor/Bei Anruf: Grad ${record.pssVor} | Potentiell: Grad ${record.pssPot}`,
      `EMPFOHLENES PROZEDERE: ${record.prozedere || 'Offen'}`,
      `--------------------------------------------------`,
      `ANAMNESE:`,
      record.anamneseText || 'Keine Anamnese erfasst.',
    ].join('\n');

    navigator.clipboard.writeText(summary);
    showToast('📋 Klinische Kurzzusammenfassung kopiert!');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1..8 for section jumps
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const sectionIds = [
          'sec-metadata',
          'sec-patient',
          'sec-noxe',
          'sec-substanzen',
          'sec-anamnese',
          'sec-vitals',
          'sec-therapien',
          'sec-pss',
        ];
        const targetId = sectionIds[parseInt(e.key, 10) - 1];
        const el = document.getElementById(targetId);
        if (el) {
          const yOffset = -130;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleLoadSample('fall1');
      } else if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleClear();
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportJson();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record]);

  // Scroll listener to update active section in header
  useEffect(() => {
    const sectionIds = [
      'sec-metadata',
      'sec-patient',
      'sec-noxe',
      'sec-substanzen',
      'sec-anamnese',
      'sec-vitals',
      'sec-therapien',
      'sec-pss',
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Sticky Header with Meta & Scroll Anchor Navigation */}
      <Header
        record={record}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onExportJson={handleExportJson}
        onCopySummary={handleCopySummary}
        activeSection={activeSection}
      />

      {/* Main Container: Continuous Scrollable Cards Stream (Left) + Sticky Dossier Sidebar (Right) */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-6 py-6 flex flex-col xl:flex-row gap-6">
        {/* Left Column: Continuous elevated section cards (NO TABS!) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Card 1: Sektion 1 - 3: Header, Anrufer, Quellen */}
          <MetadataAndCallerSection record={record} onChange={handleFieldChange} />

          {/* Card 2: Sektion 4: Patient & Biometrie */}
          <PatientSection record={record} onChange={handleFieldChange} />

          {/* Card 3: Sektion 5: Exposition & Modalitäten */}
          <NoxeExposureSection record={record} onChange={handleFieldChange} />

          {/* Card 4: Sektion 6: 7-Row High-Density Substanztabelle */}
          <SubstancesTableSection record={record} onChange={handleFieldChange} />

          {/* Card 5: Sektion 7: Anamnese & VE / VM */}
          <AnamnesisSection record={record} onChange={handleFieldChange} />

          {/* Card 6: Sektion 8: Symptome & Klinische Vitalbefunde */}
          <SymptomsVitalsSection record={record} onChange={handleFieldChange} />

          {/* Card 7: Sektion 9: Therapien, Maßnahmen & Antidote Matrix */}
          <TherapiesSection record={record} onChange={handleFieldChange} />

          {/* Card 8: Sektion 10: PSS (Poisoning Severity Score) & Empfohlenes Prozedere */}
          <PssProcedureSection record={record} onChange={handleFieldChange} />
        </div>

        {/* Right Column: Sticky Live Dossier & Completeness Sidebar */}
        <LiveSidebar record={record} />
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
