import RequestsTable from "./requests-components/requests-table/requests-table";

export default function RequestManagementPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' }}>
      <div style={{ padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Request Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>Review and manage all employee requests</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, animation: 'app-fade-in 0.4s ease-out' }}>
          <RequestsTable />
        </div>
      </div>
    </div>
  );
}
