"use client";

import { useRouter } from "next/navigation";

export function MonthSelect({ value, options }: { value: string; options: { key: string; label: string }[] }) {
  const router = useRouter();
  return (
    <select
      aria-label="Month"
      value={value}
      onChange={(e) => router.push(`/members?month=${e.target.value}`, { scroll: false })}
      className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-medium text-emerald-950"
    >
      {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
    </select>
  );
}
