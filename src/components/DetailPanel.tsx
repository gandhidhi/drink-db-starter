// ★ 改造してよい：タップした記録の詳細（PCでは右のサイドバー、スマホでは下からのシート）
import type { Entry } from "../lib/entries";
import { customFields } from "../lib/customFields";
import { formatDate, formatValue } from "../lib/format";

export default function DetailPanel({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <aside className="detail" aria-label="記録の詳細">
      <button className="close" onClick={onClose} aria-label="閉じる">
        ×
      </button>
      {entry.photo_url && <img src={entry.photo_url} alt="" />}
      <h2>{entry.drink.type}</h2>
      <dl>
        <dt>日時</dt>
        <dd>
          {formatDate(entry.timestamp)}
          {entry.entry_mode === "recall" ? `（${entry.recall_distance_days ?? "?"}日前の記憶）` : "（その場で記録）"}
        </dd>
        <dt>場所</dt>
        <dd>{entry.location ? `${entry.location.lat}, ${entry.location.lng}` : "非公開"}</dd>
        {customFields.map((f) => (
          <div key={f.key}>
            <dt>{f.question}</dt>
            <dd>{formatValue(entry.custom[f.key], f.unit)}</dd>
          </div>
        ))}
        {entry.mood_note && (
          <>
            <dt>ひとこと</dt>
            <dd>{entry.mood_note}</dd>
          </>
        )}
      </dl>
    </aside>
  );
}
