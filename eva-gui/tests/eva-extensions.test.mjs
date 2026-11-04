import test from 'node:test';
import assert from 'node:assert/strict';

// Import modules under test
import { SECTION_CONFIGS, truncateText } from '../src/lib/sectionConfig.ts';
import { extractFeatures, FEATURE_NAMES } from '../src/ml/features.ts';
import { suggestSync } from '../src/ml/inference.ts';
import { sampleCases, createEmptyRecord } from '../src/data/sampleCases.ts';

test('Feature 1: truncateText utility', () => {
  assert.equal(truncateText('Hello', 10), 'Hello');
  assert.equal(truncateText('12345678901', 10), '123456789…');
  assert.equal(truncateText('', 10), '');
  assert.equal(truncateText(null, 10), '');
  assert.equal(truncateText(undefined, 10), '');
});

test('Feature 1: Section completion validation on empty record', () => {
  const empty = createEmptyRecord();

  // On an empty record, mandatory fields are missing
  const metaVal = SECTION_CONFIGS['sec-metadata'].validate(empty);
  assert.equal(metaVal.isComplete, false, 'sec-metadata should be incomplete initially');
  assert.equal(metaVal.errors.length, 0);

  const ptVal = SECTION_CONFIGS['sec-patient'].validate(empty);
  assert.equal(ptVal.isComplete, false, 'sec-patient should be incomplete initially');

  const noxeVal = SECTION_CONFIGS['sec-noxe'].validate(empty);
  assert.equal(noxeVal.isComplete, false, 'sec-noxe should be incomplete initially');

  const subVal = SECTION_CONFIGS['sec-substanzen'].validate(empty);
  assert.equal(subVal.isComplete, false, 'sec-substanzen should be incomplete initially');

  const pssVal = SECTION_CONFIGS['sec-pss'].validate(empty);
  assert.equal(pssVal.isComplete, false, 'sec-pss should be incomplete initially');
});

test('Feature 1: Validation errors block completion and auto-collapse', () => {
  const record = createEmptyRecord();
  record.patientName = 'Test Patient';
  record.alterWert = '-5'; // Negative age -> Error!
  record.geschlecht = 'm';

  const ptVal = SECTION_CONFIGS['sec-patient'].validate(record);
  assert.equal(ptVal.isComplete, false, 'Should not be complete when errors exist');
  assert.ok(ptVal.errors.length > 0, 'Should have validation errors');
  assert.ok(ptVal.errors[0].includes('nicht negativ'));

  // Invalid non-numeric age
  record.alterWert = 'ungueltig';
  const ptVal2 = SECTION_CONFIGS['sec-patient'].validate(record);
  assert.equal(ptVal2.isComplete, false);
  assert.ok(ptVal2.errors.some((e) => e.includes('gültige Zahl')));

  // Negative weight
  record.alterWert = '25';
  record.gewichtKg = '-10';
  const ptVal3 = SECTION_CONFIGS['sec-patient'].validate(record);
  assert.equal(ptVal3.isComplete, false);
  assert.ok(ptVal3.errors.some((e) => e.includes('Körpergewicht muss positiv')));

  // Vital derangement errors (e.g. invalid GCS)
  const vitRecord = createEmptyRecord();
  vitRecord.vitalGcs = '18'; // GCS > 15
  const vitVal = SECTION_CONFIGS['sec-vitals'].validate(vitRecord);
  assert.equal(vitVal.isComplete, false);
  assert.ok(vitVal.errors.some((e) => e.includes('GCS muss zwischen 3 und 15')));

  // Invalid negative SpO2
  vitRecord.vitalGcs = '15';
  vitRecord.vitalSpo2 = '110';
  const vitVal2 = SECTION_CONFIGS['sec-vitals'].validate(vitRecord);
  assert.equal(vitVal2.isComplete, false);
  assert.ok(vitVal2.errors.some((e) => e.includes('SpO2')));
});

