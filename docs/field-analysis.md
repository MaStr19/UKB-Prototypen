# EVA-Protokoll (Giftinformationszentrum Bonn) – Feld- und Sektionsanalyse

**Dokument:** EVA_Protokoll_5.26.pdf (Version 5.26)  
**Institution:** Giftinformationszentrum-Nord / Informationszentrale gegen Vergiftungen Bonn (GIZ Bonn, Universitätsklinikum Bonn)  
**Datum der Analyse:** 27. Oktober 2026  
**Ziel:** Vollständige Spezifikation aller Formularfelder, Datenstrukturen, Abkürzungen und klinischen Workflows für die Desktop-App-Prototypisierung.

---

## 1. Übersicht und Formulararchitektur

Das Bonner EVA-Protokoll (Erfassungs- und Validierungs-Applikation / Dokumentationsstandard der deutschen Giftnotrufzentralen) dient der hochfrequenten, rechtssicheren und zeitkritischen Dokumentation toxikologischer Notfallanrufe.
Im Ernstfall muss ein/e Giftberater/in (Toxikologe/in oder Notfallmediziner/in) während des laufenden Gesprächs:
1. Den Anrufer identifizieren und einstufen (Laie vs. medizinisches Fachpersonal).
2. Patientendaten und Expositionsdaten (Wer, Was, Wann, Wieviel, Wo) parallel zur Risikobewertung notieren.
3. Recherchesysteme konsultieren.
4. Akut- und Folgemaßnahmen empfehlen und dokumentieren.
5. Den Vergiftungsschweregrad (*Poisoning Severity Score*, PSS) bestimmen.

Das Papierformular ist ein hochkomprimiertes Einseiten-Dokument (DIN A4 quer oder hoch optimiert, hier DIN A4 hoch) mit starker visueller Verdichtung, mnemonischen Kürzeln und Ankreuzfeldern.

---

## 2. Detaillierte Sektions- und Feldanalyse

### Sektion 1: Kopfbereich (Header & Metadaten)

| Feldbezeichnung im Formular | Typ / Steuerelement | Wertebereich / Optionen | Beschreibung & Klinischer Kontext |
|---|---|---|---|
| **Berater/in (Name/Vorname, Nr.)** | Text / Autocomplete | Name, Vorname, Berater-ID (z. B. "Petra Förster") | Identifiziert den beratenden Toxikologen. In einer Desktop-App üblicherweise vorausgefüllt aus dem Login. |
| **Wochentag / Datum** | Datum | Z. B. `Dienstag, 27. Oktober 2026` | Systemdatum bei Anrufannahme. |
| **Uhrzeit** | Zeit | `HH:MM` (z. B. `13:26`) | Beginn des Beratungsgesprächs. |
| **Anfrage / Folgeanruf** | Radio / Checkbox | `[ ] Anfrage`, `[ ] Folgeanruf` | Handelt es sich um eine Erstberatung oder einen Folgeanruf zu einem bestehenden Vorgang. |
| **Zusatz-Flags** | Checkboxen | `[ ] Tier`<br>`[ ] FU-B`<br>`[ ] FU-Tel` | • **Tier**: Vergiftungsfall bei einem Tier (Veterinärtotoxikologie).<br>• **FU-B**: Follow-up schriftlicher Befund (z. B. Entlassbrief, Laborbefund per Fax/Mail erhalten).<br>• **FU-Tel**: Follow-up per Telefonat (Rückruf zur Zustandskontrolle). |
| **AZ** | Text | Alphanumerisch (Aktenzeichen / Fall-ID) | Eindeutige Vorgangsnummer im GIZ-Archiv. |

---

### Sektion 2: Anrufer (Caller Information)

