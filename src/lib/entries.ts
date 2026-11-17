// 🔒 データの取得と送信（変更不要）。画面（components/）はこのファイルの関数を使ってください。
import { supabase } from "./supabase";
import { STUDENT_TOKEN } from "../config/student";
import { TERMS_VERSION, type DrinkType } from "../config/core";
import { sanitizePhoto } from "./image";
import type { CustomValue } from "./customFields";

/** 実施仕様のコアフィールドと同じ形のデータ */
export interface Entry {
  id: string;
  timestamp: string;
  entry_mode: "realtime" | "recall";
  recall_distance_days: number | null;
  drink: { type: DrinkType };
  location: { lat: number; lng: number; visibility: "public" } | null;
  location_visibility: "public" | "private";
  photo_url: string | null;
  mood_note: string | null;
  custom: Record<string, CustomValue>;
  created_at: string;
}

interface Row {
  id: string;
  timestamp: string;
  entry_mode: "realtime" | "recall";
  recall_distance_days: number | null;
  drink_type: DrinkType;
  lat: number | null;
  lng: number | null;
  location_visibility: "public" | "private";
  photo_url: string | null;
  mood_note: string | null;
  custom: Record<string, CustomValue> | null;
  created_at: string;
}

function toEntry(r: Row): Entry {
  return {
    id: r.id,
    timestamp: r.timestamp,
    entry_mode: r.entry_mode,
    recall_distance_days: r.recall_distance_days,
    drink: { type: r.drink_type },
    location: r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng, visibility: "public" } : null,
    location_visibility: r.location_visibility,
    photo_url: r.photo_url,
    mood_note: r.mood_note,
    custom: r.custom ?? {},
    created_at: r.created_at,
  };
}

/** 自分（このアプリのトークン）の公開データをすべて取得。位置が非公開の記録は location が null になります */
export async function fetchEntries(token: string = STUDENT_TOKEN): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("entries_public")
    .select("*")
    .eq("student_token", token)
    .order("timestamp", { ascending: false })
    .limit(2000);
  if (error) throw new Error(`データを読み込めませんでした：${error.message}`);
  return (data as Row[]).map(toEntry);
}

export async function checkToken(token: string = STUDENT_TOKEN): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_valid_token", { t: token });
  if (error) throw new Error(error.message);
  return data === true;
}

export interface NewEntry {
  timestamp: Date;
  entry_mode: "realtime" | "recall";
  drink_type: DrinkType;
  location: { lat: number; lng: number } | null;
  location_visibility: "public" | "private";
  photo: File | null;
  mood_note: string;
  custom: Record<string, CustomValue>;
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

export async function submitEntry(e: NewEntry, token: string = STUDENT_TOKEN): Promise<void> {
  let photo_url: string | null = null;
  if (e.photo) {
    const blob = await sanitizePhoto(e.photo);
    const path = `${token}/${crypto.randomUUID()}.jpg`;
    const up = await supabase.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
    if (up.error) throw new Error(`写真をアップロードできませんでした：${up.error.message}`);
    photo_url = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
  }
  const days =
    e.entry_mode === "recall"
      ? Math.max(0, Math.floor((Date.now() - e.timestamp.getTime()) / 86_400_000))
      : null;
  // 位置は小数点以下4桁（約10m）に丸める
  const { error } = await supabase.from("entries").insert({
    student_token: token,
    timestamp: e.timestamp.toISOString(),
    entry_mode: e.entry_mode,
    recall_distance_days: days,
    drink_type: e.drink_type,
    lat: e.location ? round4(e.location.lat) : null,
    lng: e.location ? round4(e.location.lng) : null,
    location_visibility: e.location ? e.location_visibility : "private",
    photo_url,
    mood_note: e.mood_note.trim() || null,
    custom: e.custom,
    terms_version: TERMS_VERSION,
  });
  if (error) throw new Error(`送信できませんでした：${error.message}`);
}
