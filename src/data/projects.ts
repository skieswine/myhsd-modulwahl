export type IconName =
  | "monitor"
  | "gamepad"
  | "train"
  | "database"
  | "puzzle"
  | "cpu"
  | "brush";

export type ChipKind = "info" | "success" | "warn" | "danger";

export interface Project {
  id: string;
  name: string;
  cat: string;
  icon: IconName;
  description: string;
  termine: string;
  semester: string;
  groupSize: string;
  prerequisite: string;
}

export interface ApplicationStatus {
  kind: ChipKind;
  label: string;
}

export const PROJECTS: Record<string, Project> = {
  parallax: {
    id: "parallax",
    name: "Parallax-Scrolling",
    cat: "Web & Frontend",
    icon: "monitor",
    description:
      "Studierende entwickeln eine Webseite mit Parallax-Scrolling-Effekten, bei der sich Elemente beim Scrollen in verschiedenen Geschwindigkeiten bewegen und so eine visuelle Tiefenwirkung entstehen lassen.",
    termine: "Di · 12:00–13:30",
    semester: "Jedes SoSe",
    groupSize: "5–7 Pers.",
    prerequisite: "OOP 1",
  },
  godot: {
    id: "godot",
    name: "Spiele mit GODOT-Engine",
    cat: "Game Development",
    icon: "gamepad",
    description:
      "Entwicklung eines kleinen 2D-Spiels mit der GODOT-Engine — von der Spielidee über das Leveldesign bis zur fertigen, spielbaren Anwendung.",
    termine: "Mi · 10:00–11:30",
    semester: "Jedes SoSe",
    groupSize: "4–6 Pers.",
    prerequisite: "OOP 1",
  },
  bahnhof: {
    id: "bahnhof",
    name: "Derendorfer Bahnhof",
    cat: "IoT & Embedded",
    icon: "train",
    description:
      "Ein IoT-Projekt rund um Sensorik und Echtzeitdaten am Standort Derendorfer Bahnhof — Datenerfassung, Aufbereitung und Visualisierung.",
    termine: "Do · 14:00–15:30",
    semester: "Jedes WiSe",
    groupSize: "5–7 Pers.",
    prerequisite: "Rechnernetze",
  },
  repo: {
    id: "repo",
    name: "Repository Mining",
    cat: "Data Science",
    icon: "database",
    description:
      "Analyse großer Open-Source-Repositories mit Data-Mining-Methoden — Muster, Metriken und Trends in der Softwareentwicklung sichtbar machen.",
    termine: "Mo · 09:00–10:30",
    semester: "Jedes SoSe",
    groupSize: "3–5 Pers.",
    prerequisite: "Statistik",
  },
  puzzle: {
    id: "puzzle",
    name: "Mobiles Puzzle-Spiel",
    cat: "Mobile Apps",
    icon: "puzzle",
    description:
      "Konzeption und Umsetzung eines mobilen Puzzle-Spiels für Android — mit Fokus auf Spielmechanik, UX und sauberer App-Architektur.",
    termine: "Fr · 11:00–12:30",
    semester: "Jedes SoSe",
    groupSize: "4–6 Pers.",
    prerequisite: "OOP 1",
  },
};

export const CHIPS: Record<string, ApplicationStatus> = {
  parallax: { kind: "info", label: "Eingereicht" },
  godot: { kind: "success", label: "Platz zugesagt" },
  bahnhof: { kind: "warn", label: "In Prüfung" },
};

export const INITIAL_ORDER = ["parallax", "godot", "bahnhof"];
export const AVAILABLE = ["repo", "puzzle"];
export const DEADLINE_DATE = "15. Juli 2026";

const getDeadlineDays = () => {
  const targetDate = new Date("2026-07-15T23:59:59");
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const DEADLINE_DAYS = getDeadlineDays();