| Feldbezeichnung im Formular | Typ / Steuerelement | Wertebereich / Optionen | Beschreibung & Klinischer Kontext |
|---|---|---|---|
| **Anrufertyp** | Radio / Checkbox | `Laie`, `Klinik / KH`, `Praxis`, `RTW`, `Notarzt`, `KV-Notdienst`, `Leitstelle`, `Veterinär`, `Sonstige: [Freitext]` | Wesentliche Triage: Fachberatung (Ärzte/Rettungsdienst) vs. Laienberatung (Eltern, besorgte Bürger) bestimmt Sprache und Maßnahmenkatalog. |
| **Anrede** | Radio / Checkbox | `[ ] Frau`, `[ ] Herr` | Höflichkeitsanrede des Anrufers. |
| **Name** | Text | Freitext | Vor- und Nachname des Anrufers / Gesprächspartners. |
| **TELEFON / ggf. E-Mail** | Text / Tel / Mail | Freitext | Rückrufnummer (lebenswichtig bei Verbindungsabbruch) und E-Mail für Befundübermittlung. |
| **PLZ / Ort / Klinik / Krankenhaus / ggf. Land** | Text / Multiline | Freitext | Standort des Anrufers bzw. der behandelnden Einrichtung. |
| **Abteilung** | Radio / Checkbox | `Innere`, `Psychiatrie`, `ZNA`, `Intensiv`, `Kinderklinik/Pädiatrie`, `Chirurgie`, `D-Arzt`, `Sonstige: [Freitext]` | Bei Klinik-Anrufern: Spezifische Fachabteilung/Station für Rückrufe. |

---

### Sektion 3: Quellen (Recherchesysteme & Literatur)

Diese Sektion liegt als schmale Sidebar rechts neben dem Anrufer-Block. Sie dient der Nachvollziehbarkeit herangezogener toxikologischer Informationsquellen:

| Kürzel / Bezeichnung | Vollständiger Name / Bedeutung | Zweck |
|---|---|---|
| **BonnTox** | Interne Datenbank des GIZ Bonn | Hausdatenbank mit proprietären Rezepturen, Erfahrungswerten und Vorfällen. |
| **Mühlendahl** | Vergiftungen im Kindesalter (K.E. von Mühlendahl) | Das deutsche Standardwerk für pädiatrische Toxikologie. |
| **Poisindex** | Micromedex Poisindex | Weltweit führende englischsprachige toxikologische Datenbank. |
| **Toxinz** | National Poisons Centre New Zealand Toxinz | Internationale klinische Toxikologie-Datenbank. |
| **GESTIS** | Gefahrstoffdatenbank der DGUV | Stoffdaten, Grenzwerte, physikalisch-chemische Eigenschaften. |
| **TDI** | Toxikologischer Dokumentations- und Informationsdienst | Datenbank relevanter Industriechemikalien und Haushaltschemie. |
| **SDB** | Sicherheitsdatenblatt (Safety Data Sheet) | Herstellerspezifisches SDB nach REACH/CLP. |
| **EVA** | EVA-Falldatenbank | Historische Fälle und Vergleichskorpus. |

---

### Sektion 4: Patient

| Feldbezeichnung im Formular | Typ / Steuerelement | Wertebereich / Optionen | Beschreibung & Klinischer Kontext |
|---|---|---|---|
| **Patient Name, Vorname oder Tierart** | Text | Freitext | Patientenidentifikation bzw. Tierart (z. B. "Hund, Labrador"). |
| **Fall-Nr.** | Text | Numerisch / Alphanumerisch | Interne Patientennummer / Krankenhaus-PID. |
| **Geburtsdatum** | Datum | `TT.MM.JJJJ` | Exaktes Geburtsdatum. |
| **Alter (Zahl + Einheit)** | Zahl + Einheit | Zahl + `[ ] Jahre`, `[ ] Monate`, `[ ] Tage` | Für Dosisberechnungen (mg/kg) essenziell. |
| **Alterskategorie** | Radio / Single-Select | • `Neugeb. (Tag 1-28)`<br>• `Säugling (Tag 29-365)`<br>• `Kleinkind (1 – <4 J.)`<br>• `Kind (4 bis <13 Jahre)`<br>• `Jugendliche (13 - <18 Jahre)`<br>• `Erwachsen (18 Jahre und älter)` | Standardisierte EAPCCT/GDI-Altersklassen zur statistischen Erfassung. |
| **Geschlecht** | Radio | `[ ] m`, `[ ] w`, `[ ] div` | Biologisches/administratives Geschlecht. |
| **Sonderstatus Schwangerschaft / Stillzeit** | Checkbox + Eingabe | `[ ] w-Stillzeit`<br>`[ ] w-schwanger: SSW: [___]` | Schwangerschaftswoche (SSW) entscheidet über Toxizität für Fetus und Plazentagängigkeit. |
| **Körpermaße** | Zahlen | `kg` (Körpergewicht), `cm` (Körpergröße) | Notwendig zur mg/kg-Dosisabschätzung und Flüssigkeitsberechnung. |

