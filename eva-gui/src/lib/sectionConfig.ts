import { EvaRecord } from '../types/eva';

export interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface SectionValidation {
  isComplete: boolean;
  hasWarnings: boolean;
  errors: string[];
  warnings: string[];
}

export interface SectionConfig {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  validate: (record: EvaRecord) => SectionValidation;
  summarize: (record: EvaRecord) => SummaryItem[];
}

/**
 * Truncates overly long strings cleanly with ellipsis (max 60 chars by default).
 */
export function truncateText(str: string | undefined | null, maxLen: number = 60): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1) + '…';
}

function parseNumberStrict(val: string | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  const trimmed = val.trim();
  if (trimmed === '') return null;
  // Replace comma with dot
  const normalized = trimmed.replace(',', '.');
  const num = Number(normalized);
  if (isNaN(num)) return NaN;
  return num;
}

export const SECTION_CONFIGS: Record<string, SectionConfig> = {
  'sec-metadata': {
    id: 'sec-metadata',
    number: 1,
    title: 'Kopfbereich, Anrufer & Quellen',
    subtitle: 'Stammdaten des Notrufs, Identifikation des Anrufers und konsultierte Tox-Datenbanken',
    badge: 'Sektion 1 - 3',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!record.berater?.trim()) {
        warnings.push('Berater/in nicht angegeben.');
      }
      if (!record.anruferKontakt?.trim()) {
        warnings.push('Rückrufnummer / Kontakt des Anrufers fehlt.');
      }
      if (!record.anruferName?.trim()) {
        warnings.push('Name des Anrufers fehlt.');
      }
      if (!record.anruferTyp) {
        warnings.push('Anrufertyp nicht ausgewählt.');
      }

      const isComplete = Boolean(
        record.anruferKontakt?.trim() &&
        record.anruferName?.trim() &&
        record.anruferTyp
      );

      return {
        isComplete,
        hasWarnings: warnings.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      if (record.anruferName?.trim()) {
        items.push({ label: 'Anrufer', value: truncateText(record.anruferName) });
      }
      if (record.anruferTyp) {
        items.push({ label: 'Typ', value: record.anruferTyp });
      }
      if (record.anruferKontakt?.trim()) {
        items.push({ label: 'Kontakt', value: truncateText(record.anruferKontakt, 30), highlight: true });
      }
      if (record.abteilung) {
        items.push({ label: 'Abteilung', value: record.abteilung });
      }
      if (record.az?.trim()) {
        items.push({ label: 'AZ', value: record.az });
      }
      if (record.berater?.trim()) {
        items.push({ label: 'Berater', value: truncateText(record.berater, 30) });
      }
      const activeQuellen = Object.entries(record.quellen || {})
        .filter(([, active]) => active)
        .map(([k]) => k.toUpperCase());
      if (activeQuellen.length > 0) {
        items.push({ label: 'Quellen', value: activeQuellen.join(', ') });
      }
      return items;
    },
  },

  'sec-patient': {
    id: 'sec-patient',
    number: 2,
    title: 'Patientendaten & Biometrie',
    subtitle: 'Identifikation, standardisierte Alterskategorie (EAPCCT) und anthropometrische Werte für Tox-Berechnungen',
    badge: 'Sektion 4',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Numeric validations
      const ageNum = parseNumberStrict(record.alterWert);
      if (record.alterWert?.trim() !== '') {
        if (Number.isNaN(ageNum)) {
          errors.push('Alter muss eine gültige Zahl sein.');
        } else if (ageNum !== null && ageNum < 0) {
          errors.push('Alter darf nicht negativ sein.');
        }
      }

      const weightNum = parseNumberStrict(record.gewichtKg);
      if (record.gewichtKg?.trim() !== '') {
        if (Number.isNaN(weightNum)) {
          errors.push('Körpergewicht muss eine gültige Zahl sein.');
        } else if (weightNum !== null && weightNum <= 0) {
          errors.push('Körpergewicht muss positiv sein.');
        }
      }

      const heightNum = parseNumberStrict(record.groesseCm);
      if (record.groesseCm?.trim() !== '') {
        if (Number.isNaN(heightNum)) {
          errors.push('Körpergröße muss eine gültige Zahl sein.');
        } else if (heightNum !== null && heightNum <= 0) {
          errors.push('Körpergröße muss positiv sein.');
        }
      }

      if (!record.patientName?.trim()) {
        warnings.push('Patientenname fehlt.');
      }
      if (!record.alterWert?.trim()) {
        warnings.push('Alter fehlt.');
      }
      if (!record.geschlecht) {
        warnings.push('Geschlecht nicht ausgewählt.');
      }

      const isComplete = Boolean(
        record.patientName?.trim() &&
        record.alterWert?.trim() &&
        record.geschlecht &&
        errors.length === 0
      );

      return {
        isComplete,
        hasWarnings: warnings.length > 0 || errors.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      if (record.patientName?.trim()) {
        items.push({ label: 'Patient', value: truncateText(record.patientName), highlight: true });
      }
      if (record.alterWert?.trim()) {
        items.push({ label: 'Alter', value: `${record.alterWert} ${record.alterEinheit || 'Jahre'}` });
      }
      if (record.geschlecht) {
        items.push({ label: 'Geschlecht', value: record.geschlecht.toUpperCase() });
      }
      if (record.alterskategorie) {
        items.push({ label: 'Kategorie', value: record.alterskategorie });
      }
      if (record.gewichtKg?.trim()) {
        items.push({ label: 'Gewicht', value: `${record.gewichtKg} kg` });
      }
      if (record.schwanger) {
        items.push({ label: 'Gravidität', value: record.ssw ? `SSW ${record.ssw}` : 'ja', highlight: true });
      }
      if (record.stillzeit) {
        items.push({ label: 'Stillzeit', value: 'ja', highlight: true });
      }
      return items;
    },
  },

  'sec-noxe': {
    id: 'sec-noxe',
    number: 3,
    title: 'Expositionsparameter & Modalitäten',
    subtitle: 'Zeitpunkt/Latenz, Expositionsmuster (A/S/C/B/U), Ätiologie, Ort und Inkorporationswege',
    badge: 'Sektion 5',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const timeNum = parseNumberStrict(record.zeitWert);
      if (record.zeitWert?.trim() !== '') {
        if (Number.isNaN(timeNum)) {
          errors.push('Expositionszeit muss eine gültige Zahl sein.');
        } else if (timeNum !== null && timeNum < 0) {
          errors.push('Expositionszeit darf nicht negativ sein.');
        }
      }

      if (!record.zeitWert?.trim()) {
        warnings.push('Expositionszeit / Latenz fehlt.');
      }
      if (!record.aetiologie || record.aetiologie.length === 0) {
        warnings.push('Ätiologie (z.B. akzidentiell / suizidal) fehlt.');
      }
      if (!record.routeStandard || record.routeStandard.length === 0) {
        warnings.push('Inkorporationsweg (z.B. oral) fehlt.');
      }

      const isComplete = Boolean(
        record.zeitWert?.trim() &&
        record.aetiologie?.length > 0 &&
        record.routeStandard?.length > 0 &&
        errors.length === 0
      );

      return {
        isComplete,
        hasWarnings: warnings.length > 0 || errors.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      if (record.zeitWert?.trim()) {
        const prefix = record.zeitPraefix ? `${record.zeitPraefix} ` : '';
        items.push({ label: 'Latenz', value: `${prefix}${record.zeitWert} ${record.zeitEinheit}`, highlight: true });
      }
      if (record.expositionsMuster) {
        items.push({ label: 'Muster', value: record.expositionsMuster });
      }
      if (record.aetiologie?.length > 0) {
        items.push({ label: 'Ätiologie', value: record.aetiologie.join(', ') });
      }
      if (record.routeStandard?.length > 0) {
        items.push({ label: 'Route', value: record.routeStandard.join(', ') });
      }
      if (record.routeParenteral?.length > 0) {
        items.push({ label: 'Parenteral', value: record.routeParenteral.join(', ') });
      }
      if (record.ort?.length > 0) {
        items.push({ label: 'Ort', value: record.ort.join(', ') });
      }
      return items;
    },
  },

  'sec-substanzen': {
    id: 'sec-substanzen',
    number: 4,
    title: 'Substanztabelle (7 Agenzien-Matrix)',
    subtitle: 'Erfassung aller toxischen Agentien mit Expositionssicherheit (G/N/K), Toxizität (G/N/K/T) und Mengeneinstufung (G/N/U/max)',
    badge: 'Sektion 6',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const enteredSubstances = record.substanzen.filter((s) => s.noxeName?.trim().length > 0);
      if (enteredSubstances.length === 0) {
        warnings.push('Mindestens eine Leitsubstanz / Noxe muss erfasst sein.');
      }

      const isComplete = enteredSubstances.length > 0 && errors.length === 0;

      return {
        isComplete,
        hasWarnings: warnings.length > 0 || errors.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      const activeSubs = record.substanzen.filter((s) => s.noxeName?.trim().length > 0);
      if (activeSubs.length === 0) {
        return items;
      }
      activeSubs.forEach((s, idx) => {
        const flagText = [s.noxeFlag ? `[${s.noxeFlag}]` : '', s.mengeVal ? `(${s.mengeVal})` : '']
          .filter(Boolean)
          .join(' ');
        items.push({
          label: idx === 0 ? 'Leitnoxe' : `Noxe #${s.id}`,
          value: `${truncateText(s.noxeName, 40)} ${flagText}`.trim(),
          highlight: idx === 0 || s.noxeFlag === 'T',
        });
      });
      return items;
    },
  },

  'sec-anamnese': {
    id: 'sec-anamnese',
    number: 5,
    title: 'Anamnese, Vorerkrankungen & Vormedikation',
    subtitle: 'Detaillierte Schilderung des Notfallhergangs, Auffindesituation, Zeugenaussagen und chronische Medikation',
    badge: 'Sektion 7',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!record.anamneseText || record.anamneseText.trim().length <= 5) {
        warnings.push('Ausführlicher Anamnesetext fehlt (mind. 6 Zeichen).');
      }

      const isComplete = Boolean(record.anamneseText && record.anamneseText.trim().length > 5);

      return {
        isComplete,
        hasWarnings: warnings.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      if (record.anamneseText?.trim()) {
        items.push({ label: 'Anamnese', value: truncateText(record.anamneseText, 80), highlight: true });
      }
      if (record.veText?.trim()) {
        items.push({ label: 'Vorerkrankungen', value: truncateText(record.veText, 50) });
      }
      if (record.vmText?.trim()) {
        items.push({ label: 'Vormedikation', value: truncateText(record.vmText, 50) });
      }
      return items;
    },
  },

  'sec-vitals': {
    id: 'sec-vitals',
    number: 6,
    title: 'Symptome & Klinische Vitalbefunde',
    subtitle: 'Sofort-Status, neurologischer Zustand (GCS), Kreislauf, respiratorische Parameter und Tox-Labor',
    badge: 'Sektion 8',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate numeric vitals
      if (record.vitalGcs?.trim()) {
        const gcs = parseNumberStrict(record.vitalGcs);
        if (Number.isNaN(gcs)) {
          errors.push('GCS muss eine gültige Zahl sein.');
        } else if (gcs !== null && (gcs < 3 || gcs > 15)) {
          errors.push('GCS muss zwischen 3 und 15 liegen.');
        }
      }

      if (record.vitalSpo2?.trim()) {
        const spo2 = parseNumberStrict(record.vitalSpo2);
        if (Number.isNaN(spo2)) {
          errors.push('SpO2 muss eine gültige Zahl sein.');
        } else if (spo2 !== null && (spo2 < 0 || spo2 > 100)) {
          errors.push('SpO2 muss zwischen 0 und 100% liegen.');
        }
      }

      if (record.vitalHf?.trim()) {
        const hf = parseNumberStrict(record.vitalHf);
        if (Number.isNaN(hf)) {
          errors.push('Herzfrequenz muss eine gültige Zahl sein.');
        } else if (hf !== null && (hf <= 0 || hf > 300)) {
          errors.push('Herzfrequenz muss zwischen 1 und 300/min liegen.');
        }
      }

      if (record.vitalPh?.trim()) {
        const ph = parseNumberStrict(record.vitalPh);
        if (Number.isNaN(ph)) {
          errors.push('pH-Wert muss eine gültige Zahl sein.');
        } else if (ph !== null && (ph < 6.5 || ph > 8.0)) {
          errors.push('pH-Wert muss im biologischen Bereich (6.5 – 8.0) liegen.');
        }
      }

      if (record.vitalTemp?.trim()) {
        const temp = parseNumberStrict(record.vitalTemp);
        if (Number.isNaN(temp)) {
          errors.push('Körpertemperatur muss eine gültige Zahl sein.');
        } else if (temp !== null && (temp < 20 || temp > 45)) {
          errors.push('Körpertemperatur muss zwischen 20°C und 45°C liegen.');
        }
      }

      const isComplete = Boolean(
        record.sympKeine ||
        record.sympWachOrientiert ||
        record.vitalGcs?.trim() ||
        record.vitalHf?.trim()
      ) && errors.length === 0;

      return {
        isComplete,
        hasWarnings: warnings.length > 0 || errors.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      const statusList: string[] = [];
      if (record.sympKeine) statusList.push('Asymptomatisch');
      if (record.sympWachOrientiert) statusList.push('Wach/Orientiert');
      if (record.sympZusammenhangFraglich) statusList.push('Zusammenhang fraglich');
      if (statusList.length > 0) {
        items.push({ label: 'Status', value: statusList.join(', ') });
      }

      if (record.vitalGcs?.trim()) {
        const gcsVal = Number(record.vitalGcs);
        items.push({ label: 'GCS', value: record.vitalGcs, highlight: !isNaN(gcsVal) && gcsVal < 15 });
      }
      if (record.vitalHf?.trim()) {
        const hfVal = Number(record.vitalHf);
        items.push({ label: 'HF', value: `${record.vitalHf}/min`, highlight: !isNaN(hfVal) && (hfVal > 100 || hfVal < 55) });
      }
      if (record.vitalRr?.trim()) {
        items.push({ label: 'RR', value: `${record.vitalRr} mmHg` });
      }
      if (record.vitalSpo2?.trim()) {
        const spo2Val = Number(record.vitalSpo2);
        items.push({ label: 'SpO2', value: `${record.vitalSpo2}%`, highlight: !isNaN(spo2Val) && spo2Val < 94 });
      }
      if (record.vitalPh?.trim()) {
        const phVal = Number(record.vitalPh.replace(',', '.'));
        items.push({ label: 'pH', value: record.vitalPh, highlight: !isNaN(phVal) && (phVal < 7.35 || phVal > 7.45) });
      }
      if (record.vitalTemp?.trim()) {
        items.push({ label: 'Temp', value: `${record.vitalTemp}°C` });
      }
      if (record.vitalBz?.trim()) {
        items.push({ label: 'BZ', value: `${record.vitalBz} ${record.vitalBzEinheit || 'mg/dl'}` });
      }
      return items;
    },
  },

  'sec-therapien': {
    id: 'sec-therapien',
    number: 7,
    title: 'Therapien, Maßnahmen & Antidote',
    subtitle: '3-Spalten-Interventionsmatrix (v: Vorher erfolgt | e: Empfohlen durch GIZ | g: Vor Ort gegeben) und Notfallmedikamente',
    badge: 'Sektion 9',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const hasAnyTherapy = Object.values(record.therapien || {}).some((t) => t.v || t.e || t.g);
      const hasAnyMed = Object.values(record.notfallMeds || {}).some((m) => m.e || m.g);

      if (!hasAnyTherapy && !hasAnyMed) {
        warnings.push('Keine Therapie oder Maßnahme ausgewählt.');
      }

      const isComplete = (hasAnyTherapy || hasAnyMed) && errors.length === 0;

      return {
        isComplete,
        hasWarnings: warnings.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];

      // Recommended therapies
      const empf = Object.values(record.therapien || {})
        .filter((t) => t.e)
        .map((t) => {
          const subKeys = t.subOptions ? Object.entries(t.subOptions).filter(([, v]) => v).map(([k]) => t.subOptionLabels?.[k] || k) : [];
          return subKeys.length > 0 ? `${t.label} (${subKeys.join(', ')})` : t.label;
        });

      if (empf.length > 0) {
        items.push({ label: 'Empfohlen [e]', value: truncateText(empf.join(', '), 90), highlight: true });
      }

      const prev = Object.values(record.therapien || {})
        .filter((t) => t.v)
        .map((t) => t.label);
      if (prev.length > 0) {
        items.push({ label: 'Vor Anruf [v]', value: truncateText(prev.join(', '), 60) });
      }

      const given = Object.values(record.therapien || {})
        .filter((t) => t.g)
        .map((t) => t.label);
      if (given.length > 0) {
        items.push({ label: 'Vor Ort gegeben [g]', value: truncateText(given.join(', '), 60) });
      }

      const empfMeds = Object.values(record.notfallMeds || {})
        .filter((m) => m.e)
        .map((m) => m.label);
      if (empfMeds.length > 0) {
        items.push({ label: 'Notfall-Meds', value: empfMeds.join(', '), highlight: true });
      }

      if (record.monitoring) {
        items.push({ label: 'Monitoring', value: record.monitoring });
      }
      return items;
    },
  },

  'sec-pss': {
    id: 'sec-pss',
    number: 8,
    title: 'Poisoning Severity Score (PSS) & Prozedere',
    subtitle: 'Standardisierter Schweregrad-Score (EAPCCT/WHO) und empfohlenes Verlegungs-/Entlassprozedere',
    badge: 'Sektion 10',
    validate: (record: EvaRecord): SectionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!record.prozedere) {
        warnings.push('Empfohlenes Prozedere nicht festgelegt.');
      }

      const isComplete = Boolean(record.prozedere) && errors.length === 0;

      return {
        isComplete,
        hasWarnings: warnings.length > 0,
        errors,
        warnings,
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const items: SummaryItem[] = [];
      items.push({
        label: 'PSS Ist / Pot',
        value: `Grad ${record.pssVor} → Grad ${record.pssPot}`,
        highlight: record.pssVor !== '0' || record.pssPot !== '0',
      });
      if (record.prozedere) {
        items.push({ label: 'Prozedere', value: record.prozedere, highlight: true });
      }
      return items;
    },
  },

  'sec-ml-suggestions': {
    id: 'sec-ml-suggestions',
    number: 9,
    title: 'KI-Therapie- & Antidot-Vorschläge (ML)',
    subtitle: 'Interpretable Machine-Learning-Entscheidungshilfe basierend auf Leitsubstanz, Vitalparametern und PSS',
    badge: 'Feature 2 • ML Assist',
    validate: (record: EvaRecord): SectionValidation => {
      // Complete if at least one therapy has been accepted/recommended or reviewed
      const hasAcceptedSuggestion = Object.values(record.therapien || {}).some((t) => t.e);
      return {
        isComplete: hasAcceptedSuggestion,
        hasWarnings: false,
        errors: [],
        warnings: [],
      };
    },
    summarize: (record: EvaRecord): SummaryItem[] => {
      const empf = Object.values(record.therapien || {}).filter((t) => t.e).map((t) => t.label);
      if (empf.length === 0) {
        return [{ label: 'Status', value: 'Keine Vorschläge übernommen' }];
      }
      return [{ label: 'Aktive Empfehlungen', value: truncateText(empf.join(', '), 70), highlight: true }];
    },
  },
};
