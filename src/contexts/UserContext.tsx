import { createContext } from "react"

export type User = {
  displayName: string
  uid: string
  nomeCompleto?: string
  email?: string
  cpf?: string
  agenda?: string[]
  profileCompleted?: boolean
}

export type UserContextType = {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  toggleAgendaItem: (talkId: string) => void
}

export const UserContext = createContext<UserContextType | null>(null)
