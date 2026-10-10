"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ labels }: { labels: [string, string, string, string, string] }) {
  const hrefs = ["/", "/members", "/donors", "/disbursements", "/admin"];
  const items = labels.map((label, i) => ({ label, href: hrefs[i] }));
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
