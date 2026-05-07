"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";

// Type for translation object
type TranslationType = ReturnType<typeof useLang>["t"];

// Better error typing
type LoginError = {
  message?: string;
};

export function useLogin(role: "employee" | "hr" | "directeur" | "admin") {
  const router = useRouter();
  const { login: authLogin, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (
    email: string,
    password: string,
    t: TranslationType,
  ) => {
    const newErrors: Record<string, string> = {};

    // Validation
    if (!email) newErrors.email = `${t.auth.emailOrId} is required`;
    if (!password) newErrors.password = `${t.auth.password} is required`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const profile = await authLogin(email, password);

      // Redirect based on the actual role from the profile, not the UI toggle
      const actualRole = profile?.employee?.role ?? role;
      switch (actualRole) {
        case "hr":
        case "admin":
        case "directeur":
          router.push("/hr/dashboard");
          break;
        default:
          router.push("/employee/dashboard");
      }
    } catch (error) {
      const err = error as LoginError;

      setErrors({
        submit: err.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading: loading || authLoading,
    errors,
    setErrors,
  };
}
