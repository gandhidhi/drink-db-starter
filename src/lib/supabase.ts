// 🔒 Supabase への接続（変更不要）。データの保存先は Supabase です。Firestore などに置き換えないでください。
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../config/core";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

export const isConfigured = !SUPABASE_URL.includes("YOUR-PROJECT");
