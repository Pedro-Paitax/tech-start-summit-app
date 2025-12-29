"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importar useNavigate
import { Ticket, Calendar, Gamepad2, ArrowRight } from "lucide-react";
import { useUser } from "../../contexts/useUser"; // 2. Importar o hook do usuário (ajuste o caminho se precisar)

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // 3. Inicializar o hook de navegação
  const { login } = useUser();    // 4. Pegar a função de login do contexto

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    setCpf(value);
  };

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!cpf || !email) {
      setError("CPF e e-mail são obrigatórios");
      return;
    }

    // 5. MOCK DE LOGIN (Simulação)
    // Como não temos backend ainda, criamos um objeto fake para salvar no contexto
    const usuarioSimulado = {
        nomeCompleto: "Participante Convidado", // Mock, pois o login não retorna isso ainda
        email: email,
        cpf: cpf
    };

    try {
        login(usuarioSimulado); // Salva no Context + LocalStorage
        navigate("/agenda");    // Redireciona SEM recarregar a página
    } catch (err) {
        setError("Erro ao realizar login. Tente novamente.");
    }
  }

  // Função auxiliar para navegação segura nos botões de rodapé
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center animate-fade-in-up">

        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-2">
            TECH <span className="text-[var(--primary)]">START</span> SUMMIT
          </h1>
          <p className="text-[var(--muted-foreground)]">Faça login usando o CPF e E-Mail da compra para acessar as features do evento</p>
        </div>

        <div className="w-full bg-[var(--card)]/50 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] ml-1 mb-1 block uppercase tracking-wider">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full p-3 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] ml-1 mb-1 block uppercase tracking-wider">E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-[var(--destructive)]/10 border border-[var(--destructive)]/20">
                 <p className="text-sm text-[var(--destructive)] text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full p-3 font-bold text-lg bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
            >
              Entrar <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center w-full max-w-xs">
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--border)]"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">Ainda não tem acesso?</span></div>
          </div>
          
          <button
            onClick={() => window.open("https://www.cheers.com.br", "_blank")}
            className="w-full group flex items-center justify-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/30 hover:bg-[var(--secondary)] hover:border-[var(--primary)] transition-all duration-300"
          >
            <div className="p-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
              <Ticket size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--foreground)]">Comprar Ingresso</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-tight">Sua conta é criada automaticamente</p>
            </div>
          </button>
        </div>

        <div className="mt-8 flex gap-6 text-sm text-[var(--muted-foreground)]">
          {/* Atualizei aqui para usar navigate também, evitando refresh */}
          <button 
            onClick={() => handleNavigation("/agenda")}
            className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors"
          >
            <Calendar size={16} /> Ver Agenda
          </button>
          <span className="text-[var(--border)]">|</span>
          <button 
            onClick={() => handleNavigation("/bingo")}
            className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors"
          >
            <Gamepad2 size={16} /> Ir para o Bingo
          </button>
        </div>

      </div>
    </div>
  );
}