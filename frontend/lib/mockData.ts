// Legacy mock data kept for reference only.
// All pages now use the real API via services/*.ts
// Do not import from this file in new code.

export const chartData = [
  { name: "Jan", requests: 42, approved: 35, rejected: 7 },
  { name: "Feb", requests: 58, approved: 48, rejected: 10 },
  { name: "Mar", requests: 67, approved: 54, rejected: 13 },
  { name: "Apr", requests: 45, approved: 38, rejected: 7 },
  { name: "May", requests: 73, approved: 60, rejected: 13 },
  { name: "Jun", requests: 89, approved: 72, rejected: 17 },
];

export const requestTypeData = [
  { name: "Vacation", value: 38 },
  { name: "Sick Leave", value: 24 },
  { name: "Remote Work", value: 18 },
  { name: "Training", value: 12 },
  { name: "Other", value: 8 },
];
