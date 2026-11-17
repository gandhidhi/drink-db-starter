# AIアシスタントへのガイド（Google AI Studio 等で、このプロジェクトを編集するAI向け）

このリポジトリは、デザイン学科2年生の授業「進級制作 T課題」のスターターキットです。
学生があなた（AI）と対話しながら改造します。次のルールを必ず守ってください。

## 絶対に守ること
1. **データの保存先は Supabase のまま維持する。** Firestore・localStorage・他のデータベースに置き換えない。新しいバックエンドを追加しない。
2. **🔒 マークのファイルは編集しない。** `src/config/core.ts` `src/config/supabase.json` `src/config/terms.ts` `src/config/student.ts` `src/lib/` 以下 `server.js`。
3. **コアフィールド**（timestamp / entry_mode / recall_distance_days / drink.type / location / photo_url / mood_note）を削除・改名しない。飲み物の種類（DRINK_TYPES）を増減しない。31人で共有するプロトコルです。
4. **位置情報の公開設定（location_visibility）の既定値は private のまま。** 写真は必ず `submitEntry()` 経由で送る（撮影位置の情報を消す処理が入っています）。
5. 名前・メールアドレスなど**個人を特定する項目をフォームに追加しない。**
6. フッターの**ライセンス表示を消さない。**
7. フレームワーク（React + Vite + `server.js`）を別のもの（Next.js など）に置き換えない。

## 学生から頼まれやすいことと、触る場所
| 頼まれごと | 編集するファイル |
|---|---|
| 収集トークン（合言葉）を設定して | `src/config/student.json` の `token` |
| 設計メモのカスタム項目を追加して | `src/config/custom-fields.json`（貼られたJSONをそのまま入れる。形式は下記） |
| アプリ名・説明文・ライセンス表記を変えて | `src/config/site.json` |
| 一覧の見た目を変えて／地図・時系列・画像グリッドにして | `src/components/ViewPage.tsx` `EntryList.tsx` `DetailPanel.tsx` `Filters.tsx` `src/styles.css` |

データの取得は `fetchEntries()`（`src/lib/entries.ts`）、絞り込みは `applyFilter()`（`src/lib/filter.ts`）を使ってください。
地図を作る場合は、APIキーの要らない Leaflet + OpenStreetMap タイルを使ってください。`entry.location` が null の記録は位置が非公開なので、地図には出さず、一覧などには出してください。

## custom-fields.json の形式
```json
{
  "項目名（英数字とアンダースコア推奨）": {
    "type": "select | number | boolean | text",
    "question": "フォームに表示する質問文",
    "options": ["選択肢1", "選択肢2", "その他"],
    "unit": "円",
    "min": 0, "max": 1000
  }
}
```
`options` は select のときだけ、`unit` `min` `max` は number のときだけ使います。入力フォーム・絞り込み・CSV は、このファイルから自動で作られます。画面のコードを書き換える必要はありません。
