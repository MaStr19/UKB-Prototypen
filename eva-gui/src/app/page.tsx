'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EvaRecord } from '../types/eva';
import { createEmptyRecord, sampleCases } from '../data/sampleCases';
import { Header } from '../components/Header';
import { LiveSidebar } from '../components/LiveSidebar';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { SECTION_CONFIGS } from '../lib/sectionConfig';

import { MetadataAndCallerSection } from '../components/sections/MetadataAndCallerSection';
import { PatientSection } from '../components/sections/PatientSection';
import { NoxeExposureSection } from '../components/sections/NoxeExposureSection';
import { SubstancesTableSection } from '../components/sections/SubstancesTableSection';
import { AnamnesisSection } from '../components/sections/AnamnesisSection';
import { SymptomsVitalsSection } from '../components/sections/SymptomsVitalsSection';
import { TherapiesSection } from '../components/sections/TherapiesSection';
import { PssProcedureSection } from '../components/sections/PssProcedureSection';
import { TherapySuggestionsSection } from '../components/sections/TherapySuggestionsSection';
import { CheckCircle2 } from 'lucide-react';

const SECTION_KEYS = [
  'sec-metadata',
  'sec-patient',
  'sec-noxe',
  'sec-substanzen',
  'sec-anamnese',
  'sec-vitals',
  'sec-therapien',
  'sec-pss',
  'sec-ml-suggestions',
] as const;

