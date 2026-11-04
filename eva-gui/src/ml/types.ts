import { EvaRecord } from '../types/eva';

export type TherapyTargetKey =
  | 'spuelen'
  | 'fluessigkeit'
  | 'entschaeumen'
  | 'aktivkohle'
  | 'antidot_acc'
  | 'antidot_naloxon'
  | 'antidot_flumazenil'
  | 'volumen'
  | 'giftelimination_hd'
  | 'intubation'
  | 'labor'
  | 'blutspiegel'
  | 'ueberwachung'
  | 'psv';

export interface TherapyTargetMeta {
  targetKey: TherapyTargetKey;
  therapyKey: string; // key in record.therapien
  subOptionKey?: string; // sub-option key in record.therapien[key].subOptions
  label: string;
  category: 'primary' | 'antidote' | 'supportive' | 'diagnostic' | 'expert';
}

export const THERAPY_TARGETS: TherapyTargetMeta[] = [
  {
    targetKey: 'spuelen',
    therapyKey: 'spuelen',
    label: 'Spülen (Mund / Haut / Auge)',
    category: 'primary',
  },
  {
    targetKey: 'fluessigkeit',
    therapyKey: 'fluessigkeit',
    label: 'Flüssigkeit oral',
    category: 'primary',
  },
  {
    targetKey: 'entschaeumen',
    therapyKey: 'entschaeumen',
    subOptionKey: 'simeticon',
    label: 'Entschäumen (Simeticon)',
    category: 'primary',
  },
  {
    targetKey: 'aktivkohle',
    therapyKey: 'aktivkohle',
    label: 'Aktivkohle (medizinisch)',
    category: 'primary',
  },
  {
    targetKey: 'antidot_acc',
    therapyKey: 'antidot',
    subOptionKey: 'acc',
    label: 'Antidot: ACC (N-Acetylcystein)',
    category: 'antidote',
  },
  {
    targetKey: 'antidot_naloxon',
    therapyKey: 'antidot',
    subOptionKey: 'naloxon',
    label: 'Antidot: Naloxon',
    category: 'antidote',
  },
  {
    targetKey: 'antidot_flumazenil',
    therapyKey: 'antidot',
    subOptionKey: 'flumazenil',
    label: 'Antidot: Flumazenil',
    category: 'antidote',
  },
  {
    targetKey: 'volumen',
    therapyKey: 'volumen',
    label: 'Volumentherapie i.v.',
    category: 'supportive',
  },
  {
    targetKey: 'giftelimination_hd',
    therapyKey: 'giftelimination',
    subOptionKey: 'hd',
    label: 'sek. Giftelimination (Hämodialyse)',
    category: 'supportive',
  },
  {
    targetKey: 'intubation',
    therapyKey: 'intubation',
    label: 'Intubation / Beatmung',
    category: 'supportive',
  },
  {
    targetKey: 'labor',
    therapyKey: 'labor',
    label: 'Labor (Routine / E-Lyte / Organe)',
    category: 'diagnostic',
  },
  {
    targetKey: 'blutspiegel',
    therapyKey: 'blutspiegel',
    subOptionKey: 'noxe',
    label: 'Blutspiegel (Tox-Screening / Noxe)',
    category: 'diagnostic',
  },
  {
    targetKey: 'ueberwachung',
    therapyKey: 'ueberwachung',
    label: 'Klinische Überwachung',
    category: 'diagnostic',
  },
  {
    targetKey: 'psv',
    therapyKey: 'psv',
    label: 'Pilzsachverständige (PSV) hinzuziehen',
    category: 'expert',
  },
];

export interface FeatureVector {
  // Numeric feature values (indexed in order matching FEATURE_NAMES)
  values: number[];
  featureNames: string[];
  inputSufficiencyScore: number; // 0..1
  hasSubstanceData: boolean;
  hasSymptomOrVitalData: boolean;
}

export interface FeatureExplanation {
  feature: string;
  description: string;
  impact: number; // weight * featureValue
}

export type ConfidenceTier = 'high' | 'moderate' | 'low';

export interface Suggestion {
  therapyId: TherapyTargetKey;
  therapyKey: string;
  subOptionKey?: string;
  label: string;
  probability: number; // 0..1
  confidenceTier: ConfidenceTier;
  explanation: FeatureExplanation[];
}

export type InferenceStatus = 'ok' | 'insufficient_data' | 'low_confidence' | 'no_model';

export interface InferenceResult {
  status: InferenceStatus;
  modelVersion: string;
  suggestions: Suggestion[];
  message: string;
}

export interface ModelArtifact {
  version: string;
  trainedAt: string;
  dataVersion: string;
  seed: number;
  featureNames: string[];
  thresholds: Record<TherapyTargetKey, number>;
  defaultThreshold: number;
  classes: TherapyTargetKey[];
  // For each class: weights array matching featureNames and intercept scalar
  weights: Record<TherapyTargetKey, number[]>;
  intercepts: Record<TherapyTargetKey, number>;
  metrics: {
    datasetSize: number;
    trainSize: number;
    valSize: number;
    testSize: number;
    top1Accuracy: number;
    top3Accuracy: number;
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
    brierScore: number;
    perClassMetrics: Record<
      string,
      {
        precision: number;
        recall: number;
        f1: number;
        support: number;
      }
    >;
  };
}
