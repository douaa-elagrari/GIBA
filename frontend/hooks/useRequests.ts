"use client";

import { useState, useCallback } from "react";
import {
  createRequest,
  listAllRequests,
  getUserRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  CreateRequestPayload,
  UpdateRequestPayload,
} from "@/services/requestService";
import { BaseRequest, RequestStatus, RequestType } from "@/types";

export function useRequests() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<BaseRequest[]>([]);

  const create = useCallback(async (payload: CreateRequestPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createRequest(payload);
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create request";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAllRequests();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch requests";
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
      const data = await getUserRequests(userId);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user requests";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRequestById(id);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch request";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number, payload: UpdateRequestPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await updateRequest(id, payload);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update request";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const delete_ = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteRequest(id);
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete request";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    create,
    listAll,
    getByUser,
    getById,
    update,
    delete: delete_,
  };
}
