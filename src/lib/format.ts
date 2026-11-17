import type { CustomValue } from "./customFields";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });

export function formatValue(v: CustomValue | undefined, unit?: string): string {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "boolean") return v ? "はい" : "いいえ";
  return unit ? `${v} ${unit}` : String(v);
}
