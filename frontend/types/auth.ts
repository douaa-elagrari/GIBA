export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupPayload {
  employee_id: number;
  email: string;
  password: string;
  role: "employee" | "hr" | "directeur" | "admin";
}

export interface VerifyPayload {
  email: string;
  code: string;
}

export interface AuthUser {
  id: number;
  email: string;
  employee_id: number;
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  is_verified: boolean;
  created_at: string;
  employee: Employee;
}

export interface Employee {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  telephone?: string;
  role: "employee" | "hr" | "directeur" | "admin";
  manager_id?: number;
  date_naissance?: string;
  adresse?: string;
  date_entree?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}
