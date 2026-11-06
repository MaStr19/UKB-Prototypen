import { EvaRecord } from '../types/eva';
import { FeatureVector } from './types';

export const FEATURE_NAMES = [
  // 1. Substance Category Tokens (One-hot/continuous 0..1)
  'sub_surfactant_detergent', // Detergents, dish tabs, soaps, cleansers
  'sub_paracetamol',          // Acetaminophen / Paracetamol
  'sub_amatoxin_mushroom',    // Amanita, Knollenblätterpilz, mushrooms
  'sub_sedative_benzo',       // Benzodiazepines, Z-drugs, sedatives
  'sub_opioid',               // Opioids (morphine, fentanyl, tramadol, etc.)
  'sub_caustic_acid_alkali',  // Strong acids, lyes, drain cleaner
  'sub_unknown',              // No identified category or explicit 'unbekannt'

  // 2. Exposure Modalities
  'expo_route_oral',
  'expo_route_dermal',
  'expo_route_ocular',
  'expo_route_inhalativ',
  'expo_route_parenteral',
  'expo_tox_dose_flag_t',     // Noxe flag 'T' (Toxische Dosis)

  // 3. Latency Bucket (One-hot)
  'latency_acute_under_1h',
  'latency_subacute_1_4h',
  'latency_delayed_over_4h',
  'latency_unknown',

  // 4. Patient Demographics & Biometrics
  'patient_is_child',         // Age < 13
  'patient_is_adolescent',    // 13 <= Age < 18
  'patient_is_adult',         // Age >= 18
  'patient_has_weight',       // Flag indicating weight is available
  'patient_weight_kg_norm',   // Normalized weight: min(kg, 120) / 120

  // 5. Vital & Organ Derangements
  'vital_gcs_low',            // GCS < 13 or somnolent/comatose
  'vital_hypoxia',            // SpO2 < 94%
  'vital_tachycardia',        // HF > 105 bpm
  'vital_bradycardia',        // HF < 55 bpm
  'vital_hypotension',        // Systolic RR < 95 mmHg
  'vital_qtc_prolonged',      // QTc > 460 ms
  'vital_acidosis',           // pH < 7.32
  'vital_fever',              // Temp >= 38.2°C
  'vital_asymptomatic',       // sympKeine is true

  // 6. Clinical Severity
  'pss_grade_0',
  'pss_grade_1',
  'pss_grade_2',
  'pss_grade_3_4',
] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  sub_surfactant_detergent: 'Tensid- / Reinigungsmittel-Exposition (z.B. Spültab)',
  sub_paracetamol: 'Paracetamol-Aufnahme (Hepatotoxizitäts-Risiko)',
  sub_amatoxin_mushroom: 'Amatoxin-haltige Pilzintoxikation (Knollenblätterpilz)',
  sub_sedative_benzo: 'Sedativa- / Benzodiazepin-Intoxikation',
  sub_opioid: 'Opioid-Intoxikation (Atemdepression / Sedierung)',
  sub_caustic_acid_alkali: 'Ätzende Substanz (Säure / Lauge)',
  sub_unknown: 'Unbekannte oder unklassifizierte Substanz',
  expo_route_oral: 'Orale Aufnahme',
  expo_route_dermal: 'Hautkontakt',
  expo_route_ocular: 'Augenkontakt',
  expo_route_inhalativ: 'Inhalative Exposition',
  expo_route_parenteral: 'Parenterale / Injektionsexposition',
  expo_tox_dose_flag_t: 'Toxische Dosis klinisch gesichert [T]',
  latency_acute_under_1h: 'Akute Vorstellung (< 1 Stunde nach Ingestion)',
  latency_subacute_1_4h: 'Subakutes Zeitfenster (1 bis 4 Stunden)',
  latency_delayed_over_4h: 'Verzögerte Vorstellung (> 4 Stunden Latenz)',
  latency_unknown: 'Latenzzeit unbekannt',
  patient_is_child: 'Pädiatrischer Patient (< 13 Jahre)',
  patient_is_adolescent: 'Jugendlicher Patient (13 - <18 Jahre)',
  patient_is_adult: 'Erwachsener Patient (>= 18 Jahre)',
  patient_has_weight: 'Körpergewicht dokumentiert',
  patient_weight_kg_norm: 'Normiertes Körpergewicht',
  vital_gcs_low: 'Neurologische Einschränkung (GCS < 13)',
  vital_hypoxia: 'Respiratorische Insuffizienz / Hypoxie (SpO2 < 94%)',
  vital_tachycardia: 'Tachykardie (HF > 105/min)',
  vital_bradycardia: 'Bradykardie (HF < 55/min)',
  vital_hypotension: 'Hypotonie (RR syst. < 95 mmHg)',
  vital_qtc_prolonged: 'QTc-Verlängerung (> 460 ms)',
  vital_acidosis: 'Metabolische Azidose (pH < 7.32)',
  vital_fever: 'Hyperthermie / Fieber (>= 38.2°C)',
  vital_asymptomatic: 'Klinisch asymptomatisch',
  pss_grade_0: 'PSS Grad 0 (Keine Symptome)',
  pss_grade_1: 'PSS Grad 1 (Leichte Vergiftung)',
  pss_grade_2: 'PSS Grad 2 (Mittelschwere Vergiftung)',
  pss_grade_3_4: 'PSS Grad 3-4 (Schwere / Lebensbedrohliche Vergiftung)',
};

