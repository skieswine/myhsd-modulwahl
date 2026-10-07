"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { OFFERINGS as INITIAL_OFFERINGS, Offering, CATEGORIES as INITIAL_CATEGORIES } from "@/data/lehrende";
import { useAppStore } from "@/store/app-store";
import type { IconName } from "@/data/projects";

const STORAGE_KEY = "lehrende_offerings";

export type Decision = "accepted" | "declined";

interface OfferingsContextValue {
  offerings: Offering[];
  addOffering: (offering: Offering) => void;
  deleteOffering: (id: string) => void;
  updateOffering: (offering: Offering) => void;
  registerApplication: (offeringId: string) => void;
  withdrawApplication: (offeringId: string) => void;
  decisions: Record<string, Decision>;
  decide: (studentId: string, offeringId: string, decision: Decision) => void;
  resetDecision: (studentId: string, offeringId: string) => void;
  categories: { id: string; label: string; icon: IconName }[];
  addCustomCategory: (label: string, icon: IconName) => void;
}

const APPLIED_STORAGE_KEY = "lehrende_offerings_applied_ids";
const DECISIONS_STORAGE_KEY = "lehrende_offerings_decisions";

function readDecisionsFromStorage(): Record<string, Decision> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DECISIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readAppliedFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(APPLIED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const OfferingsContext = createContext<OfferingsContextValue | undefined>(undefined);

function readFromStorage(): Offering[] {
  if (typeof window === "undefined") return INITIAL_OFFERINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_OFFERINGS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_OFFERINGS;
    return parsed;
  } catch {
    return INITIAL_OFFERINGS;
  }
}

export function OfferingsProvider({ children }: { children: ReactNode }) {
  const { studentsData } = useAppStore();

  // Start mit den hartcodierten Defaults
  const [offeringsState, setOfferingsState] = useState<Offering[]>(INITIAL_OFFERINGS);
  const [hydrated, setHydrated] = useState(false);

  // Merkt sich appliedIds (beibehalten für Kompatibilität)
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  // Entscheidungen der Lehrenden (Zusagen/Ablehnen) — Key ist "studentId_offeringId"
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const [customCategories, setCustomCategories] = useState<{ id: string; label: string; icon: IconName }[]>([]);

  // Nach dem ersten Render im Browser: echten localStorage-Stand laden
  useEffect(() => {
    setOfferingsState(readFromStorage());
    setAppliedIds(readAppliedFromStorage());
    setDecisions(readDecisionsFromStorage());
    try {
      const rawCat = window.localStorage.getItem("lehrende_custom_categories");
      if (rawCat) {
        setCustomCategories(JSON.parse(rawCat));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Bei jeder Änderung in localStorage schreiben
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offeringsState));
    } catch {
      try {
        const withoutImages = offeringsState.map(({ image: _image, ...rest }) => rest);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutImages));
      } catch {}
    }
  }, [offeringsState, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(appliedIds));
  }, [appliedIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(decisions));
  }, [decisions, hydrated]);

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setOfferingsState(readFromStorage());
      }
      if (e.key === "lehrende_custom_categories") {
        try {
          const rawCat = window.localStorage.getItem("lehrende_custom_categories");
          if (rawCat) setCustomCategories(JSON.parse(rawCat));
        } catch {}
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addOffering = (offering: Offering) => {
    setOfferingsState((prev) => [...prev, offering]);
  };

  const deleteOffering = (id: string) => {
    setOfferingsState((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOffering = (updatedOffering: Offering) => {
    setOfferingsState((prev) =>
      prev.map((offering) =>
        offering.id === updatedOffering.id ? updatedOffering : offering
      )
    );
  };

  // Dynamische Berechnung der Bewerberzahlen basierend auf allen studentischen Bewerbungen.
  const offerings = useMemo(() => {
    return offeringsState.map((o) => {
      const dynamicCount = Object.values(studentsData).filter((s) =>
        s.order.includes(o.id)
      ).length;
      return {
        ...o,
        applicants: dynamicCount,
      };
    });
  }, [offeringsState, studentsData]);

  // Für Kompatibilität beibehalten (wird aufgerufen, tut aber nichts am Counter, da dieser dynamisch berechnet wird)
  const registerApplication = (offeringId: string) => {
    if (appliedIds.includes(offeringId)) return;
    setAppliedIds((prev) => [...prev, offeringId]);
  };

  const withdrawApplication = (offeringId: string) => {
    setAppliedIds((prev) => prev.filter((id) => id !== offeringId));
  };

  // Entscheidung der Lehrenden zu einer Bewerbung (Zusagen/Ablehnen) pro Student & Projekt
  const decide = (studentId: string, offeringId: string, decision: Decision) => {
    setDecisions((prev) => ({ ...prev, [`${studentId}_${offeringId}`]: decision }));
  };

  const resetDecision = (studentId: string, offeringId: string) => {
    setDecisions((prev) => {
      const key = `${studentId}_${offeringId}`;
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const addCustomCategory = (label: string, icon: IconName) => {
    const id = label.toLowerCase().replace(/[^a-z0-9]/g, "-");
    setCustomCategories((prev) => {
      if (prev.some((c) => c.id === id) || INITIAL_CATEGORIES.some((c) => c.id === id)) {
        return prev;
      }
      const updated = [...prev, { id, label, icon }];
      window.localStorage.setItem("lehrende_custom_categories", JSON.stringify(updated));
      return updated;
    });
  };

  const categories = useMemo(() => {
    return [...INITIAL_CATEGORIES, ...customCategories];
  }, [customCategories]);

  return (
    <OfferingsContext.Provider
      value={{
        offerings,
        addOffering,
        deleteOffering,
        updateOffering,
        registerApplication,
        withdrawApplication,
        decisions,
        decide,
        resetDecision,
        categories,
        addCustomCategory,
      }}
    >
      {children}
    </OfferingsContext.Provider>
  );
}

export function useOfferings() {
  const ctx = useContext(OfferingsContext);
  if (!ctx) {
    throw new Error("useOfferings muss innerhalb von OfferingsProvider verwendet werden");
  }
  return ctx;
}