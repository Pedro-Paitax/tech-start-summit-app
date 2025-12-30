import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
// 1. Adicionado o LogIn nas importações
import { LogOut, Settings, ChevronDown, Calendar, LogIn } from "lucide-react";
import { useUser } from "../../contexts/useUser"; 
import BottomTabs from "./BottomTabs";

export default function AppLayout() {
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-dvh bg-[var(--background)] text-[var(--foreground)]">
      
      {/* HEADER FIXO */}
      <header className="h-14 flex items-center justify-center border-b border-[var(--border)] bg-[var(--card)] shadow-sm z-40 relative px-4">
        
        {/* LOGO CENTRALIZADO */}
        <span className="font-bold text-lg tracking-tight">
          TECH <span className="text-[var(--primary)]">START</span> SUMMIT
        </span>

        {/* ÁREA DA DIREITA (PERFIL ou LOGIN) */}
        <div className="absolute right-4">
          {user ? (
            // === USUÁRIO LOGADO ===
            <div>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors"
              >
                {/* Avatar com Inicial */}
                <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
                  {user.nomeCompleto ? user.nomeCompleto.charAt(0).toUpperCase() : "U"}
                </div>
                
                {/* Seta pequena indicando menu */}
                <div className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}>
                   <ChevronDown size={14} className="text-[var(--muted-foreground)]" />
                </div>
              </button>

              {/* MENU DROPDOWN */}
              {isMenuOpen && (
                <>
                  {/* Backdrop invisível para fechar ao clicar fora */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)} 
                  />

                  {/* O Menu em si */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Cabeçalho do Menu */}
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--secondary)]/30">
                      <p className="font-bold text-sm truncate">{user.nomeCompleto}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
                    </div>

                    {/* Itens do Menu */}
                    <div className="p-2 flex flex-col gap-1">
                      <button 
                        onClick={() => {
                            navigate("/minha-agenda");
                            setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors text-left"
                      >
                        <Calendar size={16} />
                        Minha Agenda
                      </button>
                      
                      <button 
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors text-left"
                      >
                        <Settings size={16} />
                        Configurações
                      </button>

                      <div className="h-px bg-[var(--border)] my-1" />

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors text-left font-medium"
                      >
                        <LogOut size={16} />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // === USUÁRIO NÃO LOGADO (Novo Código) ===
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white transition-all text-xs font-bold uppercase tracking-wide"
            >
              <LogIn size={14} />
              Entrar
            </button>
          )}
        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 relative">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      {/* BOTTOM TABS */}
      <BottomTabs />
    </div>
  );
}