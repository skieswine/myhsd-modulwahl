import type { IconName } from "./projects";

export interface Offering {
  id: string;
  name: string;
  cat: string;
  kind: string;
  icon: IconName;
  applicants: number;
  seats: number;
  published: boolean;
  description?: string;
  termine?: string;
  semester?: string;
  groupSize?: string;
  prerequisite?: string;
  /** Projektbild als Data-URL (JPEG, per Canvas verkleinert) — liegt im localStorage */
  image?: string;
  code?: string;
  ects?: string;
  exam?: string;
  language?: string;
  certTitle?: string;
  imgDesc?: string;
}

export interface Applicant {
  id: string;
  name: string;
  prio: number;
  meta: string;
  initials: string;
  av: AvatarColor;
  motivation: string;
}

export type AvatarColor = "red" | "blue" | "green" | "amber";

export interface ModuleEntry {
  id: string;
  code: string;
  name: string;
  ects: string;
  exam: string;
  description?: string;
  category?: string;
  minSeats?: number;
  maxSeats?: number;
  programs?: string[];
  semester?: string;
  language?: string;
}

export const OFFERINGS: Offering[] = [
  { id: "parallax", name: "Parallax-Scrolling", cat: "Web & Frontend", kind: "Projekt", icon: "monitor", applicants: 12, seats: 7, published: true },
  { id: "godot", name: "Spiele mit GODOT-Engine", cat: "Game Dev", kind: "Projekt", icon: "gamepad", applicants: 19, seats: 8, published: true },
  { id: "bahnhof", name: "Derendorfer Bahnhof", cat: "IoT & Embedded", kind: "Projekt", icon: "train", applicants: 6, seats: 6, published: true },
  { id: "iot", name: "IoT-Werkstatt", cat: "Embedded", kind: "Projekt", icon: "cpu", applicants: 0, seats: 6, published: false },
];

export const APPLICANTS: Applicant[] = [
  { id: "a1", name: "Lena Becker", prio: 1, meta: "5. Sem · BMI", initials: "LB", av: "red", motivation: "Frontend-Animationen sind mein Schwerpunkt — ich möchte Parallax praktisch umsetzen." },
  { id: "a2", name: "Tim Hoffmann", prio: 1, meta: "5. Sem · MMI", initials: "TH", av: "blue", motivation: "Habe schon mit GSAP gearbeitet und will tiefer in Scroll-Interaktionen einsteigen." },
  { id: "a3", name: "Marie Schulz", prio: 2, meta: "4. Sem · BMI", initials: "MS", av: "green", motivation: "Mich begeistert die Verbindung aus Design und Code, gerade bei visueller Tiefe." },
  { id: "a4", name: "Jonas Weber", prio: 3, meta: "6. Sem · MMI", initials: "JW", av: "amber", motivation: "Suche ein Projekt mit Fokus auf moderne CSS- und JS-Techniken." },
];

export const AVATARS: Record<AvatarColor, { bg: string; fg: string }> = {
  red: { bg: "#FCE6E9", fg: "#C2121F" },
  blue: { bg: "#E6EFFB", fg: "#1457B8" },
  green: { bg: "#E4F5EA", fg: "#0F7A3D" },
  amber: { bg: "#FBEFD9", fg: "#9A5B00" },
};

export const MODULES: ModuleEntry[] = [
  {
    id: "bmi52",
    code: "BMI 52",
    name: "Interaktive Systeme",
    ects: "5 ECTS",
    exam: "Projektarbeit",
    description: "Konzeption, Gestaltung und Realisierung benutzerzentrierter interaktiver Benutzerschnittstellen (UI/UX) sowie Durchführung von Usability-Tests.",
    category: "design",
    minSeats: 6,
    maxSeats: 12,
    programs: ["mmi", "bmi25"],
    semester: "wise",
  },
  {
    id: "mmi13",
    code: "MMI 13",
    name: "Mensch-Computer-Interaktion",
    ects: "5 ECTS",
    exam: "Hausarbeit",
    description: "Theoretische und praktische Grundlagen der Mensch-Computer-Interaktion. Analyse von Benutzungsschnittstellen und Gestaltungsprinzipien.",
    category: "design",
    minSeats: 5,
    maxSeats: 10,
    programs: ["mmi"],
    semester: "every",
  },
  {
    id: "bmi61",
    code: "BMI 61",
    name: "Web-Engineering",
    ects: "5 ECTS",
    exam: "Projektarbeit",
    description: "Entwicklung moderner Full-Stack Webanwendungen. Architekturmuster, State Management, API-Design und moderne Deployment-Pipelines.",
    category: "web",
    minSeats: 8,
    maxSeats: 16,
    programs: ["bmi25", "bmi18"],
    semester: "sose26",
  },
  {
    id: "bmi42",
    code: "BMI 42",
    name: "Computergrafik",
    ects: "5 ECTS",
    exam: "Schriftliche Prüfung",
    description: "Mathematische und programmiertechnische Grundlagen der 2D- und 3D-Computergrafik, Shader, Beleuchtungsmodelle und Rendering.",
    category: "game",
    minSeats: 5,
    maxSeats: 15,
    programs: ["bmi25", "mmi"],
    semester: "every",
  },
  {
    id: "mmi20",
    code: "MMI 20",
    name: "Mobile Applications",
    ects: "5 ECTS",
    exam: "Projektarbeit",
    description: "Entwicklung mobiler Apps für iOS/Android unter Verwendung nativer und hybrider Ansätze mit Fokus auf mobile User Experience.",
    category: "web",
    minSeats: 6,
    maxSeats: 12,
    programs: ["mmi", "bmi25"],
    semester: "wise",
  },
  {
    id: "iot32",
    code: "IOT 32",
    name: "IoT & Embedded Systems",
    ects: "5 ECTS",
    exam: "Projektarbeit",
    description: "Grundlagen der Mikrocontroller-Programmierung, Sensorik/Aktorik sowie drahtlose Kommunikation im Internet of Things.",
    category: "iot",
    minSeats: 4,
    maxSeats: 8,
    programs: ["bmi25", "bmt18"],
    semester: "wise",
  },
];

export const CATEGORIES: { id: string; label: string; icon: IconName }[] = [
  { id: "web", label: "Web", icon: "monitor" },
  { id: "game", label: "Game Dev", icon: "gamepad" },
  { id: "iot", label: "IoT", icon: "cpu" },
  { id: "data", label: "Data", icon: "database" },
  { id: "design", label: "Design", icon: "brush" },
];

export const PROGRAMS: { id: string; name: string; detail: string }[] = [
  { id: "mmi", name: "Medien- & Medizininformatik", detail: "PO 2021 · 4.–6. Sem" },
  { id: "bmi25", name: "Bachelor Medieninformatik", detail: "PO 2025 · ab 4. Sem" },
  { id: "bmi18", name: "Bachelor Medieninformatik", detail: "PO 2018 · ab 5. Sem" },
  { id: "bmt18", name: "Bachelor Medientechnik", detail: "PO 2018 · ab 5. Sem" },
];

export const SEMESTERS: { id: string; label: string }[] = [
  { id: "sose26", label: "Nur SoSe 26" },
  { id: "wise2627", label: "Nur WiSe 26/27" },
  { id: "everysose", label: "Jedes SoSe" },
  { id: "wise", label: "Jedes WiSe" },
  { id: "every", label: "Jedes Semester" },
  { id: "not", label: "Wird gerade nicht angeboten" },
];

export const LECTURER = { initials: "SK", name: "Prof. S. Krause", faculty: "Medien & Informatik" };
