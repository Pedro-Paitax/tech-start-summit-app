// src/contexts/userTypes.ts
import { Timestamp } from "firebase/firestore"

export type FirestoreUser = {
  uid: string
  cpf?: string
  agenda?: string[]
  nomeCompleto?: string
  email?: string
  idade?: number
  telefone?: string
  profileCompleted?: boolean
  nivelSenioridade?: string
  areaInteresse?: string
  situacaoAtual?: string
  linkedin?: string
  github?: string
  instituicaoEnsino?: string
  curso?: string
  semestre?: string
  tamanhoCamiseta?: string
  usoImagem?: boolean
  aceiteCompartilhamento?: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
  track?: "dev" | "discovery" | "carreira" | "dados-ia" | "infra-cloud"

}

