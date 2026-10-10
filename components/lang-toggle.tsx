"use client";

import { useTransition } from "react";
import { setLangAction } from "@/app/actions";

export function LangToggle({ current, label }: { current: "en" | "ta"; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => setLangAction(current === "ta" ? "en" : "ta"))}
      disabled={pending}
      className="rounded-full border border-emerald-900/20 px-3 py-1.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
    >
      {label}
    </button>
  );
}
