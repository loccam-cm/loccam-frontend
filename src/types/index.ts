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
  avatar_url?: string  
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
  titre: string
  description?: string
  adresse: string
  ville?: string
  prix: number
  caution?: number
  type_bien: string
  categorie: string
  surface?: number
  nb_pieces?: number
  nb_chambres?: number
  etage?: number
  structure?: number
  statut: string
  meuble?: boolean
  eau_incluse?: boolean
  elec_incluse?: boolean
  photos?: {
    id: number
    url_publique: string
    est_principal: boolean
    nom_original: string
    taille: number
    date_upload: string
    object_id: number
  }[]
  date_creation?: string
}
export interface Contrat {
  id: number
  bien?: Bien
  locataire?: Utilisateur
  bailleur?: Utilisateur
  statut: string
  date_debut: string
  date_fin?: string
  loyer_mensuel: number
  caution?: number
  periodicite?: string
  periodicite_display?: string
  montant_periode?: number
  jour_echeance?: number
  notes?: string
  pdf_url?: string
  signe_bailleur?: boolean
  signe_locataire?: boolean
}

export interface Paiement {
  id: number
  contrat?: Contrat
  mois: number
  annee: number
  montant_loyer: number
  montant_eau?: number
  montant_elec?: number
  montant_total: number
  moyen_paiement: string
  moyen_display?: string
  statut: string
  date_paiement?: string
  transaction_id?: string
  quittance_url?: string
  est_en_retard?: boolean
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



export interface Message {
  id: number
  expediteur?: Utilisateur
  destinataire?: Utilisateur
  contenu: string
  est_lu: boolean
  date_envoi: string
  piece_jointe_url?: string
  date_lecture?: string | null
  bien?: Bien           
  contrat?: Contrat     
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