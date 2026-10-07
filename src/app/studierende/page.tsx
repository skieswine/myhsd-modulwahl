"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { CategoryIcon, ChevronUp, ChevronDown, ClockIcon } from "@/components/icons";
import {
  PROJECTS,
  DEADLINE_DATE,
  DEADLINE_DAYS,
} from "@/data/projects";
import type { ChipKind } from "@/data/projects";
import { useAppStore } from "@/store/app-store";
import { useOfferings } from "@/context/OfferingsContext";

export default function StudierendeOverviewPage() {
  const { currentUser, order, move } = useAppStore();
  const { offerings, decisions, categories } = useOfferings();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Status-Chip aus der (persistierten) Lehrenden-Entscheidung ableiten.
  // Per Default ist eine Bewerbung nur "Eingereicht" — "Platz zugesagt" bzw.
  // "Abgelehnt" erscheinen erst, wenn die/der Lehrende entschieden hat.
  const getChip = (id: string): { kind: ChipKind; label: string } => {
    const d = decisions[`${currentUser.id}_${id}`];
    if (d === "accepted") return { kind: "success", label: "Platz zugesagt" };
    if (d === "declined") return { kind: "danger", label: "Abgelehnt" };
    return { kind: "info", label: "Eingereicht" };
  };

  const available = offerings.filter(
    (o) => o.published && !order.includes(o.id)
  );

  const filteredAvailable = available.filter((o) => {
    if (selectedTag) {
      const catObj = categories.find((c) => c.id === selectedTag);
      if (catObj && o.cat !== catObj.label) {
        return false;
      }
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = o.name.toLowerCase().includes(q);
      const matchDesc = (o.description ?? "").toLowerCase().includes(q);
      const matchCode = (o.code ?? "").toLowerCase().includes(q);
      const matchCat = o.cat.toLowerCase().includes(q);
      return matchName || matchDesc || matchCode || matchCat;
    }
    return true;
  });

  // Hilfsfunktion: Projekt-Anzeige-Daten aus beiden Quellen holen
  const getDisplayProject = (id: string) => {
    const staticProject = PROJECTS[id];
    if (staticProject) return staticProject;

    const offering = offerings.find((o) => o.id === id);
    if (!offering) return null;

    return {
      id: offering.id,
      name: offering.name,
      cat: offering.cat,
      icon: offering.icon,
    };
  };

  return (
    <AppShell back="/" rightAction="settings">
      <div className="mb-5">
        <h1 className="text-[28px] font-bold tracking-[-.5px] sm:text-[32px]">Modulwahl</h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          Informatikprojekt · WiSe 2025/26
        </p>
      </div>

      <div className="mb-7 flex items-center gap-3 rounded-[14px] border border-warn-border bg-warn-bg px-4 py-[13px]">
        <ClockIcon />
        <div className="flex-1">
          <div className="text-[13px] font-medium leading-tight text-[#7A4900]">
            Bewerbungsfrist {DEADLINE_DATE}
          </div>
          <div className="mt-px text-[12px] text-warn">
            Danach ist keine Änderung mehr möglich
          </div>
        </div>
        <span className="whitespace-nowrap rounded-full bg-warn px-2.5 py-[5px] text-[12px] font-medium text-white">
          noch {DEADLINE_DAYS} Tage
        </span>
      </div>

      <div className="mb-1.5 flex items-baseline justify-between">
        <h2 className="text-[18px] font-medium">Ihre Bewerbungen</h2>
        <span className="text-[12px] font-medium text-ink-faint">
          {order.length} · sortiert nach Priorität
        </span>
      </div>
      <p className="mb-3 text-[12px] text-ink-faint">
        Position 1 wird zuerst berücksichtigt — mit den Pfeilen umsortieren.
      </p>

      <ul className="mb-8 flex flex-col gap-2.5">
        {order.map((id, idx) => {
          const p = getDisplayProject(id);
          const chip = getChip(id);
          if (!p) return null;
          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-2xl border border-hairline bg-white py-3 pl-[13px] pr-3 shadow-card transition-shadow hover:shadow-md sm:gap-4 sm:px-4"
            >
              <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-brand text-[14px] font-bold text-white">
                {idx + 1}
              </div>
              <Link
                href={`/projekt/${id}`}
                className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl bg-brand-tint"
                aria-label={`${p.name} ansehen`}
              >
                <CategoryIcon name={p.icon} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/projekt/${id}`}
                  className="block truncate text-[15px] font-medium leading-tight hover:text-brand"
                >
                  {p.name}
                </Link>
                <div className="mt-[5px] flex items-center gap-2">
                  <StatusChip kind={chip.kind} label={chip.label} />
                  <span className="hidden text-[12px] text-ink-faint sm:inline">
                    {p.cat}
                  </span>
                </div>
              </div>
              <div className="flex flex-none flex-col gap-1">
                <button
                  onClick={() => move(id, -1)}
                  disabled={idx === 0}
                  aria-label="Höher priorisieren"
                  className="flex h-7 w-8 items-center justify-center rounded-lg border border-line transition-colors hover:bg-canvas active:bg-canvas disabled:opacity-[.32] disabled:hover:bg-transparent"
                >
                  <ChevronUp />
                </button>
                <button
                  onClick={() => move(id, 1)}
                  disabled={idx === order.length - 1}
                  aria-label="Niedriger priorisieren"
                  className="flex h-7 w-8 items-center justify-center rounded-lg border border-line transition-colors hover:bg-canvas active:bg-canvas disabled:opacity-[.32] disabled:hover:bg-transparent"
                >
                  <ChevronDown />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-1 text-[18px] font-medium">Weitere Wahlmöglichkeiten</h2>
      <p className="mb-3 text-[12px] text-ink-faint">Tippen zum Ansehen, dann bewerben</p>

      {/* Search Input Bar */}
      <div className="mb-3.5 relative">
        <input
          type="text"
          placeholder="Modulname, Beschreibung oder Code suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border-[1.5px] border-[#E2E2E2] px-[13px] py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-brand"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3 text-[12px] font-semibold text-brand hover:text-brand-pressed transition-colors"
          >
            Löschen
          </button>
        )}
      </div>

      {/* Dropdown Filter */}
      <div className="mb-4 relative">
        <div className="relative">
          <select
            value={selectedTag || ""}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="w-full appearance-none rounded-xl border-[1.5px] border-[#E2E2E2] bg-white pl-[13px] pr-[40px] py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-brand cursor-pointer"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-3.5 flex items-center justify-center text-ink-faint">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {filteredAvailable.map((o) => (
          <li
            key={o.id}
            className="flex items-center gap-3 rounded-2xl border border-hairline bg-white px-[13px] py-3 shadow-card transition-shadow hover:shadow-md"
          >
            {o.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={o.image}
                alt=""
                className="h-[42px] w-[42px] flex-none rounded-xl border border-hairline object-cover"
              />
            ) : (
              <div className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl bg-canvas">
                <CategoryIcon name={o.icon} color="#6B6B6B" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium leading-tight">{o.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-faint">
                {o.cat} · {o.applicants}/{o.seats} Plätze
              </div>
            </div>
            <Link
              href={`/projekt/${o.id}`}
              className="flex-none rounded-[10px] border-[1.5px] border-brand bg-white px-[14px] py-[7px] text-[13px] font-medium text-brand transition-colors hover:bg-brand-tint active:bg-brand-tint"
            >
              Bewerben
            </Link>
          </li>
        ))}
        {filteredAvailable.length === 0 && (
          <li className="col-span-full rounded-2xl border border-dashed border-hairline px-4 py-8 text-center text-[13.5px] text-ink-faint">
            {available.length === 0
              ? "Aktuell keine weiteren Angebote verfügbar."
              : "Keine Module gefunden, die den Filtern entsprechen."}
          </li>
        )}
      </ul>
    </AppShell>
  );
}