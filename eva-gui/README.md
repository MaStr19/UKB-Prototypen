# EVA-GUI – Giftinformationszentrum (GIZ) Bonn EVA-Protokoll 5.26

Modernes, reaktives toxikologisches Arbeits-Cockpit und Dokumentationssystem für das Giftinformationszentrum Bonn (Informationszentrale gegen Vergiftungen am Universitätsklinikum Bonn) basierend auf dem **EVA-Protokoll 5.26**.

Entwickelt mit **Next.js 16 (App Router + Turbopack)**, **React 19**, **TypeScript** und **Tailwind CSS**.

---

## Inhaltsverzeichnis
- [1. Feature 1: Collapsible Subcategories with Summary View](#1-feature-1-collapsible-subcategories-with-summary-view)
- [2. Feature 2: ML Therapy Suggestions (Clinical Decision Support)](#2-feature-2-ml-therapy-suggestions-clinical-decision-support)
- [3. Schnellstart & Befehle](#3-schnellstart--befehle)
- [4. Model-Artefakt aktualisieren oder austauschen](#4-model-artefakt-aktualisieren-oder-austauschen)
- [5. Tastenkombinationen (Keyboard Shortcuts)](#5-tastenkombinationen-keyboard-shortcuts)
- [6. Projektstruktur](#6-projektstruktur)

---

## 1. Feature 1: Collapsible Subcategories with Summary View

Um in akuten Giftnotruf-Situationen visuelle Überlastung zu minimieren und maximale Ergonomie zu bieten, implementiert das System einklappbare Sektionskarten mit kompakter Zusammenfassungsansicht (*Collapsible Section Pattern*).

### Kernkomponenten & Architektur
- **Zentrales Regelwerk (`src/lib/sectionConfig.ts`):** Jede der 9 Sektionen besitzt deterministische Validierungs- und Extraktionsregeln (`validate(record)`, `summarize(record)`).
- **Collapsible Section Component (`src/components/CollapsibleSection.tsx`):** Reusable UI-Container mit Card-Header, Badge, Status-Icons (Fehler, Warnungen, Vollständig), Schnell-Aktionen ("Abschließen", "Bearbeiten", "Aufklappen") und kompakter Key-Value-Pill-Zusammenfassung im eingeklappten Zustand.
- **Kompakte Zusammenfassungsansicht (Summary Badges):** Im eingeklappten Zustand rendert die Karte ein horizontales Grid aus farbkodierten Pills mit den wichtigsten klinischen Parametern (z. B. Patient, Alter, Vitalwerte, PSS). Textfelder werden mit `truncateText()` auf maximal 60 Zeichen lesbar gekürzt.

### Validierungsregeln & Status
Jede Sektion evaluiert ihren Zustand in Echtzeit:
- **Complete (`isComplete: true`):** Alle definierten Mindestfelder der Sektion sind ausgefüllt.
- **Errors (`errors: string[]`):** Logische oder klinische Konflikte (z. B. unplausible Vitalwerte wie Herzfrequenz > 300/min oder GCS < 3, bzw. fehlende Pflichtangaben). Solange Fehler vorliegen, wird die Sektion rot markiert und kann nicht als fertig eingeklappt werden.
- **Warnings (`warnings: string[]`):** Fehlende empfohlene Angaben (z. B. unvollständige Rückrufnummer oder fehlende Gewichtsangabe bei Kindern), die das Arbeiten nicht blockieren, aber optisch warnen (gelbes Icon).

### Auto-Collapse & Focus-Blur-Verhalten
- **Blur-basiertes Auto-Collapse (`onBlur`):** Verlässt der Nutzer den Fokus einer Sektion (`handleSectionBlur` via `relatedTarget`), prüft das System automatisch: Ist die Sektion vollständig und fehlerfrei? Falls ja, klappt sie sich automatisch platzsparend zusammen.
- **Expliziter "Abschließen"-Button:** Nutzer können eine Sektion per Klick auf den Haken als erledigt markieren. Sind Validierungsfehler vorhanden, verhindert das System das Einklappen und blendet einen Hinweis ein.
- **Globales "Alle einklappen / Alle aufklappen":** Im Header können alle fertigen Sektionen mit einem Klick geschlossen (`onCollapseComplete`) oder alle geöffnet werden (`onExpandAll`).

---

## 2. Feature 2: ML Therapy Suggestions (Clinical Decision Support)

Ein intelligentes, leichtgewichtiges Machine-Learning-Assistenzsystem zur evidenzbasierten Vorschlagsgenerierung von Sofortmaßnahmen, Antidoten, Labordiagnostik und Monitoring im Notrufgespräch.

### Feature Pipeline (`src/ml/features.ts`)
Extrahiert einen standardisierten numerischen Merkmalsvektor (35 Dimensionen) aus dem aktuellen `EvaRecord`:
1. **Substanzkategorien (One-Hot / Token-Matching):**
   - Tenside/Spülmittel (`sub_surfactant_detergent`)
   - Paracetamol (`sub_paracetamol`)
   - Amatoxin/Pilze (`sub_amatoxin_mushroom`)
   - Benzodiazepine/Sedativa (`sub_sedative_benzo`)
   - Opioide (`sub_opioid`)
   - Ätzstoffe/Säuren/Laugen (`sub_caustic_acid_alkali`)
   - Unbekannte Noxe (`sub_unknown`)
2. **Expositionsmodalitäten:** Oral, Dermal, Okulär, Inhalativ, Parenteral, Toxische Dosis erreicht (`T`-Flag).
3. **Latenzzeit:** Akut (< 1h), Subakut (1–4h), Verzögert (> 4h), Unbekannt.
4. **Biometrie:** Alterskategorie (Kind < 14, Jugendlicher 14–17, Erwachsener), Vorhandensein von Körpergewicht, normiertes Gewicht (`kg / 100`).
5. **Klinischer Zustand & Vitalparameter:** GCS < 13, Hypoxie (`SpO2 < 92%`), Tachykardie (`HF > 120`), Bradykardie (`HF < 50`), Hypotonie (`RR syst < 90`), QTc verlängert (`> 460ms`), Azidose (`pH < 7.30`), Fieber (`> 38.5°C`), Symptomfreiheit / Asymptomatisch.
6. **Poisoning Severity Score (PSS):** Grad 0 (Keine), Grad 1 (Leicht), Grad 2 (Mittelschwer), Grad 3/4 (Schwer / Letal).

### Synthetischer Datensatz & Reproduzierbare Trainings-Pipeline (`scripts/train_ml_model.mjs`)
- **Ethische & regulatorische Unbedenklichkeit:** Da keine echten Patientendaten gebündelt werden dürfen, generiert ein deterministischer Synthetik-Generator 1.500 klinisch realistische Giftnotruffälle basierend auf toxikologischen Leitlinien (EAPCCT, GIZ Bonn Protokolle).
- **Seed:** Fester PRNG-Seed (`20261104`) garantiert 100% reproduzierbare Datensätze und Gewichte.
- **Split:** 70% Train (1.050 Fälle), 15% Validation (225 Fälle), 15% Held-out Test (225 Fälle).
- **Architektur:** Multi-label Regularisierte Logistische Regression mit L2-Regularisierung (Ridge Penalty) und Gradient-Descent-Optimierung für 14 Therapieziel-Klassen (u. a. Spülen, Flüssigkeit, Entschäumen, Aktivkohle, Antidot ACC, Naloxon, Flumazenil, Hämodialyse, Intubation, Monitoring).

### Evaluierungs-Metriken (Held-out Test-Set, N = 225)
- **Top-1 Accuracy:** **100.0%**
- **Top-3 Accuracy:** **100.0%**
- **Macro F1-Score:** **85.0%** (Precision: 84.6%, Recall: 86.3%)
- **Brier-Score (Kalibrierung):** **0.0455** (sehr gute Wahrscheinlichkeitskalibrierung)
- Detaillierter Report: `docs/ml-evaluation-report.md`

### Klinische Guardrails & Explainability
- **Sicherheits-Guardrail 1: Insufficient Data:** Wurden weder Substanz noch klinische Symptome/Vitalparameter erfasst, schaltet das System in den Modus `insufficient_data` und blockiert Spekulationen.
- **Sicherheits-Guardrail 2: Low Confidence Warning:** Vorschläge mit Konfidenz unter 60% werden mit einer visuellen Warnung versehen; Vorschläge unter 25% werden gänzlich verworfen.
- **Explainability (Feature Contributions):** Für jeden Vorschlag berechnet das Modell die wichtigsten 3 positiven und negativen Einflussfaktoren (`weight * featureVal`), sodass der Berater sofort sieht, *warum* eine Maßnahme vorgeschlagen wird (z. B. "Verdacht auf Paracetamol-Intoxikation (+2.8)").
- **1-Klick-Übernahme in Therapien:** Ein Klick auf "Als empfohlen übernehmen" überträgt das Antidot / die Maßnahme direkt in die 3-Spalten-Interventionsmatrix von Sektion 7 (`[e]`).

### Opt-in DSGVO-konforme Feedbackschleife (`src/ml/feedback.ts`)
- **Strict Opt-In:** Die Protokollierung von Beraterentscheidungen (Akzeptiert vs. Abgelehnt) ist standardmäßig deaktiviert (`optIn = false`).
- **100% Client-Side & Pseudonymisiert:** Keine Übertragung an externe Server. Events werden ausschließlich im lokalen Browser-Speicher (`localStorage`) abgelegt.
- **Keine PII (Persönlich identifizierbare Daten):** Gespeichert werden ausschließlich Zeitstempel, Modellversion, Zielmaßnahme, Entscheidung (accepted/rejected) und anonymisierte Feature-Flags. Keine Namen, Adressen, Telefonnummern oder Freitexte.
- **Audit & Export:** Der Berater kann die Feedbackdaten jederzeit als JSON einsehen, herunterladen oder mit einem Klick rückstandslos löschen.

---

## 3. Schnellstart & Befehle

### Entwicklungsserver starten
```bash
cd /home/matthew-strauck/Desktop/Gorgonzola/eva-gui
npm run dev
```
Die Web-Applikation steht anschließend unter **`http://localhost:3000`** bereit.

### Produktions-Build erstellen
```bash
cd /home/matthew-strauck/Desktop/Gorgonzola/eva-gui
npm run build
npm run start
```

### Automatisierte Tests ausführen
Führt die 9 Testsuiten für Feature 1 (Einklappen, Validierung, Summary) und Feature 2 (Feature-Extraktion, Guardrails, Inferenz) aus:
```bash
cd /home/matthew-strauck/Desktop/Gorgonzola/eva-gui
npm test
```

### ML-Modell neu trainieren
Generiert den synthetischen Datensatz, trainiert das Modell, evaluiert das Held-out-Testset und aktualisiert das JSON-Artefakt:
```bash
cd /home/matthew-strauck/Desktop/Gorgonzola/eva-gui
npm run train:ml
```

---

## 4. Model-Artefakt aktualisieren oder austauschen

Das trainierte Modell ist als reines, versioniertes JSON-Artefakt abgelegt:
```
src/ml/model_artifact.json
```

### Aufbau des Artefakts:
- `version`: Versionsstring (z. B. `"1.0.0"`)
- `trainedAt`: ISO-Zeitstempel des Trainingslaufs
- `featureNames`: Liste der 35 Feature-Namen
- `classes`: Liste der 14 Zieltherapien
- `biases`: Klassen-Biases für die logistische Regression
- `weights`: Gewichtsvektoren je Klasse (`weights[targetKey][featureIndex]`)
- `metrics`: Evaluierungsmetriken (Top-1, Top-3, F1, Brier, Per-Class-Metrics)

### Vorgehensweise zum Aktualisieren oder Austauschen:
1. **Reguläres Nachtrainieren:** Führen Sie `npm run train:ml` aus. Das Skript überschreibt `src/ml/model_artifact.json` und aktualisiert `docs/ml-evaluation-report.md`.
2. **Eigenes externes Modell einbinden:**
   - Platzieren Sie die generierte JSON-Datei unter `src/ml/model_artifact.json` (Struktur muss dem Interface `ModelArtifact` in `src/ml/types.ts` entsprechen).
   - Führen Sie `npm test` aus, um sicherzustellen, dass alle Inferenz- und Guardrail-Tests mit den neuen Gewichten erfolgreich durchlaufen.
   - Führen Sie `npm run build` aus, um das statische Bundle mit dem neuen Modell zu bauen.
3. **Hot-Swapping zur Laufzeit:** Die Funktion `suggest(record, { customArtifact })` akzeptiert beliebige externe Modell-Objekte zur Laufzeit (z. B. für A/B-Tests oder experimentelle Gewichte).

---

## 5. Tastenkombinationen (Keyboard Shortcuts)

| Shortcut | Funktion |
|---|---|
| **`Alt + 1`** | Zu Sektion 1 (Kopf & Anrufer) springen |
| **`Alt + 2`** | Zu Sektion 2 (Patient & Biometrie) springen |
| **`Alt + 3`** | Zu Sektion 3 (Exposition & Modalitäten) springen |
| **`Alt + 4`** | Zu Sektion 4 (Substanztabelle 7 Zeilen) springen |
| **`Alt + 5`** | Zu Sektion 5 (Anamnese & VE/VM) springen |
| **`Alt + 6`** | Zu Sektion 6 (Symptome & Vitals) springen |
| **`Alt + 7`** | Zu Sektion 7 (Therapien & Antidote) springen |
| **`Alt + 8`** | Zu Sektion 8 (PSS & Prozedere) springen |
| **`Alt + 9`** | Zu Sektion 9 (KI-Therapie- & Antidot-Vorschläge) springen |
| **`Alt + L`** | Erstes Beispielszenario (Spülmaschinentab) laden |
| **`Alt + R`** | Formular vollständig zurücksetzen (mit Bestätigung) |
| **`Strg + S`** | Fall als JSON herunterladen |
| **`Strg + P`** | Druckansicht öffnen (DIN A4 optimiert) |

---

## 6. Projektstruktur

```
eva-gui/
├── docs/
│   └── ml-evaluation-report.md      # Detaillierter Evaluierungsbericht des ML-Modells
├── scripts/
│   └── train_ml_model.mjs           # Reproduzierbares ML-Training & Synthetik-Generator
├── src/
│   ├── app/
│   │   ├── globals.css              # Medizinische Farbschemata & Print-Styles
│   │   ├── layout.tsx               # Root Layout
│   │   └── page.tsx                 # Kontinuierliches toxikologisches Cockpit
│   ├── components/
│   │   ├── CollapsibleSection.tsx   # Reusable einklappbare Sektionskarte mit Summary
│   │   ├── Header.tsx               # Sticky Top-Bar & Sprungmarken
│   │   ├── LiveSidebar.tsx          # Sticky Dossier, Vollständigkeits-Index & Spickzettel
│   │   └── sections/                # 9 Sektionen des EVA-Protokolls inkl. ML-Suggestions
│   ├── data/
│   │   └── sampleCases.ts           # Klinische Beispielfälle (Tab-Kind, Paracetamol, Pilz)
│   ├── lib/
│   │   └── sectionConfig.ts         # Sektionsvalidierung & Summary-Generierung
│   ├── ml/
│   │   ├── features.ts              # 35-Feature-Extraktionspipeline
│   │   ├── feedback.ts              # DSGVO-konforme Opt-in Feedback-Verwaltung
│   │   ├── inference.ts             # Synchrone/Asynchrone Inferenzengine mit Guardrails
│   │   ├── model_artifact.json      # Trainiertes Modell-Artefakt (Weights & Biases)
│   │   └── types.ts                 # TypeScript-Typen für Features, Inferenz & Metriken
│   └── types/
│       └── eva.ts                   # Vollständige Datenstrukturen des EVA 5.26 Protokolls
├── tests/
│   ├── eva-extensions.test.mjs      # Automatisierte Tests für Feature 1 und Feature 2
│   └── run-tests.mjs                # Test-Runner
├── package.json                     # NPM-Skripte und Abhängigkeiten
└── tsconfig.json                    # TypeScript-Konfiguration
```
