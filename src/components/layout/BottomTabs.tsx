import { NavLink } from "react-router-dom";
import { Calendar, Grid3X3 } from "lucide-react";

export default function BottomTabs() {
  // Estilo base para os botões
  const baseClass = "flex flex-col items-center justify-center gap-1.5 text-[10px] font-medium transition-all duration-200 active:scale-95";

  return (
    <nav className="h-20 pb-4 border-t border-[var(--border)] bg-[var(--card)] flex z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
      
      {/* Botão Agenda */}
      <NavLink
        to="/agenda"
        className={({ isActive }) =>
          `${baseClass} flex-1 ${
            isActive 
              ? "text-[var(--primary)]" 
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`
        }
      >
        {/* O ícone muda de estilo se estiver ativo (opcional, mas fica chique) */}
        {({ isActive }) => (
            <>
                <Calendar size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>AGENDA</span>
            </>
        )}
      </NavLink>

      {/* Divisor vertical sutil (opcional) */}
      <div className="w-[1px] h-8 self-center bg-[var(--border)] opacity-50" />

      {/* Botão Bingo */}
      <NavLink
        to="/bingo"
        className={({ isActive }) =>
          `${baseClass} flex-1 ${
            isActive 
              ? "text-[var(--primary)]" 
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`
        }
      >
        {({ isActive }) => (
            <>
                <Grid3X3 size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>BINGO</span>
            </>
        )}
      </NavLink>

    </nav>
  );
}