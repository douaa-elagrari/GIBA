"use client";

import type { ReactNode } from "react";
import { LangProvider } from "@/contexts/LangContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>{children}</AuthProvider>
    </LangProvider>
  );
}
