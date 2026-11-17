// 🔒 小さな Node.js サーバー（変更不要）。
// 1) ビルドした画面（dist/）を配信する
// 2) 公開API /api/entries（JSON / CSV）を提供する。他の人のアプリからも呼べるよう CORS を開けています。
// データベースへの読み書きは画面（ブラウザ）から直接 Supabase に行うので、このサーバーは秘密の鍵を持ちません。
import express from "express";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const readJson = (p) => JSON.parse(readFileSync(path.join(dir, p), "utf8"));
const supa = readJson("src/config/supabase.json");
const site = readJson("src/config/site.json");
const fields = Object.fromEntries(Object.entries(readJson("src/config/custom-fields.json")).filter(([k]) => !k.startsWith("_")));
const token = (process.env.VITE_STUDENT_TOKEN || readJson("src/config/student.json").token || "").trim();

const app = express();

app.use("/api", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

const toEntry = (r) => ({
  id: r.id,
  timestamp: r.timestamp,
  entry_mode: r.entry_mode,
  recall_distance_days: r.recall_distance_days,
  drink: { type: r.drink_type },
  location: r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng, visibility: "public" } : null,
  photo_url: r.photo_url,
  mood_note: r.mood_note,
  custom: r.custom ?? {},
});

const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

app.get("/api/entries", async (req, res) => {
  if (!token) return res.status(503).json({ error: "収集トークンが未設定です" });
  const q = new URLSearchParams({ select: "*", student_token: `eq.${token}`, order: "timestamp.desc", limit: "5000" });
  const and = [];
  if (req.query.drink_type) q.set("drink_type", `eq.${req.query.drink_type}`);
  if (req.query.entry_mode) q.set("entry_mode", `eq.${req.query.entry_mode}`);
  if (req.query.from) and.push(`timestamp.gte.${req.query.from}`);
  if (req.query.to) and.push(`timestamp.lte.${req.query.to}`);
  if (req.query.has_photo === "true") q.set("photo_url", "not.is.null");
  if (and.length) q.set("and", `(${and.join(",")})`);
  try {
    const r = await fetch(`${supa.url}/rest/v1/entries_public?${q}`, {
      headers: { apikey: supa.publishableKey, Authorization: `Bearer ${supa.publishableKey}` },
    });
    if (!r.ok) return res.status(502).json({ error: "データベースから読み込めませんでした", detail: await r.text() });
    const entries = (await r.json()).map(toEntry);
    if (req.query.format === "csv") {
      const keys = Object.keys(fields);
      const head = ["id", "timestamp", "entry_mode", "recall_distance_days", "drink.type", "location.lat", "location.lng", "photo_url", "mood_note", ...keys.map((k) => `custom.${k}`)];
      const rows = entries.map((e) =>
        [e.id, e.timestamp, e.entry_mode, e.recall_distance_days, e.drink.type, e.location?.lat, e.location?.lng, e.photo_url, e.mood_note, ...keys.map((k) => e.custom[k])]
          .map(csvCell)
          .join(","),
      );
      res.set("Content-Type", "text/csv; charset=utf-8");
      res.set("Content-Disposition", 'attachment; filename="entries.csv"');
      return res.send("﻿" + [head.join(","), ...rows].join("\r\n"));
    }
    res.json({
      dataset: { title: site.title, description: site.pitch, license: site.license, student_token: token, custom_fields: fields },
      count: entries.length,
      entries,
    });
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
});

const dist = path.join(dir, "dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));
