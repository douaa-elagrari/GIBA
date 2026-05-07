"use client";

import { forwardRef } from "react";
import "./RequestPdfPreview.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RequestPdfData {
  /** Auto-generated reference, e.g. "REQ-2025-0042" */
  ref: string;
  /** Submission date (ISO string) */
  date: string;
  /** Employee full name */
  employeeName: string;
  /** Employee ID / matricule */
  matricule: string;
  /** Employee job title */
  jobTitle: string;
  /** Department */
  department: string;
  /** Type of request (label), e.g. "Vacation Leave", "Mission Order" */
  requestType: string;
  /** Short description / reason */
  description: string;
  /** Start date of leave / mission (ISO string) */
  startDate?: string;
  /** End date of leave / mission (ISO string) */
  endDate?: string;
  /** Any extra fields specific to this request — key/value pairs */
  extraFields?: { label: string; value: string }[];
  /** Status */
  status: "pending" | "approved" | "rejected";
  /** Manager name who approved/rejected (if any) */
  managerName?: string;
  /** Decision date */
  decisionDate?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string) {
  if (!iso) return "……………………………";
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function statusLabel(s: RequestPdfData["status"]) {
  return { pending: "En attente", approved: "Approuvé", rejected: "Refusé" }[s];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Rendered as HTML — attach a ref and call window.print() to print / save as PDF.
 */
const RequestPdfPreview = forwardRef<HTMLDivElement, { data: RequestPdfData }>(
  function RequestPdfPreview({ data }, ref) {
    return (
      <div className="pdf-root" ref={ref}>
        {/* ── TOP HEADER BAR ─────────────────────────────────────── */}
        <div className="pdf-header">
          {/* Left: company logo block */}
          <div className="pdf-logo-block">
            <div className="pdf-logo-border">
              <span className="pdf-logo-text">GIBA</span>
              <span className="pdf-logo-sub">GROUPE</span>
            </div>
            <p className="pdf-company-name">Société Holding GIBA (SPA)</p>
          </div>

          {/* Centre: document title */}
          <div className="pdf-title-block">
            <p className="pdf-doc-title">
              DEMANDE DE {data.requestType.toUpperCase()}
            </p>
          </div>

          {/* Right: meta info box */}
          <div className="pdf-meta-box">
            <table className="pdf-meta-table">
              <tbody>
                <tr>
                  <td>Page :</td>
                  <td>01 sur 01</td>
                </tr>
                <tr>
                  <td>Date :</td>
                  <td>{fmt(data.date)}</td>
                </tr>
                <tr>
                  <td>Version :</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>Code :</td>
                  <td>DAR EN 001</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── REF LINE ───────────────────────────────────────────── */}
        <div className="pdf-ref-line">
          <span>
            Réf : <strong>{data.ref}</strong>
          </span>
          <span>Biskra le : {fmt(data.date)}</span>
        </div>

        {/* ── EMPLOYEE INFO FIELDS ───────────────────────────────── */}
        <div className="pdf-section">
          <div className="pdf-field-row">
            <label className="pdf-field-label">Matricule :</label>
            <span className="pdf-field-value">
              {data.matricule || "……………………………………………………………"}
            </span>
          </div>
          <div className="pdf-field-row">
            <label className="pdf-field-label">Nom &amp; Prénom :</label>
            <span className="pdf-field-value">
              {data.employeeName || "……………………………………………………………"}
            </span>
          </div>
          <div className="pdf-field-row">
            <label className="pdf-field-label">Fonction :</label>
            <span className="pdf-field-value">
              {data.jobTitle || "……………………………………………………………"}
            </span>
          </div>
          <div className="pdf-field-row">
            <label className="pdf-field-label">Département :</label>
            <span className="pdf-field-value">
              {data.department || "……………………………………………………………"}
            </span>
          </div>
        </div>

        {/* ── REQUEST DETAILS ───────────────────────────────────── */}
        <div className="pdf-section">
          <div className="pdf-field-row">
            <label className="pdf-field-label">Objet de la demande :</label>
            <span className="pdf-field-value">{data.requestType}</span>
          </div>
          <div className="pdf-field-row">
            <label className="pdf-field-label">Motif :</label>
            <span className="pdf-field-value">
              {data.description || "……………………………………………………………"}
            </span>
          </div>
          {data.startDate && (
            <div className="pdf-field-row">
              <label className="pdf-field-label">Date de début :</label>
              <span className="pdf-field-value">{fmt(data.startDate)}</span>
            </div>
          )}
          {data.endDate && (
            <div className="pdf-field-row">
              <label className="pdf-field-label">Date de fin :</label>
              <span className="pdf-field-value">{fmt(data.endDate)}</span>
            </div>
          )}

          {/* Extra fields (request-type specific) */}
          {data.extraFields?.map((f) => (
            <div className="pdf-field-row" key={f.label}>
              <label className="pdf-field-label">{f.label} :</label>
              <span className="pdf-field-value">
                {f.value || "……………………………………………………………"}
              </span>
            </div>
          ))}
        </div>

        {/* ── DECISION BOX ──────────────────────────────────────── */}
        <div className="pdf-decision-box">
          <p className="pdf-decision-title">DÉCISION DU RESPONSABLE</p>
          <div className="pdf-decision-row">
            <label className="pdf-field-label">Statut :</label>
            <span className={`pdf-decision-status pdf-status-${data.status}`}>
              {statusLabel(data.status)}
            </span>
          </div>
          <div className="pdf-decision-row">
            <label className="pdf-field-label">Nom du responsable :</label>
            <span className="pdf-field-value">
              {data.managerName || "……………………………………………………………"}
            </span>
          </div>
          <div className="pdf-decision-row">
            <label className="pdf-field-label">Date de décision :</label>
            <span className="pdf-field-value">{fmt(data.decisionDate)}</span>
          </div>

          {/* Signature zone */}
          <div className="pdf-sig-zone">
            <div className="pdf-sig-box">
              <p className="pdf-sig-label">Signature de l&apos;employé</p>
              <div className="pdf-sig-line" />
            </div>
            <div className="pdf-sig-box">
              <p className="pdf-sig-label">Directeur Général</p>
              <div className="pdf-sig-line" />
            </div>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <div className="pdf-footer">
          <p>
            SPA SOCIÉTÉ HOLDING SISE N°1 CITÉ HALIMI HAI EL MOUDJAHIDINE BISKRA
          </p>
          <p>
            E-mail: contact@giba.dz &nbsp;|&nbsp; Tél : 033 65 72 80
            &nbsp;|&nbsp; Fax : 033 65 72 79
          </p>
        </div>
      </div>
    );
  },
);

export default RequestPdfPreview;
