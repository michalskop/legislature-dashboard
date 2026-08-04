import { cookies } from "next/headers";
import { parliamentConfig } from "@/lib/parliament.config";

const SUPPORTED = Object.keys(parliamentConfig.translations);

export async function getLang(): Promise<string> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  return lang && SUPPORTED.includes(lang) ? lang : parliamentConfig.defaultLang;
}
