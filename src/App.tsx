// ページの切り替え。1ページ構成（#/submit が入力フォーム＝QRコードの宛先、#/qr がQR表示）。
import { useEffect, useState } from "react";
import { STUDENT_TOKEN } from "./config/student";
import { isConfigured } from "./lib/supabase";
import { checkToken } from "./lib/entries";
import { customFieldProblems } from "./lib/customFields";
import ViewPage from "./components/ViewPage";
import SubmitPage from "./components/SubmitPage";
import QrPage from "./components/QrPage";
import Footer from "./components/Footer";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash.replace(/^#/, "") || "/";
}

type TokenState = "checking" | "ok" | "missing" | "invalid" | "error";

export default function App() {
  const route = useHashRoute();
  const [tokenState, setTokenState] = useState<TokenState>("checking");

  useEffect(() => {
    if (!STUDENT_TOKEN) return setTokenState("missing");
    if (!isConfigured) return setTokenState("error");
    checkToken()
      .then((ok) => setTokenState(ok ? "ok" : "invalid"))
      .catch(() => setTokenState("error"));
  }, []);

  return (
    <>
      <SetupNotice state={tokenState} />
      {customFieldProblems.length > 0 && (
        <div className="notice notice-warn" role="alert">
          <strong>custom-fields.json に確認してほしい点があります：</strong>
          <ul>
            {customFieldProblems.map((p) => (
              <li key={p.key + p.message}>
                {p.key}：{p.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {route.startsWith("/submit") ? <SubmitPage /> : route.startsWith("/qr") ? <QrPage /> : <ViewPage />}
      <Footer />
    </>
  );
}

function SetupNotice({ state }: { state: TokenState }) {
  if (state === "ok" || state === "checking") return null;
  const msg = {
    missing: "セットアップが未完了です。セットアップページの文章をAIのチャットに貼り付けて、収集トークン（合言葉）を設定してください。",
    invalid: "収集トークンが正しくありません。セットアップページをもう一度開いて、同じ文章をAIに貼り付けてください。",
    error: "データベースに接続できませんでした。少し待ってから再読み込みしてください。直らなければ教員・TAを呼んでください。",
  }[state];
  return (
    <div className="notice notice-error" role="alert">
      {msg}
    </div>
  );
}