---

### Sektion 5: Noxe & Expositionsparameter

Dieser 4-Spalten-Block erfasst die Modalitäten des Giftkontakts:

#### 5.1 Zeitpunkt Erstkontakt
- **Zeitbezug (Präfix):** `[ ] vor`, `[ ] um`, `[ ] über`
- **Zeiteinheit:** `[ ] Min`, `[ ] Std`, `[ ] Tage`, `[ ] Monate`, `[ ] Jahre`
- **Expositionsmuster (A / S / C / B / U):**
  - **A:** Akut (einmalige kurzzeitige Exposition)
  - **S:** Subakut (wiederholt über Tage)
  - **C:** Chronisch (dauerhaft über Wochen/Monate)
  - **B:** Akut auf chronisch / Biphasisch
  - **U:** Unbekannt

#### 5.2 Ätiologie (Ursache / Veranlassung)
- `[ ] suizidal`
- `[ ] akzidentiell` (Versehen, Unfall)
- `[ ] unbekannt`
- `[ ] Abusus` (Rauschmittel, Sucht)
- `[ ] gewerblich` (Arbeitsunfall)
- `[ ] Nebenwirkung` (UAW / Arzneimittel)
- `[ ] Umwelt` (Gase, Schadstoffe im Außenbereich)
- `[ ] Psychose`
- `[ ] Giftbeibringung` (Fremdbeibringung / Delikt)
- `[ ] Ausführungsfehler / Fehlgabe durch nichtärztl. caregiver` (z. B. Eltern, Pflegepersonal)
- `[ ] iatrogen durch Arzt/Ärztin selbst falsch angeordnet u./o. appliziert`
- `[ ] Bemerkung: [Freitext]`

#### 5.3 Ort
- `[ ] Haus` (Privathaushalt)
- `[ ] im Freien`
- `[ ] Spielplatz`
- `[ ] unbekannt`
- `[ ] Garten`
- `[ ] KiGa-KiTa`
- `[ ] Schule`
- `[ ] Krankenhaus`
- `[ ] Behind.heim` (Behinderteneinrichtung)
- `[ ] Altenheim`
- `[ ] Bemerkung: [Freitext]`

#### 5.4 Expositionsroute (Aufnahmeweg)
- Spalte 1: `[ ] oral`, `[ ] nasal`, `[ ] inhalativ`, `[ ] Auge`, `[ ] Haut`, `[ ] unbekannt`, `[ ] Bemerkung: [Freitext]`
- Spalte 2 (Parenteral / Sonderwege): `[ ] Stich`, `[ ] Biss`, `[ ] rektal`, `[ ] i.v.`, `[ ] i.m.`, `[ ] s.c.`, `[ ] para` (paravenös), `[ ] Weichteile`

---

### Sektion 6: Substanztabelle (Toxische Agenzien / 7 Zeilen)

Die Matrix erlaubt bis zu 7 Substanzen/Produkte parallel:

