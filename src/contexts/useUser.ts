import { useContext } from "react";
import { UserContext, type UserContextType } from "./UserContext";

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  
  return context;
}