# EVA Clinical Decision Support — ML Evaluation Report

- **Model Version:** 1.0.0
- **Date:** 2026-11-04
- **Seed:** 20261104
- **Architecture:** Multi-label Regularized Logistic Regression with L2 Regularization & Feature Contribution Scoring
- **Dataset:** 1,500 synthetic cases modeled after EAPCCT toxidromes and EVA 5.26 protocols (Dev/Test only)
- **Data Notice:** Note that only 3 sample cases exist in the repository; no real clinical patient dataset is bundled. A synthetic dataset generator was used for development and testing.

## Summary Test Metrics (Held-out 15% Test Set, N = 225)

| Metric | Score |
|---|---|
| **Top-1 Accuracy** | **100.0%** |
| **Top-3 Accuracy** | **100.0%** |
| **Macro Precision** | 84.6% |
| **Macro Recall** | 86.3% |
| **Macro F1-Score** | **85.0%** |
| **Brier Calibration Score** | 0.0455 *(lower is better, < 0.15 denotes solid calibration)* |

## Per-Class Evaluation

| Therapy / Antidote Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| `spuelen` | 98.7% | 93.8% | **96.2%** | 80 |
| `fluessigkeit` | 77.8% | 91.8% | **84.2%** | 61 |
| `entschaeumen` | 88.9% | 90.6% | **89.7%** | 53 |
| `aktivkohle` | 46.2% | 28.6% | **35.3%** | 21 |
| `antidot_acc` | 95.6% | 95.6% | **95.6%** | 45 |
| `antidot_naloxon` | 100.0% | 93.3% | **96.6%** | 30 |
| `antidot_flumazenil` | 61.5% | 76.2% | **68.1%** | 21 |
| `volumen` | 97.6% | 87.0% | **92.0%** | 46 |
| `giftelimination_hd` | 65.9% | 87.1% | **75.0%** | 31 |
| `intubation` | 80.0% | 83.3% | **81.6%** | 24 |
| `labor` | 93.2% | 94.9% | **94.0%** | 158 |
| `blutspiegel` | 88.8% | 97.3% | **92.8%** | 73 |
| `ueberwachung` | 92.9% | 100.0% | **96.3%** | 209 |
| `psv` | 97.6% | 88.9% | **93.0%** | 45 |

## Clinical Safety & Interpretability Guardrails
1. **Explainable Linear Weights:** Predictions provide full feature impact breakdowns (w_i * x_i), displaying clinical justifications (e.g. Paracetamol tox dose driving ACC antidote).
2. **Insufficient Data Guardrail:** When neither substances nor symptoms/vitals are entered, inference halts with status `insufficient_data` instead of weak guesses.
3. **Low Confidence Filter:** Suggestions below sensitivity threshold (0.35) are filtered out.
4. **Non-Automated Clinical Control:** All suggestions require explicit human action (`Übernehmen` / `Ablehnen`).