test('Feature 1: Section summary generation handles empty and filled fields', () => {
  const empty = createEmptyRecord();
  const emptyMetaSum = SECTION_CONFIGS['sec-metadata'].summarize(empty);
  // Optional empty caller name/contact should be omitted
  assert.ok(!emptyMetaSum.some((item) => item.label === 'Anrufer'));

  // Sample case 1 summary
  const fall1Record = { ...empty, ...sampleCases.fall1.data };
  const ptSum = SECTION_CONFIGS['sec-patient'].summarize(fall1Record);
  assert.ok(ptSum.some((item) => item.label === 'Patient' && item.value.includes('Schneider')));
  assert.ok(ptSum.some((item) => item.label === 'Alter' && item.value.includes('2')));
  assert.ok(ptSum.some((item) => item.label === 'Gewicht' && item.value.includes('13.5')));

  // Noxe summary
  const subSum = SECTION_CONFIGS['sec-substanzen'].summarize(fall1Record);
  assert.ok(subSum.some((item) => item.label === 'Leitnoxe' && item.value.includes('Somat')));

  // String elision on long text
  const longRecord = createEmptyRecord();
  longRecord.anamneseText = 'A'.repeat(120);
  const anamSum = SECTION_CONFIGS['sec-anamnese'].summarize(longRecord);
  assert.ok(anamSum[0].value.endsWith('…'), 'Should elide overly long text with ellipsis');
  assert.ok(anamSum[0].value.length <= 80);
});

test('Feature 2: Feature pipeline extraction and missing value neutrality', () => {
  const empty = createEmptyRecord();
  const fvEmpty = extractFeatures(empty);

  assert.equal(fvEmpty.values.length, FEATURE_NAMES.length);
  assert.equal(fvEmpty.hasSubstanceData, false);
  assert.equal(fvEmpty.hasSymptomOrVitalData, true); // sympWachOrientiert defaults to true
  assert.ok(fvEmpty.inputSufficiencyScore < 0.6);

  // Fall 1: Surfactant Dish Tab
  const fall1Record = { ...empty, ...sampleCases.fall1.data };
  const fv1 = extractFeatures(fall1Record);
  assert.equal(fv1.hasSubstanceData, true);
  assert.equal(fv1.hasSymptomOrVitalData, true);

  const surfactantIdx = FEATURE_NAMES.indexOf('sub_surfactant_detergent');
  assert.equal(fv1.values[surfactantIdx], 1, 'Should detect surfactant detergent token');

  const childIdx = FEATURE_NAMES.indexOf('patient_is_child');
  assert.equal(fv1.values[childIdx], 1, 'Should categorize 2yo as child');

  // Fall 2: Paracetamol
  const fall2Record = { ...empty, ...sampleCases.fall2.data };
  const fv2 = extractFeatures(fall2Record);
  const pcmIdx = FEATURE_NAMES.indexOf('sub_paracetamol');
  assert.equal(fv2.values[pcmIdx], 1, 'Should detect paracetamol token');

  const toxFlagIdx = FEATURE_NAMES.indexOf('expo_tox_dose_flag_t');
  assert.equal(fv2.values[toxFlagIdx], 1, 'Should detect tox dose flag T');

  // Fall 3: Amanita Mushroom
  const fall3Record = { ...empty, ...sampleCases.fall3.data };
  const fv3 = extractFeatures(fall3Record);
  const amanitaIdx = FEATURE_NAMES.indexOf('sub_amatoxin_mushroom');
  assert.equal(fv3.values[amanitaIdx], 1, 'Should detect amatoxin mushroom token');

  const delayedIdx = FEATURE_NAMES.indexOf('latency_delayed_over_4h');
  assert.equal(fv3.values[delayedIdx], 1, 'Should detect 14h latency as delayed >4h');
});

