"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function Navbar() {
  const pathname = usePathname();
  const isCarsPage = pathname === "/cars" || pathname.startsWith("/cars/") || pathname.startsWith("/cars?");

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[64px] max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link href="/cars" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
            CS
          </div>
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold tracking-tight text-slate-900">CarSensor</span>
            <span className="block truncate text-xs text-slate-500">Каталог автомобилей из Японии</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Link
            href="/cars"
            className={`flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-medium transition sm:flex-none ${
              isCarsPage
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            Каталог
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
