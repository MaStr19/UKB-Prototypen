export type CallerType =
  | 'Laie'
  | 'Klinik / KH'
  | 'Praxis'
  | 'RTW'
  | 'Notarzt'
  | 'KV-Notdienst'
  | 'Leitstelle'
  | 'Veterinär'
  | 'Sonstige';

export type DepartmentType =
  | 'Innere'
  | 'Psychiatrie'
  | 'ZNA'
  | 'Intensiv'
  | 'Kinderklinik/Pädiatrie'
  | 'Chirurgie'
  | 'D-Arzt'
  | 'Sonstige';

export type AgeCategory =
  | 'Neugeb. (Tag 1-28)'
  | 'Säugling (Tag 29-365)'
  | 'Kleinkind (1 – <4 J.)'
  | 'Kind (4 bis <13 Jahre)'
  | 'Jugendliche (13 - <18 Jahre)'
  | 'Erwachsen (18 Jahre und älter)';

export type Gender = 'm' | 'w' | 'div';

export type ExposurePattern = 'A' | 'S' | 'C' | 'B' | 'U';

export type PssLevel = '0' | '1' | '2' | '3' | '4' | 'U';

export type ProcedureOption =
  | 'keines'
  | 'Laie'
  | 'ambulant'
  | 'stationär'
  | 'Intensiv / IMC'
  | 'nicht zu entsch.'
  | 'Beiblatt';

export interface SubstanceRow {
  id: number;
  expoFlag: 'G' | 'N' | 'K' | '';
  noxeName: string;
  noxeFlag: 'G' | 'N' | 'K' | 'T' | '';
  mengeVal: string;
  mengeFlag: 'G' | 'N' | 'U' | 'max' | '';
}

export interface TherapyItem {
  id: string;
  label: string;
  v: boolean; // vor Anruf
  e: boolean; // empfohlen
  g: boolean; // gegeben
  subOptions?: { [key: string]: boolean };
  subOptionLabels?: { [key: string]: string };
}

export interface EmergencyMedItem {
  id: string;
  label: string;
  subtitle?: string;
  e: boolean; // empfohlen
  g: boolean; // gegeben
}

export interface EvaRecord {
  // 1. Header / Metadata
  berater: string;
  datum: string;
  uhrzeit: string;
  anrufTyp: 'Anfrage' | 'Folgeanruf';
  flagTier: boolean;
  flagFuB: boolean;
  flagFuTel: boolean;
  az: string;

  // 2. Caller
  anruferTyp: CallerType;
  anruferTypSonstiges: string;
  anrede: 'Frau' | 'Herr' | '';
  anruferName: string;
  anruferKontakt: string;
  anruferOrt: string;
  abteilung: DepartmentType | '';
  abteilungSonstiges: string;

  // 3. Quellen
  quellen: {
    bonnTox: boolean;
    muehlendahl: boolean;
    poisindex: boolean;
    toxinz: boolean;
    gestis: boolean;
    tdi: boolean;
    sdb: boolean;
    eva: boolean;
  };

  // 4. Patient
  patientName: string;
  fallNr: string;
  geburtsdatum: string;
  alterWert: string;
  alterEinheit: 'Jahre' | 'Monate' | 'Tage';
  alterskategorie: AgeCategory | '';
  geschlecht: Gender | '';
  stillzeit: boolean;
  schwanger: boolean;
  ssw: string;
  gewichtKg: string;
  groesseCm: string;

  // 5. Noxe & Exposition
  zeitPraefix: 'vor' | 'um' | 'über' | '';
  zeitWert: string;
  zeitEinheit: 'Min' | 'Std' | 'Tage' | 'Monate' | 'Jahre';
  expositionsMuster: ExposurePattern | '';
  aetiologie: string[];
  aetiologieBemerkung: string;
  ort: string[];
  ortBemerkung: string;
  routeStandard: string[];
  routeParenteral: string[];
  routeBemerkung: string;

  // 6. Substanztabelle (7 Zeilen)
  substanzen: SubstanceRow[];

  // 7. Anamnese
  anamneseText: string;
  anamneseBeiblatt: boolean;
  veText: string;
  veBeiblatt: boolean;
  vmText: string;
  vmBeiblatt: boolean;

  // 8. Symptome & Vitals
  sympKeine: boolean;
  sympWachOrientiert: boolean;
  sympZusammenhangFraglich: boolean;
  vitalGcs: string;
  vitalSpo2: string;
  vitalHf: string;
  vitalRr: string;
  vitalQtc: string;
  vitalPh: string;
  vitalTemp: string;
  vitalBz: string;
  vitalBzEinheit: 'mg/dl' | 'mmol/l';
  vitalEthanol: string;
  vitalEthanolEinheit: 'mg/L' | '‰';

  // 9. Therapien
  therapien: { [key: string]: TherapyItem };
  caregiver: 'Familie' | 'Betreuungseinrichtung' | '';
  khKlinik: 'somatisch' | 'Psychiatrie' | '';
  monitoring: 'Klinik allg.' | 'Notaufn.' | 'Intensiv' | 'IMC' | '';
  notfallMeds: { [key: string]: EmergencyMedItem };
  kontaktEmpfehlungGIZ: string;

  // 10. PSS & Prozedere
  pssVor: PssLevel;
  pssPot: PssLevel;
  prozedere: ProcedureOption | '';
}
