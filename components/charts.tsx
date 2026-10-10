"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function InflowChart({ data }: { data: { label: string; members: number; donors: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8e4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip cursor={{ fill: "#f1f5f2" }} formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 12, border: "1px solid #d1e7dc" }} />
          <Bar dataKey="members" name="Members" stackId="a" fill="#1b4e3d" radius={[0, 0, 4, 4]} />
          <Bar dataKey="donors" name="Donors" stackId="a" fill="#c69f5d" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