| Spalte | Kürzel / Flags | Bedeutung |
|---|---|---|
| **Exposition** | `G` / `N` / `K` | • **G**: Gesichert (Stoffkontakt fand definitiv statt)<br>• **N**: Nicht gesichert / fraglich<br>• **K**: Keine Exposition (Ausschluss) |
| **Noxe** | Text + Flags `G` / `N` / `K` / `T` | • Text: Freitextfeld für Handelsname, Wirkstoff, Pflanze, Tier oder Chemikalie.<br>• **G**: Giftig / toxisch relevant<br>• **N**: Nicht giftig (atoxisch bei aufgenommener Menge)<br>• **K**: Kontaminiert / unrein<br>• **T**: Toxische Dosis / Letale Dosis erreicht |
| **Menge** | Text + Flags `G` / `N` / `U` / `max` | • Text: Dosisangabe (z. B. "10 Tabletten á 500mg", "1 Schluck", "20 ml")<br>• **G**: Gesichert (genau abgezählt/gemessen)<br>• **N**: Nicht gesichert (grobe Schätzung)<br>• **U**: Unbekannt<br>• **max**: Worst-Case / Maximaldosis angenommen |

---

### Sektion 7: Anamnese, Vorerkrankungen & Vormedikation

- **Anamnese (aktuelles Ereignis, ggf. Vorgeschichte):** Großes Textfeld für die freie Schilderung des Notfallhergangs, Auffindesituation, Zeugenaussagen.
  - Option: `[ ] Beiblatt`
- **VE (Vorerkrankungen / Vorereignisse):** Spezifisches Textfeld für Vorerkrankungen (z. B. Herzinsuffizienz, Epilepsie, Niereninsuffizienz).
  - Option: `[ ] Rückseite / Beiblatt`
- **VM (Vormedikation):** Spezifisches Textfeld für Dauermedikation des Patienten (Interaktionsgefahr!).
  - Option: `[ ] Rückseite / Beiblatt`

---

### Sektion 8: Symptome und Befunde (Klinischer Status)

#### 8.1 Symptome Schnell-Status
- `[ ] keine` (Asymptomatisch)
- `[ ] wach und voll orientiert`
- `[ ] Zusammenhang fraglich` (Symptom möglicherweise unabhängig von der Noxe)

#### 8.2 Vitalparameter / Befunde vor / bei Anruf
Kompaktes 2-spaltiges Gitter:
- **GCS:** Glasgow Coma Scale (3 bis 15)
- **SpO2:** Sauerstoffsättigung in %
- **HF:** Herzfrequenz / Puls (bpm)
- **RR:** Blutdruck systolisch / diastolisch (mmHg), z. B. `120 / 80`
- **QTc:** Frequenzkorrigierte QT-Zeit im EKG in ms (essentiell bei kardiotoxischen Noxen)
- **pH:** Arterieller oder venöser Blut-pH-Wert
- **Temp:** Körpertemperatur (°C)
- **BZ:** Blutzucker
- **Ethanol:** Alkoholspiegel mit Einheitenauswahl: `[ ] mg/L` oder `[ ] ‰ (o/oo / Promille)`

---

### Sektion 9: Therapien und Maßnahmen

Dies ist der interaktive Hauptempfehlungsblock. Er verwendet ein 3-Checkboxen-System:
- **Spalte v:** Vor Anruf bereits erfolgt / gegeben
- **Spalte e:** Empfohlen durch GIZ Bonn
- **Spalte g:** Gegeben / vor Ort umgesetzt

#### 9.1 Hauptliste der Maßnahmen

