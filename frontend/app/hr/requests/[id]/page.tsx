"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRequestById, updateRequest } from "@/services/requestService";
import { formatDate } from "@/lib/utils";

import RequestPdfPreview, { RequestPdfData } from "./RequestPdfPreview";
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  MessageCircle,
  User,
  Briefcase,
  Building2,
  Hash,
  CalendarDays,
  FileText,
  AlignLeft,
  Send,
  Plus,
} from "lucide-react";
import "./page.css";

interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
}

// ─── Small display helpers ─────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rd-info-row">
      <span className="rd-info-icon">{icon}</span>
      <div className="rd-info-content">
        <p className="rd-info-label">{label}</p>
        <p className="rd-info-value">{value || "—"}</p>
      </div>
    </div>
  );
}

function badgeClass(status: string) {
  if (status === "pending") return "rd-badge rd-badge-pending";
  if (status === "approved") return "rd-badge rd-badge-approved";
  if (status === "rejected") return "rd-badge rd-badge-rejected";
  return "rd-badge";
}

function badgeLabel(status: string) {
  return (
    { pending: "Pending", approved: "Approved", rejected: "Rejected" }[
      status
    ] ?? status
  );
}

function typeLabel(type: string) {
  return (
    {
      conge: "Demande de congé",
      mission: "Ordre de mission",
      sortie: "Autorisation de sortie",
      formation: "Demande de formation",
    }[type] ?? type
  );
}

// ─── Build extra fields from details ──────────────────────────────────────────

