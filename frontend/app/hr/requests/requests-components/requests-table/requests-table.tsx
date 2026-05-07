"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequestStatus, BaseRequest, RequestResponse } from "@/types";
import { listAllRequests, updateRequest } from "@/services/requestService";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/contexts/LangContext";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageCircle,
  X,
  Send,
} from "lucide-react";
import "./requests-table.css";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string) {
  const colors = [
    "#4f46e5",
    "#0891b2",
    "#059669",
    "#d97706",
    "#dc2626",
    "#7c3aed",
    "#db2777",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

type RequestRow = RequestResponse;

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  requestId,
  action,
  onConfirm,
  onClose,
  loading,
}: {
  requestId: number;
  action: "approved" | "rejected";
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const isApprove = action === "approved";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "28px",
          width: "380px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              margin: "0 auto 14px",
              background: isApprove ? "#dcfce7" : "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isApprove ? (
              <CheckCircle size={26} color="#16a34a" />
            ) : (
              <XCircle size={26} color="#dc2626" />
            )}
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 700 }}>
            {isApprove ? "Approve" : "Reject"} Request #{requestId}?
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            {isApprove
              ? "This will approve the request and notify the employee."
              : "This will reject the request and notify the employee."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: isApprove ? "#16a34a" : "#dc2626",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "..." : isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Comment Modal ─────────────────────────────────────────────────────────────
function CommentModal({
  requestId,
  existingComments,
  onClose,
  onSaved,
  onError,
}: {
  requestId: number;
  existingComments: string;
  onClose: () => void;
  onSaved: (updated: string) => void;
  onError: (error: string) => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    try {
      const timestamp = new Date().toLocaleString("fr-DZ");
      const appended = existingComments
        ? `${existingComments}\n\n[${timestamp}]\n${text.trim()}`
        : `[${timestamp}]\n${text.trim()}`;

      await updateRequest(requestId, { responsible_comments: appended });
      onSaved(appended);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      onError(err.message ?? "Failed to save comment");
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "28px",
          width: "420px",
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
            Comment — Request #{requestId}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* existing comments preview */}
        {existingComments && (
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "14px",
              fontSize: "13px",
              color: "#475569",
              whiteSpace: "pre-wrap",
              maxHeight: "140px",
              overflowY: "auto",
            }}
          >
            {existingComments}
          </div>
        )}

        {done ? (
          <p style={{ color: "#16a34a", textAlign: "center", padding: "16px 0", fontWeight: 500 }}>
            ✓ Comment saved
          </p>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your comment..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "14px" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#5b4df7",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: !text.trim() || sending ? 0.6 : 1,
                }}
              >
                <Send size={14} /> {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Table ────────────────────────────────────────────────────────────────
export default function RequestsTable() {
  const { t } = useLang();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentModal, setCommentModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: number;
    action: "approved" | "rejected";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    listAllRequests()
      .then(setRows)
      .catch((err) => setError(err.message ?? "Failed to load requests"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDecision(id: number, action: "approved" | "rejected") {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await updateRequest(id, { status: action });
      setRows((prev) =>
        prev.map((r) =>
          r.request.id === id ? { ...r, request: updated.request } : r,
        ),
      );
    } catch (err: any) {
      setActionError(err.message ?? "Failed to update request");
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  }

  function handleCommentSaved(requestId: number, updated: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.request.id === requestId
          ? { ...r, request: { ...r.request, responsible_comments: updated } }
          : r,
      ),
    );
  }

  const filtered = rows.filter(({ request, employee }) => {
    const matchStatus = statusFilter === "all" || request.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchSearch =
      (request.type ?? "").toLowerCase().includes(searchLower) ||
      (employee?.full_name ?? "").toLowerCase().includes(searchLower) ||
      String(request.user_id).includes(search);
    return matchStatus && matchSearch;
  });

  const statusOptions: { value: RequestStatus | "all"; label: string }[] = [
    { value: "all", label: t.requests.all ?? "All Status" },
    { value: "pending", label: t.requests.pending ?? "Pending" },
    { value: "approved", label: t.requests.approved ?? "Approved" },
    { value: "rejected", label: t.requests.rejected ?? "Rejected" },
  ];

  function badgeClass(status: RequestStatus) {
    const map: Record<RequestStatus, string> = {
      pending: "rm-badge rm-badge-pending",
      approved: "rm-badge rm-badge-approved",
      rejected: "rm-badge rm-badge-rejected",
    };
    return map[status] ?? "rm-badge";
  }

  function badgeLabel(status: RequestStatus) {
    if (status === "pending") return t.requests.pending ?? "Pending";
    if (status === "approved") return t.requests.approved ?? "Approved";
    if (status === "rejected") return t.requests.rejected ?? "Rejected";
    return status;
  }

  const commentTarget = commentModal !== null
    ? rows.find((r) => r.request.id === commentModal)
    : null;

  return (
    <>
      {commentModal !== null && commentTarget && (
        <CommentModal
          requestId={commentModal}
          existingComments={commentTarget.request.responsible_comments ?? ""}
          onClose={() => setCommentModal(null)}
          onSaved={(updated) => handleCommentSaved(commentModal, updated)}
          onError={(error) => setActionError(error)}
        />
      )}
      {confirmModal !== null && (
        <ConfirmModal
          requestId={confirmModal.id}
          action={confirmModal.action}
          loading={actionLoading}
          onConfirm={() => handleDecision(confirmModal.id, confirmModal.action)}
          onClose={() => setConfirmModal(null)}
        />
      )}

      <div className="rm-filter-bar">
        <div className="rm-search-wrap">
          <span className="rm-search-icon">
            <Search size={14} />
          </span>
          <input
            className="rm-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              t.requests.searchPlaceholder ?? "Search by employee or request type..."
            }
          />
        </div>
        <div className="rm-filter-divider" />
        <span className="rm-filter-icon">
          <Filter size={14} />
        </span>
        <select
          className="rm-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "all")}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rm-table-card">
        <div className="rm-table-scroll">
          {isLoading ? (
            <div className="rm-empty">Loading requests…</div>
          ) : error ? (
            <div className="rm-empty" style={{ color: "var(--danger-600)" }}>
              {error}
            </div>
          ) : (
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Request Type</th>
                  <th>{t.requests.dateCol}</th>
                  <th>{t.requests.statusCol}</th>
                  <th>{t.requests.actionsCol}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="rm-empty">
                      {t.requests.noResults ?? "No requests found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map(({ request, employee, can_approve }) => (
                    <tr key={request.id}>
                      <td>
                        <div className="rm-emp-cell">
                          <div
                            className="rm-avatar"
                            style={{
                              background: avatarColor(
                                employee?.full_name ?? String(request.user_id)
                              ),
                            }}
                          >
                            {getInitials(
                              employee?.full_name ?? `EMP ${request.user_id}`
                            )}
                          </div>
                          <div>
                            <p className="rm-emp-name">
                              {employee?.full_name ?? String(request.user_id)}
                            </p>
                            {employee?.fonction && (
                              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: 0 }}>
                                {employee.fonction}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="rm-type">{request.type}</span>
                      </td>
                      <td>
                        <span className="rm-date">
                          {formatDate(request.created_at)}
                        </span>
                      </td>
                      <td>
                        <span className={badgeClass(request.status)}>
                          {badgeLabel(request.status)}
                        </span>
                      </td>
                      <td>
                        <div className="rm-actions">
                          <button
                            className="rm-action-btn view"
                            title="View"
                            onClick={() => router.push(`/hr/requests/${request.id}`)}
                          >
                            <Eye size={15} />
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button
                                className="rm-action-btn approve"
                                title="Approve"
                                style={{ opacity: can_approve ? 1 : 0.65, cursor: "pointer" }}
                                onClick={() =>
                                  can_approve
                                    ? setConfirmModal({ id: request.id, action: "approved" })
                                    : setActionError("You are not responsible for this employee. Please contact the responsible manager.")
                                }
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                className="rm-action-btn reject"
                                title="Reject"
                                style={{ opacity: can_approve ? 1 : 0.65, cursor: "pointer" }}
                                onClick={() =>
                                  can_approve
                                    ? setConfirmModal({ id: request.id, action: "rejected" })
                                    : setActionError("You are not responsible for this employee. Please contact the responsible manager.")
                                }
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          <button
                            className="rm-action-btn comment"
                            title="Comment"
                            style={{ opacity: can_approve ? 1 : 0.65, cursor: "pointer" }}
                            onClick={() =>
                              can_approve
                                ? setCommentModal(request.id)
                                : setActionError("You are not responsible for this employee. Please contact the responsible manager.")
                            }
                          >
                            <MessageCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {actionError && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "#dc2626",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              maxWidth: "400px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <XCircle size={16} />
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
