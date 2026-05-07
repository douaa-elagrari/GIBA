'use client';

import { useState, useEffect, useCallback } from 'react';
import { PieChart, List } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface LogRow {
  id: number;
  timestamp: string;
  user_id: string;
  session_id: string | null;
  query: string;
  lang: string;
  intent: string;
  confidence: number | null;
  answer_preview: string;
  answer_length: number;
  cache_hit: boolean;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  model: string;
  error_message: string | null;
}

interface Stats {
  total: number;
  avgLatency: number;
  cacheHitRate: number;
  errorRate: number;
  intentCounts: Record<string, number>;
  langCounts: Record<string, number>;
  hourlyVolume: { hour: string; count: number }[];
  latencyBuckets: { label: string; count: number }[];
  recentLogs: LogRow[];
  topQueries: { query: string; count: number }[];
  avgConfidence: number;
}

// ── Supabase fetch ───────────────────────────────────────────────────────────
const SUPABASE_URL  = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function fetchLogs(limit = 500): Promise<LogRow[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }
  const url = `${SUPABASE_URL}/rest/v1/chat_logs?order=timestamp.desc&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ── Compute stats ─────────────────────────────────────────────────────────────
function computeStats(logs: LogRow[]): Stats {
  if (!logs.length) {
    return {
      total: 0, avgLatency: 0, cacheHitRate: 0, errorRate: 0,
      intentCounts: {}, langCounts: {}, hourlyVolume: [],
      latencyBuckets: [], recentLogs: [], topQueries: [], avgConfidence: 0,
    };
  }

  const intentCounts: Record<string, number> = {};
  const langCounts: Record<string, number> = {};
  const hourMap: Record<string, number> = {};
  const queryMap: Record<string, number> = {};

  let totalLatency = 0, cacheHits = 0, errors = 0;
  const latencyBuckets = [
    { label: '<1s', min: 0, max: 1000, count: 0 },
    { label: '1–3s', min: 1000, max: 3000, count: 0 },
    { label: '3–6s', min: 3000, max: 6000, count: 0 },
    { label: '6–10s', min: 6000, max: 10000, count: 0 },
    { label: '>10s', min: 10000, max: Infinity, count: 0 },
  ];
  let confTotal = 0, confCount = 0;

  for (const log of logs) {
    intentCounts[log.intent] = (intentCounts[log.intent] ?? 0) + 1;
    langCounts[log.lang]     = (langCounts[log.lang]     ?? 0) + 1;
    totalLatency += log.latency_ms ?? 0;
    if (log.cache_hit) cacheHits++;
    if (log.error_message) errors++;
    if (log.confidence != null) { confTotal += log.confidence; confCount++; }

    const d = new Date(log.timestamp);
    const h = `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}h`;
    hourMap[h] = (hourMap[h] ?? 0) + 1;

    if (log.query) {
      const q = log.query.slice(0, 60);
      queryMap[q] = (queryMap[q] ?? 0) + 1;
    }

    for (const b of latencyBuckets) {
      if ((log.latency_ms ?? 0) >= b.min && (log.latency_ms ?? 0) < b.max) { b.count++; break; }
    }
  }

  const hourlyVolume = Object.entries(hourMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-24)
    .map(([hour, count]) => ({ hour, count }));

  const topQueries = Object.entries(queryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }));

  return {
    total: logs.length,
    avgLatency: totalLatency / logs.length,
    cacheHitRate: (cacheHits / logs.length) * 100,
    errorRate: (errors / logs.length) * 100,
    intentCounts,
    langCounts,
    hourlyVolume,
    latencyBuckets: latencyBuckets.filter(b => b.count > 0),
    recentLogs: logs.slice(0, 50),
    topQueries,
    avgConfidence: confCount ? confTotal / confCount : 0,
  };
}

// ── Palette ───────────────────────────────────────────────────────────────────
const INTENT_COLOR: Record<string, string> = {
  hr_query:  '#6366f1', giba_query: '#0ea5e9',
  general:   '#10b981', small_talk:  '#f59e0b', gibberish: '#ef4444',
};
const LANG_COLOR: Record<string, string> = {
  ar: '#f59e0b', fr: '#6366f1', en: '#10b981',
};
const LANG_LABEL: Record<string, string> = { ar: 'Arabic', fr: 'French', en: 'English' };

function intentColor(i: string) { return INTENT_COLOR[i] ?? '#9ca3af'; }
function langColor(l: string)   { return LANG_COLOR[l]   ?? '#9ca3af'; }

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({
  data, colorFn, labelFn,
}: {
  data: { key: string; val: number }[];
  colorFn: (k: string) => string;
  labelFn?: (k: string) => string;
}) {
  const max = Math.max(...data.map(d => d.val), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map(({ key, val }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#6b7280', width: 88, flexShrink: 0, textAlign: 'right' }}>
            {labelFn ? labelFn(key) : key}
          </span>
          <div style={{ flex: 1, height: 20, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(val / max) * 100}%`,
                background: colorFn(key),
                borderRadius: 6,
                transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
              }}
            >
              {val > 0 && (
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{val}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Sparkline (hourly volume) ─────────────────────────────────────────────────
function Sparkline({ data }: { data: { hour: string; count: number }[] }) {
  if (!data.length) return <div style={{ color: '#9ca3af', fontSize: 12 }}>No data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const W = 100, H = 48;
  const pts = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * W;
    const y = H - (d.count / max) * H;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 100 ${H}`} style={{ width: '100%', height: 64, display: 'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,${H} ${pts} ${W},${H}`}
          fill="url(#sparkFill)"
        />
        <polyline
          points={pts}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{data[0]?.hour}</span>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{data[data.length - 1]?.hour}</span>
      </div>
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function Donut({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const R = 36, stroke = 14, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, flexShrink: 0 }}>
      <circle cx="50" cy="50" r={R} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {slices.map((s, i) => {
        const dash = (s.value / total) * C;
        const el = (
          <circle
            key={i}
            cx="50" cy="50" r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">
        {total}
      </text>
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, accent, icon: Icon }: { label: string; value: string; sub?: string; accent: string; icon?: React.ElementType }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #eef0f4', borderRadius: 12,
      padding: '16px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#0f1320', margin: '4px 0 2px', lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>}
        </div>
        {Icon && <div style={{ color: accent, opacity: 0.8 }}><Icon size={18} /></div>}
      </div>
    </div>
  );
}

// ── Intent badge ──────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10, fontWeight: 600,
      padding: '2px 7px', borderRadius: 20,
      background: color + '22', color,
      border: `1px solid ${color}44`,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #eef0f4', borderRadius: 12, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f1320', margin: 0 }}>{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LogsDashboard() {
  const [logs, setLogs]       = useState<LogRow[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tab, setTab]         = useState<'overview' | 'logs'>('overview');
  const [filterIntent, setFilterIntent] = useState<string>('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLogs(500);
      setLogs(data);
      setStats(computeStats(data));
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [autoRefresh, load]);

  const filteredLogs = filterIntent === 'all'
    ? stats?.recentLogs ?? []
    : (stats?.recentLogs ?? []).filter(l => l.intent === filterIntent);

  const intents = stats ? Object.keys(stats.intentCounts).sort() : [];

  return (
    <div style={S.root}>
      {/* Compact Header & Controls */}
      <div style={S.headerRow}>
        <div style={S.tabs}>
          {(['overview', 'logs'] as const).map(t => (
            <button
              key={t}
              style={{ ...S.tabBtn, ...(tab === t ? S.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? (
                <><PieChart size={14} style={{ marginRight: 6, marginBottom: -2 }} /> Overview</>
              ) : (
                <><List size={14} style={{ marginRight: 6, marginBottom: -2 }} /> Logs</>
              )}
            </button>
          ))}
        </div>
        
        <div style={S.headerActions}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </span>
          <button
            style={{ ...S.pill, background: autoRefresh ? '#f4f3ff' : '#f8fafc', color: autoRefresh ? '#6d5dfc' : '#6b7280', border: `1px solid ${autoRefresh ? '#e0d9ff' : '#e5e7eb'}` }}
            onClick={() => setAutoRefresh(a => !a)}
          >
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: autoRefresh ? '#6d5dfc' : '#9ca3af', marginRight: 4 }} />
            Auto
          </button>
          <button style={S.refreshBtn} onClick={load} disabled={loading}>
            <svg style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', marginBottom: 12, color: '#dc2626', fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && stats && (
        <div style={S.grid}>

          {/* KPI row */}
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <KPI label="Total Queries" value={stats.total.toLocaleString()} accent="#6d5dfc" />
            <KPI label="Avg Latency"   value={`${(stats.avgLatency / 1000).toFixed(1)}s`} accent="#0ea5e9" />
            <KPI label="Cache Hit Rate" value={`${stats.cacheHitRate.toFixed(1)}%`} accent="#10b981" />
            <KPI label="Error Rate"    value={`${stats.errorRate.toFixed(1)}%`} accent={stats.errorRate > 5 ? '#ef4444' : '#f59e0b'} />
            <KPI label="Confidence" value={stats.avgConfidence ? stats.avgConfidence.toFixed(2) : '—'} accent="#8b5cf6" />
          </div>

          {/* Hourly volume */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Section title="Hourly Volume">
              <Sparkline data={stats.hourlyVolume} />
            </Section>
          </div>

          {/* Intent distribution */}
          <div style={{ gridColumn: '1 / span 1' }}>
            <Section title="Intent Distribution">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Donut
                  slices={Object.entries(stats.intentCounts).map(([k, v]) => ({
                    label: k, value: v, color: intentColor(k),
                  }))}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(stats.intentCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge label={k.replace('_', ' ')} color={intentColor(k)} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{v}</span>
                      </div>
                    ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Language breakdown */}
          <div style={{ gridColumn: '2 / span 1' }}>
            <Section title="Language Breakdown">
              <BarChart
                data={Object.entries(stats.langCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, val]) => ({ key, val }))}
                colorFn={langColor}
                labelFn={k => LANG_LABEL[k] ?? k}
              />
            </Section>
          </div>

          {/* Latency distribution */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Section title="Latency Distribution">
              <BarChart
                data={stats.latencyBuckets.map(b => ({ key: b.label, val: b.count }))}
                colorFn={k => {
                  const colors: Record<string, string> = {
                    '<1s': '#10b981', '1–3s': '#6366f1', '3–6s': '#f59e0b',
                    '6–10s': '#f97316', '>10s': '#ef4444',
                  };
                  return colors[k] ?? '#9ca3af';
                }}
              />
            </Section>
          </div>

          {/* Top queries */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Section title="Top Queries">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.topQueries.slice(0, 8).map(({ query, count }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', borderBottom: i < 7 ? '1px solid #f8fafc' : 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', width: 16 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{query}</span>
                    <span style={{ background: '#f4f3ff', color: '#6d5dfc', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{count}×</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── LOGS TAB ── */}
      {tab === 'logs' && (
        <div>
          {/* Filter row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {['all', ...intents].map(i => (
              <button
                key={i}
                onClick={() => setFilterIntent(i)}
                style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
                  background: filterIntent === i ? intentColor(i) : '#f8fafc',
                  color: filterIntent === i ? '#fff' : '#6b7280',
                  border: `1px solid ${filterIntent === i ? intentColor(i) : '#e5e7eb'}`,
                }}
              >
                {i === 'all' ? 'All' : i.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Time', 'Query', 'Intent', 'Lang', 'Latency', 'Cache', 'Confidence', 'Error'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log.id ?? i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...S.td, fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ ...S.td, maxWidth: 220 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#374151' }} title={log.query}>
                        {log.query}
                      </span>
                    </td>
                    <td style={S.td}>
                      <Badge label={log.intent?.replace('_', ' ') ?? '—'} color={intentColor(log.intent)} />
                    </td>
                    <td style={S.td}>
                      <Badge label={LANG_LABEL[log.lang] ?? log.lang ?? '—'} color={langColor(log.lang)} />
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: log.latency_ms > 6000 ? '#ef4444' : log.latency_ms > 3000 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {log.latency_ms != null ? `${(log.latency_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      {log.cache_hit
                        ? <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
                        : <span style={{ color: '#e5e7eb', fontSize: 14 }}>—</span>}
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: '#6b7280' }}>
                      {log.confidence != null ? log.confidence.toFixed(2) : '—'}
                    </td>
                    <td style={{ ...S.td, maxWidth: 140 }}>
                      {log.error_message
                        ? <span style={{ fontSize: 11, color: '#ef4444', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.error_message}>⚠ {log.error_message}</span>
                        : <span style={{ color: '#d1fae5', fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...S.td, textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root:          { padding: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 16 },
  headerRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  headerActions: { display: 'flex', gap: 8, alignItems: 'center' },
  pill:          { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' },
  refreshBtn:    { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', background: '#f4f3ff', color: '#6d5dfc', border: 'none', transition: 'all 0.15s' },
  tabs:          { display: 'flex', gap: 4, background: '#f8fafc', border: '1px solid #f1f5f9', padding: 3, borderRadius: 8 },
  tabBtn:        { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', background: 'none', border: 'none', color: '#6b7280', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' },
  tabActive:     { background: '#ffffff', color: '#0f1320', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  tableWrap:     { overflowX: 'auto', background: '#ffffff', border: '1px solid #eef0f4', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  table:         { width: '100%', borderCollapse: 'collapse' as const },
  th:            { padding: '10px 12px', textAlign: 'left' as const, fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const, background: '#fafafa' },
  td:            { padding: '8px 12px', borderBottom: '1px solid #f9fafb', verticalAlign: 'middle' as const },
};