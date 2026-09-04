"use client";

import Link from "next/link";
import { useDarkMode } from "@/lib/flags";

export function Header() {
  const isDarkMode = useDarkMode();
  return (
    <header className={isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"}>
      <nav className="mx-auto flex max-w-4xl gap-6 p-4">
        <Link href="/">Home</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
    </header>
  );
}
