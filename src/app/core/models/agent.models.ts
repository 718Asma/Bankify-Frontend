// ── Client (Agent-scoped) ─────────────────────────────────────────────────
export interface ClientForm {
  cin:           number;
  nom:           string;
  prenom:        string;
  email:         string;
  motDePasse?:   string;
  telephone:     number;
  adresse:       string;
  dateNaiss:     string; // ISO date string yyyy-MM-dd
}

export interface ClientDetail {
  cin:        number;
  nom:        string;
  prenom:     string;
  email:      string;
  adresse:    string;
  telephone:  number;
  dateNaiss:  string;
  role:       string;
}

// ── Account (Agent-scoped) ────────────────────────────────────────────────
export interface OpenAccountForm {
  rib:          string;
  type:         'COURANT' | 'EPARGNE';
  soldeInitial: number;
  clientCin:    number;
}

export interface AgentCompte {
  rib:         string;
  solde:       number;
  dateCreation: string;
  type:        'COURANT' | 'EPARGNE';
  status:      'ACTIF' | 'BLOQUE' | 'FERME';
  clientCin:   number;
}

// ── Audit ─────────────────────────────────────────────────────────────────
export interface AuditEntry {
  id:            number;
  type:          string;
  dateRealisation: string;
  montant:       number;
  statut:        string;
  agentCin:      number | null;
  compteRibs:    string[];
}

export interface AuditFilters {
  type?:      string;
  statut?:    string;
  dateDebut?: string;
  dateFin?:   string;
  rib?:       string;
  page?:      number;
  size?:      number;
}

// ── Agent Stats ───────────────────────────────────────────────────────────
export interface AgentStats {
  totalClients:       number;
  comptesOuvertsMois: number;
  totalOperations:    number;
  comptesBlockes:     number;
  operationsParJour:  { date: string; count: number }[];
  repartitionComptes: { type: string; count: number }[];
}