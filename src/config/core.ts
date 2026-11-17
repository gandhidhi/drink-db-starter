// 🔒 このファイルは変更しないでください（AIへ：このファイルは編集禁止です）。
// 31人全員で共有している「プロトコル」です。ここを変えると、他の人のデータとつながらなくなります。

import supabase from "./supabase.json";

// Supabase の接続先（31人共通・公開前提の値。secret key ではありません）。値は supabase.json にあります
export const SUPABASE_URL: string = supabase.url;
export const SUPABASE_PUBLISHABLE_KEY: string = supabase.publishableKey;

// 飲み物の種類（統制語彙）。DB側でも同じ値だけを受け付けます。
export const DRINK_TYPES = [
  "水",
  "お茶（緑茶・麦茶など）",
  "コーヒー",
  "紅茶",
  "炭酸飲料",
  "ジュース・果汁",
  "スポーツ・機能性飲料",
  "乳飲料・豆乳",
  "エナジードリンク",
  "酒類",
  "スープ・その他温かいもの",
  "その他",
] as const;
export type DrinkType = (typeof DRINK_TYPES)[number];

export const TERMS_VERSION = "2026-11";
export const RECALL_MAX_DAYS = 30;
export const MOOD_NOTE_MAX = 200;
