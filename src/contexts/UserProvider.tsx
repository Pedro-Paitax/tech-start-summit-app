"use client";

import { useState } from "react";
import { UserContext, type User } from "./UserContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("techsummit_user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error("Erro ao ler usuário do storage", e);
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading] = useState(false);

  function login(userData: User) {
    setUser(userData);
    localStorage.setItem("techsummit_user", JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("techsummit_user");
    window.location.href = "/";
  }

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}