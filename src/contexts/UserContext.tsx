import { createContext } from "react";
import type { User as FirebaseUser } from "firebase/auth"; 

// Definição dos dados que vêm do Firestore (Banco de Dados)
export type UserData = {
  uid: string;
  nomeCompleto?: string;
  apelido?: string; 
  email?: string;
  cpf?: string;
  senioridade?: string;
  curso?: string;
  instituicao?: string; 
  semestre?: string;    
  tamanhoCamiseta?: string; 
  linkedin?: string;
  github?: string;
  usoImagem?: boolean;
  compartilhamento?: boolean;
  situacaoAtual?: string;
  areaInteresse?: string;
  agenda_favorites?: string[];
  profileCompleted?: boolean;
  track?: "dev" | "discovery" | "carreira" | "dados" | "infra"
  [key: string]: unknown;
};

export type UserContextType = {
  user: FirebaseUser | { uid: string; displayName: string; email?: string } | null;
  
  userData: UserData | null; 

  isLoading: boolean;
  
  logout: () => Promise<void>;
  toggleAgendaItem: (talkId: string) => Promise<void>;
};

export const UserContext = createContext<UserContextType | null>(null);