| Maßnahme / Feld | Zusatzoptionen / Sub-Checkboxen |
|---|---|
| **Keine** | Keine Therapie erforderlich |
| **Symptominfo telefonisch** | `[ ] FAX` (schriftliche Faxmitteilung) |
| **Überwachung** | Klinische/häusliche Beobachtung |
| **Spülen** | Mund / Haut / Augen spülen |
| **Flüssigkeit oral** | `[ ] kohlenhydratreich` (z. B. Tee mit Zucker) |
| **Entschäumen** | `[ ] Butter`, `[ ] Simeticon` (z. B. Sab Simplex / Lefax bei Spülmittel-Ingestion) |
| **wg. Noxe Ärztl. Untersuchung** | Arztvorstellung aufgrund der Gefährlichkeit der Substanz |
| **wg. Symptom Ärztl. Untersuchung** | Arztvorstellung aufgrund manifester Symptomatik |
| **Symptomat. Therapie/Massnahmen** | Analgesie, Antiemetika, Lagerung etc. |
| **Aktivkohle** | `[ ] repetitiv` (Mehrfachdosis), `[ ] prolongiert` |
| **Labor** | Routinelabor / E-Lyte / Leber / Niere |
| **Blutspiegel** | `[ ] Ethanol`, `[ ] Noxe` |
| **Antidot** | `[ ] Flumazenil`, `[ ] Naloxon`, `[ ] ACC`, `[ ] ACC prolongiert` |
| **Volumentherapie i.v.** | Infusionen / Schocktherapie |
| **Verätzungsschema** | Standardisiertes Verätzungsmanagement (z. B. Endoskopie, Schmerztherapie) |
| **Cortison** | `[ ] i.v.`, `[ ] inhal.`, `[ ] lokal` |
| **Magenspül.** | `[ ] Endo` (Endoskopie), `[ ] Intub.schutz` (nur unter Intubationsschutz) |
| **Intubation / Beatmung** | Atemwegssicherung |
| **sek. Giftelim.** | `[ ] HD` (Hämodialyse), `[ ] lipid rescue` (Lipidemulsion) |
| **Produktinformation** | `[ ] SDB` |
| **Bestimmung Noxe und Wiederanruf** | Identifikation / Rückruf nach Klärung |
| **Pilzsachverständige PSV** | Hinzuziehen eines DGfM-Pilzsachverständigen |
| **Rückruf durch GIZ** | Aktiver Kontrollanruf des Giftnotrufs |
| **GIZ empfiehlt Kontaktaufn. durch:** | Freitext (z. B. Giftzentrale Berlin, Tox Info Suisse, Rechtsmedizin) |

#### 9.2 Kontext-Zusatz (oben rechts bei Therapien)
- Hinweis: `in EVA-1.0 Feld „Zusatz“ beachten`
- **caregiver:** `[ ] Familie`, `[ ] Betreuungseinrichtung`
- **KH/Klinik:** `[ ] somatisch`, `[ ] Psychiatrie`
- **Monitoring:** `[ ] Klinik allg.`, `[ ] Notaufn.`, `[ ] Intensiv`, `[ ] IMC`

#### 9.3 Spezifische Notfall- und Antidot-Medikamenten-Matrix (unten rechts, Spalten `e` und `g`)
- **Benzodiaz:** Benzodiazepine (Krampfanfallunterbrechung, Sedierung)
- **NaBi:** Natriumhydrogencarbonat (Urin-Alkalinisierung, kardioprotektiv bei Trizyklika)
- **Mg++:** Magnesium (Torsade de Pointes, Membranstabilisierung)
- **Katecholamin:** Noradrenalin, Adrenalin (Schocktherapie)
- **Biperiden:** Akineton (bei extrapyramidal-motorischen Symptomen)
- **E'lyt-Subst.:** Elektrolyt-Substitution (z. B. Kalium, Calcium)
- **Glukose:** Hypoglykämie-Therapie
- **ß-Blocker:** Betablocker
- **Vitamin B1:** Thiamin (Wernicke-Enzephalopathie)
- **Lidocain:** Antiarrhythmikum
- **Temp.Kontr.:** Temperaturkontrolle
- **kühlen:** Physikalische Kühlung bei Hyperthermie
- **Physostig:** Physostigmin / Anticholium (bei Anticholinergem Syndrom)

---

