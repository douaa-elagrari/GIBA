import "./page.css";
import DashboardContent from "./dashboard-content/dashboard-content";

export default function HRDashboardPage() {
  // ===== FAKE REQUEST DATA =====
  const fakeRows = [
    {
      request: {
        id: 1,
        userId: 101,
        type: "Leave",
        status: "pending",
        created_at: new Date().toISOString(),
      },
      details: {},
    },
    {
      request: {
        id: 2,
        userId: 102,
        type: "Salary",
        status: "approved",
        created_at: new Date().toISOString(),
      },
      details: {},
    },
    {
      request: {
        id: 3,
        userId: 103,
        type: "WFH",
        status: "rejected",
        created_at: new Date().toISOString(),
      },
      details: {},
    },
    {
      request: {
        id: 4,
        userId: 104,
        type: "Leave",
        status: "approved",
        created_at: new Date().toISOString(),
      },
      details: {},
    },
  ];

  // ===== FAKE BAR CHART DATA =====
  const chartDataForBar = [
    { topic: "Pending", number: 1 },
    { topic: "Approved", number: 2 },
    { topic: "Rejected", number: 1 },
  ];

  // ===== FAKE PIE CHART DATA =====
  const chartDataForPie = [
    { topic: "Leave", number: 2 },
    { topic: "Salary", number: 1 },
    { topic: "WFH", number: 1 },
  ];

  return (
    <DashboardContent
      chartDataForBar={chartDataForBar}
      chartDataForPie={chartDataForPie}
    />
  );
}