import type { ChipKind } from "@/data/projects";

const STYLES: Record<ChipKind, { bg: string; fg: string; dot: string }> = {
  info: { bg: "bg-info-bg", fg: "text-info", dot: "bg-info" },
  success: { bg: "bg-success-bg", fg: "text-success", dot: "bg-success" },
  warn: { bg: "bg-warn-bg", fg: "text-warn", dot: "bg-warn" },
  danger: { bg: "bg-danger-bg", fg: "text-danger", dot: "bg-danger" },
};

export function StatusChip({
  kind,
  label,
  size = "sm",
}: {
  kind: ChipKind;
  label: string;
  size?: "sm" | "md";
}) {
  const s = STYLES[kind];
  const pad = size === "md" ? "px-2.5 py-1" : "px-[9px] py-[3px]";
  const dot = size === "md" ? "h-1.5 w-1.5" : "h-[5px] w-[5px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full text-[12px] font-medium ${pad} ${s.bg} ${s.fg}`}
    >
      <span className={`rounded-full ${dot} ${s.dot}`} />
      {label}
    </span>
  );
}
