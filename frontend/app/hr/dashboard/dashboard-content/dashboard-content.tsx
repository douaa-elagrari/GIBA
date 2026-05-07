'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HRChatbot from './HRChatbot';
import LogsDashboard from './LogsDashboard';
import { listAllRequests } from '@/services/requestService';
import { BaseRequest } from '@/types';
import { formatDate } from '@/lib/utils';

type RequestRow = {
  request: BaseRequest;
  details: Record<string, unknown>;
};

export default function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'analytics'>('home');
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listAllRequests()
      .then(setRows)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const pending  = rows.filter(r => r.request.status === 'pending').length;
  const approved = rows.filter(r => r.request.status === 'approved').length;
  const rejected = rows.filter(r => r.request.status === 'rejected').length;
  const total    = rows.length;

  // ── Recent (last 5) ──────────────────────────────────────────────────────
  const recent = rows.slice(-5).reverse();

  return (
    <div style={S.root}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={S.topbar}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
            {activeTab === 'home' ? 'HR Dashboard' : 'RAG Analytics'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
            {activeTab === 'home' ? 'Live HR analytics and request overview for your team.' : 'Live performance logs from the AI HR assistant.'}
          </p>
        </div>

        {/* Right-side controls */}
        <div style={S.topRight}>
          {/* Tabs pill */}
          <div style={S.tabPill}>
            <button
              style={{ ...S.tabBtn, ...(activeTab === 'home'      ? S.tabActive : {}) }}
              onClick={() => setActiveTab('home')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </button>
            <button
              style={{ ...S.tabBtn, ...(activeTab === 'analytics' ? S.tabActive : {}) }}
              onClick={() => setActiveTab('analytics')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6"  y1="20" x2="6"  y2="14" />
              </svg>
              Analytics
            </button>
          </div>

          {/* Bell */}
          <div style={S.bellWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {pending > 0 && <div style={S.badge} />}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={S.content}>

        {/* ════════════ HOME TAB ════════════ */}
        {activeTab === 'home' && (
          <>
            {/* Action cards */}
            <div style={S.grid2}>
              <button
                className="app-card"
                style={S.card}
                onClick={() => router.push('/hr/new-request')}
              >
                <div style={{ ...S.cardIcon, background: '#eff6ff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <p style={S.cardTitle}>New Request</p>
                <p style={S.cardDesc}>Create a new HR request</p>
              </button>

              <button
                className="app-card"
                style={S.card}
                onClick={() => router.push('/hr/requests')}
              >
                <div style={{ ...S.cardIcon, background: '#faf5ff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p style={S.cardTitle}>All Requests</p>
                <p style={S.cardDesc}>View and manage requests</p>
              </button>
            </div>

            {/* Stat cards */}
            <div style={S.grid4}>
              {[
                { label: 'Total',    value: isLoading ? '…' : String(total),    icon: '#6366f1', bg: '#eef2ff' },
                { label: 'Pending',  value: isLoading ? '…' : String(pending),  icon: '#f59e0b', bg: '#fffbeb' },
                { label: 'Approved', value: isLoading ? '…' : String(approved), icon: '#10b981', bg: '#f0fdf4' },
                { label: 'Rejected', value: isLoading ? '…' : String(rejected), icon: '#ef4444', bg: '#fef2f2' },
              ].map(stat => (
                <div key={stat.label} style={S.stat}>
                  <div style={S.statHeader}>
                    <p style={S.statLabel}>{stat.label}</p>
                    <div style={{ ...S.statDot, background: stat.bg }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.icon }} />
                    </div>
                  </div>
                  <p style={S.statNum}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent requests */}
            <div style={S.activity}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={S.actTitle}>Recent Requests</p>
                <button style={S.viewAll} onClick={() => router.push('/hr/requests')}>View All</button>
              </div>

              {isLoading ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>
              ) : recent.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>No requests yet.</p>
              ) : (
                recent.map(({ request }, i) => {
                  const statusColor =
                    request.status === 'approved' ? '#10b981' :
                    request.status === 'rejected' ? '#ef4444' : '#f59e0b';
                  const statusBg =
                    request.status === 'approved' ? '#f0fdf4' :
                    request.status === 'rejected' ? '#fef2f2' : '#fffbeb';
                  const statusBorder =
                    request.status === 'approved' ? '#bbf7d0' :
                    request.status === 'rejected' ? '#fecaca' : '#fde68a';

                  return (
                    <div
                      key={request.id}
                      style={{ ...S.actRow, borderBottom: i < recent.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }}
                      onClick={() => router.push(`/hr/requests/${request.id}`)}
                    >
                      <div style={S.actIconWrap}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={S.actLabel}>Employee #{request.user_id} — {request.type}</p>
                        <p style={S.actDate}>{formatDate(request.created_at)}</p>
                      </div>
                      <span style={{ ...S.actStatus, color: statusColor, background: statusBg, border: `1px solid ${statusBorder}` }}>
                        {request.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ════════════ ANALYTICS TAB ════════════ */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <LogsDashboard />
            </div>
          </div>
        )}
      </div>

      {/* ── Floating chatbot ─────────────────────────────────────────────── */}
      <HRChatbot />
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  root:        { display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' },

  // Topbar
  topbar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
  topRight:    { display: 'flex', alignItems: 'center', gap: 12 },
  tabPill:     { display: 'flex', gap: 2, background: '#f1f5f9', borderRadius: 10, padding: 3 },
  tabBtn:      { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  tabActive:   { background: '#fff', color: '#4f46e5', fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  bellWrap:    { position: 'relative', cursor: 'pointer', display: 'flex' },
  badge:       { position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' },

  content:     { flex: 1, overflowY: 'auto', padding: '24px 32px' },

  // Action cards
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  card:        { background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'box-shadow 0.2s', textAlign: 'left' as const, fontFamily: "'DM Sans', sans-serif" },
  cardIcon:    { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle:   { fontWeight: 600, fontSize: 14, color: '#111827', margin: '0 0 4px' },
  cardDesc:    { fontSize: 13, color: '#9ca3af', margin: 0 },

  // Stat cards
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 },
  stat:        { background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 18 },
  statHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel:   { fontSize: 12, color: '#9ca3af', margin: 0 },
  statDot:     { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum:     { fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 },

  // Activity
  activity:    { background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 18 },
  actTitle:    { fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 },
  viewAll:     { background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: '#6b7280', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  actRow:      { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' },
  actIconWrap: { width: 32, height: 32, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #f1f5f9' },
  actLabel:    { fontSize: 13.5, fontWeight: 500, color: '#111827', margin: 0, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  actDate:     { fontSize: 11, color: '#9ca3af', margin: '2px 0 0' },
  actStatus:   { fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, flexShrink: 0 },
};