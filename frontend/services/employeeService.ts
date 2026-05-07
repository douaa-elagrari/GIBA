import { apiRequest } from "@/lib/api";
import { Employee } from "@/types";

export async function listEmployees(): Promise<Employee[]> {
  return apiRequest<Employee[]>("/employees", {
    method: "GET",
  });
}

export async function getEmployee(id: number): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}`, {
    method: "GET",
  });
}

export async function createEmployee(
  data: Partial<Employee>,
): Promise<Employee> {
  return apiRequest<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(
  id: number,
  data: Partial<Employee>,
): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/employees/${id}`, {
    method: "DELETE",
  });
}