### Sektion 10: PSS (Poisoning Severity Score) & Prozedere

#### 10.1 PSS vor/bei Anruf (Ist-Zustand)
International standardisierter Poisoning Severity Score (EAPCCT / WHO / IPCS):
- **⓪ (0 - Keine):** Keine Symptome oder Befunde bezogen auf die Vergiftung.
- **① (1 - Leicht):** Milde, vorübergehende und spontan abklingende Symptome (z. B. leichte Übelkeit, isolierte Hautreizung).
- **② (2 - Mittelschwer):** Ausgeprägte oder langanhaltende Symptome (z. B. Somnolenz, Sinustachykardie, moderate Verätzung).
- **③ (3 - Schwer):** Schwere oder lebensbedrohliche Symptome (z. B. Koma GCS < 8, Herzstillstand, Intubationspflichtigkeit).
- **④ (4 - Letal):** Tod infolge der Vergiftung.
- **U (Unbekannt):** PSS zum Anrufzeitpunkt nicht beurteilbar.

#### 10.2 Max. PSS potentiell (Prognose / Worst-Case)
Gleiche Skala: **⓪ / ① / ② / ③ / ④ / U**  
Definiert das theoretische Gefährdungspotenzial basierend auf Substanz, Dosis und Latenzzeit (wichtig für die Stationswahl!).

#### 10.3 Wegen Noxe empfohlenes Prozedere
- `[ ] keines`
- `[ ] Laie` (zu Hause belassen, keine ärztliche Vorstellung nötig)
- `[ ] ambulant` (Vorstellung beim Hausarzt / Pädiater / Notfallpraxis)
- `[ ] stationär` (Stationäre Aufnahme Normalstation)
- `[ ] Intensiv / IMC` (Intensivstation / Intermediate Care)
- `[ ] nicht zu entsch.` (Nicht zu entscheiden / unklarer Verlauf)
- `[ ] Beiblatt`

---

## 3. Offene Fragen, Ambiguitäten & Empfehlungen für die Digitalisierung

1. **Abkürzungen in der Substanztabelle (`G N K` und `G N K T` und `G N U max`):**
   - Auf dem Papier sind dies Ein-Buchstaben-Spaltenköpfe. Im Papier-Workflow müssen Anwender wissen, was gemeint ist.
   - *Lösung für die Prototypen:* Tooltips und klare Labeling-Erweiterungen (z. B. `G (Gesichert)`, `N (Nicht gesichert)`, `K (Keine)`).
2. **Kürzel `A S C B U` bei Erstkontakt:**
   - Typische EAPCCT-Expositionsverläufe: **A**kut, **S**ubakut, **C**hronisch, **B**iphasisch (oder Akut auf Chronisch), **U**nbekannt.
   - *Lösung:* Im Tooltip oder als segmentierter Button explizit ausschreiben.
3. **Mehrfachauswahl vs. Exklusivität:**
   - Altersklassen, Geschlecht und PSS sind logisch exklusiv (Single-Select / Radio).
   - Therapien (`v`, `e`, `g`) und Ätiologien können kombiniert werden (Multi-Select).
4. **Alterskategorie-Automatik:**
   - In einer digitalen App kann aus dem Geburtsdatum oder Alter (z. B. 2 Jahre) automatisch die korrekte Altersklasse (`Kleinkind (1 – <4 J.)`) selektiert werden.
5. **Kopplung Anrufertyp mit Abteilungen:**
   - Die Abteilung (`ZNA`, `Intensiv`, etc.) ist nur für Klinikanrufer relevant. Bei Laien sollte dieses Feld dezent ausgegraut oder bedingt eingeblendet werden.
6. **Dringlichkeits- / Validierungs-Fokus:**
   - Pflichtfelder bei Notrufannahme: Rückrufnummer, Patient (Alter/Geschlecht), Substanz, Zeit.
   - PSS und Prozedere bilden den obligatorischen Abschluss des Falls.
