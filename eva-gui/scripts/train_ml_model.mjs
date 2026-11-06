import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SEED = 20261104;
function createRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(SEED);

const CLASSES = [
  'spuelen',
  'fluessigkeit',
  'entschaeumen',
  'aktivkohle',
  'antidot_acc',
  'antidot_naloxon',
  'antidot_flumazenil',
  'volumen',
  'giftelimination_hd',
  'intubation',
  'labor',
  'blutspiegel',
  'ueberwachung',
  'psv',
];

const FEATURE_NAMES = [
  'sub_surfactant_detergent',
  'sub_paracetamol',
  'sub_amatoxin_mushroom',
  'sub_sedative_benzo',
  'sub_opioid',
  'sub_caustic_acid_alkali',
  'sub_unknown',

  'expo_route_oral',
  'expo_route_dermal',
  'expo_route_ocular',
  'expo_route_inhalativ',
  'expo_route_parenteral',
  'expo_tox_dose_flag_t',

  'latency_acute_under_1h',
  'latency_subacute_1_4h',
  'latency_delayed_over_4h',
  'latency_unknown',

  'patient_is_child',
  'patient_is_adolescent',
  'patient_is_adult',
  'patient_has_weight',
  'patient_weight_kg_norm',

  'vital_gcs_low',
  'vital_hypoxia',
  'vital_tachycardia',
  'vital_bradycardia',
  'vital_hypotension',
  'vital_qtc_prolonged',
  'vital_acidosis',
  'vital_fever',
  'vital_asymptomatic',

  'pss_grade_0',
  'pss_grade_1',
  'pss_grade_2',
  'pss_grade_3_4',
];

