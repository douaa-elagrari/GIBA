import { apiRequest } from "@/lib/api";
import { Exercice, EmployeeLeaveBalance } from "@/types";

// ==================== EXERCICE ====================
export async function createExercice(
  data: Omit<Exercice, "id">,
): Promise<Exercice> {
  return apiRequest<Exercice>("/exercices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAllExercices(): Promise<Exercice[]> {
  return apiRequest<Exercice[]>("/exercices", {
    method: "GET",
  });
}

export async function getExercice(id: number): Promise<Exercice> {
  return apiRequest<Exercice>(`/exercices/${id}`, {
    method: "GET",
  });
}

export async function updateExercice(
  id: number,
  data: Partial<Exercice>,
): Promise<Exercice> {
  return apiRequest<Exercice>(`/exercices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteExercice(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/exercices/${id}`, {
    method: "DELETE",
  });
}

// ==================== LEAVE BALANCE ====================
export async function createLeaveBalance(
  data: Omit<EmployeeLeaveBalance, "id">,
): Promise<EmployeeLeaveBalance> {
  return apiRequest<EmployeeLeaveBalance>("/leave-balance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAllLeaveBalances(): Promise<EmployeeLeaveBalance[]> {
  return apiRequest<EmployeeLeaveBalance[]>("/leave-balance", {
    method: "GET",
  });
}

export async function getLeaveBalance(
  id: number,
): Promise<EmployeeLeaveBalance> {
  return apiRequest<EmployeeLeaveBalance>(`/leave-balance/${id}`, {
    method: "GET",
  });
}

export async function getEmployeeLeaveBalances(
  employeeId: number,
): Promise<EmployeeLeaveBalance[]> {
  return apiRequest<EmployeeLeaveBalance[]>(
    `/leave-balance/employee/${employeeId}`,
    {
      method: "GET",
    },
  );
}

export async function updateLeaveBalance(
  id: number,
  data: Partial<EmployeeLeaveBalance>,
): Promise<EmployeeLeaveBalance> {
  return apiRequest<EmployeeLeaveBalance>(`/leave-balance/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLeaveBalance(
  id: number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/leave-balance/${id}`, {
    method: "DELETE",
  });
}
