import RequestsTable from "./requests-components/requests-table/requests-table";

export default function RequestManagementPage() {
  return (
    <div className="rm-page">
      <h1 className="rm-page-title">Request Management</h1>
      <RequestsTable />
    </div>
  );
}
