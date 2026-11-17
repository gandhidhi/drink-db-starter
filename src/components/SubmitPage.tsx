// 入力フォーム（QRコードの宛先）。対象者がスマホで開いて入力する画面。
import { useState } from "react";
import { DRINK_TYPES, MOOD_NOTE_MAX, RECALL_MAX_DAYS, type DrinkType } from "../config/core";
import { TERMS_SHORT } from "../config/terms";
import { TERMS_VERSION } from "../config/core";
import site from "../config/site.json";
import { customFields, type CustomValue } from "../lib/customFields";
import { submitEntry } from "../lib/entries";
import CustomInput from "./CustomInput";

const TERMS_KEY = `terms-agreed-${TERMS_VERSION}`;
const readAgreed = () => {
  try {
    return localStorage.getItem(TERMS_KEY) === "1";
  } catch {
    return false;
  }
};

// <input type="datetime-local"> 用の文字列（端末のローカル時刻）
const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function SubmitPage() {
  const [agreed, setAgreed] = useState(readAgreed);
  if (!agreed) return <Terms onAgree={() => setAgreed(true)} />;
  return <EntryForm />;
}

function Terms({ onAgree }: { onAgree: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <main className="page form-page">
      <h1>{site.title}</h1>
      <section className="card">
        <h2>{TERMS_SHORT.title}</h2>
        <p>{TERMS_SHORT.lead}</p>
        <ul>
          {TERMS_SHORT.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        {TERMS_SHORT.fullTextUrl && (
          <p>
            <a href={TERMS_SHORT.fullTextUrl} target="_blank" rel="noreferrer">
              利用規約の全文を読む
            </a>
          </p>
        )}
        <label className="check">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          {TERMS_SHORT.agree}
        </label>
        <button
          className="btn btn-wide"
          disabled={!checked}
          onClick={() => {
            try {
              localStorage.setItem(TERMS_KEY, "1");
            } catch {
              /* 保存できなくても続行 */
            }
            onAgree();
          }}
        >
          入力をはじめる
        </button>
      </section>
    </main>
  );
}

function EntryForm() {
  const [mode, setMode] = useState<"realtime" | "recall">("realtime");
  const [when, setWhen] = useState(() => toLocalInput(new Date()));
  const [drink, setDrink] = useState<DrinkType | null>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locMsg, setLocMsg] = useState("");
  const [locPublic, setLocPublic] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [mood, setMood] = useState("");
  const [custom, setCustom] = useState<Record<string, CustomValue>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  const now = new Date();
  const minDate = new Date(now.getTime() - RECALL_MAX_DAYS * 86_400_000);

  const getLocation = () => {
    if (!navigator.geolocation) return setLocMsg("この端末では現在地を取得できません");
    setLocMsg("現在地を取得中…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocMsg("現在地を記録しました");
      },
      () => setLocMsg("現在地を取得できませんでした（場所はなしでも送信できます）"),
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  const send = async () => {
    setError("");
    if (!drink) return setError("飲み物の種類を選んでください");
    const ts = mode === "realtime" ? new Date() : new Date(when);
    if (isNaN(ts.getTime()) || ts > new Date(Date.now() + 60_000) || ts < minDate)
      return setError(`日時は今日から${RECALL_MAX_DAYS}日前までの範囲で選んでください`);
    setStatus("sending");
    try {
      const cleaned = Object.fromEntries(Object.entries(custom).filter(([, v]) => v !== null && v !== ""));
      await submitEntry({
        timestamp: ts,
        entry_mode: mode,
        drink_type: drink,
        location: loc,
        location_visibility: locPublic ? "public" : "private",
        photo,
        mood_note: mood,
        custom: cleaned,
      });
      setCount((c) => c + 1);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("idle");
    }
  };

  const reset = (shiftDay: boolean) => {
    if (shiftDay) {
      const d = new Date(when);
      d.setDate(d.getDate() - 1);
      if (d >= minDate) setWhen(toLocalInput(d));
    } else if (mode === "realtime") {
      setWhen(toLocalInput(new Date()));
    }
    setDrink(null);
    setLoc(null);
    setLocMsg("");
    setLocPublic(false);
    setPhoto(null);
    setMood("");
    setCustom({});
    setStatus("idle");
    window.scrollTo(0, 0);
  };

  if (status === "done") {
    return (
      <main className="page form-page">
        <section className="card done">
          <h2>送信しました。ありがとうございます！</h2>
          <p>この画面から {count} 件送信しました。</p>
          <button className="btn btn-wide" onClick={() => reset(false)}>
            続けてもう1件記録する
          </button>
          {mode === "recall" && (
            <button className="btn btn-wide btn-ghost" onClick={() => reset(true)}>
              1日前の日付で、続けて記録する
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="page form-page">
      <h1>{site.title}</h1>

      <fieldset className="field">
        <legend>いつ飲みましたか？</legend>
        <div className="chips">
          <button type="button" className={"chip" + (mode === "realtime" ? " chip-on" : "")} onClick={() => setMode("realtime")}>
            いま飲んだ
          </button>
          <button type="button" className={"chip" + (mode === "recall" ? " chip-on" : "")} onClick={() => setMode("recall")}>
            前に飲んだのを思い出して記録
          </button>
        </div>
        {mode === "recall" && (
          <input
            type="datetime-local"
            aria-label="飲んだ日時"
            value={when}
            min={toLocalInput(minDate)}
            max={toLocalInput(now)}
            onChange={(e) => setWhen(e.target.value)}
          />
        )}
      </fieldset>

      <fieldset className="field">
        <legend>何を飲みましたか？</legend>
        <div className="chips">
          {DRINK_TYPES.map((t) => (
            <button type="button" key={t} className={"chip" + (drink === t ? " chip-on" : "")} aria-pressed={drink === t} onClick={() => setDrink(t)}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>どこで飲みましたか？（任意）</legend>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={getLocation}>
            {mode === "recall" ? "現在地を使う（その場所にいる場合）" : "現在地を使う"}
          </button>
          {loc && (
            <button type="button" className="btn btn-ghost" onClick={() => (setLoc(null), setLocMsg(""))}>
              場所を消す
            </button>
          )}
        </div>
        {locMsg && <p className="hint">{locMsg}</p>}
        {loc && (
          <label className="check">
            <input type="checkbox" checked={locPublic} onChange={(e) => setLocPublic(e.target.checked)} />
            この場所を公開する（オフのままなら、場所は公開されません）
          </label>
        )}
      </fieldset>

      <div className="field">
        <label htmlFor="photo">写真（任意）</label>
        <input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        <p className="hint">人の顔や、個人が特定できるものは写さないでください。撮影場所の情報は自動で消えます。</p>
      </div>

      {customFields.map((f) => (
        <CustomInput key={f.key} field={f} value={custom[f.key]} onChange={(v) => setCustom((c) => ({ ...c, [f.key]: v }))} />
      ))}

      <div className="field">
        <label htmlFor="mood">ひとこと（任意・1〜2文）</label>
        <textarea
          id="mood"
          rows={2}
          maxLength={MOOD_NOTE_MAX}
          placeholder="例：行き詰まってたけど、これ飲んだら少し落ち着いた"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <p className="hint">名前や連絡先は書かないでください。</p>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-wide" disabled={status === "sending"} onClick={send}>
        {status === "sending" ? "送信中…" : "送信する"}
      </button>
    </main>
  );
}
