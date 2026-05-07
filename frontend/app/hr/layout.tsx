import DashboardLayout from "@/components/layout/DashboardLayout";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="manager" userName="HR Admin">
      {children}
    </DashboardLayout>
  );
}
