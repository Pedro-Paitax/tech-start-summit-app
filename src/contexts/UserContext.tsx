import { createContext } from "react";

export type User = {
  nomeCompleto: string;
  email: string;
  cpf: string;
  agenda: string[]; 
};

export type UserContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  toggleAgendaItem: (talkId: string) => void; 
  isLoading: boolean;
};

export const UserContext = createContext<UserContextType | null>(null);