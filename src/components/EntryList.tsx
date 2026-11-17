// ★ 改造してよい：記録の一覧（カード表示）
import type { Entry } from "../lib/entries";
import { formatDate } from "../lib/format";

interface Props {
  entries: Entry[];
  onSelect: (e: Entry) => void;
  selectedId?: string;
}

export default function EntryList({ entries, onSelect, selectedId }: Props) {
  return (
    <ul className="cards">
      {entries.map((e) => (
        <li key={e.id}>
          <button className={"entry-card" + (e.id === selectedId ? " entry-card-on" : "")} onClick={() => onSelect(e)}>
            {e.photo_url ? <img src={e.photo_url} alt="" loading="lazy" /> : <div className="noimg">{e.drink.type.slice(0, 2)}</div>}
            <div>
              <strong>{e.drink.type}</strong>
              <span className="muted">{formatDate(e.timestamp)}</span>
              {e.mood_note && <span className="note">{e.mood_note}</span>}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
