import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatbotButton from "@/components/chatbot/ChatbotButton";
import { Providers } from "@/components/providers";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="employee" userName="Sarah Johnson">
      <div className="employee-view">{children}</div>
      <Providers>
        <ChatbotButton />
      </Providers>
    </DashboardLayout>
  );
}
