"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  CategoryIcon,
  CheckIcon,
  SpinnerIcon,
  InfoIcon,
  ChevronDownSmall,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
} from "@/components/icons";
import { ImageUpload } from "@/components/ImageUpload";
import {
  MODULES,
  CATEGORIES,
  PROGRAMS,
  SEMESTERS,
  type ModuleEntry,
} from "@/data/lehrende";
import { useOfferings } from "@/context/OfferingsContext";
import type { IconName } from "@/data/projects";

function SaveIndicator({ saving }: { saving: boolean }) {
  return (
    <div
      className="mt-1.5 flex flex-none items-center gap-1.5 text-[12px] font-medium"
      style={{ color: saving ? "#9A9A9A" : "#0F7A3D" }}
    >
      {saving ? <SpinnerIcon /> : <CheckIcon />}
      {saving ? "Wird gespeichert …" : "Gespeichert"}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="-mx-4 mb-6 flex items-center gap-1.5 border-b border-hairline px-4 pb-4 sm:-mx-6 sm:px-6">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="h-[5px] flex-1 rounded-full"
          style={{ background: n <= step ? "#E2001A" : "#F0DADC" }}
        />
      ))}
      <span className="ml-1.5 text-[12px] font-medium text-ink-faint">{step} / 3</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border-[1.5px] border-[#E2E2E2] px-[13px] py-3 text-[14.5px] text-ink outline-none transition-colors focus:border-brand";

export default function NeueKLVPage() {
  const router = useRouter();
  const { addOffering, categories, addCustomCategory } = useOfferings();

  const [step, setStep] = useState(1);
  const [module, setModule] = useState("");
  const [moduleOpen, setModuleOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("web");
  const [minSeats, setMinSeats] = useState(5);
  const [maxSeats, setMaxSeats] = useState(minSeats + 2);
  const [programs, setPrograms] = useState<Record<string, boolean>>({
    mmi: true,
    bmi25: true,
    bmi18: false,
    bmt18: false,
  });
  const [semester, setSemester] = useState("wise");
  const [firstMeetingDate, setFirstMeetingDate] = useState(() => new Date().toLocaleDateString("sv-SE"));
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ModuleEntry[]>(MODULES);
  const [isSearching, setIsSearching] = useState(false);

  // States for editable module information
  const [moduleCode, setModuleCode] = useState("");
  const [ects, setEcts] = useState("");
  const [exam, setExam] = useState("");
  const [language, setLanguage] = useState("Deutsch");
  const [prerequisiteName, setPrerequisiteName] = useState("");

  // States for adding custom categories
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<IconName>("monitor");

  const touch = () => {
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaving(false), 800);
  };

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(MODULES);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/courses?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error("Error fetching modules:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const pickModule = (m: ModuleEntry) => {
    setModule(m.id);
    setName(m.name);
    setDesc(m.description ?? "");
    setCategory(m.category ?? "web");
    setMinSeats(m.minSeats ?? 5);
    setMaxSeats(m.maxSeats ?? 10);
    setSemester(m.semester ?? "wise");

    setModuleCode(m.code);
    setEcts(m.ects);
    setExam(m.exam);
    setLanguage(m.language ?? "Deutsch");
    setPrerequisiteName(m.name);

    const newPrograms = { mmi: false, bmi25: false, bmi18: false, bmt18: false };
    m.programs?.forEach((p) => {
      if (p in newPrograms) {
        newPrograms[p as keyof typeof newPrograms] = true;
      }
    });
    setPrograms(newPrograms);

    setSearchQuery(`${m.code} - ${m.name}`);
    setModuleOpen(false);
    touch();
  };

  const handleCreateImmediately = (m: ModuleEntry) => {
    const selectedCat = categories.find((c) => c.id === (m.category ?? "web"));
    const selectedSemester = SEMESTERS.find((s) => s.id === (m.semester ?? "wise"));

    addOffering({
      id: `klv-${Date.now()}`,
      name: m.name,
      cat: selectedCat?.label ?? "Web & Frontend",
      kind: "Lehrveranstaltung",
      icon: selectedCat?.icon ?? "monitor",
      applicants: 0,
      seats: m.maxSeats ?? 10,
      published: true,
      description: m.description ?? "",
      termine: "",
      semester: selectedSemester?.label ?? "Jedes WiSe",
      groupSize: `${m.minSeats ?? 5}–${m.maxSeats ?? 10} Pers.`,
      prerequisite: m.name,
      code: m.code,
      ects: m.ects,
      exam: m.exam,
      language: m.language ?? "Deutsch",
    });

    router.push("/lehrende");
  };

  const handleFinish = () => {
    const selectedCat = categories.find((c) => c.id === category);
    const selectedSemester = SEMESTERS.find((s) => s.id === semester);

    addOffering({
      id: `klv-${Date.now()}`,
      name: name || "Unbenannte Lehrveranstaltung",
      cat: selectedCat?.label ?? "",
      kind: "Lehrveranstaltung",
      icon: selectedCat?.icon ?? "monitor",
      applicants: 0,
      seats: maxSeats,
      published: true,
      description: desc,
      termine: firstMeetingDate,
      semester: selectedSemester?.label ?? "",
      groupSize: `${minSeats}–${maxSeats} Pers.`,
      prerequisite: prerequisiteName,
      image: image ?? undefined,
      code: moduleCode,
      ects: ects,
      exam: exam,
      language: language,
    });

    router.push("/lehrende");
  };

  const handleSaveDraft = () => {
    const selectedCat = categories.find((c) => c.id === category);
    const selectedSemester = SEMESTERS.find((s) => s.id === semester);

    addOffering({
      id: `klv-${Date.now()}`,
      name: name || "Unbenannte Lehrveranstaltung (Entwurf)",
      cat: selectedCat?.label ?? "",
      kind: "Lehrveranstaltung",
      icon: selectedCat?.icon ?? "monitor",
      applicants: 0,
      seats: maxSeats,
      published: false,
      description: desc,
      termine: firstMeetingDate,
      semester: selectedSemester?.label ?? "",
      groupSize: `${minSeats}–${maxSeats} Pers.`,
      prerequisite: prerequisiteName || undefined,
      image: image ?? undefined,
      code: moduleCode || undefined,
      ects: ects || undefined,
      exam: exam || undefined,
      language: language || undefined,
    });

    router.push("/lehrende");
  };

  return (
    <AppShell
      onBackClick={handleSaveDraft}
      backVariant="close"
      title="Neue Lehrveranstaltung"
      rightAction="none"
      contentClassName="!pb-0"
    >
      <ProgressBar step={step} />

      {step === 1 ? (
        <>
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold leading-[1.1] tracking-[-.4px] sm:text-[24px]">
                Informationen
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">Kurs aus dem Modulhandbuch</p>
            </div>
            <SaveIndicator saving={saving} />
          </div>

          <div className="mb-[18px] relative">
            <label htmlFor="modSearch" className="mb-[7px] block text-[14px] font-medium">
              Kurs aus dem Modulhandbuch suchen
            </label>
            <div className="relative">
              <input
                id="modSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setModuleOpen(true)}
                placeholder="Modulname oder Nummer suchen (z. B. BMI 52, Web...)"
                className="w-full rounded-xl border-[1.5px] border-[#E2E2E2] pl-[13px] pr-[40px] py-3 text-[14.5px] text-ink outline-none transition-colors focus:border-brand"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-3.5 flex items-center justify-center">
                  <SpinnerIcon />
                </div>
              )}
            </div>

            {moduleOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setModuleOpen(false)}
                />
                <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-[280px] overflow-y-auto rounded-xl border border-hairline bg-white shadow-[0_6px_22px_rgba(0,0,0,.1)]">
                  <div className="border-b border-[#F2F2F2] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.5px] text-ink-faint">
                    Ergebnisse ({searchResults.length})
                  </div>
                  {searchResults.map((m) => {
                    const sel = m.id === module;
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col gap-2 border-b border-[#F2F2F2] p-3.5 last:border-b-0 hover:bg-canvas sm:flex-row sm:items-center sm:justify-between"
                        style={{ background: sel ? "#FFF5F6" : undefined }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-brand-tint px-1.5 py-0.5 text-[10px] font-extrabold text-brand">
                              {m.code}
                            </span>
                            <span className="text-[14px] font-semibold text-ink truncate">
                              {m.name}
                            </span>
                          </div>
                          {m.description && (
                            <p className="mt-1 text-[12px] leading-relaxed text-ink-faint line-clamp-2">
                              {m.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-none justify-end">
                          <button
                            type="button"
                            onClick={() => pickModule(m)}
                            className="rounded-lg border border-[#E2E2E2] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink hover:bg-canvas hover:border-[#A6A6A6] transition-colors"
                          >
                            Auswählen
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateImmediately(m)}
                            className="rounded-lg bg-brand px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-pressed transition-colors"
                          >
                            Direkt erstellen
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {searchResults.length === 0 && (
                    <div className="py-6 text-center text-[13px] text-ink-faint">
                      Keine Module gefunden.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mb-[18px] flex gap-2.5 rounded-xl bg-info-bg px-[13px] py-[11px]">
            <InfoIcon />
            <p className="text-[12.5px] leading-[1.5] text-info">
              Moduldaten werden automatisch übernommen.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-hairline bg-white px-[13px] py-[11px] focus-within:border-brand">
              <label htmlFor="modCode" className="block text-[11.5px] font-medium text-ink-faint">
                Modulnummer
              </label>
              <input
                id="modCode"
                type="text"
                value={moduleCode}
                onChange={(e) => {
                  setModuleCode(e.target.value);
                  touch();
                }}
                className="w-full bg-transparent text-[14px] font-medium text-ink outline-none mt-0.5"
              />
            </div>
            <div className="rounded-xl border border-hairline bg-white px-[13px] py-[11px] focus-within:border-brand">
              <label htmlFor="modCredits" className="block text-[11.5px] font-medium text-ink-faint">
                Credits
              </label>
              <input
                id="modCredits"
                type="text"
                value={ects}
                onChange={(e) => {
                  setEcts(e.target.value);
                  touch();
                }}
                className="w-full bg-transparent text-[14px] font-medium text-ink outline-none mt-0.5"
              />
            </div>
            <div className="rounded-xl border border-hairline bg-white px-[13px] py-[11px] focus-within:border-brand">
              <label htmlFor="modExam" className="block text-[11.5px] font-medium text-ink-faint">
                Prüfungsform
              </label>
              <input
                id="modExam"
                type="text"
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  touch();
                }}
                className="w-full bg-transparent text-[14px] font-medium text-ink outline-none mt-0.5"
              />
            </div>
            <div className="rounded-xl border border-hairline bg-white px-[13px] py-[11px] focus-within:border-brand">
              <label htmlFor="modLang" className="block text-[11.5px] font-medium text-ink-faint">
                Sprache
              </label>
              <input
                id="modLang"
                type="text"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  touch();
                }}
                className="w-full bg-transparent text-[14px] font-medium text-ink outline-none mt-0.5"
              />
            </div>
          </div>

          <div className="mb-[18px]">
            <label htmlFor="pname" className="mb-[7px] block text-[14px] font-medium">
              Angezeigter Projektname
            </label>
            <input
              id="pname"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                touch();
              }}
              placeholder="z. B. Parallax-Scrolling"
              className={inputCls}
            />
            <p className="mt-1.5 text-[12px] text-ink-faint">
              Name anpassen, falls die automatische Übernahme abweicht.
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-[7px] block text-[14px] font-medium">Projektbild</label>
            <ImageUpload
              value={image}
              onChange={(v) => {
                setImage(v);
                touch();
              }}
            />
          </div>

          <div className="sticky bottom-0 -mx-4 flex gap-2.5 border-t border-hairline bg-white/95 px-4 py-3.5 backdrop-blur sm:-mx-6 sm:px-6">
            <button
              onClick={handleSaveDraft}
              className="rounded-xl border-[1.5px] border-[#E2E2E2] bg-white px-[18px] py-[11.5px] text-[15px] font-medium text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
            >
              Abbrechen
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!module || !name.trim() || !moduleCode.trim() || !ects.trim()}
              className="flex-1 rounded-xl bg-brand py-[13px] text-[15px] font-medium text-white transition-colors hover:bg-brand-pressed active:bg-brand-pressed disabled:opacity-[.4] disabled:pointer-events-none"
            >
              Weiter zu Eckdaten
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold leading-[1.1] tracking-[-.4px] sm:text-[24px]">
                Eckdaten
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">Beschreibung & Organisation</p>
            </div>
            <SaveIndicator saving={saving} />
          </div>

          <div className="mb-[18px]">
            <label htmlFor="pname2" className="mb-[7px] block text-[14px] font-medium">
              Projektname
            </label>
            <input
              id="pname2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                touch();
              }}
              placeholder="z. B. Parallax-Scrolling"
              className={inputCls}
            />
          </div>

          <div className="mb-[18px]">
            <label className="mb-[7px] block text-[14px] font-medium">Kategorie</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategory(c.id);
                      touch();
                    }}
                    className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[13px] py-2 text-[13px] font-medium transition-colors"
                    style={{
                      background: on ? "#E2001A" : "#fff",
                      color: on ? "#fff" : "#1A1A1A",
                      borderColor: on ? "#E2001A" : "#E2E2E2",
                    }}
                  >
                    <CategoryIcon name={c.icon} size={16} color={on ? "#fff" : "#E2001A"} />
                    {c.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsAddingCat(true)}
                className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] border-dashed border-[#E2E2E2] bg-white px-[13px] py-2 text-[13px] font-medium text-ink-muted hover:border-brand hover:text-brand transition-colors"
              >
                <PlusIcon size={14} />
                Kategorie hinzufügen
              </button>
            </div>

            {isAddingCat && (
              <div className="mt-2.5 rounded-xl border border-hairline bg-white p-3.5 shadow-sm">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.5px] text-ink-faint">
                  Neue Kategorie hinzufügen
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Kategorie-Name (z. B. AI, VR)"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    className="flex-1 rounded-lg border border-[#E2E2E2] px-3 py-1.5 text-[13.5px] outline-none focus:border-brand"
                  />
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[12px] text-ink-faint mr-1">Icon:</span>
                    {(["monitor", "gamepad", "train", "database", "puzzle", "cpu", "brush"] as const).map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setNewCatIcon(ic)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                        style={{
                          borderColor: newCatIcon === ic ? "#E2001A" : "#E2E2E2",
                          background: newCatIcon === ic ? "#FFF5F6" : "#fff",
                        }}
                      >
                        <CategoryIcon name={ic} size={16} color={newCatIcon === ic ? "#E2001A" : "#6B6B6B"} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCat(false);
                        setNewCatLabel("");
                      }}
                      className="rounded-lg border border-[#E2E2E2] bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-muted hover:bg-canvas transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (newCatLabel.trim()) {
                          addCustomCategory(newCatLabel.trim(), newCatIcon);
                          setCategory(newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"));
                          setIsAddingCat(false);
                          setNewCatLabel("");
                          touch();
                        }
                      }}
                      disabled={!newCatLabel.trim()}
                      className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-pressed transition-colors disabled:opacity-[.4] disabled:pointer-events-none"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-[18px]">
            <label htmlFor="desc" className="mb-[7px] block text-[14px] font-medium">
              Beschreibung
            </label>
            <textarea
              id="desc"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                touch();
              }}
              placeholder="Worum geht es im Projekt?"
              className="min-h-[96px] w-full resize-y rounded-xl border-[1.5px] border-[#E2E2E2] px-[13px] py-3 text-[14.5px] leading-[1.55] text-ink outline-none transition-colors focus:border-brand"
            />
          </div>

          <div className="mb-[22px] flex gap-3">
            <div className="flex-1">
              <label className="mb-[7px] block text-[14px] font-medium">Min. Teilnehmer</label>
              <div className="flex items-center overflow-hidden rounded-xl border-[1.5px] border-[#E2E2E2]">
                <button
                  onClick={() => {
                    setMinSeats((s) => Math.max(1, s - 1));
                    touch();
                  }}
                  aria-label="Weniger"
                  className="flex h-[46px] w-[42px] items-center justify-center text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
                >
                  <MinusIcon />
                </button>
                <div className="flex-1 text-center text-[15px] font-bold">{minSeats}</div>
                <button
                  onClick={() => {
                    setMinSeats((s) => {
                      const newMin = Math.min(30, s + 1);
                      if (newMin > maxSeats) {
                        setMaxSeats(Math.min(30, newMin + 1));
                      }
                      return newMin;
                    });
                    touch();
                  }}
                  aria-label="Mehr"
                  className="flex h-[46px] w-[42px] items-center justify-center text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-[7px] block text-[14px] font-medium">Max. Teilnehmer</label>
              <div className="flex items-center overflow-hidden rounded-xl border-[1.5px] border-[#E2E2E2]">
                <button
                  onClick={() => {
                    setMaxSeats((s) => {
                      const newMax = Math.max(1, s - 1);
                      if (newMax < minSeats) {
                        setMinSeats(newMax);
                      }
                      return newMax;
                    });
                    touch();
                  }}
                  aria-label="Weniger"
                  className="flex h-[46px] w-[42px] items-center justify-center text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
                >
                  <MinusIcon />
                </button>
                <div className="flex-1 text-center text-[15px] font-bold">{maxSeats}</div>
                <button
                  onClick={() => {
                    setMaxSeats((s) => Math.min(30, s + 1));
                    touch();
                  }}
                  aria-label="Mehr"
                  className="flex h-[46px] w-[42px] items-center justify-center text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-[7px] block text-[14px] font-medium">Erstes Treffen</label>
              <input
                type="date"
                value={firstMeetingDate}
                onChange={(e) => {
                  setFirstMeetingDate(e.target.value);
                  touch();
                }}
                className={inputCls}
              />
            </div>
          </div>

          <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[.6px] text-ink-faint">
            Kurs-Zuordnung
          </div>
          <p className="mb-[11px] text-[12px] text-ink-faint">
            In welchen Studiengängen wählbar?
          </p>
          <div className="mb-[22px] flex flex-col gap-2">
            {PROGRAMS.map((p) => {
              const on = !!programs[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPrograms((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
                    touch();
                  }}
                  className="flex items-center gap-3 rounded-[13px] border-[1.5px] bg-white px-[13px] py-3 text-left transition-colors"
                  style={{ borderColor: on ? "#E2001A" : "#ECECEC" }}
                >
                  <span
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px] border-[1.5px]"
                    style={{
                      borderColor: on ? "#E2001A" : "#CFCFCF",
                      background: on ? "#E2001A" : "#fff",
                    }}
                  >
                    {on && <CheckIcon color="#fff" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14.5px] font-medium">{p.name}</span>
                    <span className="mt-px block text-[12px] text-ink-faint">{p.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-[11px] text-[12px] font-bold uppercase tracking-[.6px] text-ink-faint">
            Semester-Rhythmus
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {SEMESTERS.map((s) => {
              const on = semester === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSemester(s.id);
                    touch();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border-[1.5px] px-3.5 py-[9px] text-[13.5px] font-medium transition-colors"
                  style={{
                    background: on ? "#FCE6E9" : "#fff",
                    color: on ? "#E2001A" : "#1A1A1A",
                    borderColor: on ? "#E2001A" : "#E2E2E2",
                  }}
                >
                  <span
                    className="flex h-4 w-4 flex-none items-center justify-center rounded-full border-[1.5px]"
                    style={{ borderColor: on ? "#E2001A" : "#CFCFCF" }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: on ? "#E2001A" : "transparent" }}
                    />
                  </span>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-0 -mx-4 flex gap-2.5 border-t border-hairline bg-white/95 px-4 py-3.5 backdrop-blur sm:-mx-6 sm:px-6">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border-[1.5px] border-[#E2E2E2] bg-white px-[18px] py-[11.5px] text-[15px] font-medium text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
            >
              Zurück
            </button>
            <button
              onClick={handleFinish}
              disabled={!desc.trim()}
              className="flex-1 rounded-xl bg-brand py-[13px] text-[15px] font-medium text-white transition-colors hover:bg-brand-pressed active:bg-brand-pressed disabled:opacity-[.4] disabled:pointer-events-none"
            >
              Erstellen
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}
