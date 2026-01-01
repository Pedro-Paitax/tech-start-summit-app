"use client";

import { useEffect, useState, ReactNode } from "react";
import { UserContext, UserData } from "./UserContext";
import { auth, db } from "../app/lib/firebase"; // Ajuste o caminho conforme sua estrutura
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Escuta mudanças na autenticação (Login/Logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Se tem usuário, vamos buscar/escutar os dados do Firestore
        const userDocRef = doc(db, "users", currentUser.uid);

        // onSnapshot cria uma conexão em tempo real. Se mudar no banco, muda na tela na hora.
        const unsubscribeFirestore = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            // Se o documento existe, seta os dados
            setUserData(docSnap.data() as UserData);
          } else {
            // Se o usuário logou mas não tem documento no 'users' (ex: primeiro login), criamos um básico
            const initialData: UserData = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              nomeCompleto: currentUser.displayName || "Usuário",
              profileCompleted: false,
              agenda_favorites: []
            };
            await setDoc(userDocRef, initialData);
            setUserData(initialData);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Erro ao buscar dados do usuário:", error);
          setIsLoading(false);
        });

        // Cleanup da subscrição do Firestore ao desmontar ou mudar user
        return () => unsubscribeFirestore();
      } else {
        // Se deslogou
        setUserData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    router.push("/");
  };

  const toggleAgendaItem = async (talkId: string) => {
    if (!user || !userData) return;

    const userRef = doc(db, "users", user.uid);
    const isFavorite = userData.agenda_favorites?.includes(talkId);

    try {
      if (isFavorite) {
        await updateDoc(userRef, {
          agenda_favorites: arrayRemove(talkId)
        });
      } else {
        await updateDoc(userRef, {
          agenda_favorites: arrayUnion(talkId)
        });
      }
    } catch (error) {
      console.error("Erro ao favoritar item:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, userData, isLoading, logout, toggleAgendaItem }}>
      {children}
    </UserContext.Provider>
  );
}