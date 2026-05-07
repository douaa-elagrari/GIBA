"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/status-badge/StatusBadge";
import { formatDate } from "@/lib/utils";
import { RequestStatus, BaseRequest } from "@/types";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRequests, createRequest } from "@/services/requestService";
import {
  PlusCircle,
  Download,
  Eye,
  Search,
  Umbrella,
  Stethoscope,
  FileText,
  Clock,
  BookOpen,
  Upload,
  X,
  GraduationCap,
  Users,
  Heart,
  Clock3,
  Plane,
} from "lucide-react";
import "./page.css";

function RequestIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  if (type === "vacation") return <Umbrella className={cls} />;
  if (type === "sick-leave") return <Stethoscope className={cls} />;
  if (type === "mission") return <Plane className={cls} />;
  if (type === "training") return <GraduationCap className={cls} />;
  if (type === "mise-a-disposition") return <Users className={cls} />;
  if (type === "conge-exceptionnel") return <Heart className={cls} />;
  if (type === "autorisation") return <Clock3 className={cls} />;
  return <FileText className={cls} />;
}

/* ── Field type definitions ──────────────────────── */

type FieldDef =
  | { kind: "date"; key: string; label: string; required?: boolean }
  | {
      kind: "text";
      key: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      kind: "number";
      key: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      kind: "textarea";
      key: string;
      label: string;
      placeholder?: string;
      rows?: number;
      required?: boolean;
    }
  | {
      kind: "upload";
      key: string;
      label: string;
      accept?: string;
      required?: boolean;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      options: string[];
      required?: boolean;
    }
  | { kind: "info"; label: string; value: string }
  | {
      kind: "computed";
      key: string;
      label: string;
      deps: string[];
      compute: (vals: Record<string, string>) => string;
    };

interface RequestTypeDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  legislation: string;
  fields: FieldDef[];
}

