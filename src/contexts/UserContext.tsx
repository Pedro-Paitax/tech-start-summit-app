import { createContext } from "react";

export type User = {
  nomeCompleto: string;
  email: string;
  cpf: string;
};

// O Contexto agora carrega o usuário E as funções para manipular ele
export type UserContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean; // Útil para não mostrar a tela de login enquanto verifica a sessão
};

export const UserContext = createContext<UserContextType | null>(null);