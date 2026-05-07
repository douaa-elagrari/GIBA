import { apiRequest } from "@/lib/api";
import {
  BaseRequest,
  RequestType,
  RequestStatus,
  CongeType,
  FormationType,
  RequestResponse,
} from "@/types";

// ==================== RE-EXPORT TYPES ====================
export type { RequestResponse };

// ==================== CREATE PAYLOAD ====================
export interface CreateRequestPayload {
  type: RequestType;

  conge?: {
    type_conge: CongeType;
    date_debut: string;
    date_fin: string;
    nb_jours: number;
    interim?: string;
    adresse?: string;
    motif?: string;

    // file (React Native / web)
    document?: File | Blob | any;
  };

  mission?: {
    destination: string;
    objet: string;
    itineraire: string;
    duree: number;
    date_depart: string;
    date_retour: string;
    transport: string;
  };

  placement?: {
    host_structure: string;
    duration: string;
    conditions: string;
  };

  sortie?: {
    date_sortie: string;
    heure_sortie: string;
    heure_retour: string;
    motif: string;
  };

  formation?: {
    theme: string;
    type_formation: FormationType;
    periode: string;
    objectifs: string;
  };
}

// ==================== UPDATE PAYLOAD ====================
export interface UpdateRequestPayload {
  status?: RequestStatus;
  responsible_comments?: string; 
  conge?: Partial<CreateRequestPayload["conge"]>;
  mission?: Partial<CreateRequestPayload["mission"]>;
  sortie?: Partial<CreateRequestPayload["sortie"]>;
  formation?: Partial<CreateRequestPayload["formation"]>;
  placement?: Partial<CreateRequestPayload["placement"]>;
}

// ==================== HELPERS ====================
function buildFormData(payload: CreateRequestPayload): FormData {
  const formData = new FormData();

  formData.append("type", payload.type);

  // Helper to append nested objects
  const appendObject = (prefix: string, obj: Record<string, any>) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // special case: file
      if (key === "document") {
        formData.append(`${prefix}.document`, value);
      } else {
        formData.append(`${prefix}.${key}`, String(value));
      }
    });
  };

  if (payload.conge) appendObject("conge", payload.conge);
  if (payload.mission) appendObject("mission", payload.mission);
  if (payload.sortie) appendObject("sortie", payload.sortie);
  if (payload.formation) appendObject("formation", payload.formation);
  if (payload.placement) appendObject("placement", payload.placement);

  return formData;
}

// ==================== CREATE ====================
export async function createRequest(
  payload: CreateRequestPayload,
): Promise<{
  message: string;
  id: number;
  type: RequestType;
  status: RequestStatus;
}> {
  const isCongeWithFile = payload.conge?.document;

  return apiRequest<{
    message: string;
    id: number;
    type: RequestType;
    status: RequestStatus;
  }>("/requests", {
    method: "POST",
    body: isCongeWithFile
      ? buildFormData(payload) 
      : JSON.stringify(payload), 
  });
}

// ==================== LIST ALL ====================
export async function listAllRequests(): Promise<RequestResponse[]> {
  return apiRequest("/requests", { method: "GET" });
}

// ==================== USER REQUESTS ====================
export async function getUserRequests(
  userId: number,
): Promise<RequestResponse[]> {
  return apiRequest(`/requests/user/${userId}`, { method: "GET" });
}

// ==================== GET BY ID ====================
export async function getRequestById(id: number): Promise<RequestResponse> {
  return apiRequest(`/requests/${id}`, { method: "GET" });
}

// ==================== UPDATE ====================
export async function updateRequest(
  id: number,
  payload: UpdateRequestPayload,
): Promise<RequestResponse> {
  return apiRequest(`/requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ==================== DELETE ====================
export async function deleteRequest(
  id: number,
): Promise<{ message: string }> {
  return apiRequest(`/requests/${id}`, {
    method: "DELETE",
  });
}

// ==================== DELETE USER REQUESTS ====================
export async function deleteUserRequests(
  userId: number,
): Promise<{ message: string }> {
  return apiRequest(`/requests/user/${userId}`, {
    method: "DELETE",
  });
}