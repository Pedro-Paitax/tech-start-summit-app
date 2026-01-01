"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"; // Ajuste o caminho conforme sua estrutura
import { ArrowRight, Ticket, Calendar, Gamepad2 } from "lucide-react";

// Função para formatar o CPF visualmente (000.000.000-00)
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Atualiza o CPF aplicando a máscara
  const handleCpfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !cpf) {
      setError("E-mail e CPF são obrigatórios");
      setIsLoading(false);
      return;
    }

    try {
      // Remove a pontuação para enviar ao Firebase como senha (ex: 12345678900)
      const cpfLimpo = cpf.replace(/\D/g, "");

      // Autentica. O UserProvider detectará a mudança de estado automaticamente.
      await signInWithEmailAndPassword(auth, email, cpfLimpo);

      navigate("/agenda");
    } catch (err: unknown) {
      const error = err as { code: string }; 

      console.error("Erro no login:", err);
      
      // Tratamento de erros comuns para feedback visual melhor
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Dados inválidos. Verifique e-mail e CPF.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Muitas tentativas. Aguarde um momento.");
      } else {
        setError("Erro ao realizar login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-[var(--muted-foreground)]">
            Faça login usando o CPF e E-Mail da compra para acessar as features do evento
          </p>
        </div>

        <div className="w-full bg-[var(--card)]/50 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="space-y-4">
              
              {/* INPUT DE CPF */}
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] ml-1 mb-1 block uppercase tracking-wider">
                  CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className="w-full p-3 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all font-mono"
                />
              </div>

              {/* INPUT DE EMAIL */}
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] ml-1 mb-1 block uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
              disabled={isLoading}
              className="mt-2 w-full p-3 font-bold text-lg bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : <>Entrar <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center w-full max-w-xs">
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">
                Ainda não tem acesso?
              </span>
            </div>
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