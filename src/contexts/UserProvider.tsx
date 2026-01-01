"use client"

import { useEffect, useState } from "react"
import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

import { auth, db } from "../app/lib/firebase"
import { UserContext } from "./UserContext"
import type { FirestoreUser } from "../types/userType"
import { motion } from "framer-motion"

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirestoreUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
  async function initAuth() {
        console.log("[Auth] Inicializando persistência")

    try {
      await setPersistence(auth, browserLocalPersistence)
            console.log("[Auth] Persistência aplicada com sucesso")

    } catch (error) {
      console.error("Erro ao definir persistência:", error)
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("[Auth] onAuthStateChanged chamado", firebaseUser)

      if (!firebaseUser) {
                console.log("[Auth] Usuário não encontrado")

        setUser(null)
        setIsLoading(false)
        return
      }

            console.log("[Auth] Usuário encontrado:", firebaseUser.uid)


      const userRef = doc(db, "users", firebaseUser.uid)
      const snapshot = await getDoc(userRef)

      if (!snapshot.exists()) {
                console.log("[Auth] Criando documento do usuário")
        await setDoc(userRef, {
          nomeCompleto: "",
          email: firebaseUser.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profileCompleted: false,
        })
      }

      const userData = (await getDoc(userRef)).data() as FirestoreUser
            console.log("[Auth] userData carregado:", userData)


      setUser({
        ...userData,
        uid: firebaseUser.uid,
      })

      setIsLoading(false)
    })

    return () => unsubscribe()
  }

  initAuth()
}, [])

  async function logout() {
    await signOut(auth)
    setUser(null)
  }

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Carregando Usuário...</h2>
        <p className="text-[var(--muted-foreground)] text-center max-w-xs">
          Aguarde enquanto verificamos seu usuário.
        </p>
      </section>
    )
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        logout,
        login: (userData) => setUser(userData),
        toggleAgendaItem: (talkId: string) => {
          if (!user) return
          setUser((prev) => {
            if (!prev) return null
            const agenda = prev.agenda || []
            const exists = agenda.includes(talkId)
            return {
              ...prev,
              agenda: exists ? agenda.filter((id) => id !== talkId) : [...agenda, talkId],
            }
          })
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
