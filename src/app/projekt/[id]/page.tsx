"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { ButtonLink, Button } from "@/components/Button";
import {
  CategoryIcon,
  CalendarIcon,
  SemesterIcon,
  GroupIcon,
  ShieldIcon,
  PresentationIcon,
  InfoIcon,
} from "@/components/icons";
import { PROJECTS } from "@/data/projects";
import type { ChipKind } from "@/data/projects";
import { useAppStore } from "@/store/app-store";
import { useOfferings } from "@/context/OfferingsContext";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  return dateStr;
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-[11px] rounded-[14px] border border-hairline bg-white p-[13px]">
      {icon}
      <div>
        <div className="text-[11.5px] font-medium text-ink-faint">{label}</div>
        <div className="mt-0.5 text-[14px] font-medium leading-tight">{value}</div>
      </div>
    </div>
  );
}

export default function ProjektDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser, order, withdraw } = useAppStore();
  const { offerings, withdrawApplication, decisions, resetDecision } = useOfferings();

  // 1. Zuerst im statischen Katalog suchen
  const staticProject = PROJECTS[id];

  // 2. Falls nicht gefunden, im Lehrenden-Angebot suchen und in dasselbe Shape mappen
  const offering = offerings.find((o) => o.id === id);

  const project = staticProject ?? (offering
    ? {
        id: offering.id,
        name: offering.name,
        cat: offering.cat,
        icon: offering.icon,
        description: offering.description ?? "Keine Beschreibung vorhanden.",
        termine: offering.termine ?? "Noch nicht festgelegt",
        semester: offering.semester ?? "—",
        groupSize: offering.groupSize ?? `bis ${offering.seats} Pers.`,
        prerequisite: offering.prerequisite ?? "—",
        code: (offering as any).code,
        ects: (offering as any).ects,
        exam: (offering as any).exam,
        language: (offering as any).language,
        certTitle: (offering as any).certTitle,
      }
    : null);

  if (!project) notFound();

  // Hochgeladenes Projektbild (falls die/der Lehrende eines gesetzt hat)
  const heroImage = offering?.image;

  const applied = order.includes(id);
  const priority = order.indexOf(id) + 1;

  // Status aus der Lehrenden-Entscheidung ableiten — per Default nur "eingereicht"
  const decision = decisions[`${currentUser.id}_${id}`];
  const chip: { kind: ChipKind; label: string } =
    decision === "accepted"
      ? { kind: "success", label: "Platz zugesagt" }
      : decision === "declined"
        ? { kind: "danger", label: "Abgelehnt" }
        : { kind: "info", label: "Bewerbung eingereicht" };

  return (
    <AppShell back="/studierende" rightAction="heart" contentClassName="!px-0 !pb-0">
      <div className="px-4 sm:px-6">
        {heroImage ? (
          <div className="w-full overflow-hidden rounded-2xl border border-hairline">
            {/* Data-URL aus localStorage — next/image bringt hier keinen Vorteil */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={`Projektbild: ${project.name}`}
              className="aspect-[16/9] max-h-[260px] w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] max-h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl border border-hairline [background:repeating-linear-gradient(135deg,#EDEDED_0_14px,#F6F6F6_14px_28px)]">
            <span className="font-mono text-[12px] text-[#A6A6A6]">[ Projektbild · 16:9 ]</span>
          </div>
        )}
        <div className="mt-5">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-2.5 py-1 text-[12px] font-medium text-brand">
            <CategoryIcon name={project.icon} size={14} />
            {project.cat}
          </div>
          <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-.5px] sm:text-[30px]">
            {project.name}
          </h1>
          {applied && (
            <div className="mt-3 flex items-center gap-2">
              <StatusChip kind={chip.kind} label={chip.label} />
              <span className="text-[12px] text-ink-faint">Priorität {priority}</span>
            </div>
          )}
          <div className="mb-2 mt-6 text-[12px] font-bold uppercase tracking-[.6px] text-ink-faint">
            Beschreibung
          </div>
          <p className="max-w-prose text-[15px] leading-[1.6] text-[#3A3A3A]">
            {project.description}
          </p>
          <div className="mb-2.5 mt-7 text-[12px] font-bold uppercase tracking-[.6px] text-ink-faint">
            Eckdaten
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {project.termine && project.termine !== "—" && project.termine !== "Noch nicht festgelegt" && (
              <MetaItem icon={<CalendarIcon />} label="Termine" value={formatDate(project.termine)} />
            )}
            <MetaItem icon={<SemesterIcon />} label="Semester" value={project.semester} />
            <MetaItem icon={<GroupIcon />} label="Gruppengröße" value={project.groupSize} />
            <MetaItem icon={<ShieldIcon />} label="Voraussetzung" value={project.prerequisite} />
            {(project as any).code && <MetaItem icon={<ShieldIcon />} label="Modulnummer" value={(project as any).code} />}
            {(project as any).ects && <MetaItem icon={<SemesterIcon />} label="Credits" value={(project as any).ects} />}
            {(project as any).exam && <MetaItem icon={<PresentationIcon size={20} />} label="Prüfungsform" value={(project as any).exam} />}
            {(project as any).language && <MetaItem icon={<InfoIcon color="#E2001A" />} label="Sprache" value={(project as any).language} />}
            {(project as any).certTitle && <MetaItem icon={<PresentationIcon size={20} />} label="Zeugnistitel" value={(project as any).certTitle} />}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 mt-8 border-t border-hairline bg-white/95 backdrop-blur">
        <div className="flex gap-2.5 px-4 py-3.5 sm:px-6">
          {applied ? (
            <>
              <ButtonLink href={`/bewerbung/${id}`} variant="primary" full>
                Bewerbung bearbeiten
              </ButtonLink>
              <Button
                variant="secondary"
                onClick={() => {
                  withdraw(id);
                  withdrawApplication(id);
                  resetDecision(currentUser.id, id);
                }}
              >
                Zurückziehen
              </Button>
            </>
          ) : (
            <ButtonLink href={`/bewerbung/${id}`} variant="primary" full>
              Jetzt bewerben
            </ButtonLink>
          )}
        </div>
      </div>
    </AppShell>
  );
}