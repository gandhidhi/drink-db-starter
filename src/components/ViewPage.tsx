// ★ Day2で自由に作り替えてよい画面です（ランディングページ＋ビュー）。
// データの取得は lib/entries.ts の fetchEntries()、絞り込みは lib/filter.ts の applyFilter() を使います。
// 今は「カードの一覧」ですが、時系列・地図・画像グリッドなどに差し替えてください。
import { useEffect, useMemo, useState } from "react";
import site from "../config/site.json";
import { fetchEntries, type Entry } from "../lib/entries";
import { STUDENT_TOKEN } from "../config/student";
import { applyFilter, emptyFilter, type Filter } from "../lib/filter";
import Filters from "./Filters";
import EntryList from "./EntryList";
import DetailPanel from "./DetailPanel";

export default function ViewPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>(emptyFilter);
  const [selected, setSelected] = useState<Entry | null>(null);

  useEffect(() => {
    if (!STUDENT_TOKEN) return setLoading(false);
    fetchEntries()
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => applyFilter(entries, filter), [entries, filter]);
  const goal = site.goal_count;

  return (
    <div className="layout">
      <main className="page">
        <header className="hero">
          <h1>{site.title}</h1>
          <p>{site.pitch}</p>
          <div className="row">
            <a className="btn" href="#/submit">
              記録する
            </a>
            <a className="btn btn-ghost" href="#/qr">
              QRコードを表示
            </a>
          </div>
        </header>

        {/* 30件ノルマの進み具合（Day2で消してかまいません） */}
        <div className="progress" aria-label={`目標${goal}件中${entries.length}件`}>
          <div className="progress-bar" style={{ width: `${Math.min(100, (entries.length / goal) * 100)}%` }} />
          <span>
            {entries.length} / {goal} 件
          </span>
        </div>

        <Filters filter={filter} onChange={setFilter} />

        <p className="count">
          {entries.length}件中 {shown.length}件を表示
        </p>
        {loading && <p>読み込み中…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && entries.length === 0 && <p>まだ記録がありません。「記録する」から最初の1件を入力しましょう。</p>}
        <EntryList entries={shown} onSelect={setSelected} selectedId={selected?.id} />
      </main>
      <DetailPanel entry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