const REQUEST_TYPES: RequestTypeDef[] = [
  {
    id: "vacation",
    label: "Congé annuel",
    icon: <Umbrella size={18} />,
    legislation: "النظام الداخلي",
    fields: [
      {
        kind: "date",
        key: "startDate",
        label: "Date de début",
        required: true,
      },
      { kind: "date", key: "endDate", label: "Date de fin", required: true },
      {
        kind: "computed",
        key: "duration",
        label: "Durée (jours)",
        deps: ["startDate", "endDate"],
        compute: (v) => {
          if (!v.startDate || !v.endDate) return "—";
          const d =
            (new Date(v.endDate).getTime() - new Date(v.startDate).getTime()) /
            86400000;
          return d >= 0 ? `${Math.round(d) + 1} jour(s)` : "—";
        },
      },
      { kind: "info", label: "Solde restant", value: "18 jours" },
      {
        kind: "textarea",
        key: "motif",
        label: "Motif",
        placeholder: "Motif du congé...",
        rows: 2,
      },
    ],
  },
  {
    id: "sick-leave",
    label: "Congé maladie",
    icon: <Stethoscope size={18} />,
    legislation: "طب العمل",
    fields: [
      {
        kind: "date",
        key: "startDate",
        label: "Date de début",
        required: true,
      },
      {
        kind: "number",
        key: "duration",
        label: "Durée prévisionnelle (jours)",
        placeholder: "ex: 3",
        required: true,
      },
      {
        kind: "upload",
        key: "certificate",
        label: "Certificat médical",
        accept: ".pdf,.jpg,.png",
        required: true,
      },
      {
        kind: "textarea",
        key: "notes",
        label: "Observations",
        placeholder: "Informations complémentaires...",
        rows: 2,
      },
    ],
  },
  {
    id: "mission",
    label: "Ordre de mission",
    icon: <Plane size={18} />,
    legislation: "DAR PR 03",
    fields: [
      {
        kind: "text",
        key: "destination",
        label: "Destination",
        placeholder: "Ville / Pays",
        required: true,
      },
      {
        kind: "textarea",
        key: "objet",
        label: "Objet de la mission",
        placeholder: "Description...",
        rows: 2,
        required: true,
      },
      {
        kind: "textarea",
        key: "itineraire",
        label: "Itinéraire",
        placeholder: "Trajet détaillé...",
        rows: 2,
      },
      {
        kind: "date",
        key: "departDate",
        label: "Date de départ",
        required: true,
      },
      {
        kind: "text",
        key: "departHeure",
        label: "Heure de départ",
        placeholder: "08:00",
      },
      {
        kind: "date",
        key: "retourDate",
        label: "Date de retour",
        required: true,
      },
      {
        kind: "text",
        key: "retourHeure",
        label: "Heure de retour",
        placeholder: "18:00",
      },
      {
        kind: "select",
        key: "transport",
        label: "Moyen de transport",
        options: [
          "Véhicule de service",
          "Véhicule personnel",
          "Train",
          "Avion",
          "Bus",
        ],
        required: true,
      },
      {
        kind: "computed",
        key: "indemnites",
        label: "Indemnités estimées (DZD)",
        deps: ["departDate", "retourDate"],
        compute: (v) => {
          if (!v.departDate || !v.retourDate) return "—";
          const d =
            (new Date(v.retourDate).getTime() -
              new Date(v.departDate).getTime()) /
            86400000;
          const days = Math.max(0, Math.round(d) + 1);
          return days > 0
            ? `${(days * 1500).toLocaleString("fr-DZ")} DZD`
            : "—";
        },
      },
    ],
  },
  {
    id: "training",
    label: "Demande de formation",
    icon: <GraduationCap size={18} />,
    legislation: "Procédure de formation",
    fields: [
      {
        kind: "text",
        key: "organisme",
        label: "Organisme de formation",
        placeholder: "Nom de l'organisme",
        required: true,
      },
      {
        kind: "text",
        key: "theme",
        label: "Thème / Intitulé",
        placeholder: "Intitulé de la formation",
        required: true,
      },
      {
        kind: "number",
        key: "duree",
        label: "Durée (jours)",
        placeholder: "ex: 5",
        required: true,
      },
      {
        kind: "number",
        key: "cout",
        label: "Coût estimé (DZD)",
        placeholder: "ex: 50000",
      },
      {
        kind: "textarea",
        key: "objectif",
        label: "Objectif pédagogique",
        placeholder: "Décrire les objectifs...",
        rows: 3,
        required: true,
      },
      { kind: "date", key: "startDate", label: "Date prévue de début" },
    ],
  },
  {
    id: "mise-a-disposition",
    label: "Mise à disposition",
    icon: <Users size={18} />,
    legislation: "Procédure mise à disposition",
    fields: [
      {
        kind: "text",
        key: "structure",
        label: "Structure d'accueil",
        placeholder: "Nom de la structure",
        required: true,
      },
      {
        kind: "date",
        key: "startDate",
        label: "Date de début",
        required: true,
      },
      { kind: "date", key: "endDate", label: "Date de fin", required: true },
      {
        kind: "textarea",
        key: "conditions",
        label: "Conditions de mise à disposition",
        placeholder: "Poste, rémunération, responsabilités...",
        rows: 3,
        required: true,
      },
    ],
  },
  {
    id: "conge-exceptionnel",
    label: "Congé exceptionnel",
    icon: <Heart size={18} />,
    legislation: "النظام الداخلي",
    fields: [
      {
        kind: "select",
        key: "motif",
        label: "Motif",
        required: true,
        options: [
          "Mariage (employé)",
          "Mariage (enfant)",
          "Naissance",
          "Décès (conjoint)",
          "Décès (parent/enfant)",
          "Décès (autre parent)",
          "Autre",
        ],
      },
      {
        kind: "date",
        key: "startDate",
        label: "Date de début",
        required: true,
      },
      {
        kind: "upload",
        key: "justif",
        label: "Pièces justificatives",
        accept: ".pdf,.jpg,.png",
        required: true,
      },
      {
        kind: "textarea",
        key: "notes",
        label: "Précisions",
        placeholder: "Informations complémentaires...",
        rows: 2,
      },
    ],
  },
  {
    id: "autorisation",
    label: "Autorisation d'absence",
    icon: <Clock3 size={18} />,
    legislation: "النظام الداخلي",
    fields: [
      { kind: "date", key: "date", label: "Date", required: true },
      {
        kind: "text",
        key: "heureDebut",
        label: "Heure de début",
        placeholder: "08:30",
        required: true,
      },
      {
        kind: "text",
        key: "heureFin",
        label: "Heure de fin",
        placeholder: "10:00",
        required: true,
      },
      {
        kind: "textarea",
        key: "motif",
        label: "Motif",
        placeholder: "Raison de l'absence...",
        rows: 2,
        required: true,
      },
    ],
  },
];

/* ── Modal ───────────────────────────────────────── */

