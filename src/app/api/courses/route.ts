import { NextResponse } from "next/server";
import { MODULES } from "@/data/lehrende";

let cachedModules: any[] | null = null;
let lastFetched = 0;
const CACHE_TTL = 1000 * 60 * 15; // Cache for 15 minutes

async function getExternalModules() {
  const now = Date.now();
  if (cachedModules && now - lastFetched < CACHE_TTL) {
    return cachedModules;
  }

  try {
    const res = await fetch("https://meinmoodle.hosting.medien.hs-duesseldorf.de/api/mhb/studyprograms/id/1", {
      next: { revalidate: 900 } // 15 mins Next.js fetch cache
    });
    if (!res.ok) throw new Error("Failed to fetch external MHB API");
    const data = await res.json();

    // We expect an array representing the study program, or a direct object
    const program = Array.isArray(data) ? data[0] : data;
    if (!program || !Array.isArray(program.modules)) {
      return MODULES;
    }

    const mapped = program.modules.map((item: any) => {
      const m = item.module;

      // Translate exam type into readable German terms
      let examText = "Projektarbeit";
      if (m.examType === "written_exam") examText = "Schriftliche Prüfung";
      else if (m.examType === "portfolio") examText = "Portfolio";
      else if (m.examType === "project") examText = "Projektarbeit";
      else if (m.examType === "written_assignment") examText = "Hausarbeit";
      else if (m.examType === "oral_exam") examText = "Mündliche Prüfung";
      else if (m.examType) examText = m.examType;

      // Infer category from module name
      let category = "web";
      const nameLower = m.nameGerman?.toLowerCase() || "";
      if (
        nameLower.includes("gestaltung") ||
        nameLower.includes("design") ||
        nameLower.includes("ux") ||
        nameLower.includes("interaktion")
      ) {
        category = "design";
      } else if (
        nameLower.includes("game") ||
        nameLower.includes("grafik") ||
        nameLower.includes("godot") ||
        nameLower.includes("spiel")
      ) {
        category = "game";
      } else if (
        nameLower.includes("iot") ||
        nameLower.includes("embedded") ||
        nameLower.includes("hardware") ||
        nameLower.includes("rechnerarchitektur") ||
        nameLower.includes("system")
      ) {
        category = "iot";
      } else if (
        nameLower.includes("daten") ||
        nameLower.includes("database") ||
        nameLower.includes("sql") ||
        nameLower.includes("analytics")
      ) {
        category = "data";
      }

      // Map offered season to semester id
      const semester = item.offeredInSeason === "winter_semester" ? "wise" : "sose26";

      return {
        id: `mhb-${m.id}`,
        code: item.moduleNumber || `M${m.id}`,
        name: m.nameGerman || m.nameEnglish || "Unbenanntes Modul",
        ects: item.creditPoints ? `${parseFloat(item.creditPoints)} ECTS` : "5 ECTS",
        exam: examText,
        description: m.goalsOfLectureGerman || m.contentsOfLectureGerman || "",
        category: category,
        minSeats: 5,
        maxSeats: 15,
        programs: ["bmi25", "bmi18"], // Default programs for Bachelor Medieninformatik
        semester: semester,
      };
    });

    cachedModules = mapped;
    lastFetched = now;
    return mapped;
  } catch (error) {
    console.error("Error fetching external MHB modules:", error);
    // Fallback to local modules
    return MODULES;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const query = q.toLowerCase().trim();
  const modulesList = await getExternalModules();

  if (!query) {
    return NextResponse.json(modulesList);
  }

  const filtered = modulesList.filter(
    (m: any) =>
      m.name.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query))
  );

  return NextResponse.json(filtered);
}
