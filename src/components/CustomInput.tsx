// カスタム項目1つ分の入力欄。custom-fields.json の type に合わせて自動で切り替わる。
import type { CustomField, CustomValue } from "../lib/customFields";

interface Props {
  field: CustomField;
  value: CustomValue | undefined;
  onChange: (v: CustomValue) => void;
}

export default function CustomInput({ field, value, onChange }: Props) {
  const id = `custom-${field.key}`;
  switch (field.type) {
    case "select":
      return (
        <fieldset className="field">
          <legend>{field.question}</legend>
          <div className="chips">
            {field.options!.map((o) => (
              <button
                type="button"
                key={o}
                className={"chip" + (value === o ? " chip-on" : "")}
                aria-pressed={value === o}
                onClick={() => onChange(value === o ? null : o)}
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      );
    case "boolean":
      return (
        <fieldset className="field">
          <legend>{field.question}</legend>
          <div className="chips">
            {[
              [true, "はい"],
              [false, "いいえ"],
            ].map(([v, label]) => (
              <button
                type="button"
                key={String(v)}
                className={"chip" + (value === v ? " chip-on" : "")}
                aria-pressed={value === v}
                onClick={() => onChange(value === v ? null : (v as boolean))}
              >
                {label as string}
              </button>
            ))}
          </div>
        </fieldset>
      );
    case "number":
      return (
        <div className="field">
          <label htmlFor={id}>{field.question}</label>
          <div className="row">
            <input
              id={id}
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              value={typeof value === "number" ? value : ""}
              onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            />
            {field.unit && <span>{field.unit}</span>}
          </div>
        </div>
      );
    default:
      return (
        <div className="field">
          <label htmlFor={id}>{field.question}</label>
          <input
            id={id}
            type="text"
            maxLength={100}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
          />
        </div>
      );
  }
}
