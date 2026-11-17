// 自分の入力フォーム（#/submit）のQRコードを表示する。対象者にはこれを見せる／印刷して渡す。
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import site from "../config/site.json";

export const submitUrl = () => `${window.location.origin}${window.location.pathname}#/submit`;

export default function QrPage() {
  const [dataUrl, setDataUrl] = useState("");
  const url = submitUrl();
  useEffect(() => {
    QRCode.toDataURL(url, { width: 640, margin: 2 }).then(setDataUrl);
  }, [url]);
  return (
    <main className="page qr-page">
      <h1>{site.title}</h1>
      <p>スマホのカメラで読み取ると、入力フォームが開きます（ログイン不要・1件30秒ほど）</p>
      {dataUrl && <img src={dataUrl} alt="入力フォームのQRコード" className="qr" />}
      <p className="mono">{url}</p>
      <div className="row">
        {dataUrl && (
          <a className="btn" href={dataUrl} download="qr-submit.png">
            QRコードを保存
          </a>
        )}
        <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(url)}>
          URLをコピー
        </button>
        <a className="btn btn-ghost" href="#/">
          一覧にもどる
        </a>
      </div>
    </main>
  );
}
