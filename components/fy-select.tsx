"use client";

import { useRouter } from "next/navigation";

export function FySelect({ value, options }: { value: number; options: number[] }) {
  const router = useRouter();
  return (
    <select
      aria-label="Financial year (Oct–Sep)"
      value={value}
      onChange={(e) => router.push(`/?fy=${e.target.value}`, { scroll: false })}
      className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-950"
    >
      {options.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}