function buildExtraFields(
  type: string,
  details: Record<string, any>,
): { label: string; value: string }[] {
  if (!details) return [];

  if (type === "conge") {
    return [
      { label: "Type de congé", value: details.type_conge ?? "—" },
      { label: "Date début", value: details.date_debut ?? "—" },
      { label: "Date fin", value: details.date_fin ?? "—" },
      { label: "Nombre de jours", value: String(details.nb_jours ?? "—") },
      { label: "Intérimaire", value: details.interim ?? "—" },
      { label: "Adresse pendant congé", value: details.adresse ?? "—" },
    ];
  }
  if (type === "mission") {
    return [
      { label: "Destination", value: details.destination ?? "—" },
      { label: "Objet", value: details.objet ?? "—" },
      { label: "Itinéraire", value: details.itineraire ?? "—" },
      { label: "Date départ", value: details.date_depart ?? "—" },
      { label: "Date retour", value: details.date_retour ?? "—" },
      { label: "Transport", value: details.transport ?? "—" },
    ];
  }
  if (type === "sortie") {
    return [
      { label: "Date sortie", value: details.date_sortie ?? "—" },
      { label: "Heure sortie", value: details.heure_sortie ?? "—" },
      { label: "Heure retour", value: details.heure_retour ?? "—" },
      { label: "Motif", value: details.motif ?? "—" },
    ];
  }
  if (type === "formation") {
    return [
      { label: "Thème", value: details.theme ?? "—" },
      { label: "Type", value: details.type_formation ?? "—" },
      { label: "Période", value: details.periode ?? "—" },
      { label: "Objectifs", value: details.objectifs ?? "—" },
    ];
  }
  return [];
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [req, setReq] = useState<{ request: any; details: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRequestById(Number(id))
      .then((data) => {
        setReq(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load request");
        setLoading(false);
      });
  }, [id]);

  async function handleDecision(status: "approved" | "rejected") {
    if (!req) return;
    setActionLoading(true);
    try {
      const updated = await updateRequest(Number(id), { status });
      setReq((prev) => (prev ? { ...prev, request: updated.request } : prev));
    } catch (err: any) {
      alert(err.message ?? "Failed to update request");
    } finally {
      setActionLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleAddComment() {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `c${Date.now()}`,
        author: "Current User",
        role: "hr",
        text: newComment.trim(),
        date: new Date().toISOString(),
      };
      setComments([...comments, comment]);
      setNewComment("");
      setShowCommentForm(false);
    }
  }

  // ── Loading / error states ──
  if (loading) {
    return (
      <div className="rd-not-found">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="rd-not-found">
        <p>{error ?? "Request not found."}</p>
        <button className="rd-back-btn" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const { request, details } = req;
  const extraFields = buildExtraFields(request.type, details);

  const pdfData: RequestPdfData = {
    ref: `REQ-${new Date(request.created_at).getFullYear()}-${String(request.id).padStart(4, "0")}`,
    date: request.created_at,
    employeeName: details?.employee_name ?? `Employee #${request.user_id}`,
    matricule: String(request.user_id),
    jobTitle: details?.job_title ?? "—",
    department: details?.department ?? "—",
    requestType: typeLabel(request.type),
    description: details?.motif ?? details?.objet ?? details?.objectifs ?? "—",
    startDate:
      details?.date_debut ?? details?.date_depart ?? details?.date_sortie,
    endDate: details?.date_fin ?? details?.date_retour,
    extraFields,
    status: request.status,
  };

  return (
    <div className="rd-root animate-fade-in">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="rd-topbar">
        <button className="rd-back-btn" onClick={() => router.back()}>
          <ArrowLeft size={15} />
          Back to Requests
        </button>

        <div className="rd-topbar-actions">
          {request.status === "pending" && (
            <>
              <button
                className="rd-btn rd-btn-approve"
                onClick={() => handleDecision("approved")}
                disabled={actionLoading}
              >
                <CheckCircle size={15} />
                Approve
              </button>
              <button
                className="rd-btn rd-btn-reject"
                onClick={() => handleDecision("rejected")}
                disabled={actionLoading}
              >
                <XCircle size={15} />
                Reject
              </button>
            </>
          )}
          <button
            className="rd-btn rd-btn-comment"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            <MessageCircle size={15} />
            Comment
          </button>
          <button className="rd-btn rd-btn-print" onClick={handlePrint}>
            <Printer size={15} />
            Print
          </button>
          <button className="rd-btn rd-btn-download" onClick={handlePrint}>
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Split layout ──────────────────────────────────────── */}
      <div className="rd-split">
        {/* ── LEFT: Form fields ─────────────────────────────── */}
        <aside className="rd-left">
          <div className="rd-left-header">
            <h2 className="rd-left-title">{typeLabel(request.type)}</h2>
            <span className={badgeClass(request.status)}>
              {badgeLabel(request.status)}
            </span>
          </div>

          {/* Request details card */}
          <section className="rd-card">
            <p className="rd-card-heading">Request Details</p>
            <InfoRow
              icon={<FileText size={14} />}
              label="Request Type"
              value={typeLabel(request.type)}
            />
            <InfoRow
              icon={<Hash size={14} />}
              label="Request ID"
              value={`#${request.id}`}
            />
            <InfoRow
              icon={<CalendarDays size={14} />}
              label="Submission Date"
              value={formatDate(request.created_at)}
            />
            {request.updated_at && (
              <InfoRow
                icon={<CalendarDays size={14} />}
                label="Last Updated"
                value={formatDate(request.updated_at)}
              />
            )}
          </section>

          {/* Type-specific details card */}
          {extraFields.length > 0 && (
            <section className="rd-card">
              <p className="rd-card-heading">Request Information</p>
              {extraFields.map((f) => (
                <InfoRow
                  key={f.label}
                  icon={<AlignLeft size={14} />}
                  label={f.label}
                  value={f.value}
                />
              ))}
            </section>
          )}

          {/* Decision card (if decided) */}
          {request.status !== "pending" && request.finished_at && (
            <section className="rd-card rd-card-decision">
              <p className="rd-card-heading">Decision</p>
              <InfoRow
                icon={<CalendarDays size={14} />}
                label="Decision Date"
                value={formatDate(request.finished_at)}
              />
            </section>
          )}

          {/* Comments section */}
          <section className="rd-card">
            <div className="rd-comments-header">
              <p className="rd-card-heading">Comments ({comments.length})</p>
              {!showCommentForm && (
                <button
                  className="rd-add-comment-btn"
                  onClick={() => setShowCommentForm(true)}
                  title="Add Comment"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {showCommentForm && (
              <div className="rd-comment-form">
                <textarea
                  className="rd-comment-input"
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="rd-comment-actions">
                  <button
                    className="rd-btn rd-btn-cancel"
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="rd-btn rd-btn-submit"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send size={14} />
                    Add Comment
                  </button>
                </div>
              </div>
            )}

            <div className="rd-comments-list">
              {comments.length === 0 ? (
                <p className="rd-no-comments">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rd-comment">
                    <div className="rd-comment-header">
                      <div className="rd-comment-author">
                        <User size={14} />
                        <span className="rd-author-name">{comment.author}</span>
                        <span className="rd-author-role">{comment.role}</span>
                      </div>
                      <span className="rd-comment-date">
                        {formatDate(comment.date)}
                      </span>
                    </div>
                    <p className="rd-comment-text">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        {/* ── RIGHT: PDF Preview ────────────────────────────── */}
        <div className="rd-right">
          <div className="rd-pdf-toolbar">
            <p className="rd-pdf-label">
              <FileText size={13} />
              Document Preview
            </p>
          </div>
          <div className="rd-pdf-scroll">
            <div className="pdf-print-portal">
              <RequestPdfPreview ref={pdfRef} data={pdfData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
