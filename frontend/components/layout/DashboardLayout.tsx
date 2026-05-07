"use client";

import Sidebar from "@/components/ui/side-bar/side-bar";

interface DashboardLayoutProps {
  role: "employee" | "manager";
  userName: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  role,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar initialRole={role} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
