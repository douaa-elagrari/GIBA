"use client";

import { useState, useCallback } from "react";
import {
  getAllDocuments,
  getUserDocuments,
  getAllTitreConges,
  getTitreConge,
  getTitreCongeByRequest,
  getUserTitreConges,
  deleteTitreConge,
  getAllOrdreMissions,
  getOrdreMission,
  getOrdreMissionByRequest,
  getUserOrdreMissions,
  deleteOrdreMission,
  createAttestation,
  getAllAttestations,
  getAttestation,
  getUserAttestations,
  deleteAttestation,
} from "@/services/documentService";
import { TitreConge, OrdreMission, AttestationTravail } from "@/types";

export function useDocuments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllDocuments();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch documents";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getByUser = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserDocuments(userId);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user documents";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Titre Conge
  const listTitreConges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAllTitreConges();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch titre conges";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTitreCongeById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getTitreConge(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch titre conge";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTitreCongeByRequestId = useCallback(async (requestId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getTitreCongeByRequest(requestId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch titre conge";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserTitreCongesList = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getUserTitreConges(userId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user titre conges";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeTitreConge = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deleteTitreConge(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete titre conge";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ordre Mission
  const listOrdreMissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAllOrdreMissions();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch ordre missions";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrdreMissionById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getOrdreMission(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch ordre mission";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrdreMissionByRequestId = useCallback(async (requestId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getOrdreMissionByRequest(requestId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch ordre mission";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserOrdreMissionsList = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getUserOrdreMissions(userId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user ordre missions";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeOrdreMission = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deleteOrdreMission(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete ordre mission";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Attestation
  const createNewAttestation = useCallback(
    async (data: Omit<AttestationTravail, "id">) => {
      setIsLoading(true);
      setError(null);
      try {
        return await createAttestation(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create attestation";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const listAttestations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAllAttestations();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch attestations";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAttestationById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAttestation(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch attestation";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserAttestationsList = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getUserAttestations(userId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user attestations";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeAttestation = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deleteAttestation(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete attestation";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getAll,
    getByUser,
    // Titre Conge
    listTitreConges,
    getTitreCongeById,
    getTitreCongeByRequestId,
    getUserTitreCongesList,
    removeTitreConge,
    // Ordre Mission
    listOrdreMissions,
    getOrdreMissionById,
    getOrdreMissionByRequestId,
    getUserOrdreMissionsList,
    removeOrdreMission,
    // Attestation
    createNewAttestation,
    listAttestations,
    getAttestationById,
    getUserAttestationsList,
    removeAttestation,
  };
}
