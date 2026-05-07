"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const role = user?.employee?.role;
  const isManager = role === "hr" || role === "admin" || role === "directeur";

  return (
    <DashboardLayout role={isManager ? "manager" : "employee"} userName="">
      <div className="employee-view">{children}</div>
    </DashboardLayout>
  );
}
