"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CategoryIcon, ClockIcon, PlusIcon, PresentationIcon, ChevronRight } from "@/components/icons";
import { LECTURER } from "@/data/lehrende";
import { useOfferings } from "@/context/OfferingsContext";
import { DEADLINE_DATE, DEADLINE_DAYS } from "@/data/projects";

function fillPct(applicants: number, seats: number) {
  return Math.min(100, Math.round((applicants / (seats * 2)) * 100));
}

const STATS = [
  { value: "3", label: "Angebote", accent: false },
  { value: "31", label: "Bewerbungen", accent: true },
  { value: "9", label: "offen", accent: false },
];


export default function LehrendeDashboard() {
  const { offerings, deleteOffering } = useOfferings();

  const STATS = [
    { value: String(offerings.length), label: "Angebote", accent: false },
    { value: String(offerings.reduce((sum, o) => sum + o.applicants, 0)), label: "Bewerbungen", accent: true },
    { value: String(offerings.filter((o) => !o.published).length), label: "offen", accent: false },
  ];

  return (
    <AppShell back="/" title="Verwaltung" rightAction="avatar">
      <div className="mb-4">
        <h1 className="text-[28px] font-bold tracking-[-.5px] sm:text-[32px]">Meine Angebote</h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          {LECTURER.name} · {LECTURER.faculty}
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-[14px] border border-[#CFE0F6] bg-info-bg px-4 py-[13px]">
        <ClockIcon color="#1457B8" />
        <div className="flex-1">
          <div className="text-[13px] font-medium leading-tight text-[#103E86]">
            Bewerbungsphase läuft
          </div>
          <div className="mt-px text-[12px] text-info">
            Noch {DEADLINE_DAYS} {DEADLINE_DAYS === 1 ? "Tag" : "Tage"} — danach Zuteilung
          </div>
        </div>
        <span className="whitespace-nowrap rounded-full bg-info px-2.5 py-[5px] text-[12px] font-medium text-white">
          bis {DEADLINE_DATE.replace(" 2026", "")}
        </span>
      </div>

      <div className="mb-7 grid grid-cols-3 gap-2.5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-[14px] border border-hairline bg-white px-3.5 py-[13px]">
            <div
              className={`text-[24px] font-bold tracking-[-.5px] ${s.accent ? "text-brand" : ""}`}
            >
              {s.value}
            </div>
            <div className="mt-px text-[12px] font-medium text-ink-faint">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-[18px] font-medium">Ihre Angebote</h2>
      <ul className="mb-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {offerings.map((o) => (
          <li
            key={o.id}
            className="flex flex-col rounded-2xl border border-hairline bg-white p-3.5 shadow-card"
          >
            <div className="flex items-center gap-3">
              {o.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={o.image}
                  alt=""
                  className="h-11 w-11 flex-none rounded-xl border border-hairline object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-tint">
                  <CategoryIcon name={o.icon} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium leading-tight">{o.name}</div>
                <div className="mt-0.5 text-[12px] text-ink-faint">
                  {o.cat} · {o.kind}
                </div>
              </div>
              {o.published ? (
                <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[12px] font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Live
                </span>
              ) : (
                <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-[#F1EFEC] px-2.5 py-1 text-[12px] font-medium text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
                  Entwurf
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#F1EFEC]">
                <div className="h-full rounded-full bg-brand" style={{ width: `${fillPct(o.applicants, o.seats)}%` }} />
              </div>
              <div className="whitespace-nowrap text-[12px] font-medium text-ink-muted">
                {o.applicants} Bew. · {o.seats} Plätze
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href={`/lehrende/bewerbungen/${o.id}`}
                className="flex-1 rounded-[10px] bg-brand px-3 py-[9px] text-center text-[13px] font-medium text-white transition-colors hover:bg-brand-pressed active:bg-brand-pressed"
              >
                Bewerbungen {o.applicants > 0 ? `(${o.applicants})` : ""}
              </Link>
              <Link
                href={`/lehrende/bearbeiten/${o.id}`}
                className="rounded-[10px] border-[1.5px] border-[#E2E2E2] bg-white px-[14px] py-[7.5px] text-center text-[13px] font-medium text-ink transition-colors hover:bg-canvas active:bg-canvas"
              >
                Bearbeiten
              </Link>
              <button
                onClick={() => {
                  if (confirm(`"${o.name}" wirklich löschen?`)) {
                    deleteOffering(o.id);
                  }
                }}
                className="rounded-[10px] border border-red-200 dark:border-red-900/40 px-3 py-[7.5px] text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mb-1 text-[18px] font-medium">Neues Angebot</h2>
      <p className="mb-3 text-[12px] text-ink-faint">
        Erstellen Sie ein Projekt oder eine klassische Lehrveranstaltung
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Link
          href="/lehrende/neuProjekt"
          className="flex items-center gap-3 rounded-[14px] bg-brand p-3.5 text-white transition-colors hover:bg-brand-pressed active:bg-brand-pressed"
        >
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-white/20">
            <PlusIcon color="#fff" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium">Neues Projekt erstellen</div>
            <div className="mt-px text-[12px] text-white/85">Mit Bewerbung & Motivationsschreiben</div>
          </div>
          <ChevronRight color="#fff" />
        </Link>
        <Link
          href="/lehrende/neuKLV"
          className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-brand bg-white p-[13px] text-ink transition-colors hover:bg-brand-tint active:bg-brand-tint"
        >
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-brand-tint">
            <PresentationIcon />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium">Klassische Lehrveranstaltung</div>
            <div className="mt-px text-[12px] text-ink-faint">Ohne Bewerbungsverfahren</div>
          </div>
          <ChevronRight color="#E2001A" />
        </Link>
      </div>
    </AppShell>
  );
}
