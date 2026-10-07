"use client";

import { use, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CategoryIcon } from "@/components/icons";
import { OFFERINGS } from "@/data/lehrende";
import { useOfferings } from "@/context/OfferingsContext";
import { useAppStore, USERS } from "@/store/app-store";

type Filter = "alle" | "offen" | "zugesagt";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "offen", label: "Offen" },
  { id: "zugesagt", label: "Zugesagt" },
];

export default function BewerbungenPruefenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { offerings, decisions, decide, resetDecision } = useOfferings();
  const { studentsData } = useAppStore();

  // Angebot bevorzugt aus dem (live) OfferingsContext holen, Fallback auf die Defaults
  const offering =
    offerings.find((o) => o.id === id) ??
    OFFERINGS.find((o) => o.id === id) ??
    offerings[0];

  const seats = offering?.seats ?? 0;

  // Bewerbungen aus allen Studentendaten filtern und zusammensuchen
  const realApplicants = useMemo(() => {
    if (!offering) return [];
    
    const list: {
      studentId: string;
      studentName: string;
      initials: string;
      avatarBg?: string;
      avatarFg?: string;
      prio: number;
      motivation: string;
      group: string;
    }[] = [];

    Object.entries(studentsData).forEach(([studentId, data]) => {
      if (data.order.includes(offering.id)) {
        const user = USERS.find((u) => u.id === studentId);
        const app = data.applications[offering.id] ?? { motivation: "", group: "" };
        list.push({
          studentId,
          studentName: user?.name ?? "Studierende/r",
          initials: user?.initials ?? "S",
          avatarBg: user?.avatarBg,
          avatarFg: user?.avatarFg,
          prio: data.order.indexOf(offering.id) + 1,
          motivation: app.motivation,
          group: app.group,
        });
      }
    });

    return list;
  }, [offering, studentsData]);

  const [filter, setFilter] = useState<Filter>("alle");

  const accepted = useMemo(
    () => realApplicants.filter((a) => decisions[`${a.studentId}_${offering.id}`] === "accepted").length,
    [decisions, realApplicants, offering.id]
  );
  const decided = useMemo(
    () => realApplicants.filter((a) => decisions[`${a.studentId}_${offering.id}`]).length,
    [decisions, realApplicants, offering.id]
  );
  const open = realApplicants.length - decided;
  const acceptedPct = seats > 0 ? Math.round((accepted / seats) * 100) : 0;

  const list = realApplicants.filter((a) => {
    const dec = decisions[`${a.studentId}_${offering.id}`];
    if (filter === "offen") return !dec;
    if (filter === "zugesagt") return dec === "accepted";
    return true;
  });

  if (!offering) {
    return (
      <AppShell back="/lehrende" title="Bewerbungen" rightAction="none">
        <p className="py-10 text-center text-[13px] text-ink-faint">
          Angebot nicht gefunden.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell back="/lehrende" title="Bewerbungen" rightAction="none">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-tint">
          <CategoryIcon name={offering.icon} />
        </div>
        <div>
          <h1 className="text-[20px] font-bold leading-tight tracking-[-.3px] sm:text-[22px] text-ink">
            {offering.name}
          </h1>
          <p className="mt-px text-[13px] text-ink-muted">
            {offering.cat} · {offering.kind}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-hairline bg-white p-[15px]">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-[14px] font-medium">Plätze vergeben</span>
          <span className="text-[14px] font-bold">
            <span className="text-success">{accepted}</span> / {seats}
          </span>
        </div>
        <div className="h-[9px] overflow-hidden rounded-full bg-[#F1EFEC]">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-300"
            style={{ width: `${acceptedPct}%` }}
          />
        </div>
        <p className="mt-2.5 text-[12px] text-ink-faint">
          {realApplicants.length} Bewerbungen insgesamt · {open} noch offen
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border-[1.5px] px-3.5 py-[7px] text-[13px] font-medium transition-colors ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-[#E2E2E2] bg-white text-ink hover:bg-canvas"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {list.map((a) => {
          const st = decisions[`${a.studentId}_${offering.id}`];
          return (
            <li key={a.studentId} className="rounded-2xl border border-hairline bg-white p-3.5 shadow-card">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[13px] font-bold border border-black/5"
                  style={{ backgroundColor: a.avatarBg ?? "#E6EFFB", color: a.avatarFg ?? "#1457B8" }}
                >
                  {a.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-medium text-ink">{a.studentName}</span>
                    <span className="inline-flex items-center rounded-full bg-brand-tint px-[7px] py-0.5 text-[11px] font-bold text-brand">
                      Prio {a.prio}
                    </span>
                  </div>
                  {a.group && (
                    <div className="mt-px text-[12px] text-ink-faint">
                      Gruppenwunsch: {a.group}
                    </div>
                  )}
                </div>
                {st === "accepted" && (
                  <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[12px] font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Zugesagt
                  </span>
                )}
                {st === "declined" && (
                  <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-danger-bg px-2.5 py-1 text-[12px] font-medium text-danger">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                    Abgelehnt
                  </span>
                )}
              </div>

              <p className="mt-3 rounded-[10px] bg-[#F8F8F7] px-3 py-[11px] text-[13px] leading-[1.5] text-[#3A3A3A]">
                {a.motivation ? `„${a.motivation}“` : "Kein Motivationsschreiben hinterlegt."}
              </p>

              {!st ? (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => decide(a.studentId, offering.id, "accepted")}
                    className="flex-1 rounded-[10px] bg-brand py-[9px] text-[13px] font-medium text-white transition-colors hover:bg-brand-pressed active:bg-brand-pressed"
                  >
                    Zusagen
                  </button>
                  <button
                    onClick={() => decide(a.studentId, offering.id, "declined")}
                    className="flex-1 rounded-[10px] border-[1.5px] border-[#E2E2E2] bg-white py-[7.5px] text-[13px] font-medium text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
                  >
                    Ablehnen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => resetDecision(a.studentId, offering.id)}
                  className="mt-2 w-full py-[9px] text-[12px] font-medium text-ink-faint transition-colors hover:text-ink"
                >
                  Entscheidung zurücknehmen
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {realApplicants.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-ink-faint">
          Für dieses Angebot liegen noch keine Bewerbungen vor.
        </p>
      ) : (
        list.length === 0 && (
          <p className="py-10 text-center text-[13px] text-ink-faint">
            Keine Bewerbungen in dieser Ansicht.
          </p>
        )
      )}
    </AppShell>
  );
}
