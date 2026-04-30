// ── Compte (Bank Account) ─────────────────────────────────────────────────
export interface Compte {
  rib:          string;
  type:         'COURANT' | 'EPARGNE';
  solde:        number;
  statut:       'ACTIF' | 'BLOQUE' | 'FERME';
  dateCreation: string;
  clientCin:    string;
}

// ── Transaction ───────────────────────────────────────────────────────────
export interface Transaction {
  id:            number;
  type:          'VIREMENT' | 'DEPOT' | 'RETRAIT';
  montant:       number;
  date:          string;
  statut:        'EFFECTUE' | 'EN_ATTENTE' | 'ECHOUE';
  description?:  string;
  ribSource?:    string;
  ribDestination?: string;
}

// ── Notification ──────────────────────────────────────────────────────────
export interface Notification {
  id:      number;
  contenu: string;
  date:    string;
  lu:      boolean;
}

// ── Transfer payload ──────────────────────────────────────────────────────
export interface TransferPayload {
  ribSource: string;
  ribDestination: string;
  montant: number;
  description?: string;
}

// ── Deposit payload ───────────────────────────────────────────────────────
export interface DepositPayload {
  montant: number;
}

// ── Withdraw payload ──────────────────────────────────────────────────────
export interface WithdrawPayload {
  montant: number;
}

// ── Transaction filters ───────────────────────────────────────────────────
export interface TransactionFilters {
  dateDebut?: string;
  dateFin?:   string;
  type?:      'VIREMENT' | 'DEPOT' | 'RETRAIT' | '';
  page?:      number;
  size?:      number;
}

// ── Paginated response ────────────────────────────────────────────────────
export interface PagedResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  size:          number;
  number:        number;
}

// ── Statement request ─────────────────────────────────────────────────────
export interface StatementRequest {
  rib:       string;
  dateDebut: string;
  dateFin:   string;
}