function generateSyntheticDataset(n = 1500) {
  const dataset = [];

  for (let i = 0; i < n; i++) {
    const r = rng();
    const f = Object.fromEntries(FEATURE_NAMES.map((k) => [k, 0]));
    const y = Object.fromEntries(CLASSES.map((k) => [k, 0]));

    if (r < 0.22) {
      // Scenario 1: Detergent / Surfactant (Kleinkind Spültab, Seife, All-in-1)
      f.sub_surfactant_detergent = 1;
      f.expo_route_oral = 1;
      if (rng() < 0.25) f.expo_route_ocular = 1;
      if (rng() < 0.2) f.expo_route_dermal = 1;
      f.patient_is_child = rng() < 0.85 ? 1 : 0;
      f.patient_is_adult = f.patient_is_child ? 0 : 1;
      f.patient_has_weight = 1;
      f.patient_weight_kg_norm = f.patient_is_child ? 0.12 + rng() * 0.15 : 0.6 + rng() * 0.2;
      f.latency_acute_under_1h = rng() < 0.8 ? 1 : 0;
      f.latency_subacute_1_4h = f.latency_acute_under_1h ? 0 : 1;
      f.pss_grade_1 = 1;
      y.spuelen = 1;
      y.fluessigkeit = rng() < 0.9 ? 1 : 0;
      y.entschaeumen = 1;
      y.ueberwachung = rng() < 0.75 ? 1 : 0;
    } else if (r < 0.44) {
      // Scenario 2: Paracetamol Overdose
      f.sub_paracetamol = 1;
      f.expo_route_oral = 1;
      f.expo_tox_dose_flag_t = rng() < 0.8 ? 1 : 0;
      f.patient_is_adolescent = rng() < 0.45 ? 1 : 0;
      f.patient_is_adult = f.patient_is_adolescent ? 0 : (rng() < 0.85 ? 1 : 0);
      f.patient_is_child = (!f.patient_is_adolescent && !f.patient_is_adult) ? 1 : 0;
      f.patient_has_weight = 1;
      f.patient_weight_kg_norm = 0.45 + rng() * 0.35;
      const latR = rng();
      if (latR < 0.3) f.latency_acute_under_1h = 1;
      else if (latR < 0.7) f.latency_subacute_1_4h = 1;
      else f.latency_delayed_over_4h = 1;
      f.pss_grade_2 = rng() < 0.7 ? 1 : 0;
      f.pss_grade_3_4 = f.pss_grade_2 ? 0 : 1;
      y.labor = 1;
      y.blutspiegel = 1;
      if (f.expo_tox_dose_flag_t || f.latency_subacute_1_4h || f.latency_delayed_over_4h) {
        y.antidot_acc = 1;
      }
      if (f.latency_acute_under_1h && rng() < 0.75) {
        y.aktivkohle = 1;
      }
      y.ueberwachung = 1;
    } else if (r < 0.60) {
      // Scenario 3: Amanita / Green Death Cap
      f.sub_amatoxin_mushroom = 1;
      f.expo_route_oral = 1;
      f.expo_tox_dose_flag_t = 1;
      f.patient_is_adult = rng() < 0.8 ? 1 : 0;
      f.patient_is_child = f.patient_is_adult ? 0 : 1;
      f.patient_has_weight = 1;
      f.patient_weight_kg_norm = 0.55 + rng() * 0.3;
      f.latency_delayed_over_4h = 1;
      f.pss_grade_3_4 = 1;
      f.vital_tachycardia = rng() < 0.7 ? 1 : 0;
      f.vital_hypotension = rng() < 0.65 ? 1 : 0;
      f.vital_acidosis = rng() < 0.5 ? 1 : 0;
      y.psv = 1;
      y.labor = 1;
      y.volumen = 1;
      y.giftelimination_hd = rng() < 0.65 ? 1 : 0;
      y.ueberwachung = 1;
    } else if (r < 0.75) {
      // Scenario 4: Sedatives / Benzodiazepines
      f.sub_sedative_benzo = 1;
      f.expo_route_oral = 1;
      f.patient_is_adult = rng() < 0.75 ? 1 : 0;
      f.patient_is_adolescent = f.patient_is_adult ? 0 : 1;
      f.patient_has_weight = 1;
      f.patient_weight_kg_norm = 0.5 + rng() * 0.3;
      if (rng() < 0.5) f.latency_acute_under_1h = 1;
      else f.latency_subacute_1_4h = 1;
      f.vital_gcs_low = rng() < 0.8 ? 1 : 0;
      f.vital_bradycardia = rng() < 0.4 ? 1 : 0;
      f.pss_grade_2 = rng() < 0.7 ? 1 : 0;
      f.pss_grade_3_4 = f.pss_grade_2 ? 0 : 1;
      y.labor = 1;
      y.blutspiegel = rng() < 0.7 ? 1 : 0;
      y.ueberwachung = 1;
      if (f.vital_gcs_low && rng() < 0.7) {
        y.antidot_flumazenil = 1;
      }
      if (f.latency_acute_under_1h && rng() < 0.6) {
        y.aktivkohle = 1;
      }
      if (f.pss_grade_3_4 && f.vital_gcs_low && rng() < 0.4) {
        y.intubation = 1;
      }
    } else if (r < 0.88) {
      // Scenario 5: Opioids
      f.sub_opioid = 1;
      f.expo_route_oral = rng() < 0.6 ? 1 : 0;
      f.expo_route_parenteral = f.expo_route_oral ? 0 : 1;
      f.patient_is_adult = 1;
      f.patient_has_weight = 1;
      f.patient_weight_kg_norm = 0.58;
      f.latency_acute_under_1h = rng() < 0.7 ? 1 : 0;
      f.latency_subacute_1_4h = f.latency_acute_under_1h ? 0 : 1;
      f.vital_gcs_low = 1;
      f.vital_hypoxia = rng() < 0.85 ? 1 : 0;
      f.vital_bradycardia = rng() < 0.6 ? 1 : 0;
      f.pss_grade_3_4 = 1;
      y.antidot_naloxon = 1;
      y.ueberwachung = 1;
      y.labor = 1;
      if (f.vital_hypoxia && rng() < 0.65) {
        y.intubation = 1;
      }
    } else {
      // Scenario 6: Caustic / Unknown
      const isCaustic = rng() < 0.6;
      if (isCaustic) {
        f.sub_caustic_acid_alkali = 1;
      } else {
        f.sub_unknown = 1;
      }
      if (rng() < 0.5) f.expo_route_oral = 1;
      if (rng() < 0.4) f.expo_route_ocular = 1;
      if (rng() < 0.4) f.expo_route_dermal = 1;
      f.patient_is_adult = rng() < 0.6 ? 1 : 0;
      f.patient_is_child = f.patient_is_adult ? 0 : 1;
      f.latency_acute_under_1h = 1;
      f.pss_grade_1 = rng() < 0.5 ? 1 : 0;
      f.pss_grade_2 = f.pss_grade_1 ? 0 : 1;
      y.spuelen = 1;
      if (f.expo_route_oral) {
        y.fluessigkeit = 1;
      }
      y.ueberwachung = 1;
      y.labor = rng() < 0.5 ? 1 : 0;
    }

    for (const c of CLASSES) {
      if (rng() < 0.02) y[c] = y[c] === 1 ? 0 : 1;
    }

    dataset.push({
      features: FEATURE_NAMES.map((k) => f[k]),
      labels: CLASSES.map((c) => y[c]),
    });
  }

  return dataset;
}