export default function Home() {
  const [record, setRecord] = useState<EvaRecord>(() => createEmptyRecord());
  const [activeSection, setActiveSection] = useState<string>('sec-metadata');
  const [toast, setToast] = useState<string | null>(null);

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SECTION_KEYS.forEach((k) => {
      initial[k] = false;
    });
    return initial;
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleFieldChange = useCallback(<K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => {
    setRecord((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedMap(() => {
      const next: Record<string, boolean> = {};
      SECTION_KEYS.forEach((k) => {
        next[k] = false;
      });
      return next;
    });
    showToast('Alle Sektionen aufgeklappt.');
  }, [showToast]);

  const handleCollapseComplete = useCallback(() => {
    setCollapsedMap((prev) => {
      const next: Record<string, boolean> = { ...prev };
      SECTION_KEYS.forEach((k) => {
        const cfg = SECTION_CONFIGS[k];
        if (cfg) {
          const val = cfg.validate(record);
          if (val.isComplete && val.errors.length === 0) {
            next[k] = true;
          }
        }
      });
      return next;
    });
    showToast('Fertige Sektionen eingeklappt.');
  }, [record, showToast]);

  const handleSectionFinish = useCallback((sectionId: string) => {
    const cfg = SECTION_CONFIGS[sectionId];
    if (cfg) {
      const val = cfg.validate(record);
      if (val.errors.length > 0) {
        showToast('Sektion enthaelt Fehler und kann nicht eingeklappt werden.');
        return;
      }
    }
    setCollapsedMap((prev) => ({
      ...prev,
      [sectionId]: true,
    }));
  }, [record, showToast]);

  const handleLoadSample = useCallback((key: string) => {
    const sample = sampleCases[key];
    if (!sample) return;

    const base = createEmptyRecord();
    const updated: EvaRecord = {
      ...base,
      ...sample.data,
      datum: new Date().toISOString().split('T')[0],
      uhrzeit: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

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

    // Auto-collapse behavior for sample cases:
    const nextCollapsed: Record<string, boolean> = {};
    SECTION_KEYS.forEach((k) => {
      const cfg = SECTION_CONFIGS[k];
      if (cfg) {
        const val = cfg.validate(updated);
        nextCollapsed[k] = val.isComplete && val.errors.length === 0;
      } else {
        nextCollapsed[k] = false;
      }
    });

    setRecord(updated);
    setCollapsedMap(nextCollapsed);
    showToast(`${sample.title} erfolgreich geladen!`);
  }, [showToast]);

  const handleClear = useCallback(() => {
    if (confirm('Moechten Sie das Formular wirklich vollstaendig zuruecksetzen? Alle Eingaben werden geloescht.')) {
      setRecord(createEmptyRecord());
      const initial: Record<string, boolean> = {};
      SECTION_KEYS.forEach((k) => {
        initial[k] = false;
      });
      setCollapsedMap(initial);
      showToast('Formular vollstaendig geleert.');
    }
  }, [showToast]);

  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EVA-Protokoll_${record.az || 'Fall'}_${record.datum}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Fall als JSON heruntergeladen.');
  }, [record, showToast]);

  const handleCopySummary = useCallback(() => {
    const primaryNoxe = record.substanzen.find((s) => s.noxeName.trim() !== '');
    const summary = [
      'GIZ BONN NOTRUF-DOKUMENTATION EVA 5.26',
      `Aktenzeichen: ${record.az} (${record.datum} ${record.uhrzeit} Uhr)`,
      `Berater/in: ${record.berater}`,
      '--------------------------------------------------',
      `ANRUFER: ${record.anruferName || 'Unbekannt'} (${record.anruferTyp}) | Tel: ${record.anruferKontakt || '-'}`,
      `PATIENT: ${record.patientName || 'Unbekannt'} (${record.alterWert} ${record.alterEinheit}, ${record.geschlecht || '-'}, ${record.gewichtKg ? record.gewichtKg + 'kg' : '-'})`,
      `NOXE: ${primaryNoxe?.noxeName || 'Keine Angabe'} | Dosis: ${primaryNoxe?.mengeVal || '-'}`,
      `EXPOSITION: vor ${record.zeitWert} ${record.zeitEinheit} (${record.aetiologie.join(', ')}) | Route: ${record.routeStandard.join(', ')}`,
      `PSS: Vor/Bei Anruf: Grad ${record.pssVor} | Potentiell: Grad ${record.pssPot}`,
      `EMPFOHLENES PROZEDERE: ${record.prozedere || 'Offen'}`,
      '--------------------------------------------------',
      'ANAMNESE:',
      record.anamneseText || 'Keine Anamnese erfasst.',
    ].join('\n');

    navigator.clipboard.writeText(summary);
    showToast('Klinische Kurzzusammenfassung kopiert!');
  }, [record, showToast]);

  const handleSectionBlur = useCallback(
    (sectionId: string, e: React.FocusEvent<HTMLDivElement>) => {
      const nextTarget = e.relatedTarget as Node | null;
      if (!e.currentTarget.contains(nextTarget)) {
        const cfg = SECTION_CONFIGS[sectionId];
        if (cfg) {
          const val = cfg.validate(record);
          if (val.isComplete && val.errors.length === 0) {
            setCollapsedMap((prev) => {
              if (prev[sectionId]) return prev;
              return { ...prev, [sectionId]: true };
            });
          }
        }
      }
    },
    [record]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const targetId = SECTION_KEYS[parseInt(e.key, 10) - 1];
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
  }, [record, handleClear, handleExportJson, handleLoadSample]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = SECTION_KEYS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_KEYS[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTION_KEYS[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header
        record={record}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onExportJson={handleExportJson}
        onCopySummary={handleCopySummary}
        onExpandAll={handleExpandAll}
        onCollapseComplete={handleCollapseComplete}
        activeSection={activeSection}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-6 py-6 flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Card 1: Sektion 1 - 3: Header, Anrufer, Quellen */}
          <div onBlur={(e) => handleSectionBlur('sec-metadata', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-metadata']}
              validation={SECTION_CONFIGS['sec-metadata'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-metadata'].summarize(record)}
              isCollapsed={collapsedMap['sec-metadata']}
              onToggle={() => toggleSection('sec-metadata')}
              onFinish={() => handleSectionFinish('sec-metadata')}
            >
              <MetadataAndCallerSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 2: Sektion 4: Patient & Biometrie */}
          <div onBlur={(e) => handleSectionBlur('sec-patient', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-patient']}
              validation={SECTION_CONFIGS['sec-patient'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-patient'].summarize(record)}
              isCollapsed={collapsedMap['sec-patient']}
              onToggle={() => toggleSection('sec-patient')}
              onFinish={() => handleSectionFinish('sec-patient')}
            >
              <PatientSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 3: Sektion 5: Exposition & Modalitäten */}
          <div onBlur={(e) => handleSectionBlur('sec-noxe', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-noxe']}
              validation={SECTION_CONFIGS['sec-noxe'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-noxe'].summarize(record)}
              isCollapsed={collapsedMap['sec-noxe']}
              onToggle={() => toggleSection('sec-noxe')}
              onFinish={() => handleSectionFinish('sec-noxe')}
            >
              <NoxeExposureSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 4: Sektion 6: 7-Row High-Density Substanztabelle */}
          <div onBlur={(e) => handleSectionBlur('sec-substanzen', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-substanzen']}
              validation={SECTION_CONFIGS['sec-substanzen'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-substanzen'].summarize(record)}
              isCollapsed={collapsedMap['sec-substanzen']}
              onToggle={() => toggleSection('sec-substanzen')}
              onFinish={() => handleSectionFinish('sec-substanzen')}
            >
              <SubstancesTableSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 5: Sektion 7: Anamnese & VE / VM */}
          <div onBlur={(e) => handleSectionBlur('sec-anamnese', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-anamnese']}
              validation={SECTION_CONFIGS['sec-anamnese'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-anamnese'].summarize(record)}
              isCollapsed={collapsedMap['sec-anamnese']}
              onToggle={() => toggleSection('sec-anamnese')}
              onFinish={() => handleSectionFinish('sec-anamnese')}
            >
              <AnamnesisSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 6: Sektion 8: Symptome & Klinische Vitalbefunde */}
          <div onBlur={(e) => handleSectionBlur('sec-vitals', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-vitals']}
              validation={SECTION_CONFIGS['sec-vitals'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-vitals'].summarize(record)}
              isCollapsed={collapsedMap['sec-vitals']}
              onToggle={() => toggleSection('sec-vitals')}
              onFinish={() => handleSectionFinish('sec-vitals')}
            >
              <SymptomsVitalsSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 7: Sektion 9: Therapien, Maßnahmen & Antidote Matrix */}
          <div onBlur={(e) => handleSectionBlur('sec-therapien', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-therapien']}
              validation={SECTION_CONFIGS['sec-therapien'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-therapien'].summarize(record)}
              isCollapsed={collapsedMap['sec-therapien']}
              onToggle={() => toggleSection('sec-therapien')}
              onFinish={() => handleSectionFinish('sec-therapien')}
            >
              <TherapiesSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 8: Sektion 10: PSS & Empfohlenes Prozedere */}
          <div onBlur={(e) => handleSectionBlur('sec-pss', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-pss']}
              validation={SECTION_CONFIGS['sec-pss'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-pss'].summarize(record)}
              isCollapsed={collapsedMap['sec-pss']}
              onToggle={() => toggleSection('sec-pss')}
              onFinish={() => handleSectionFinish('sec-pss')}
            >
              <PssProcedureSection record={record} onChange={handleFieldChange} />
            </CollapsibleSection>
          </div>

          {/* Card 9: Feature 2: KI-Therapie- & Antidot-Vorschläge (ML) */}
          <div onBlur={(e) => handleSectionBlur('sec-ml-suggestions', e)} tabIndex={-1} className="outline-none">
            <CollapsibleSection
              config={SECTION_CONFIGS['sec-ml-suggestions']}
              validation={SECTION_CONFIGS['sec-ml-suggestions'].validate(record)}
              summaryItems={SECTION_CONFIGS['sec-ml-suggestions'].summarize(record)}
              isCollapsed={collapsedMap['sec-ml-suggestions']}
              onToggle={() => toggleSection('sec-ml-suggestions')}
              onFinish={() => handleSectionFinish('sec-ml-suggestions')}
            >
              <TherapySuggestionsSection
                record={record}
                onChange={handleFieldChange}
                onToast={showToast}
              />
            </CollapsibleSection>
          </div>
        </div>

        <LiveSidebar record={record} />
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}