// 🔒 custom-fields.json の読み込みと検証（変更不要）。
import raw from "../config/custom-fields.json";

export type FieldType = "select" | "number" | "boolean" | "text";
export interface CustomFieldDef {
  type: FieldType;
  question: string;
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
}
export interface CustomField extends CustomFieldDef {
  key: string;
}

export interface FieldProblem {
  key: string;
  message: string;
}

const TYPES: FieldType[] = ["select", "number", "boolean", "text"];

function load(): { fields: CustomField[]; problems: FieldProblem[] } {
  const fields: CustomField[] = [];
  const problems: FieldProblem[] = [];
  const obj = raw as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("_")) continue; // _説明 などのコメント用キー
    const d = value as Partial<CustomFieldDef> | null;
    if (!d || typeof d !== "object") {
      problems.push({ key, message: "項目の中身がオブジェクト（{ }）になっていません" });
      continue;
    }
    if (!d.type || !TYPES.includes(d.type)) {
      problems.push({ key, message: `type は ${TYPES.join(" / ")} のどれかにしてください（今は "${String(d.type)}"）` });
      continue;
    }
    if (!d.question) problems.push({ key, message: "question（フォームに出す質問文）がありません" });
    if (d.type === "select" && (!Array.isArray(d.options) || d.options.length < 2)) {
      problems.push({ key, message: "select には options（選択肢を2つ以上）が必要です" });
      continue;
    }
    fields.push({ key, ...(d as CustomFieldDef), question: d.question || key });
  }
  if (fields.length > 4) {
    problems.push({ key: "(全体)", message: `カスタム項目が${fields.length}個あります。2〜4個がおすすめです（動作はします）` });
  }
  return { fields, problems };
}

const loaded = load();
export const customFields = loaded.fields;
export const customFieldProblems = loaded.problems;

export type CustomValue = string | number | boolean | null;
