"use client";

import { useState, useCallback } from "react";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/services/employeeService";
import { Employee } from "@/types";

export function useEmployees() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const list = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listEmployees();
      setEmployees(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch employees";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const get = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEmployee(id);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch employee";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: Partial<Employee>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newEmployee = await createEmployee(data);
      setEmployees((prev) => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create employee";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: Partial<Employee>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateEmployee(id, data);
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update employee";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const delete_ = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete employee";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    employees,
    list,
    get,
    create,
    update,
    delete: delete_,
  };
}
