"use client";

import { useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";
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
  User,
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

// ─── Small display helpers ─────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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

// ─── Build extra fields ─────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

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

  function handleDownload() {
    // temporary (same as print for now)
    window.print();
  }

  function handleAddComment() {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: "Current User",
      role: "hr",
      text: newComment.trim(),
      date: new Date().toISOString(),
    };

    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setShowCommentForm(false);
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="rd-not-found">
        <p>Loading...</p>
      </div>
    );
  }

  // ── Error ──
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
    ref: `REQ-${new Date(request.created_at).getFullYear()}-${String(
      request.id,
    ).padStart(4, "0")}`,
    date: request.created_at,
    employeeName: details?.employee_name ?? `Employee #${request.userId}`,
    matricule: String(request.userId),
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
      {/* RIGHT */}
      <div className="rd-right">
        <RequestPdfPreview ref={pdfRef} data={pdfData} />
      </div>

      {/* COMMENTS */}
      <section className="rd-card">
        <div className="rd-comments-header">
          <p className="rd-card-heading">Comments ({comments.length})</p>

          {!showCommentForm && (
            <button onClick={() => setShowCommentForm(true)}>
              <Plus size={14} />
            </button>
          )}
        </div>

        {showCommentForm && (
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button onClick={handleAddComment}>
              <Send size={14} />
              Add
            </button>
          </div>
        )}

        {comments.map((c) => (
          <div key={c.id}>
            <p>{c.author}</p>
            <p>{c.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
