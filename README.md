# Giftinformationszentrum (GIZ) Bonn – EVA-Protokoll 5.26 GUI

Dieses Repository enthält die vollständige Digitalisierung und grafische Benutzeroberfläche für das **EVA-Protokoll (Version 5.26)** des Giftinformationszentrums Bonn (Informationszentrale gegen Vergiftungen am Universitätsklinikum Bonn).

---

## 1. Haupt-Anwendung: EVA-GUI (Next.js + Tailwind CSS)

Das primäre System befindet sich im Verzeichnis **`eva-gui/`** (Symlink: `eva-app/`). Es implementiert ein modernes, tab-freies, kontinuierlich scrollbares toxikologisches Arbeits-Cockpit.

### 🌟 Kern-Eigenschaften:
- **NO TABS (Kontinuierlicher Flow):** Keine künstlichen Tab-Grenzen im Notrufgespräch. Alle 8 Kernbereiche liegen in einem ergonomischen, kontinuierlichen Stream erhöhter klinischer Karten.
- **Sticky Top Bar:** Fixierter Kopfbereich mit Fall-Metadaten (AZ, Berater, Anrufzeit), Live-Zusammenfassung (Patient, Leitnoxe, PSS) und Schnell-Sprungmarken (`Alt+1` bis `Alt+8`) mit Smooth-Scroll.
- **Sticky Live-Falldossier (Sidebar rechts):**
  - **Klinischer Vollständigkeits-Index:** Erkennt fehlende Pflichtfelder (z. B. Rückrufnummer, PSS) in Echtzeit.
  - **Empfohlene Sofortmaßnahmen (Telefon-Spickzettel):** Aggregiert automatisch alle aktuell empfohlenen Maßnahmen (`[e]`) und Antidote zur schnellen telefonischen Durchgabe.
  - **Konsultierte Quellen:** Übersicht der genutzten Toxikologie-Datenbanken (BonnTox, Mühlendahl, Poisindex, GESTIS etc.).
- **Vollständige Sektionsabdeckung:**
  1. *Kopf & Anrufer:* Berater, Datum, Uhrzeit, Anruftyp, Flags (Tier, FU-B, FU-Tel), AZ, Anrufertyp-Pills, Rückrufnummer, Klinik-Abteilung, Quellen.
  2. *Patient & Biometrie:* Name/Tierart, Fall-Nr., Geburtsdatum, Alter mit Auto-Alterskategorisierung (EAPCCT), Geschlecht, Stillzeit, Schwangerschaft mit SSW, Maße mit automatischer BMI- & mg/kg-Berechnung.
  3. *Exposition & Modalitäten:* Zeitpunkt & Latenz (vor/um/über), Expositionsmuster (`A/S/C/B/U`), Ätiologie-Pills, Ort-Pills, Aufnahmewege (Standard & Parenteral).
  4. *Substanztabelle (7 Agenzien):* Hochverdichtete medizinische Matrix mit Expositionssicherheit (`G/N/K`), toxischem Flag (`G/N/K/T`) und Mengensicherheit (`G/N/U/max`).
  5. *Anamnese & VE/VM:* Großes Notfallprotokollfeld mit 1-Klick-Textbausteinen, VE (Vorerkrankungen) und VM (Vormedikation) jeweils mit Beiblatt-Option.
  6. *Symptome & Klinische Vitals:* Sofortstatus-Pills, Vitalparameter-Gitter (GCS, SpO2, HF, RR, QTc, pH, Temp, BZ, Ethanol) mit automatischer Grenzwert-Warnmarkierung.
  7. *Therapien & Antidote:* 3-Spalten-Interventionsmatrix (`v` vorher | `e` empfohlen | `g` gegeben) für 24 Standard-Maßnahmen + 13-teilige Notfallmedikationsmatrix.
  8. *PSS & Empfohlenes Prozedere:* Poisoning Severity Score (0 bis 4 + U) für Ist-Zustand vs. potentieller Worst-Case + Entlass-/Verlegungs-Prozedere.
