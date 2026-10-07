"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  CategoryIcon,
  CheckIcon,
  SpinnerIcon,
  PlusIcon,
  MinusIcon,
} from "@/components/icons";
import { CATEGORIES } from "@/data/lehrende";
import { useOfferings } from "@/context/OfferingsContext";
import { ImageUpload } from "@/components/ImageUpload";
import type { IconName } from "@/data/projects";

const inputCls =
  "w-full rounded-xl border-[1.5px] border-[#E2E2E2] px-[13px] py-3 text-[14.5px] text-ink outline-none transition-colors focus:border-brand";

export default function EditOfferingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { offerings, updateOffering, categories, addCustomCategory } = useOfferings();

  const offering = offerings.find((o) => o.id === id);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("web");
  const [seats, setSeats] = useState(7);
  const [published, setPublished] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [certTitle, setCertTitle] = useState("");
  const [firstMeetingDate, setFirstMeetingDate] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States for adding custom categories
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<IconName>("monitor");

  // Formular einmalig aus dem (ggf. erst nach Hydration verfügbaren) Angebot befüllen
  useEffect(() => {
    if (offering && !loaded) {
      setName(offering.name);
      setDesc(offering.description ?? "");
      setCategory(categories.find((c) => c.label === offering.cat)?.id ?? "web");
      setSeats(offering.seats);
      setPublished(offering.published);
      setImage(offering.image ?? null);
      setCertTitle((offering as any).certTitle ?? "");
      setFirstMeetingDate(offering.termine ?? "");
      setLoaded(true);
    }
  }, [offering, loaded]);

  const touch = () => {
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaving(false), 800);
  };

  if (!offering) {
    return (
      <AppShell back="/lehrende" title="Bearbeiten" rightAction="none">
        <p className="py-10 text-center text-[13px] text-ink-faint">
          Angebot nicht gefunden.
        </p>
      </AppShell>
    );
  }

  const handleSave = () => {
    const selectedCat = categories.find((c) => c.id === category);
    updateOffering({
      ...offering,
      name: name || offering.name,
      description: desc,
      cat: selectedCat?.label ?? offering.cat,
      icon: selectedCat?.icon ?? offering.icon,
      seats,
      published,
      image: image ?? undefined,
      certTitle: offering.kind === "Projekt" ? certTitle : undefined,
      termine: firstMeetingDate,
    });
    router.push("/lehrende");
  };

  return (
    <AppShell
      back="/lehrende"
      backVariant="close"
      title="Angebot bearbeiten"
      rightAction="none"
      contentClassName="!pb-0"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold leading-[1.1] tracking-[-.4px] sm:text-[24px]">
            {offering.name}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {offering.cat} · {offering.kind}
          </p>
        </div>
        <div
          className="mt-1.5 flex flex-none items-center gap-1.5 text-[12px] font-medium"
          style={{ color: saving ? "#9A9A9A" : "#0F7A3D" }}
        >
          {saving ? <SpinnerIcon /> : <CheckIcon />}
          {saving ? "Wird gespeichert …" : "Gespeichert"}
        </div>
      </div>

      <div className="mb-[18px]">
        <label htmlFor="ename" className="mb-[7px] block text-[14px] font-medium">
          Projektname
        </label>
        <input
          id="ename"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            touch();
          }}
          placeholder="z. B. Parallax-Scrolling"
          className={inputCls}
        />
      </div>

      {offering.kind === "Projekt" && (
        <div className="mb-[18px]">
          <label htmlFor="certtitle" className="mb-[7px] block text-[14px] font-medium">
            Zeugnistitel
          </label>
          <input
            id="certtitle"
            value={certTitle}
            onChange={(e) => {
              setCertTitle(e.target.value);
              touch();
            }}
            placeholder="z. B. Parallax-Scrolling"
            className={inputCls}
          />
        </div>
      )}

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
        <label htmlFor="edesc" className="mb-[7px] block text-[14px] font-medium">
          Beschreibung
        </label>
        <textarea
          id="edesc"
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
            touch();
          }}
          placeholder="Worum geht es im Projekt?"
          className="min-h-[96px] w-full resize-y rounded-xl border-[1.5px] border-[#E2E2E2] px-[13px] py-3 text-[14.5px] leading-[1.55] text-ink outline-none transition-colors focus:border-brand"
        />
      </div>
      <div className="mb-[18px]">
        <label htmlFor="firstMeeting" className="mb-[7px] block text-[14px] font-medium">
          Erstes Treffen
        </label>
        <input
          id="firstMeeting"
          type="date"
          value={firstMeetingDate}
          onChange={(e) => {
            setFirstMeetingDate(e.target.value);
            touch();
          }}
          className={inputCls}
        />
      </div>

      <div className="mb-[22px] flex gap-3">
        <div className="flex-1">
          <label className="mb-[7px] block text-[14px] font-medium">Plätze</label>
          <div className="flex items-center overflow-hidden rounded-xl border-[1.5px] border-[#E2E2E2]">
            <button
              onClick={() => {
                setSeats((s) => Math.max(1, s - 1));
                touch();
              }}
              aria-label="Weniger"
              className="flex h-[46px] w-[42px] items-center justify-center text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
            >
              <MinusIcon />
            </button>
            <div className="flex-1 text-center text-[15px] font-bold">{seats}</div>
            <button
              onClick={() => {
                setSeats((s) => Math.min(30, s + 1));
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
          <label className="mb-[7px] block text-[14px] font-medium">Status</label>
          <button
            onClick={() => {
              setPublished((v) => !v);
              touch();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] text-[14px] font-medium transition-colors"
            style={{
              borderColor: published ? "#0F7A3D" : "#E2E2E2",
              background: published ? "#E4F5EA" : "#fff",
              color: published ? "#0F7A3D" : "#6B6B6B",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: published ? "#0F7A3D" : "#9A9A9A" }}
            />
            {published ? "Live" : "Entwurf"}
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex gap-2.5 border-t border-hairline bg-white/95 px-4 py-3.5 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          onClick={() => router.push("/lehrende")}
          className="rounded-xl border-[1.5px] border-[#E2E2E2] bg-white px-[18px] py-[11.5px] text-[15px] font-medium text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="flex-1 rounded-xl bg-brand py-[13px] text-[15px] font-medium text-white transition-colors hover:bg-brand-pressed active:bg-brand-pressed"
        >
          Änderungen speichern
        </button>
      </div>
    </AppShell>
  );
}
