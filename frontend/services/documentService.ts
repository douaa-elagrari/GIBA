import { apiRequest } from "@/lib/api";
import { TitreConge, OrdreMission, AttestationTravail } from "@/types";

// ==================== DOCUMENTS ====================
export async function getAllDocuments(): Promise<{
  titre_conge: TitreConge[];
  ordre_mission: OrdreMission[];
  attestation_travail: AttestationTravail[];
}> {
  return apiRequest<{
    titre_conge: TitreConge[];
    ordre_mission: OrdreMission[];
    attestation_travail: AttestationTravail[];
  }>("/documents", {
    method: "GET",
  });
}

export async function getUserDocuments(userId: number): Promise<{
  titre_conge: TitreConge[];
  ordre_mission: OrdreMission[];
  attestation_travail: AttestationTravail[];
}> {
  return apiRequest<{
    titre_conge: TitreConge[];
    ordre_mission: OrdreMission[];
    attestation_travail: AttestationTravail[];
  }>(`/documents/user/${userId}`, {
    method: "GET",
  });
}

// ==================== TITRE CONGE ====================
export async function getAllTitreConges(): Promise<TitreConge[]> {
  return apiRequest<TitreConge[]>("/conge", {
    method: "GET",
  });
}

export async function getTitreConge(id: number): Promise<TitreConge> {
  return apiRequest<TitreConge>(`/conge/${id}`, {
    method: "GET",
  });
}

export async function getTitreCongeByRequest(
  requestId: number,
): Promise<TitreConge> {
  return apiRequest<TitreConge>(`/conge/request/${requestId}`, {
    method: "GET",
  });
}

export async function getUserTitreConges(
  userId: number,
): Promise<TitreConge[]> {
  return apiRequest<TitreConge[]>(`/conge/user/${userId}`, {
    method: "GET",
  });
}

export async function deleteTitreConge(
  id: number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/conge/${id}`, {
    method: "DELETE",
  });
}

// ==================== ORDRE MISSION ====================
export async function getAllOrdreMissions(): Promise<OrdreMission[]> {
  return apiRequest<OrdreMission[]>("/mission", {
    method: "GET",
  });
}

export async function getOrdreMission(id: number): Promise<OrdreMission> {
  return apiRequest<OrdreMission>(`/mission/${id}`, {
    method: "GET",
  });
}

export async function getOrdreMissionByRequest(
  requestId: number,
): Promise<OrdreMission> {
  return apiRequest<OrdreMission>(`/mission/request/${requestId}`, {
    method: "GET",
  });
}

export async function getUserOrdreMissions(
  userId: number,
): Promise<OrdreMission[]> {
  return apiRequest<OrdreMission[]>(`/mission/user/${userId}`, {
    method: "GET",
  });
}

export async function deleteOrdreMission(
  id: number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/mission/${id}`, {
    method: "DELETE",
  });
}

// ==================== ATTESTATION TRAVAIL ====================
export async function createAttestation(
  data: Omit<AttestationTravail, "id">,
): Promise<AttestationTravail> {
  return apiRequest<AttestationTravail>("/attestation", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAllAttestations(): Promise<AttestationTravail[]> {
  return apiRequest<AttestationTravail[]>("/attestation", {
    method: "GET",
  });
}

export async function getAttestation(id: number): Promise<AttestationTravail> {
  return apiRequest<AttestationTravail>(`/attestation/${id}`, {
    method: "GET",
  });
}

export async function getUserAttestations(
  userId: number,
): Promise<AttestationTravail[]> {
  return apiRequest<AttestationTravail[]>(`/attestation/user/${userId}`, {
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