function sigmoid(z) {
  if (z < -30) return 0;
  if (z > 30) return 1;
  return 1 / (1 + Math.exp(-z));
}

function trainLogisticRegression(X, y, l2 = 0.001, lr = 0.15, epochs = 200) {
  const n = X.length;
  const numFeatures = X[0].length;
  let weights = new Array(numFeatures).fill(0);
  let intercept = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array(numFeatures).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i++) {
      let z = intercept;
      const xi = X[i];
      for (let j = 0; j < numFeatures; j++) {
        z += weights[j] * xi[j];
      }
      const pred = sigmoid(z);
      const err = pred - y[i];

      for (let j = 0; j < numFeatures; j++) {
        gradW[j] += err * xi[j];
      }
      gradB += err;
    }

    for (let j = 0; j < numFeatures; j++) {
      weights[j] -= lr * (gradW[j] / n + l2 * weights[j]);
    }
    intercept -= lr * (gradB / n);
  }

  return { weights, intercept };
}

function predictProb(x, weights, intercept) {
  let z = intercept;
  for (let j = 0; j < weights.length; j++) {
    z += weights[j] * x[j];
  }
  return sigmoid(z);
}

function run() {
  console.log('[train_ml_model] Starting EVA ML Synthetic Data Generation & Model Training...');
  console.log(`[train_ml_model] Seed: ${SEED}`);

  const dataset = generateSyntheticDataset(1500);

  const nTrain = Math.floor(dataset.length * 0.70);
  const nVal = Math.floor(dataset.length * 0.15);
  const nTest = dataset.length - nTrain - nVal;

  const trainSet = dataset.slice(0, nTrain);
  const valSet = dataset.slice(nTrain, nTrain + nVal);
  const testSet = dataset.slice(nTrain + nVal);

  console.log(`[train_ml_model] Split: ${trainSet.length} train / ${valSet.length} val / ${testSet.length} test`);

  const XTrain = trainSet.map((d) => d.features);

  const modelWeights = {};
  const modelIntercepts = {};
  const modelThresholds = {};

  CLASSES.forEach((c) => {
    modelThresholds[c] = 0.35;
  });

  for (let ci = 0; ci < CLASSES.length; ci++) {
    const c = CLASSES[ci];
    const yTrain = trainSet.map((d) => d.labels[ci]);
    const { weights, intercept } = trainLogisticRegression(XTrain, yTrain);
    modelWeights[c] = weights.map((w) => Math.round(w * 10000) / 10000);
    modelIntercepts[c] = Math.round(intercept * 10000) / 10000;
  }

  console.log('[train_ml_model] Evaluating model on test set...');
  let totalBrier = 0;
  let brierCount = 0;
  const perClassMetrics = {};
  let macroPrecSum = 0;
  let macroRecSum = 0;
  let macroF1Sum = 0;
  let top1Correct = 0;
  let top3Correct = 0;

  for (let ci = 0; ci < CLASSES.length; ci++) {
    const c = CLASSES[ci];
    const weights = modelWeights[c];
    const intercept = modelIntercepts[c];
    const thresh = modelThresholds[c];

    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;
    let support = 0;

    for (let i = 0; i < testSet.length; i++) {
      const x = testSet[i].features;
      const actual = testSet[i].labels[ci];
      const prob = predictProb(x, weights, intercept);

      totalBrier += Math.pow(prob - actual, 2);
      brierCount++;

      if (actual === 1) support++;

      const predicted = prob >= thresh ? 1 : 0;
      if (predicted === 1 && actual === 1) tp++;
      else if (predicted === 1 && actual === 0) fp++;
      else if (predicted === 0 && actual === 1) fn++;
      else tn++;
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    perClassMetrics[c] = {
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      f1: Math.round(f1 * 1000) / 1000,
      support,
    };

    macroPrecSum += precision;
    macroRecSum += recall;
    macroF1Sum += f1;
  }

  for (let i = 0; i < testSet.length; i++) {
    const x = testSet[i].features;
    const actuals = testSet[i].labels;

    const classScores = CLASSES.map((c, ci) => ({
      class: c,
      ci,
      prob: predictProb(x, modelWeights[c], modelIntercepts[c]),
      actual: actuals[ci],
    }));

    classScores.sort((a, b) => b.prob - a.prob);

    if (classScores[0].actual === 1) {
      top1Correct++;
    }

    if (classScores.slice(0, 3).some((s) => s.actual === 1)) {
      top3Correct++;
    }
  }

  const macroPrecision = Math.round((macroPrecSum / CLASSES.length) * 1000) / 1000;
  const macroRecall = Math.round((macroRecSum / CLASSES.length) * 1000) / 1000;
  const macroF1 = Math.round((macroF1Sum / CLASSES.length) * 1000) / 1000;
  const brierScore = Math.round((totalBrier / brierCount) * 10000) / 10000;
  const top1Accuracy = Math.round((top1Correct / testSet.length) * 1000) / 1000;
  const top3Accuracy = Math.round((top3Correct / testSet.length) * 1000) / 1000;

  console.log(`[train_ml_model] Top-1: ${(top1Accuracy * 100).toFixed(1)}% | Top-3: ${(top3Accuracy * 100).toFixed(1)}%`);
  console.log(`[train_ml_model] Macro F1: ${(macroF1 * 100).toFixed(1)}% | Brier: ${brierScore}`);

  const artifact = {
    version: '1.0.0',
    trainedAt: '2026-11-04T12:00:00Z',
    dataVersion: 'synthetic-v1.0-1500cases',
    seed: SEED,
    featureNames: FEATURE_NAMES,
    classes: CLASSES,
    defaultThreshold: 0.35,
    thresholds: modelThresholds,
    weights: modelWeights,
    intercepts: modelIntercepts,
    metrics: {
      datasetSize: dataset.length,
      trainSize: trainSet.length,
      valSize: valSet.length,
      testSize: testSet.length,
      top1Accuracy,
      top3Accuracy,
      macroPrecision,
      macroRecall,
      macroF1,
      brierScore,
      perClassMetrics,
    },
  };

  const artifactPath = path.join(projectRoot, 'src', 'ml', 'model_artifact.json');
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8');
  console.log(`[train_ml_model] Saved model artifact to ${artifactPath}`);

  const docsDir = path.join(projectRoot, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const reportPath = path.join(docsDir, 'ml-evaluation-report.md');
  const perClassRows = CLASSES.map((c) =>
    `| \`${c}\` | ${(perClassMetrics[c].precision * 100).toFixed(1)}% | ${(perClassMetrics[c].recall * 100).toFixed(1)}% | **${(perClassMetrics[c].f1 * 100).toFixed(1)}%** | ${perClassMetrics[c].support} |`
  ).join('\n');

  const reportContent = [
    '# EVA Clinical Decision Support — ML Evaluation Report',
    '',
    `- **Model Version:** ${artifact.version}`,
    `- **Date:** 2026-11-04`,
    `- **Seed:** ${SEED}`,
    `- **Architecture:** Multi-label Regularized Logistic Regression with L2 Regularization & Feature Contribution Scoring`,
    `- **Dataset:** 1,500 synthetic cases modeled after EAPCCT toxidromes and EVA 5.26 protocols (Dev/Test only)`,
    `- **Data Notice:** Note that only 3 sample cases exist in the repository; no real clinical patient dataset is bundled. A synthetic dataset generator was used for development and testing.`,
    '',
    `## Summary Test Metrics (Held-out 15% Test Set, N = ${testSet.length})`,
    '',
    '| Metric | Score |',
    '|---|---|',
    `| **Top-1 Accuracy** | **${(top1Accuracy * 100).toFixed(1)}%** |`,
    `| **Top-3 Accuracy** | **${(top3Accuracy * 100).toFixed(1)}%** |`,
    `| **Macro Precision** | ${(macroPrecision * 100).toFixed(1)}% |`,
    `| **Macro Recall** | ${(macroRecall * 100).toFixed(1)}% |`,
    `| **Macro F1-Score** | **${(macroF1 * 100).toFixed(1)}%** |`,
    `| **Brier Calibration Score** | ${brierScore} *(lower is better, < 0.15 denotes solid calibration)* |`,
    '',
    '## Per-Class Evaluation',
    '',
    '| Therapy / Antidote Class | Precision | Recall | F1-Score | Support |',
    '|---|---|---|---|---|',
    perClassRows,
    '',
    '## Clinical Safety & Interpretability Guardrails',
    '1. **Explainable Linear Weights:** Predictions provide full feature impact breakdowns (w_i * x_i), displaying clinical justifications (e.g. Paracetamol tox dose driving ACC antidote).',
    '2. **Insufficient Data Guardrail:** When neither substances nor symptoms/vitals are entered, inference halts with status `insufficient_data` instead of weak guesses.',
    '3. **Low Confidence Filter:** Suggestions below sensitivity threshold (0.35) are filtered out.',
    '4. **Non-Automated Clinical Control:** All suggestions require explicit human action (`Übernehmen` / `Ablehnen`).',
    '',
  ].join('\n');

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`[train_ml_model] Saved evaluation report to ${reportPath}`);
}

run();