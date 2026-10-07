"use client";

import { use } from "react";
import { useRouter, notFound, useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { CheckIcon, SpinnerIcon, InfoIcon } from "@/components/icons";
import { PROJECTS } from "@/data/projects";
import { useAppStore } from "@/store/app-store";
import { useOfferings } from "@/context/OfferingsContext";

const MAX = 1500;

export default function BewerbungPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getApplication, setMotivation, setGroup, saveStatus, apply, order } = useAppStore();
  const { motivation, group } = getApplication(id);
  const { offerings, registerApplication } = useOfferings();

  // 1. Zuerst im statischen Katalog suchen
  const staticProject = PROJECTS[id];

  // 2. Falls nicht gefunden, im Lehrenden-Angebot suchen
  const offering = offerings.find((o) => o.id === id);

  const project = staticProject ?? (offering
    ? { id: offering.id, name: offering.name }
    : null);

  if (!project) notFound();

  const priority = order.indexOf(id) + 1;
  const saving = saveStatus === "saving";

  return (
    <AppShell back={`/projekt/${id}`} rightAction="none" contentClassName="!pb-0">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-[1.1] tracking-[-.5px] sm:text-[30px]">
            Bewerbung
          </h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            {project.name}
            {priority > 0 ? ` · Priorität ${priority}` : ""}
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

      <div className="mb-6">
        <label htmlFor="motivation" className="mb-1.5 block text-[14px] font-medium">
          Motivationsschreiben
        </label>
        <p className="mb-[9px] text-[12.5px] leading-[1.45] text-ink-faint">
          Warum möchten Sie an diesem Projekt teilnehmen? Welche Vorerfahrung bringen Sie mit?
        </p>
        <textarea
          id="motivation"
          value={motivation}
          maxLength={MAX}
          onChange={(e) => setMotivation(id, e.target.value)}
          placeholder="Ihre Motivation …"
          className="min-h-[160px] w-full resize-y rounded-xl border-[1.5px] border-[#E2E2E2] p-[13px] text-[14.5px] leading-[1.55] text-ink outline-none focus:border-brand"
        />
        <div className="mt-1.5 flex justify-end text-[12px] text-[#A6A6A6]">
          {motivation.length} / {MAX} Zeichen
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="group" className="mb-1.5 block text-[14px] font-medium">
          Gruppenwunsch <span className="font-normal text-[#A6A6A6]">· optional</span>
        </label>
        <p className="mb-[9px] text-[12.5px] leading-[1.45] text-ink-faint">
          Mit wem möchten Sie zusammenarbeiten? Namen oder Matrikelnummern.
        </p>
        <textarea
          id="group"
          value={group}
          onChange={(e) => setGroup(id, e.target.value)}
          placeholder="z. B. Lena Becker, Tim Hoffmann …"
          className="min-h-[90px] w-full resize-y rounded-xl border-[1.5px] border-[#E2E2E2] p-[13px] text-[14.5px] leading-[1.55] text-ink outline-none focus:border-brand"
        />
      </div>

      <div className="mb-2 flex gap-2.5 rounded-xl bg-info-bg px-[14px] py-3">
        <InfoIcon />
        <p className="text-[12.5px] leading-[1.5] text-info">
          Eingaben werden automatisch gespeichert. Sie können die Bewerbung bis zum
          Fristende jederzeit anpassen.
        </p>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-4 border-t border-hairline bg-white/95 backdrop-blur sm:-mx-6">
        <div className="flex gap-2.5 px-4 py-3.5 sm:px-6">
          <Button
            variant="primary"
            full
            onClick={() => {
              apply(id);
              registerApplication(id);
              router.push("/studierende");
            }}
          >
            Bewerbung absenden
          </Button>
          <Button variant="neutral" onClick={() => router.push(`/projekt/${id}`)}>
            Verwerfen
          </Button>
        </div>
      </div>
    </AppShell>
  );
}