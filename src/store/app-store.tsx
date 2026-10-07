"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type SaveStatus = "saved" | "saving";

export interface Application {
  motivation: string;
  group: string;
}

export interface User {
  id: string;
  name: string;
  role: "student" | "professor";
  initials: string;
  avatarBg?: string;
  avatarFg?: string;
  meta?: string;
}

export interface StudentData {
  order: string[];
  applications: Record<string, Application>;
}

export const USERS: User[] = [
  { id: "student-lena", name: "Lena Becker", role: "student", initials: "LB", avatarBg: "#FCE6E9", avatarFg: "#C2121F", meta: "5. Sem · BMI" },
  { id: "student-tim", name: "Tim Hoffmann", role: "student", initials: "TH", avatarBg: "#E6EFFB", avatarFg: "#1457B8", meta: "5. Sem · MMI" },
  { id: "student-marie", name: "Marie Schulz", role: "student", initials: "MS", avatarBg: "#E4F5EA", avatarFg: "#0F7A3D", meta: "4. Sem · BMI" },
  { id: "student-jonas", name: "Jonas Weber", role: "student", initials: "JW", avatarBg: "#FBEFD9", avatarFg: "#9A5B00", meta: "6. Sem · MMI" },
  { id: "prof-krause", name: "Prof. S. Krause", role: "professor", initials: "SK", avatarBg: "#F1EFEC", avatarFg: "#3A3A3A", meta: "Medien & Informatik" },
];

interface AppState {
  order: string[];
  applications: Record<string, Application>;
  move: (id: string, dir: -1 | 1) => void;
  apply: (id: string) => void;
  withdraw: (id: string) => void;
  saveStatus: SaveStatus;
  getApplication: (id: string) => Application;
  setMotivation: (id: string, v: string) => void;
  setGroup: (id: string, v: string) => void;
  
  // User system
  currentUser: User;
  studentsData: Record<string, StudentData>;
  isSwitching: boolean;
  switchingTarget: User | null;
  changeUser: (userId: string, callback?: () => void) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppState | null>(null);

const EMPTY_APPLICATION: Application = { motivation: "", group: "" };

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [studentsData, setStudentsData] = useState<Record<string, StudentData>>({
    "student-lena": { order: [], applications: {} },
    "student-tim": { order: [], applications: {} },
    "student-marie": { order: [], applications: {} },
    "student-jonas": { order: [], applications: {} },
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingTarget, setSwitchingTarget] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    const storedData = localStorage.getItem("students_data");
    const storedDark = localStorage.getItem("dark_mode");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const match = USERS.find((u) => u.id === parsed.id);
        if (match) setCurrentUser(match);
      } catch {}
    }
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && typeof parsed === "object") {
          setStudentsData(parsed);
        }
      } catch {}
    }
    if (storedDark === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setHydrated(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("current_user", JSON.stringify(currentUser));
    localStorage.setItem("students_data", JSON.stringify(studentsData));
  }, [currentUser, studentsData, hydrated]);

  const activeStudentId = currentUser.role === "student" ? currentUser.id : "student-lena";
  const currentStudentData = studentsData[activeStudentId] ?? { order: [], applications: {} };
  const { order, applications } = currentStudentData;

  const move = useCallback((id: string, dir: -1 | 1) => {
    setStudentsData((prev) => {
      const data = prev[activeStudentId] ?? { order: [], applications: {} };
      const nextOrder = data.order.slice();
      const i = nextOrder.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= nextOrder.length) return prev;
      [nextOrder[i], nextOrder[j]] = [nextOrder[j], nextOrder[i]];
      return {
        ...prev,
        [activeStudentId]: {
          ...data,
          order: nextOrder,
        },
      };
    });
  }, [activeStudentId]);

  const apply = useCallback((id: string) => {
    setStudentsData((prev) => {
      const data = prev[activeStudentId] ?? { order: [], applications: {} };
      const nextOrder = data.order.includes(id) ? data.order : [...data.order, id];
      return {
        ...prev,
        [activeStudentId]: {
          ...data,
          order: nextOrder,
          applications: {
            ...data.applications,
            [id]: data.applications[id] ?? { motivation: "", group: "" },
          },
        },
      };
    });
  }, [activeStudentId]);

  const withdraw = useCallback((id: string) => {
    setStudentsData((prev) => {
      const data = prev[activeStudentId] ?? { order: [], applications: {} };
      return {
        ...prev,
        [activeStudentId]: {
          ...data,
          order: data.order.filter((x) => x !== id),
        },
      };
    });
  }, [activeStudentId]);

  const triggerSave = useCallback(() => {
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaveStatus("saved"), 800);
  }, []);

  const getApplication = useCallback(
    (id: string) => applications[id] ?? EMPTY_APPLICATION,
    [applications]
  );

  const setMotivation = useCallback(
    (id: string, v: string) => {
      setStudentsData((prev) => {
        const data = prev[activeStudentId] ?? { order: [], applications: {} };
        const currentApp = data.applications[id] ?? { motivation: "", group: "" };
        return {
          ...prev,
          [activeStudentId]: {
            ...data,
            applications: {
              ...data.applications,
              [id]: { ...currentApp, motivation: v },
            },
          },
        };
      });
      triggerSave();
    },
    [activeStudentId, triggerSave]
  );

  const setGroup = useCallback(
    (id: string, v: string) => {
      setStudentsData((prev) => {
        const data = prev[activeStudentId] ?? { order: [], applications: {} };
        const currentApp = data.applications[id] ?? { motivation: "", group: "" };
        return {
          ...prev,
          [activeStudentId]: {
            ...data,
            applications: {
              ...data.applications,
              [id]: { ...currentApp, group: v },
            },
          },
        };
      });
      triggerSave();
    },
    [activeStudentId, triggerSave]
  );

  const changeUser = useCallback((userId: string, callback?: () => void) => {
    const target = USERS.find((u) => u.id === userId);
    if (!target) return;

    const roleChanged = currentUser.role !== target.role;

    if (roleChanged) {
      // Deliberate transition when role changes to prevent "on-the-fly" silent swaps
      setIsSwitching(true);
      setSwitchingTarget(target);
      setTimeout(() => {
        setCurrentUser(target);
        setIsSwitching(false);
        setSwitchingTarget(null);
        if (target.role === "professor") {
          router.push("/lehrende");
        } else {
          router.push("/studierende");
        }
        if (callback) callback();
      }, 1200);
    } else {
      // Instant transition within the same role group
      setCurrentUser(target);
      if (target.role === "student") {
        router.push("/studierende");
      }
      if (callback) callback();
    }
  }, [currentUser, router]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("dark_mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        order,
        applications,
        move,
        apply,
        withdraw,
        saveStatus,
        getApplication,
        setMotivation,
        setGroup,
        currentUser,
        studentsData,
        isSwitching,
        switchingTarget,
        changeUser,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}