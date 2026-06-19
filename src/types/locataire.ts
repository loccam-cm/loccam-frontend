import { Contrat, Paiement, Notification, Message } from '@/types'

export interface SignalementLocal {
  id: number
  type_panne: string
  type_panne_display?: string
  statut: string
  date_creation: string
}

export interface LocataireDashboardData {
  contrat: Contrat | null
  paiements: Paiement[]
  notifications: Notification[]
  messages: Message[]
  signalements: SignalementLocal[]
  totalPaye: number
  paiementsEffectues: number
  moisSansRetard: number
}
