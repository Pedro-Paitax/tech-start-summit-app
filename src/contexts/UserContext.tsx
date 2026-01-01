import { createContext } from "react";
import type { User as FirebaseUser } from "firebase/auth"; 

// Definição dos dados que vêm do Firestore (Banco de Dados)
export type UserData = {
  uid: string;
  nomeCompleto?: string;
  apelido?: string; // Importante para o crachá
  email?: string;
  cpf?: string;
  senioridade?: string;
  curso?: string;
  instituicao?: string; // Adicionei este pois o modal usa
  semestre?: string;    // Adicionei este pois o modal usa
  tamanhoCamiseta?: string; // Adicionei este pois o modal usa
  linkedin?: string;
  github?: string;
  usoImagem?: boolean;
  compartilhamento?: boolean;
  situacaoAtual?: string;
  areaInteresse?: string;
  agenda_favorites?: string[];
  profileCompleted?: boolean;
  [key: string]: unknown;
};

// Definição do Contexto
export type UserContextType = {
  // 'user' é a autenticação (Login/Logout/Email)
  user: FirebaseUser | { uid: string; displayName: string; email?: string } | null;
  
  // 'userData' são os dados do perfil (Nome, Senioridade, Favoritos)
  userData: UserData | null; 

  isLoading: boolean;
  
  // Funções
  logout: () => Promise<void>;
  
  // Função auxiliar para facilitar adicionar/remover da agenda em qualquer lugar
  toggleAgendaItem: (talkId: string) => Promise<void>;
};

export const UserContext = createContext<UserContextType | null>(null);