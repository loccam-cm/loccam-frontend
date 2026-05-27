// ============================================================
//  TYPES — LocCam Frontend
//  Correspondance avec les modèles Django
// ============================================================

export type Role = 'bailleur' | 'locataire' | 'admin'
export type StatutCNI = 'en_attente' | 'valide' | 'rejete'
export type StatutBien = 'libre' | 'occupe' | 'maintenance' | 'inactif'
export type StatutContrat = 'brouillon' | 'actif' | 'expire' | 'resilie'
export type StatutPaiement = 'en_attente' | 'confirme' | 'echoue' | 'rembourse'
export type MoyenPaiement = 'orange_money' | 'mtn_money' | 'cash' | 'virement'

export interface Utilisateur {
  id: number
  email: string
  nom: string
  prenom: string
  nom_complet: string
  telephone: string
  role: Role
  langue: 'fr' | 'en'
  email_verifie: boolean
  est_actif: boolean
  cni_photo_url: string | null
  cni_statut: StatutCNI
  date_creation: string
  date_modification: string
}

export interface Structure {
  id: number
  proprietaire: Utilisateur
  nom: string
  type_structure: string
  adresse: string
  latitude: number | null
  longitude: number | null
  description: string
  nb_unites: number
  est_active: boolean
  date_creation: string
}

export interface Bien {
  id: number
  proprietaire: Utilisateur
  structure: Structure | null
  titre: string
  description: string
  categorie: string
  type_bien: string
  type_bien_display: string
  prix: number
  surface: number | null
  est_meuble: boolean
  est_climatise: boolean
  a_ascenseur: boolean
  adresse: string
  latitude: number | null
  longitude: number | null
  statut: StatutBien
  statut_display: string
  nb_vues: number
  photo_principale: string | null
  date_creation: string
}

export interface Contrat {
  id: number
  bien: Bien
  locataire: Utilisateur
  bailleur: Utilisateur
  date_debut: string
  date_fin: string | null
  loyer_mensuel: number
  caution: number
  signe_bailleur: boolean
  signe_locataire: boolean
  date_signature: string | null
  pdf_url: string
  statut: StatutContrat
  statut_display: string
  est_signe: boolean
  date_creation: string
}

export interface Paiement {
  id: number
  contrat: Contrat
  montant_loyer: number
  montant_eau: number
  montant_elec: number
  montant_total: number
  mois: number
  annee: number
  date_paiement: string | null
  statut: StatutPaiement
  statut_display: string
  transaction_id: string
  moyen_paiement: MoyenPaiement
  moyen_display: string
  quittance_url: string
  est_confirme: boolean
  est_en_retard: boolean
  date_creation: string
}

export interface Notification {
  id: number
  type: string
  type_display: string
  titre: string
  message: string
  est_lue: boolean
  metadonnees: Record<string, unknown> | null
  date_creation: string
}

export interface AuthResponse {
  user: Utilisateur
  access_token: string
  refresh_token: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}