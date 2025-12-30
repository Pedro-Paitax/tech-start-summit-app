"use client";

import { useState, useEffect } from "react";
import { UserContext, type User } from "./UserContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("techsummit_user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [isLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("techsummit_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("techsummit_user");
    }
  }, [user]);

  function login(userData: User) {
    setUser({ ...userData, agenda: userData.agenda || [] });
  }

  function logout() {
    setUser(null);
    window.location.href = "/";
  }

  // Lógica para Adicionar/Remover palestra
  function toggleAgendaItem(talkId: string) {
    if (!user) return;

    setUser((prev) => {
      if (!prev) return null;
      
      const exists = prev.agenda.includes(talkId);
      const newAgenda = exists 
        ? prev.agenda.filter(id => id !== talkId) 
        : [...prev.agenda, talkId];

      return { ...prev, agenda: newAgenda };
    });
  }

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading, toggleAgendaItem }}>
      {children}
    </UserContext.Provider>
  );
}