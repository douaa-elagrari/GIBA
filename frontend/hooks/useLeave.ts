"use client";

import { useState, useCallback } from "react";
import {
  createExercice,
  getAllExercices,
  getExercice,
  updateExercice,
  deleteExercice,
  createLeaveBalance,
  getAllLeaveBalances,
  getLeaveBalance,
  getEmployeeLeaveBalances,
  updateLeaveBalance,
  deleteLeaveBalance,
} from "@/services/leaveService";
import { Exercice, EmployeeLeaveBalance } from "@/types";

export function useLeave() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exercice
  const createNewExercice = useCallback(async (data: Omit<Exercice, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createExercice(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create exercice";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listExercices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAllExercices();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch exercices";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getExerciceById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getExercice(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch exercice";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExerciceData = useCallback(
    async (id: number, data: Partial<Exercice>) => {
      setIsLoading(true);
      setError(null);
      try {
        return await updateExercice(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update exercice";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removeExercice = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deleteExercice(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete exercice";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leave Balance
  const createNewLeaveBalance = useCallback(
    async (data: Omit<EmployeeLeaveBalance, "id">) => {
      setIsLoading(true);
      setError(null);
      try {
        return await createLeaveBalance(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create leave balance";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const listLeaveBalances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAllLeaveBalances();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch leave balances";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLeaveBalanceById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getLeaveBalance(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch leave balance";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEmployeeLeaveBalanceList = useCallback(
    async (employeeId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        return await getEmployeeLeaveBalances(employeeId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch leave balances";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateLeaveBalanceData = useCallback(
    async (id: number, data: Partial<EmployeeLeaveBalance>) => {
      setIsLoading(true);
      setError(null);
      try {
        return await updateLeaveBalance(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update leave balance";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removeLeaveBalance = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deleteLeaveBalance(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete leave balance";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    // Exercice
    createNewExercice,
    listExercices,
    getExerciceById,
    updateExerciceData,
    removeExercice,
    // Leave Balance
    createNewLeaveBalance,
    listLeaveBalances,
    getLeaveBalanceById,
    getEmployeeLeaveBalanceList,
    updateLeaveBalanceData,
    removeLeaveBalance,
  };
}
