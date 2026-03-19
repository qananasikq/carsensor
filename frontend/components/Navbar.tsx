"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex min-h-[64px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/cars" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
            CS
          </div>
          <div className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-900">CarSensor</span>
            <span className="block text-xs text-slate-500">Каталог автомобилей из Японии</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/cars"
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              pathname === "/cars" || pathname.startsWith("/cars?")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            Каталог
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
