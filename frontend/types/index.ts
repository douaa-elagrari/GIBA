// ==================== REQUEST TYPES ====================
export type RequestType =
  | "conge"
  | "mission"
  | "sortie"
  | "formation"
  | "placement";

export type RequestStatus = "pending" | "approved" | "rejected";

export type CongeType =
  | "annuel"
  | "recuperation"
  | "sans_solde"
  | "autre";

export type FormationType = "courte" | "moyenne" | "longue";

// ==================== EMPLOYEE ROLE ====================
export type EmployeeRole = "employee" | "hr" | "directeur" | "admin";

// ==================== EMPLOYEE ====================
export interface Employee {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;

  date_naissance?: string | null;
  adresse?: string;
  telephone?: string;
  email?: string;
  nin?: string;
  assurance?: string;

  date_entree?: string | null;
  date_recrutement?: string | null;

  sit_fam?: string;
  nombre_enfants?: number;
  groupage?: string;
  compte_banque?: string;
  categorie?: string;
  affectation?: string;
  diplome?: string;
  type_contrat?: string;

  debut_contrat?: string | null;
  fin_contrat?: string | null;

  date_sortie?: string | null;
  motif_sortie?: string;
  mesure_disciplinaire?: string;
  derniere_visite_medicale?: string | null;

  manager_id: number | null;
  role: EmployeeRole;
}

// ==================== BASE REQUEST ====================
export interface BaseRequest {
  id: number;
  user_id: number;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  updated_at?: string;
  responsible_comments?: string | null;
}

// ==================== REQUEST RESPONSE ====================
export interface RequestResponse {
  request: BaseRequest;
  details: Record<string, any>;
  employee?: Employee & { full_name: string };
  can_approve: boolean;
}

// ==================== REQUESTS ====================

export interface CongeRequest extends BaseRequest {
  type: "conge";
  conge_details?: {
    request_id: number;
    type_conge: CongeType;
    date_debut: string;
    date_fin: string;
    nb_jours: number;

    // nullable in backend
    interim?: string;
    adresse?: string;


    motif?: string;
    document_path?: string;
  };
}

export interface MissionRequest extends BaseRequest {
  type: "mission";
  mission_details?: {
    request_id: number;
    destination: string;
    objet: string;
    itineraire: string;
    duree: number;
    date_depart: string;
    date_retour: string;
    transport: string;
  };
}

export interface SortieRequest extends BaseRequest {
  type: "sortie";
  sortie_details?: {
    request_id: number;
    date_sortie: string;
    heure_sortie: string;
    heure_retour: string;
    motif: string;
  };
}

export interface FormationRequest extends BaseRequest {
  type: "formation";
  formation_details?: {
    request_id: number;
    theme: string;
    type_formation: FormationType;
    periode: string;
    objectifs: string;
  };
}

export interface PlacementRequest extends BaseRequest {
  type: "placement";
  placement_details?: {
    request_id: number;
    host_structure: string;
    duration: string;
    conditions: string;
  };
}

// ==================== UNION TYPE ====================
export type Request =
  | CongeRequest
  | MissionRequest
  | SortieRequest
  | FormationRequest
  | PlacementRequest;

// ==================== DOCUMENTS ====================
export interface TitreConge {
  id: number;
  conge_request_id: number;
  exercice: number;
  duree: number;
  date_reprise: string;
  reliquat: number;
}

export interface OrdreMission {
  id: number;
  mission_request_id: number;
  reference: string;
  date_emission: string;
}

export interface AttestationTravail {
  id: number;
  user_id: number;
  date_naissance: string;
  adresse: string;
  num_secu: string;
  date_embauche: string;
  poste: string;
}

// ==================== LEAVE MANAGEMENT ====================
export interface Exercice {
  id: number;
  label: string;
  date_debut: string;
  date_fin: string;
}

export interface EmployeeLeaveBalance {
  id: number;
  employee_id: number;
  exercice_id: number;
  initial_days: number;
  used_days: number;
}

// ==================== UI TYPES ====================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface APIResponse<T> {
  data: T;
  message?: string;
}

export interface APIErrorResponse {
  detail: string;
}