"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Grid3X3 } from "lucide-react";

export default function BottomTabs() {
  const pathname = usePathname();
  const baseClass = "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all duration-200 active:scale-95";

  const isAgendaActive = pathname === "/agenda" || pathname === "/minha-agenda";
  const isBingoActive = pathname === "/bingo";

  return (
    <nav className="h-16 pb-2 border-t border-[var(--border)] bg-[var(--card)] flex z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
      
      <Link
        id="nav-agenda"
        href="/agenda"
        className={`${baseClass} flex-1 ${
          isAgendaActive 
            ? "text-[var(--primary)]" 
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        <Calendar size={20} strokeWidth={isAgendaActive ? 2.5 : 2} />
        <span>AGENDA</span>
      </Link>

      <div className="w-[1px] h-6 self-center bg-[var(--border)] opacity-50" />

      <Link
        id="nav-bingo"
        href="/bingo"
        className={`${baseClass} flex-1 ${
          isBingoActive 
            ? "text-[var(--primary)]" 
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        <Grid3X3 size={20} strokeWidth={isBingoActive ? 2.5 : 2} />
        <span>BINGO</span>
      </Link>

    </nav>
  );
}