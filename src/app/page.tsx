"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StudentIcon, PresentationIcon, ChevronRight } from "@/components/icons";
import { useAppStore } from "@/store/app-store";

export default function RoleChoicePage() {
  const router = useRouter();
  const { currentUser, changeUser } = useAppStore();

  const handleRoleSelect = (role: "student" | "professor", defaultUserId: string, fallbackPath: string) => {
    if (currentUser.role !== role) {
      changeUser(defaultUserId);
    } else {
      router.push(fallbackPath);
    }
  };

  const ROLES = [
    {
      onClick: () => handleRoleSelect("student", "student-lena", "/studierende"),
      icon: <StudentIcon size={26} />,
      title: "Ich möchte mich bewerben",
      role: "Studierende",
      desc: "Wahlmodule entdecken, Bewerbungen priorisieren und einreichen.",
    },
    {
      onClick: () => handleRoleSelect("professor", "prof-krause", "/lehrende"),
      icon: <PresentationIcon size={26} />,
      title: "Meine Angebote Verwalten",
      role: "Lehrende",
      desc: "Eigene Projekte erstellen, Angebote verwalten und Bewerbungen prüfen.",
    },
  ];

  return (
    <AppShell back={null} rightAction="settings">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center py-6">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-[28px] font-bold tracking-[-.5px] sm:text-[34px]">Modulwahl</h1>
          <p className="mt-2 max-w-prose text-[15px] leading-[1.6] text-ink-muted sm:text-[16px]">
            Willkommen bei der Wahlmodul-Vergabe der Hochschule Düsseldorf. Wie möchten
            Sie fortfahren?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {ROLES.map((r, i) => (
            <button
              key={i}
              onClick={r.onClick}
              className="group text-left flex flex-col gap-4 rounded-2xl border border-hairline bg-white p-5 shadow-card transition-all hover:border-brand hover:shadow-md sm:p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint">
                  {r.icon}
                </div>
                <span className="text-ink-faint transition-colors group-hover:text-brand">
                  <ChevronRight />
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-brand">
                  {r.role}
                </span>
                <h2 className="mt-1 text-[18px] font-medium leading-snug sm:text-[19px] text-ink">
                  {r.title}
                </h2>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-muted">
                  {r.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-[12.5px] text-ink-faint">
          Sie können die Rolle jederzeit über das myHSD-Logo oder oben rechts im Menü wechseln.
        </p>
      </div>
    </AppShell>
  );
}
