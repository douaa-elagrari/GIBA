"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./page.css";
import Card from "@/components/ui/cards/cards";
import StatusBadge from "@/components/ui/status-badge/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRequests } from "@/services/requestService";
import { BaseRequest } from "@/types";

import {
  PlusCircle,
  FileText,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Umbrella,
  MonitorSmartphone,
  Wallet,
  Bell,
  ChevronRight,
} from "lucide-react";

function RequestTypeIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  if (type === "conge") return <Umbrella className={cls} />;
  if (type === "sortie") return <Clock className={cls} />;
  if (type === "mission") return <MonitorSmartphone className={cls} />;
  if (type === "formation") return <Wallet className={cls} />;
  return <FileText className={cls} />;
}

export default function EmployeeDashboardPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const [rows, setRows] = useState<Array<{ request: BaseRequest; details: Record<string, any> }>>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  useEffect(() => {
    if (user?.employee?.id) {
      getUserRequests(user.employee.id).then(setRows).catch(console.error);
    }
  }, [user]);

  const recentRequests = rows.slice(-3).reverse();
  const pending = rows.filter((r) => r.request.status === "pending").length;
  const approved = rows.filter((r) => r.request.status === "approved").length;
  const rejected = rows.filter((r) => r.request.status === "rejected").length;

  const actionCards = [
    {
      icon: <PlusCircle size={18} />,
      label: t.employee.submitRequest,
      desc: t.employee.submitRequestDesc,
      href: "/employee/new-request",
      iconColor: "text-blue-500",
    },
    {
      icon: <FileText size={18} />,
      label: t.employee.myRequests,
      desc: t.employee.myRequestsDesc,
      href: "/employee/requests",
      iconColor: "text-indigo-500",
    },
  ];

  const stats = [
    {
      icon: <Clock size={16} />,
      label: t.employee.pending,
      value: pending,
      color: "text-yellow-500",
    },
    {
      icon: <CheckCircle size={16} />,
      label: t.employee.approved,
      value: approved,
      color: "text-green-500",
    },
    {
      icon: <AlertCircle size={16} />,
      label: t.employee.rejected,
      value: rejected,
      color: "text-red-500",
    },
  ];

  const notifications = rows
    .filter((row) => row.request.status !== "pending" || Boolean(row.request.responsible_comments))
    .map((row) => {
      const typeLabel = row.request.type.charAt(0).toUpperCase() + row.request.type.slice(1);
      const details = row.details || {};
      const submittedAt = formatDate(row.request.created_at);
      const statusLabel = row.request.status === "approved" ? "Approved" : row.request.status === "rejected" ? "Rejected" : "Pending";
      const responsibleComment = row.request.responsible_comments
        ? row.request.responsible_comments.trim().split("\n").slice(-1)[0]
        : "No comments yet.";

      const requestLines = Object.entries(details)
        .filter(([key]) => key !== "request_id" && key !== "id")
        .slice(0, 3)
        .map(([key, value]) => `${key.replace(/_/g, " ")}: ${String(value)}`);

      return {
        id: row.request.id,
        request: row.request,
        title:
          row.request.status === "approved"
            ? `${typeLabel} request approved`
            : row.request.status === "rejected"
            ? `${typeLabel} request rejected`
            : `${typeLabel} request updated`,
        submittedAt,
        statusLabel,
        requestLines,
        responsibleComment,
        updatedAt: row.request.updated_at ?? row.request.created_at,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const leaves = [
    {
      label: t.employee.annualLeave,
      used: 12,
      total: 30,
      fillClass: "bg-blue-500",
    },
    {
      label: t.employee.sickLeave,
      used: 5,
      total: 10,
      fillClass: "bg-orange-400",
    },
    {
      label: t.employee.remoteWork,
      used: 4,
      total: 12,
      fillClass: "bg-violet-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">
            {t.employee.welcomeBack}, {user?.employee?.prenom ?? ""}{" "}
            {user?.employee?.nom ?? ""}
          </h1>
          <p className="page-subtitle">
            {user?.employee?.categorie ?? ""} · {user?.employee?.fonction ?? ""}
          </p>
        </div>

        <div ref={notifRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "16px",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              background: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: "#ef4444",
                  boxShadow: "0 0 0 2px #fff",
                }}
              />
            )}
          </button>

          {notificationsOpen && (
            <div
              style={{
                position: "absolute",
                top: "60px",
                right: 0,
                width: "360px",
                maxHeight: "420px",
                overflowY: "auto",
                background: "#fff",
                borderRadius: "22px",
                boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                padding: "16px",
                zIndex: 30,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    Notifications
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Recent updates for your requests.
                  </p>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>
                  {notifications.length} new
                </span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                  No new notifications yet.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#f8fafc",
                        borderRadius: "18px",
                        padding: "16px",
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                      }}
                    >
                      {/* Title + status badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                            {item.title}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569" }}>
                            Submitted {item.submittedAt}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: item.statusLabel === "Approved" ? "#d1fae5" : item.statusLabel === "Rejected" ? "#fee2e2" : "#f8fafc",
                            color: item.statusLabel === "Approved" ? "#166534" : item.statusLabel === "Rejected" ? "#991b1b" : "#334155",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {item.statusLabel}
                        </span>
                      </div>

                      {/* Request details */}
                      <div style={{ display: "grid", gap: "6px", marginBottom: "12px" }}>
                        {item.requestLines.map((line) => (
                          <p key={line} style={{ margin: 0, fontSize: "13px", color: "#334155" }}>
                            {line}
                          </p>
                        ))}
                      </div>

                      {/* Responsible comment */}
                      <div
                        style={{
                          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
                          paddingTop: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Responsible comment
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#475569",
                              whiteSpace: "pre-wrap",
                              fontStyle: item.responsibleComment === "No comments yet." ? "italic" : "normal",
                            }}
                          >
                            {item.responsibleComment}
                          </p>
                          <ChevronRight size={16} color="#64748b" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards-container">
        {actionCards.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="action-card">
              <div className="action-card-icon">
                <span className={item.iconColor}>{item.icon}</span>
              </div>
              <h3 className="action-card-title">{item.label}</h3>
              <p className="action-card-text">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Status Cards */}
      <div className="status-cards-container hr-grid-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="status-card">
            <div className="status-card-icon">
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div>
              <p className="status-card-value">{stat.value}</p>
              <p className="status-card-label">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity + Leave Balance */}
      <div className="recent-and-balance">
        {/* Recent Activity */}
        <div className="section-block">
          <div className="section-header">
            <h2 className="section-title">{t.employee.recentActivity}</h2>
            <Link href="/employee/requests" className="section-link">
              {t.employee.viewAll}
            </Link>
          </div>

          <div className="activity-list">
            {recentRequests.map(({ request }) => (
              <div key={request.id} className="activity-card">
                <div className="activity-card-icon">
                  <RequestTypeIcon type={request.type} />
                </div>
                <div className="activity-card-info">
                  <p className="activity-card-label">{request.type}</p>
                  <p className="activity-card-date">
                    {formatDate(request.created_at)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="section-block">
          <div className="section-header">
            <h2 className="section-title">{t.employee.leaveBalance}</h2>
            <TrendingUp size={14} className="text-slate-400" />
          </div>

          <div className="leave-list">
            {leaves.map((leave) => {
              const percent = Math.round((leave.used / leave.total) * 100);
              return (
                <div key={leave.label} className="leave-row">
                  <div className="leave-meta">
                    <span className="leave-label">{leave.label}</span>
                    <span className="leave-count">
                      {leave.total - leave.used} / {leave.total}{" "}
                      {t.employee.daysLeft}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${leave.fillClass}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="salary-box">
            <p className="salary-label">{t.employee.nextSalary}</p>
            <p className="salary-date">April 30, 2024</p>
            <div className="salary-status">
              <span className="salary-dot" />
              <span>{t.employee.scheduled} · 85,000 DZD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
