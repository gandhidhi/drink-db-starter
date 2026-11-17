// ★ 改造してよい：絞り込みUI。カスタム項目の絞り込みは custom-fields.json から自動で作られます。
import { DRINK_TYPES } from "../config/core";
import { customFields } from "../lib/customFields";
import type { Filter } from "../lib/filter";

export default function Filters({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
  const set = (patch: Partial<Filter>) => onChange({ ...filter, ...patch });
  const setCustom = (key: string, v: Filter["custom"][string]) => onChange({ ...filter, custom: { ...filter.custom, [key]: v } });
  const toggleDrink = (t: string) =>
    set({ drinks: filter.drinks.includes(t) ? filter.drinks.filter((d) => d !== t) : [...filter.drinks, t] });

  return (
    <details className="filters" open>
      <summary>絞り込み</summary>
      <input type="search" placeholder="ひとことを検索" value={filter.keyword} onChange={(e) => set({ keyword: e.target.value })} />
      <div className="chips small">
        {DRINK_TYPES.map((t) => (
          <button key={t} className={"chip" + (filter.drinks.includes(t) ? " chip-on" : "")} onClick={() => toggleDrink(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="row">
        <label>
          から <input type="date" value={filter.from} onChange={(e) => set({ from: e.target.value })} />
        </label>
        <label>
          まで <input type="date" value={filter.to} onChange={(e) => set({ to: e.target.value })} />
        </label>
        <select value={filter.mode} onChange={(e) => set({ mode: e.target.value as Filter["mode"] })}>
          <option value="">記録方法：すべて</option>
          <option value="realtime">その場で記録</option>
          <option value="recall">思い出して記録</option>
        </select>
        <label className="check">
          <input type="checkbox" checked={filter.photoOnly} onChange={(e) => set({ photoOnly: e.target.checked })} />
          写真あり
        </label>
      </div>
      {customFields.map((f) => {
        const v = filter.custom[f.key];
        if (f.type === "select" || f.type === "boolean") {
          const opts = f.type === "select" ? f.options! : ["はい", "いいえ"];
          return (
            <label key={f.key}>
              {f.question}{" "}
              <select value={typeof v === "string" ? v : ""} onChange={(e) => setCustom(f.key, e.target.value || undefined)}>
                <option value="">すべて</option>
                {opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          );
        }
        if (f.type === "number") {
          const r = (typeof v === "object" && v) || { min: "", max: "" };
          return (
            <label key={f.key}>
              {f.question}{" "}
              <input type="number" className="num" value={r.min} onChange={(e) => setCustom(f.key, { ...r, min: e.target.value })} /> 〜{" "}
              <input type="number" className="num" value={r.max} onChange={(e) => setCustom(f.key, { ...r, max: e.target.value })} />
              {f.unit}
            </label>
          );
        }
        return (
          <label key={f.key}>
            {f.question} <input type="search" value={typeof v === "string" ? v : ""} onChange={(e) => setCustom(f.key, e.target.value || undefined)} />
          </label>
        );
      })}
    </details>
  );
}