function NewRequestModal({ onClose }: { onClose: () => void }) {
  const [selectedType, setSelectedType] = useState<RequestTypeDef | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setValues((p) => ({ ...p, [key]: val }));

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    setSubmitError(null);

    const typeMap: Record<
      string,
      "conge" | "mission" | "sortie" | "formation"
    > = {
      vacation: "conge",
      "sick-leave": "conge",
      "conge-exceptionnel": "conge",
      mission: "mission",
      autorisation: "sortie",
      training: "formation",
      "mise-a-disposition": "conge",
    };

    const backendType = typeMap[selectedType.id];
    if (!backendType) {
      setSubmitError("Type de demande non supporté");
      setLoading(false);
      return;
    }

    try {
      let details: Record<string, any> = {};

      if (backendType === "conge") {
        details = {
          type_conge: selectedType.id,
          date_debut: values.startDate ?? "",
          date_fin: values.endDate ?? values.startDate ?? "",
          nb_jours: parseInt(values.duration ?? "1") || 1,
          interim: "",
          adresse: "",
        };
      } else if (backendType === "mission") {
        details = {
          destination: values.destination ?? "",
          objet: values.objet ?? "",
          itineraire: values.itineraire ?? "",
          duree: 1,
          date_depart: values.departDate ?? "",
          date_retour: values.retourDate ?? "",
          transport: values.transport ?? "",
        };
      } else if (backendType === "sortie") {
        details = {
          date_sortie: values.date ?? "",
          heure_sortie: values.heureDebut ?? "",
          heure_retour: values.heureFin ?? "",
          motif: values.motif ?? "",
        };
      } else if (backendType === "formation") {
        details = {
          theme: values.theme ?? "",
          type_formation: "courte",
          periode: values.startDate ?? "",
          objectifs: values.objectif ?? "",
        };
      }

      await createRequest({ type: backendType, [backendType]: details });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h3>Demande soumise</h3>
            <p>Votre demande a été transmise au service RH pour traitement.</p>
            <div className="modal-success-ref">
              REQ-{Date.now().toString().slice(-5)}
            </div>
            <button className="mq-btn mq-btn-primary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Nouvelle demande</h3>
            {selectedType && (
              <span className="modal-legislation">
                {selectedType.legislation}
              </span>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {!selectedType ? (
          <div className="modal-body">
            <p className="modal-type-label">Choisir le type de demande</p>
            <div className="modal-type-grid">
              {REQUEST_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  className="modal-type-card"
                  onClick={() => {
                    setSelectedType(rt);
                    setValues({});
                    setFiles({});
                  }}
                >
                  <span className="modal-type-icon">{rt.icon}</span>
                  <span className="modal-type-name">{rt.label}</span>
                  <span className="modal-type-law">{rt.legislation}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <div className="modal-type-header">
              <button
                className="modal-back"
                onClick={() => setSelectedType(null)}
              >
                ← Retour
              </button>
              <div className="modal-type-pill">
                <span>{selectedType.icon}</span>
                {selectedType.label}
              </div>
            </div>

            <div className="modal-fields">
              {selectedType.fields.map((field) => {
                if (field.kind === "info")
                  return (
                    <div key={field.label} className="mq-field-group">
                      <label className="mq-label">{field.label}</label>
                      <div className="mq-info-value">{field.value}</div>
                    </div>
                  );

                if (field.kind === "computed") {
                  const result = field.compute(values);
                  return (
                    <div key={field.key} className="mq-field-group">
                      <label className="mq-label">{field.label}</label>
                      <div className="mq-computed-value">{result}</div>
                    </div>
                  );
                }

                if (field.kind === "upload")
                  return (
                    <div key={field.key} className="mq-field-group mq-full">
                      <label className="mq-label">
                        {field.label}
                        {field.required && (
                          <span className="mq-required">*</span>
                        )}
                      </label>
                      <label className="mq-upload-area">
                        <input
                          type="file"
                          accept={field.accept}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            setFiles((p) => ({ ...p, [field.key]: f }));
                          }}
                        />
                        {files[field.key] ? (
                          <span className="mq-upload-name">
                            📄 {files[field.key]!.name}
                          </span>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Cliquer pour joindre un fichier</span>
                            <span className="mq-upload-hint">
                              {field.accept}
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  );

                if (field.kind === "textarea")
                  return (
                    <div key={field.key} className="mq-field-group mq-full">
                      <label className="mq-label">
                        {field.label}
                        {field.required && (
                          <span className="mq-required">*</span>
                        )}
                      </label>
                      <textarea
                        className="mq-textarea"
                        rows={field.rows ?? 3}
                        placeholder={field.placeholder}
                        value={values[field.key] ?? ""}
                        onChange={(e) => set(field.key, e.target.value)}
                      />
                    </div>
                  );

                if (field.kind === "select")
                  return (
                    <div key={field.key} className="mq-field-group">
                      <label className="mq-label">
                        {field.label}
                        {field.required && (
                          <span className="mq-required">*</span>
                        )}
                      </label>
                      <select
                        className="mq-select"
                        value={values[field.key] ?? ""}
                        onChange={(e) => set(field.key, e.target.value)}
                      >
                        <option value="">— Sélectionner —</option>
                        {field.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  );

                return (
                  <div key={field.key} className="mq-field-group">
                    <label className="mq-label">
                      {field.label}
                      {field.required && <span className="mq-required">*</span>}
                    </label>
                    <input
                      className="mq-input"
                      type={field.kind}
                      placeholder={
                        "placeholder" in field ? field.placeholder : undefined
                      }
                      value={values[field.key] ?? ""}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <button className="mq-btn mq-btn-ghost" onClick={onClose}>
                Annuler
              </button>
              {submitError && (
                <p
                  style={{ color: "red", fontSize: "0.8rem", margin: "0 auto" }}
                >
                  {submitError}
                </p>
              )}
              <button
                className="mq-btn mq-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Envoi…" : "Soumettre la demande"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */

export default function MyRequestsPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rows, setRows] = useState<
    Array<{ request: BaseRequest; details: Record<string, any> }>
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchRequests = () => {
    if (user?.employee?.id) {
      console.log("Fetching requests for employee ID:", user.employee.id);
      setFetchError(null);
      getUserRequests(user.employee.id)
        .then((data) => {
          console.log("Got requests:", data);
          setRows(data);
        })
        .catch((err) =>
          setFetchError(err.message ?? "Failed to fetch requests"),
        );
    }
    // don't show error while user is still loading (user === null)
  };

  useEffect(() => {
    fetchRequests();
  }, [user, refreshKey]);

  const filtered = rows.filter(({ request }) => {
    const matchStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchSearch = request.type
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filters: { key: RequestStatus | "all"; label: string }[] = [
    { key: "all", label: t.requests.all },
    { key: "pending", label: t.requests.pending },
    { key: "approved", label: t.requests.approved },
    { key: "rejected", label: t.requests.rejected },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' }}>
      {showModal && (
        <NewRequestModal
          onClose={() => {
            setShowModal(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      <div style={{ padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>{t.requests.title}</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>{t.requests.subtitle}</p>
        </div>
        <button className="new-req-btn" onClick={() => setShowModal(true)}>
          <PlusCircle size={15} />
          {t.requests.newRequest}
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, animation: 'app-fade-in 0.4s ease-out' }}>

        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">
              <Search size={14} />
            </span>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.requests.searchPlaceholder}
            />
          </div>
          <div className="filter-pills">
            <span className="filter-label">{t.requests.status}</span>
            {filters.map((f) => (
              <button
                key={f.key}
                className={`filter-pill ${statusFilter === f.key ? "active" : ""}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          <div className="table-scroll">
            <table className="req-table">
              <thead>
                <tr>
                  <th>{t.requests.requestCol}</th>
                  <th>{t.requests.dateCol}</th>
                  <th>{t.requests.statusCol}</th>
                  <th>{t.requests.actionsCol}</th>
                </tr>
              </thead>
              <tbody>
                {fetchError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="table-empty"
                      style={{ color: "red" }}
                    >
                      Error: {fetchError}
                    </td>
                  </tr>
                ) : !user ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      {t.requests.noResults}
                    </td>
                  </tr>
                ) : (
                  filtered.map(({ request }) => (
                    <tr key={request.id}>
                      <td>
                        <div className="req-cell">
                          <div className="req-icon">
                            <RequestIcon type={request.type} />
                          </div>
                          <div>
                            <p className="req-label">{request.type}</p>
                            <p className="req-id">#{request.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="req-date">
                          {formatDate(request.created_at)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={request.status} />
                      </td>
                      <td>
                        <div className="req-actions">
                          <button className="action-btn action-btn-view">
                            <Eye size={13} /> {t.requests.view}
                          </button>
                          {request.status === "approved" && (
                            <button className="action-btn action-btn-download">
                              <Download size={13} /> {t.requests.download}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
