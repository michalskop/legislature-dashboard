"use client";

import { useRouter } from "next/navigation";

interface Props {
  current: string;
  langs: string[];
}

export function LangSwitcher({ current, langs }: Props) {
  const router = useRouter();

  if (langs.length < 2) return null;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value;
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="text-xs font-medium bg-transparent text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 cursor-pointer transition-colors"
    >
      {langs.map((code) => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
