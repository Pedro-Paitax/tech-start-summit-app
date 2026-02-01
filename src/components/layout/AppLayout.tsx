"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronDown, Calendar, LogIn, User } from "lucide-react";
import { useUser } from "@/contexts/useUser";
import BottomTabs from "./BottomTabs";
import { ProfileDrawer } from "../ProfileDrawer";
import CompleteProfileModal from "../CompleteProfileModal";
import TourGuide from "../TourGuide";
import WelcomeModal from "../WelcomeModal";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push("/");
  };

   const handleWelcomeClose = async () => {
    setIsWelcomeModalOpen(false);
      if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { isFirstLogin: false });
  };

  useEffect(() => {
    if (!user || !userData) return;

   if (userData.isFirstLogin === true) {
      setIsWelcomeModalOpen(true);
      return; 
    }
    if (!userData.trilhaSelecionada
 && pathname !== "/trilhas") {
      router.push("/trilhas");
      return;

    }
    if ( userData.trilhaSelecionada
 && userData.profileCompleted === false) {
      setIsCompleteProfileOpen(true);
    }


  }, [userData, user, pathname]);


  const isLoginPage = pathname === "/";

  if (isLoginPage) {
    return <main className="h-dvh bg-[var(--background)] text-[var(--foreground)]">{children}</main>;
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--background)] text-[var(--foreground)]">

      <TourGuide />
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleWelcomeClose}
        userName={userData?.nomeCompleto}
      />
      <CompleteProfileModal
        isOpen={isCompleteProfileOpen}
        onClose={() => setIsCompleteProfileOpen(false)}
      />
      <header className="h-14 flex items-center justify-center border-b border-[var(--border)] bg-[var(--card)] shadow-sm z-40 relative px-4">

        <span id="nav-home" className="font-bold text-lg tracking-tight">
          TECH <span className="text-[var(--primary)]">START</span> SUMMIT
        </span>

        <div className="absolute right-4">
          {userData ? (
            <div>
              <button
                id="nav-profile"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
                  {userData.nomeCompleto ? userData.nomeCompleto.charAt(0).toUpperCase() : "U"}
                </div>

                <div className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}>
                  <ChevronDown size={14} className="text-[var(--muted-foreground)]" />
                </div>
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    <div className="p-4 border-b border-[var(--border)] bg-[var(--secondary)]/30">
                      <p className="font-bold text-sm truncate">{userData.nomeCompleto}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{userData.email}</p>
                    </div>

                    <div className="p-2 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          router.push("/minha-agenda");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors text-left"
                      >
                        <Calendar size={16} />
                        Minha Agenda
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsProfileOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors text-left"
                      >
                        <User size={16} />
                        Meus Dados
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
            <button
              id="nav-profile"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white transition-all text-xs font-bold uppercase tracking-wide"
            >
              <LogIn size={14} />
              Entrar
            </button>
          )}
        </div>

      </header>

      <main className="flex-1 overflow-y-auto p-4 relative">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <BottomTabs />
    </div>
  );
}