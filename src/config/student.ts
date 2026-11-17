// 🔒 トークンの読み込み（変更不要）。トークン自体は student.json に書きます。
import student from "./student.json";

const fromEnv = (import.meta.env.VITE_STUDENT_TOKEN as string | undefined)?.trim();
export const STUDENT_TOKEN: string = fromEnv || (student.token ?? "").trim();
