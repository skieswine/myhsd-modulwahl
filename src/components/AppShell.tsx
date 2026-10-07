"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { BackIcon, SettingsIcon, HeartIcon, CloseIcon, SunIcon, MoonIcon } from "./icons";
import { useAppStore, USERS, User } from "@/store/app-store";

function Wordmark() {
  return (
    <Link href="/" className="flex items-baseline gap-px" aria-label="myHSD Startseite">
      <span className="-translate-y-[5px] text-[11px] font-extrabold">my</span>
      <span className="text-[22px] font-extrabold tracking-[-.5px] text-brand">HSD</span>
    </Link>
  );
}

type RightAction = "settings" | "heart" | "none" | "avatar";

export function AppShell({
  children,
  back = null,
  backVariant = "arrow",
  title,
  rightAction = "settings",
  contentClassName = "",
  onBackClick = null,
}: {
  children: ReactNode;
  back?: string | null;
  backVariant?: "arrow" | "close";
  title?: string;
  rightAction?: RightAction;
  contentClassName?: string;
  onBackClick?: (() => void) | null;
}) {
  const { currentUser, isSwitching, switchingTarget, changeUser, darkMode, toggleDarkMode } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-hairline bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            {onBackClick ? (
              <button
                type="button"
                onClick={onBackClick}
                aria-label={backVariant === "close" ? "Schließen" : "Zurück"}
                className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-canvas text-ink"
              >
                {backVariant === "close" ? <CloseIcon /> : <BackIcon />}
              </button>
            ) : back ? (
              <Link
                href={back}
                aria-label={backVariant === "close" ? "Schließen" : "Zurück"}
                className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-canvas text-ink"
              >
                {backVariant === "close" ? <CloseIcon /> : <BackIcon />}
              </Link>
            ) : (
              <Wordmark />
            )}
          </div>

          <div className="flex flex-none items-center justify-center">
            {title ? (
              <span className="text-[15px] font-medium">{title}</span>
            ) : back ? (
              <Wordmark />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
            {rightAction === "heart" && (
              <button
                aria-label="Merken"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-canvas"
              >
                <HeartIcon />
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Lichtmodus einschalten" : "Dunkelmodus einschalten"}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-canvas text-ink-muted hover:text-ink"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Profile Dropdown Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Benutzerprofil wechseln"
                style={{
                  backgroundColor: currentUser.avatarBg ?? "#F1EFEC",
                  color: currentUser.avatarFg ?? "#3A3A3A",
                }}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 border border-black/5"
              >
                {currentUser.initials}
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-hairline bg-white p-2.5 shadow-popover z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-[1px] text-ink-faint">
                        Aktueller Benutzer
                      </span>
                      <div className="mt-1 flex items-center gap-2.5">
                        <div
                          style={{
                            backgroundColor: currentUser.avatarBg ?? "#F1EFEC",
                            color: currentUser.avatarFg ?? "#3A3A3A",
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold border border-black/5"
                        >
                          {currentUser.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13.5px] font-semibold text-ink">
                            {currentUser.name}
                          </div>
                          <div className="truncate text-[11px] text-ink-faint">
                            {currentUser.role === "professor" ? "Lehrende/r" : "Studierende/r"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="my-2 h-px bg-hairline" />

                    <div className="px-2.5 pb-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-[1px] text-ink-faint">
                        Benutzer wechseln
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
                      {USERS.map((user) => {
                        const active = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              changeUser(user.id);
                              setIsOpen(false);
                            }}
                            className={`flex items-center gap-2.5 w-full rounded-xl px-2.5 py-1.5 text-left transition-colors ${
                              active
                                ? "bg-brand-tint text-brand"
                                : "text-ink hover:bg-canvas"
                            }`}
                          >
                            <div
                              style={{
                                backgroundColor: user.avatarBg ?? "#F1EFEC",
                                color: user.avatarFg ?? "#3A3A3A",
                              }}
                              className="flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full text-[11px] font-bold border border-black/5"
                            >
                              {user.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12.5px] font-medium leading-tight">
                                {user.name}
                              </div>
                              <div className="truncate text-[10.5px] text-ink-faint">
                                {user.meta ?? (user.role === "professor" ? "Lehrende/r" : "Studierende/r")}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-6 sm:px-6 ${contentClassName}`}
      >
        {children}
      </main>

      {/* Simulated Logout/Login role transition screen */}
      {isSwitching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-card border border-hairline max-w-sm w-[90%] text-center">
            {/* Elegant rotating spinner */}
            <div className="flex h-10 w-10 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="text-[16px] font-bold text-ink">
                Sitzung wird gewechselt
              </h3>
              <p className="text-[13px] text-ink-muted leading-tight">
                Abmelden von <span className="font-semibold text-ink">{currentUser.name}</span>...
              </p>
              <div className="h-px bg-hairline my-2.5" />
              <p className="text-[13.5px] text-brand font-medium animate-pulse">
                Anmelden als <span className="font-bold">{switchingTarget?.name}</span>...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