/**
 * Parses numeric hours from zeitWert and zeitEinheit.
 */
function parseLatencyInHours(val: string, unit: string): number | null {
  if (!val || !val.trim()) return null;
  const num = parseFloat(val.replace(',', '.'));
  if (isNaN(num) || num < 0) return null;

  switch (unit) {
    case 'Min':
      return num / 60;
    case 'Std':
      return num;
    case 'Tage':
      return num * 24;
    case 'Monate':
      return num * 24 * 30;
    case 'Jahre':
      return num * 24 * 365;
    default:
      return num;
  }
}

/**
 * Extracts pure, deterministic feature vector from EvaRecord.
 * Shared 100% identically between training script and runtime inference.
 */
export function extractFeatures(record: EvaRecord): FeatureVector {
  // Aggregate text for keyword scanning
  const combinedNoxeText = (record.substanzen || [])
    .map((s) => `${s.noxeName || ''} ${s.mengeVal || ''}`)
    .join(' ')
    .toLowerCase();

  const anamneseText = (record.anamneseText || '').toLowerCase();
  const allSubstanceText = `${combinedNoxeText} ${anamneseText}`;

  const hasSubstanceEntered = (record.substanzen || []).some(
    (s) => s.noxeName && s.noxeName.trim().length > 0
  );

  // 1. Substance Classification
  const surfactantPatterns = [
    'tab',
    'spül',
    'reiniger',
    'tensid',
    'detergen',
    'seife',
    'shampoo',
    'somat',
    'pronto',
    'finish',
    'waschmittel',
    'schaum',
    'all-in-1',
  ];
  const isSurfactant = surfactantPatterns.some((kw) => allSubstanceText.includes(kw));

  const paracetamolPatterns = [
    'paracetamol',
    'acetaminophen',
    'ben-u-ron',
    'perfalgan',
    'apap',
    'pcm',
  ];
  const isParacetamol = paracetamolPatterns.some((kw) => allSubstanceText.includes(kw));

  const amatoxinPatterns = [
    'knollenblätter',
    'amanita',
    'phalloides',
    'amatoxin',
    'pilz',
    'waldpilz',
    'champignon-verwechslung',
  ];
  const isAmatoxin = amatoxinPatterns.some((kw) => allSubstanceText.includes(kw));

  const sedativePatterns = [
    'diazepam',
    'lorazepam',
    'tavor',
    'midazolam',
    'oxazepam',
    'zolpidem',
    'zopiclon',
    'benzo',
    'valium',
    'bromazepam',
    'alprazolam',
  ];
  const isSedative = sedativePatterns.some((kw) => allSubstanceText.includes(kw));

  const opioidPatterns = [
    'morphin',
    'fentanyl',
    'oxycodon',
    'tilidin',
    'tramadol',
    'methadon',
    'buprenorphin',
    'codein',
    'heroin',
    'opioid',
    'opiat',
  ];
  const isOpioid = opioidPatterns.some((kw) => allSubstanceText.includes(kw));

  const causticPatterns = [
    'säure',
    'lauge',
    'ätz',
    'rohrreiniger',
    'abflussreiniger',
    'salzsäure',
    'schwefelsäure',
    'natronlauge',
    'kalilauge',
    'essigessenz',
  ];
  const isCaustic = causticPatterns.some((kw) => allSubstanceText.includes(kw));

  const isKnownCategory =
    isSurfactant || isParacetamol || isAmatoxin || isSedative || isOpioid || isCaustic;
  const isUnknownSubstance = hasSubstanceEntered ? (isKnownCategory ? 0 : 1) : 0;

  // 2. Exposure Routes & Tox Flag
  const standardRoutes = record.routeStandard || [];
  const parenteralRoutes = record.routeParenteral || [];

  const expoOral = standardRoutes.includes('oral') ? 1 : 0;
  const expoDermal = standardRoutes.includes('Haut') ? 1 : 0;
  const expoOcular = standardRoutes.includes('Auge') ? 1 : 0;
  const expoInhal = standardRoutes.includes('inhalativ') ? 1 : 0;
  const expoParenteral = parenteralRoutes.length > 0 ? 1 : 0;

  const expoToxFlagT = (record.substanzen || []).some((s) => s.noxeFlag === 'T') ? 1 : 0;

  // 3. Latency
  const hours = parseLatencyInHours(record.zeitWert, record.zeitEinheit);
  let latAcute = 0;
  let latSubacute = 0;
  let latDelayed = 0;
  let latUnknown = 0;

  if (hours === null) {
    latUnknown = 1;
  } else if (hours < 1.0) {
    latAcute = 1;
  } else if (hours <= 4.0) {
    latSubacute = 1;
  } else {
    latDelayed = 1;
  }

  // 4. Demographics & Biometrics
  let isChild = 0;
  let isAdolescent = 0;
  let isAdult = 0;

  const ageVal = parseFloat((record.alterWert || '').replace(',', '.'));
  if (!isNaN(ageVal)) {
    if (record.alterEinheit === 'Tage' || record.alterEinheit === 'Monate') {
      isChild = 1;
    } else if (ageVal < 13) {
      isChild = 1;
    } else if (ageVal < 18) {
      isAdolescent = 1;
    } else {
      isAdult = 1;
    }
  } else if (record.alterskategorie) {
    if (
      record.alterskategorie.includes('Neugeb') ||
      record.alterskategorie.includes('Säugling') ||
      record.alterskategorie.includes('Kleinkind') ||
      record.alterskategorie.includes('Kind')
    ) {
      isChild = 1;
    } else if (record.alterskategorie.includes('Jugend')) {
      isAdolescent = 1;
    } else if (record.alterskategorie.includes('Erwachsen')) {
      isAdult = 1;
    }
  }

  const weightVal = parseFloat((record.gewichtKg || '').replace(',', '.'));
  const hasWeight = !isNaN(weightVal) && weightVal > 0 ? 1 : 0;
  const normWeight = hasWeight ? Math.min(weightVal, 120) / 120 : 0.58; // 70kg neutral default

  // 5. Vitals & Derangements
  const gcsVal = parseFloat((record.vitalGcs || '').replace(',', '.'));
  const vitalGcsLow = (!isNaN(gcsVal) && gcsVal < 13) || anamneseText.includes('somnolent') || anamneseText.includes('koma') ? 1 : 0;

  const spo2Val = parseFloat((record.vitalSpo2 || '').replace(',', '.'));
  const vitalHypoxia = (!isNaN(spo2Val) && spo2Val < 94) || anamneseText.includes('dyspnoe') || anamneseText.includes('atemdepression') ? 1 : 0;

  const hfVal = parseFloat((record.vitalHf || '').replace(',', '.'));
  const vitalTachy = (!isNaN(hfVal) && hfVal > 105) ? 1 : 0;
  const vitalBrady = (!isNaN(hfVal) && hfVal < 55) ? 1 : 0;

  // Systolic RR parsing (e.g. '85/55' or '90')
  let vitalHypotension = 0;
  if (record.vitalRr) {
    const sysMatch = record.vitalRr.match(/^(\d+)/);
    if (sysMatch) {
      const sys = parseInt(sysMatch[1], 10);
      if (sys < 95) vitalHypotension = 1;
    }
  }

  const qtcVal = parseFloat((record.vitalQtc || '').replace(',', '.'));
  const vitalQtcProlonged = (!isNaN(qtcVal) && qtcVal > 460) ? 1 : 0;

  const phVal = parseFloat((record.vitalPh || '').replace(',', '.'));
  const vitalAcidosis = (!isNaN(phVal) && phVal < 7.32) ? 1 : 0;

  const tempVal = parseFloat((record.vitalTemp || '').replace(',', '.'));
  const vitalFever = (!isNaN(tempVal) && tempVal >= 38.2) ? 1 : 0;

  const vitalAsymptomatic = record.sympKeine ? 1 : 0;

  // 6. PSS Levels
  const pssLevel = record.pssVor || '0';
  const pss0 = pssLevel === '0' ? 1 : 0;
  const pss1 = pssLevel === '1' ? 1 : 0;
  const pss2 = pssLevel === '2' ? 1 : 0;
  const pss34 = (pssLevel === '3' || pssLevel === '4') ? 1 : 0;

  // Check data presence
  const hasSymptomOrVitalData = Boolean(
    record.sympKeine ||
    record.sympWachOrientiert ||
    record.vitalGcs?.trim() ||
    record.vitalSpo2?.trim() ||
    record.vitalHf?.trim() ||
    record.vitalRr?.trim() ||
    record.vitalPh?.trim() ||
    (record.anamneseText && record.anamneseText.trim().length > 10)
  );

  // Calculate sufficiency score (0..1)
  let sufficiency = 0;
  if (hasSubstanceEntered) sufficiency += 0.45;
  if (hasSymptomOrVitalData) sufficiency += 0.35;
  if (record.zeitWert?.trim()) sufficiency += 0.1;
  if (record.alterWert?.trim() || record.alterskategorie) sufficiency += 0.1;

  // Build ordered feature values
  const featureMap: Record<FeatureName, number> = {
    sub_surfactant_detergent: isSurfactant ? 1 : 0,
    sub_paracetamol: isParacetamol ? 1 : 0,
    sub_amatoxin_mushroom: isAmatoxin ? 1 : 0,
    sub_sedative_benzo: isSedative ? 1 : 0,
    sub_opioid: isOpioid ? 1 : 0,
    sub_caustic_acid_alkali: isCaustic ? 1 : 0,
    sub_unknown: isUnknownSubstance,

    expo_route_oral: expoOral,
    expo_route_dermal: expoDermal,
    expo_route_ocular: expoOcular,
    expo_route_inhalativ: expoInhal,
    expo_route_parenteral: expoParenteral,
    expo_tox_dose_flag_t: expoToxFlagT,

    latency_acute_under_1h: latAcute,
    latency_subacute_1_4h: latSubacute,
    latency_delayed_over_4h: latDelayed,
    latency_unknown: latUnknown,

    patient_is_child: isChild,
    patient_is_adolescent: isAdolescent,
    patient_is_adult: isAdult,
    patient_has_weight: hasWeight,
    patient_weight_kg_norm: normWeight,

    vital_gcs_low: vitalGcsLow,
    vital_hypoxia: vitalHypoxia,
    vital_tachycardia: vitalTachy,
    vital_bradycardia: vitalBrady,
    vital_hypotension: vitalHypotension,
    vital_qtc_prolonged: vitalQtcProlonged,
    vital_acidosis: vitalAcidosis,
    vital_fever: vitalFever,
    vital_asymptomatic: vitalAsymptomatic,

    pss_grade_0: pss0,
    pss_grade_1: pss1,
    pss_grade_2: pss2,
    pss_grade_3_4: pss34,
  };

  const values = FEATURE_NAMES.map((name) => featureMap[name]);

  return {
    values,
    featureNames: [...FEATURE_NAMES],
    inputSufficiencyScore: Math.min(1, Math.round(sufficiency * 100) / 100),
    hasSubstanceData: hasSubstanceEntered,
    hasSymptomOrVitalData,
  };
}