test('Feature 2: Inference Interface — High confidence predictions for Sample Cases', () => {
  const empty = createEmptyRecord();

  // Fall 1: Ingestion of dishwasher tab by toddler
  const fall1Record = { ...empty, ...sampleCases.fall1.data };
  const res1 = suggestSync(fall1Record);
  assert.equal(res1.status, 'ok');
  assert.ok(res1.suggestions.length > 0);

  const sugIds1 = res1.suggestions.map((s) => s.therapyId);
  assert.ok(sugIds1.includes('spuelen'), 'Should suggest spuelen for detergent ingestion');
  assert.ok(sugIds1.includes('entschaeumen'), 'Should suggest entschaeumen for detergent tab');

  // Check explanation impact
  const entSugg = res1.suggestions.find((s) => s.therapyId === 'entschaeumen');
  assert.ok(entSugg.explanation.length > 0);
  assert.ok(entSugg.explanation.some((e) => e.feature === 'sub_surfactant_detergent'));

  // Fall 2: Suicidal Paracetamol
  const fall2Record = { ...empty, ...sampleCases.fall2.data };
  const res2 = suggestSync(fall2Record);
  assert.equal(res2.status, 'ok');
  const sugIds2 = res2.suggestions.map((s) => s.therapyId);
  assert.ok(sugIds2.includes('antidot_acc'), 'Should recommend antidote ACC for paracetamol intoxication');
  assert.ok(sugIds2.includes('labor'), 'Should recommend labor');
  assert.ok(sugIds2.includes('blutspiegel'), 'Should recommend blutspiegel');

  // Fall 3: Amanita phalloides
  const fall3Record = { ...empty, ...sampleCases.fall3.data };
  const res3 = suggestSync(fall3Record);
  assert.equal(res3.status, 'ok');
  const sugIds3 = res3.suggestions.map((s) => s.therapyId);
  assert.ok(sugIds3.includes('psv'), 'Should recommend Pilzsachverständige (PSV) for mushroom intoxication');
  assert.ok(sugIds3.includes('volumen'), 'Should recommend fluid replacement volumen for Amanita dehydration');
});

test('Feature 2: Inference Interface — Insufficient data guardrail', () => {
  const blankRecord = createEmptyRecord();
  blankRecord.sympKeine = false;
  blankRecord.sympWachOrientiert = false;
  blankRecord.vitalGcs = '';
  blankRecord.vitalSpo2 = '';
  blankRecord.vitalHf = '';
  blankRecord.vitalRr = '';
  blankRecord.vitalPh = '';
  blankRecord.anamneseText = '';
  blankRecord.substanzen = [];

  const res = suggestSync(blankRecord);
  assert.equal(res.status, 'insufficient_data');
  assert.equal(res.suggestions.length, 0);
  assert.ok(res.message.includes('Unzureichende Daten'));
});

test('Feature 2: Inference Interface — Low confidence guardrail', () => {
  const empty = createEmptyRecord();
  // Provide mild nonspecific data that does not trigger high confidence
  empty.substanzen[0] = {
    id: 1,
    noxeName: 'Kochsalz 1 Prise',
    expoFlag: 'G',
    noxeFlag: 'N',
    mengeVal: '0.1g',
    mengeFlag: 'G',
  };
  empty.sympKeine = true;

  // Set minConfidence artificially high to verify low_confidence fallback
  const res = suggestSync(empty, { minConfidence: 0.999 });
  assert.equal(res.status, 'low_confidence');
  assert.equal(res.suggestions.length, 0);
  assert.ok(res.message.includes('Keine spezifische Therapie'));
});

test('Feature 2: Inference Interface — Graceful degradation without model (no_model)', () => {
  const empty = createEmptyRecord();
  const res = suggestSync(empty, { customArtifact: null });
  assert.equal(res.status, 'no_model');
  assert.equal(res.suggestions.length, 0);
  assert.ok(res.message.includes('Kein gültiges ML-Modell'));
});