- **1-Klick-Beispielszenarien:**
  - *Fall 1:* Kleinkind – Spülmaschinentab-Ingestion (Somat Tab, PSS 1, Entschäumen Simeticon, häuslich)
  - *Fall 2:* Jugendliche – Suizidale Paracetamol-Intoxikation (15g Paracetamol, PSS 2 → 3, Antidot ACC i.v., stationär)
  - *Fall 3:* Erwachsener – Grüner Knollenblätterpilz (Amanita phalloides, Latenz 10h, PSS 3 → 4, Silibinin, Intensiv/IMC)
- **Export & Druck:** JSON-Export, klinische Kurzzusammenfassung in Zwischenablage kopieren, optimierte Druckansicht (`Strg+P`).

---

## 2. Starten der Anwendung

### Voraussetzungen:
- Node.js >= 18 (Getestet mit Node v26)
- npm >= 9

### Entwicklungsserver starten:
```bash
cd /home/matthew-strauck/Desktop/Gorgonzola/eva-gui
npm run dev
```
Die Anwendung öffnet sich unter: **`http://localhost:3000`**

### Produktions-Build erstellen und starten:
```bash
cd /home/matthew-strauck/Desktop/Gorgonzola/eva-gui
npm run build
npm run start
```

---

## 3. Tastaturbedienung (Shortcuts)

| Tastenkombination | Aktion |
|---|---|
| **`Alt + 1`** | Zu Sektion 1 (Kopf & Anrufer) scrollen |
| **`Alt + 2`** | Zu Sektion 2 (Patient & Biometrie) scrollen |
| **`Alt + 3`** | Zu Sektion 3 (Exposition & Modalitäten) scrollen |
| **`Alt + 4`** | Zu Sektion 4 (Substanztabelle 7 Zeilen) scrollen |
| **`Alt + 5`** | Zu Sektion 5 (Anamnese & VE/VM) scrollen |
| **`Alt + 6`** | Zu Sektion 6 (Symptome & Vitals) scrollen |
| **`Alt + 7`** | Zu Sektion 7 (Therapien & Antidote) scrollen |
| **`Alt + 8`** | Zu Sektion 8 (PSS & Prozedere) scrollen |
| **`Alt + L`** | Beispielszenario laden |
| **`Alt + R`** | Formular vollständig leeren |
| **`Strg + S`** | Fall als JSON herunterladen |
| **`Strg + P`** | Druckansicht / PDF erstellen |

---

## 4. Verzeichnisstruktur

```
/home/matthew-strauck/Desktop/Gorgonzola/
├── eva-gui/                       # Modernes Next.js + Tailwind CSS Haupt-Framework (Scrollable GUI)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css        # Medizinische Farbpalette, Scroll & Print-Styles
│   │   │   ├── layout.tsx         # Root Layout
│   │   │   └── page.tsx           # Hauptseite mit kontinuierlichem Stream
│   │   ├── components/
│   │   │   ├── Header.tsx         # Sticky Header & Sprungmarken-Leiste
│   │   │   ├── LiveSidebar.tsx    # Sticky Falldossier, Sofortmaßnahmen & Vollständigkeit
│   │   │   ├── SectionHeader.tsx  # Einheitliche Sektionsüberschriften
│   │   │   └── sections/          # 8 modulare Sektionskarten
│   │   ├── data/
│   │   │   └── sampleCases.ts     # Klinische Beispielfälle & Grundkonfigurationen
│   │   └── types/
│   │       └── eva.ts             # TypeScript Definitionen des EVA 5.26 Formulars
│   ├── package.json
│   └── tsconfig.json
├── eva-app/                       # Symlink auf eva-gui
├── docs/
│   └── field-analysis.md          # Umfassende Feld- und Sektionsanalyse
├── reference/
│   ├── EVA_Protokoll_blank.pdf    # Original-Referenzformular (DIN A4)
│   └── page-1.png                 # Scan des Papierformulars
├── prototype-a/                   # Historischer Prototyp A: "Digital Form" (Formular-Replikat)
├── prototype-b/                   # Historischer Prototyp B: "Guided Flow" (Wizard)
├── prototype-c/                   # Historischer Prototyp C: "Hybrid Workspace"
└── README.md                      # Projektdokumentation
```
