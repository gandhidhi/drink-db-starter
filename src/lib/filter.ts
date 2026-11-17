// 絞り込みのロジック（画面と分けてあります）。
import type { Entry } from "./entries";
import { customFields } from "./customFields";

export interface Filter {
  keyword: string;
  drinks: string[];
  from: string; // YYYY-MM-DD
  to: string;
  mode: "" | "realtime" | "recall";
  photoOnly: boolean;
  custom: Record<string, string | { min: string; max: string } | undefined>;
}

export const emptyFilter: Filter = { keyword: "", drinks: [], from: "", to: "", mode: "", photoOnly: false, custom: {} };

const localDate = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export function applyFilter(entries: Entry[], f: Filter): Entry[] {
  const kw = f.keyword.trim();
  return entries.filter((e) => {
    if (kw && !(e.mood_note ?? "").includes(kw)) return false;
    if (f.drinks.length && !f.drinks.includes(e.drink.type)) return false;
    const day = localDate(e.timestamp);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    if (f.mode && e.entry_mode !== f.mode) return false;
    if (f.photoOnly && !e.photo_url) return false;
    for (const field of customFields) {
      const cond = f.custom[field.key];
      if (cond === undefined || cond === "") continue;
      const v = e.custom[field.key];
      if (field.type === "number" && typeof cond === "object") {
        if (cond.min !== "" && !(typeof v === "number" && v >= Number(cond.min))) return false;
        if (cond.max !== "" && !(typeof v === "number" && v <= Number(cond.max))) return false;
      } else if (field.type === "boolean") {
        if ((cond === "はい") !== (v === true) || v == null) return false;
      } else if (field.type === "select") {
        if (v !== cond) return false;
      } else if (typeof cond === "string") {
        if (!String(v ?? "").includes(cond)) return false;
      }
    }
    return true;
  });
}
