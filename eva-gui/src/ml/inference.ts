import { EvaRecord } from '../types/eva';
import { extractFeatures, FEATURE_DESCRIPTIONS } from './features';
import {
  InferenceResult,
  ModelArtifact,
  Suggestion,
  THERAPY_TARGETS,
  TherapyTargetKey,
  ConfidenceTier,
  FeatureExplanation,
} from './types';

// Import bundled model artifact
import bundledArtifactRaw from './model_artifact.json';

export interface SuggestOptions {
  customArtifact?: ModelArtifact | null;
  minConfidence?: number;
}

function sigmoid(z: number): number {
  if (z < -30) return 0;
  if (z > 30) return 1;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Synchronous inference implementation.
 */
export function suggestSync(record: EvaRecord, options?: SuggestOptions): InferenceResult {
  const artifact: ModelArtifact | null =
    options?.customArtifact !== undefined
      ? options.customArtifact
      : (bundledArtifactRaw as unknown as ModelArtifact);

  // 1. Graceful Degradation: Check if model artifact exists and is valid
  if (!artifact || !artifact.classes || !artifact.weights || !artifact.intercepts) {
    return {
      status: 'no_model',
      modelVersion: 'none',
      suggestions: [],
      message: 'Kein gültiges ML-Modell-Artefakt geladen. Vorschläge sind deaktiviert.',
    };
  }

  // 2. Extract features
  const featureVector = extractFeatures(record);

  // 3. Insufficient Data Guardrail
  // If no substance/noxe AND no symptoms/vitals are entered, return insufficient_data
  if (!featureVector.hasSubstanceData && !featureVector.hasSymptomOrVitalData) {
    return {
      status: 'insufficient_data',
      modelVersion: artifact.version,
      suggestions: [],
      message:
        'Unzureichende Daten: Bitte erfassen Sie mindestens eine Leitsubstanz oder klinische Symptome/Vitalparameter.',
    };
  }

  const minConfidence = options?.minConfidence ?? artifact.defaultThreshold ?? 0.35;
  const suggestions: Suggestion[] = [];

  // 4. Compute predictions for each supported class
  for (const targetMeta of THERAPY_TARGETS) {
    const classKey = targetMeta.targetKey;
    const weights = artifact.weights[classKey];
    const intercept = artifact.intercepts[classKey];

    if (!weights || intercept === undefined) continue;

    // Linear score: z = b + sum(w_i * x_i)
    let z = intercept;
    const contributions: { feature: string; impact: number }[] = [];

    for (let i = 0; i < weights.length; i++) {
      const featVal = featureVector.values[i];
      const w = weights[i];
      const impact = w * featVal;
      z += impact;

      if (featVal > 0 && Math.abs(impact) >= 0.05) {
        contributions.push({
          feature: featureVector.featureNames[i],
          impact: Math.round(impact * 100) / 100,
        });
      }
    }

    const probability = sigmoid(z);

    // Filter out low confidence
    if (probability < minConfidence) continue;

    // Sort contributions by absolute impact descending
    contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    const explanations: FeatureExplanation[] = contributions.slice(0, 3).map((c) => ({
      feature: c.feature,
      description: FEATURE_DESCRIPTIONS[c.feature] || c.feature,
      impact: c.impact,
    }));

    // Confidence tier
    let tier: ConfidenceTier = 'low';
    if (probability >= 0.75) {
      tier = 'high';
    } else if (probability >= 0.50) {
      tier = 'moderate';
    }

    suggestions.push({
      therapyId: classKey,
      therapyKey: targetMeta.therapyKey,
      subOptionKey: targetMeta.subOptionKey,
      label: targetMeta.label,
      probability: Math.round(probability * 1000) / 1000,
      confidenceTier: tier,
      explanation: explanations,
    });
  }

  // Sort suggestions by probability descending
  suggestions.sort((a, b) => b.probability - a.probability);

  // 5. Low confidence status check
  if (suggestions.length === 0) {
    return {
      status: 'low_confidence',
      modelVersion: artifact.version,
      suggestions: [],
      message:
        'Keine spezifische Therapie mit ausreichender Konfidenz (>= 35%) ermittelt.',
    };
  }

  return {
    status: 'ok',
    modelVersion: artifact.version,
    suggestions,
    message: `${suggestions.length} evidenzbasierte Therapie-/Maßnahmenvorschläge generiert.`,
  };
}

/**
 * Asynchronous inference wrapper that executes off the immediate UI render cycle
 * (non-blocking) so the user interface never freezes.
 */
export async function suggest(
  record: EvaRecord,
  options?: SuggestOptions
): Promise<InferenceResult> {
  // Yield to the browser/event loop to ensure zero main-thread UI blockage
  await new Promise((resolve) => setTimeout(resolve, 0));
  return suggestSync(record, options);
}
