# 飲み物の体験DB スターターキット

進級制作 T課題で使う「土台になるアプリ」です。Google AI Studio に取り込んで、AIと話しながら自分のアプリに育てていきます。

## できること（最初から入っています）
- **入力フォーム**（`#/submit`）：QRコードから開いた人が、ログインなしで記録できる
- **一覧と絞り込み**（トップページ）：自分のデータを検索・絞り込みできる
- **QRコード表示**（`#/qr`）：自分の入力フォームのQRコードを表示・保存できる
- **公開API**：`/api/entries`（JSON）、`/api/entries?format=csv`（CSV）
- **ライセンス表示**：ページの下に常に表示

## あなたが変えるところ（★）
| やりたいこと | AIへの頼み方の例 | 変わるファイル |
|---|---|---|
| 合言葉を設定する | セットアップページの文章をそのまま貼る | `src/config/student.json` |
| 自分の記録項目を追加する | 「2限の設計メモのJSONを custom-fields.json に入れて」＋JSONを貼る | `src/config/custom-fields.json` |
| アプリ名・説明を変える | 「アプリ名を〇〇、説明文を〇〇にして」 | `src/config/site.json` |
| 見せ方を変える（Day2） | 「一覧を、地図の上にピンで表示する形に変えて」 | `src/components/` |

🔒 マークのファイル（`core.ts` など）は、31人で共有している約束ごとです。変えないでください。

## 教員向け
- `src/config/supabase.json` に共有 Supabase プロジェクトの URL と publishable key を記入してから公開する
- テーブル定義・RLS は教員用リポジトリの `supabase/schema.sql`
- ローカルで動かす：`npm install` → `npm run dev`（画面のみ）／`npm run preview`（ビルド＋APIサーバー）
