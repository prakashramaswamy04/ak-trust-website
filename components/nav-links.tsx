"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/" },
  { label: "Members", href: "/members" },
  { label: "Donors", href: "/donors" },
  { label: "Disbursements", href: "/disbursements" },
  { label: "Admin", href: "/admin" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm font-medium">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 transition ${active ? "bg-emerald-900 text-white shadow-sm" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
