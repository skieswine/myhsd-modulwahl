"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  CategoryIcon,
  CheckIcon,
  SpinnerIcon,
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

export default function NeuesProjektPage() {
  const router = useRouter();
  const { addOffering, categories, addCustomCategory } = useOfferings();

  const [step, setStep] = useState(1);
  const [module, setModule] = useState("bmi52");
  const [name, setName] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certTitleTouched, setCertTitleTouched] = useState(false);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("web");
  const [minSeats, setMinSeats] = useState(5);
  const [maxSeats, setMaxSeats] = useState(minSeats + 2);
  const [imgDesc, setImgDesc] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Record<string, boolean>>({
    mmi: true,
    bmi25: true,
    bmi18: false,
  });
  const [semester, setSemester] = useState("wise");
  const [firstMeetingDate, setFirstMeetingDate] = useState(() => new Date().toLocaleDateString("sv-SE"));
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States for adding custom categories
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<IconName>("monitor");

  const touch = () => {
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaving(false), 800);
  };

  const selMod = MODULES.find((m) => m.id === module) ?? MODULES[0];

  const handleFinish = () => {
    const selectedCat = categories.find((c) => c.id === category);
    const selectedSemester = SEMESTERS.find((s) => s.id === semester);

    addOffering({
      id: `proj-${Date.now()}`,
      name: name || "Unbenanntes Projekt",
      cat: selectedCat?.label ?? "",
      kind: "Projekt",
      icon: selectedCat?.icon ?? "monitor",
      applicants: 0,
      seats: maxSeats,
      published: true,
      description: desc,
      termine: firstMeetingDate,
      semester: selectedSemester?.label ?? "",
      groupSize: `${minSeats}–${maxSeats} Pers.`,
      prerequisite: selMod.name,
      image: image ?? undefined,
      certTitle: certTitle || undefined,
      imgDesc: imgDesc || undefined,
    });

    router.push("/lehrende");
  };

  const handleSaveDraft = () => {
    const selectedCat = categories.find((c) => c.id === category);
    const selectedSemester = SEMESTERS.find((s) => s.id === semester);

    addOffering({
      id: `proj-${Date.now()}`,
      name: name || "Unbenanntes Projekt (Entwurf)",
      cat: selectedCat?.label ?? "",
      kind: "Projekt",
      icon: selectedCat?.icon ?? "monitor",
      applicants: 0,
      seats: maxSeats,
      published: false,
      description: desc,
      termine: firstMeetingDate,
      semester: selectedSemester?.label ?? "",
      groupSize: `${minSeats}–${maxSeats} Pers.`,
      prerequisite: selMod.name,
      image: image ?? undefined,
      certTitle: certTitle || undefined,
      imgDesc: imgDesc || undefined,
    });

    router.push("/lehrende");
  };

  return (
    <AppShell
      onBackClick={handleSaveDraft}
      backVariant="close"
      title="Neues Projekt"
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
              <p className="mt-1 text-[13px] text-ink-muted">Angezeigte Informationen im Dashboard</p>
            </div>
            <SaveIndicator saving={saving} />
          </div>

          <div className="mb-[18px]">
            <label htmlFor="pname" className="mb-[7px] block text-[14px] font-medium">
              Angezeigter Projektname
            </label>
            <input
              id="pname"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                if (!certTitleTouched) {
                  setCertTitle(value);
                }
                touch();
              }}
              placeholder="z. B. Parallax-Scrolling"
              className={inputCls}
            />
          </div>

          <div className="mb-[18px]">
            <label htmlFor="certtitle" className="mb-[7px] block text-[14px] font-medium">
              Zeugnistitel
            </label>
            <input
              id="certtitle"
              value={certTitle}
              onChange={(e) => {
                setCertTitle(e.target.value);
                setCertTitleTouched(true);
                touch();
              }}
              placeholder="z. B. Parallax-Scrolling"
              className={inputCls}
            />
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
          
          <div className="mb-[18px]">
            <label htmlFor="imgDesc" className="mb-[7px] block text-[14px] font-medium">
              Bildunterschrift (Optional)
            </label>
            <input
              id="imgDesc"
              value={imgDesc}
              onChange={(e) => {
                setImgDesc(e.target.value);
                touch();
              }}
              placeholder="Untertitel eingeben..."
              className={inputCls}
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
              disabled={!name.trim() || !certTitle.trim()}
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
