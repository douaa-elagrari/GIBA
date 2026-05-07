import { apiRequest } from "@/lib/api";

export interface CreateAttestationPayload {
  date_naissance: string;
  adresse: string;
  num_secu: string;
  date_embauche: string;
  poste: string;
}

export interface AttestationResponse {
  id: number;
  user_id: number;
  poste: string;
}

export async function createAttestation(
  payload: CreateAttestationPayload,
): Promise<AttestationResponse> {
  return apiRequest<AttestationResponse>("/attestation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAllAttestations(): Promise<AttestationResponse[]> {
  return apiRequest<AttestationResponse[]>("/attestation", {
    method: "GET",
  });
}

export async function getAttestationsByUser(
  userId: number,
): Promise<AttestationResponse[]> {
  return apiRequest<AttestationResponse[]>(`/attestation/user/${userId}`, {
    method: "GET",
  });
}

export async function getAttestationById(
  id: number,
): Promise<AttestationResponse> {
  return apiRequest<AttestationResponse>(`/attestation/${id}`, {
    method: "GET",
  });
}

export async function deleteAttestation(
  id: number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/attestation/${id}`, {
    method: "DELETE",
  });
}
