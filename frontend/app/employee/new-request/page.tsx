"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { createRequest } from "@/services/requestService";
import { createAttestation } from "@/services/attestationService";
import { validateRequestForm } from "@/lib/validators/requesrValidation";
import {
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Umbrella,
  Stethoscope,
  MonitorSmartphone,
  Clock,
  Wallet,
  BookOpen,
  Monitor,
  Award,
  Info,
  FileText,
} from "lucide-react";
import "./page.css";

export default function NewRequestPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formFiles, setFormFiles] = useState<Record<string, File | null>>({});
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parseDateValue = (value: string): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatDateValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const addDays = (dateStr: string, days: number): string => {
    const date = parseDateValue(dateStr);
    if (!date) return "";
    date.setDate(date.getDate() + days);
    return formatDateValue(date);
  };

  const computeDaysBetween = (start: string, end: string): number => {
    const startDate = parseDateValue(start);
    const endDate = parseDateValue(end);
    if (!startDate || !endDate || endDate < startDate) return 0;
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const updateFormValues = (newValues: Record<string, string>) => {
    setFormValues((prev) => ({ ...prev, ...newValues }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormFiles((prev) => ({ ...prev, [name]: file }));
    setFormValues((prev) => ({ ...prev, [name]: file ? file.name : "" }));
  };

  const handleValueChange = (name: string, value: string) => {
    const updatedValues = { ...formValues, [name]: value };

    if (selectedType === "sick-leave") {
      if (name === "startDate" || name === "expectedDuration") {
        const startDate = updatedValues["startDate"];
        const duration = Number(updatedValues["expectedDuration"] || 0);

        if (startDate && duration > 0) {
          updatedValues["endDate"] = addDays(startDate, duration - 1);
          updatedValues["nb_jours"] = String(duration);
        } else {
          updatedValues["endDate"] = updatedValues["endDate"] || "";
          updatedValues["nb_jours"] = updatedValues["expectedDuration"] || "";
        }
      }
    }

    if (selectedType === "vacation-annual" || selectedType === "exceptional-leave") {
      if (name === "startDate" || name === "endDate") {
        const startDate = updatedValues["startDate"];
        const endDate = updatedValues["endDate"];
        if (startDate && endDate) {
          const days = computeDaysBetween(startDate, endDate);
          updatedValues["nb_jours"] = days ? String(days) : "";
        }
      }
    }

    setFormValues(updatedValues);
  };

const requestTypes = [
  {
    id: "vacation-annual",
    label: "Congé annuel",
    legalRef: "الداخلي النظام",
    icon: <Umbrella size={18} />,
    desc: "Demande de congé annuel selon solde disponible",
    fields: [
      { name: "startDate", type: "date", label: "Date début" },
      { name: "endDate", type: "date", label: "Date fin" },
      { name: "nb_jours", type: "number", label: "Nombre de jours", readOnly: true },
      { name: "interim", type: "text", label: "Intérimaire" },
      { name: "adresse", type: "textarea", label: "Adresse pendant le congé" },
    ],
  },
  {
    id: "sick-leave", 
    label: "Congé maladie",
    legalRef: "طب العمل",
    icon: <Stethoscope size={18} />,
    desc: "Arrêt maladie avec certificat médical",
    fields: [
      { name: "startDate", type: "date", label: "Date début" },
      {
        name: "expectedDuration",
        type: "number",
        label: "Durée prévisionnelle (jours)",
      },
      { name: "endDate", type: "date", label: "Date fin", readOnly: true },
      {
        name: "medicalCertificate",
        type: "file",
        label: "Certificat médical",
      },
    ],
  },
  {
    id: "mission-order",
    label: "Ordre de mission",
    legalRef: "DAR PR 03",
    icon: <MonitorSmartphone size={18} />,
    desc: "Déplacement professionnel officiel",
    fields: [
      { name: "destination", type: "text", label: "Destination" },
      { name: "object", type: "text", label: "Objet" },
      { name: "itinerary", type: "textarea", label: "Itinéraire" },
      { name: "duree", type: "number", label: "Durée (jours)" },
      { name: "startDate", type: "date", label: "Date départ" },
      { name: "endDate", type: "date", label: "Date retour" },
      { name: "transport", type: "text", label: "Moyen de transport" },
    ],
  },
  {
    id: "training",
    label: "Demande de formation",
    legalRef: "Procédure de formation",
    icon: <BookOpen size={18} />,
    desc: "Formation professionnelle",
    fields: [
      { name: "theme", type: "text", label: "Thème" },
      {
        name: "type_formation",
        type: "select",
        label: "Type de formation",
        options: [
          { value: "courte", label: "Courte" },
          { value: "moyenne", label: "Moyenne" },
          { value: "longue", label: "Longue" },
        ],
      },
      { name: "duration", type: "text", label: "Période" },
      { name: "objective", type: "textarea", label: "Objectifs" },
    ],
  },
  {
    id: "placement",
    label: "Mise à disposition",
    legalRef: "Procédure mise à disposition",
    icon: <Monitor size={18} />,
    desc: "Affectation temporaire dans une autre structure",
    fields: [
      { name: "hostStructure", type: "text", label: "Structure d'accueil" },
      { name: "duration", type: "text", label: "Durée" },
      { name: "conditions", type: "textarea", label: "Conditions" },
    ],
  },
  {
    id: "exceptional-leave", 
    label: "Congé exceptionnel",
    legalRef: "الداخلي النظام",
    icon: <Award size={18} />,
    desc: "Congé pour événements exceptionnels",
    fields: [
      { name: "reason", type: "text", label: "Motif (mariage, décès...)" },
      { name: "startDate", type: "date", label: "Date début" },
      { name: "endDate", type: "date", label: "Date fin" },
      { name: "nb_jours", type: "number", label: "Durée (jours)", readOnly: true },
      { name: "documents", type: "file", label: "Pièces justificatives" },
    ],
  },
  {
    id: "absence-authorization",
    label: "Autorisation d'absence",
    legalRef: "الداخلي النظام",
    icon: <Clock size={18} />,
    desc: "Sortie temporaire autorisée",
    fields: [
      { name: "date", type: "date", label: "Date" },
      { name: "startTime", type: "time", label: "Heure début" },
      { name: "endTime", type: "time", label: "Heure fin" },
      { name: "reason", type: "textarea", label: "Motif" },
    ],
  },
  {
    id: "attestation-travail",
    label: "Attestation de travail",
    legalRef: "RH",
    icon: <FileText size={18} />,
    desc: "Demande d'attestation de travail officielle",
    fields: [
      { name: "date_naissance", type: "date", label: "Date de naissance" },
      { name: "adresse", type: "textarea", label: "Adresse" },
      { name: "num_secu", type: "text", label: "Numéro de sécurité sociale" },
      { name: "date_embauche", type: "date", label: "Date d'embauche" },
      { name: "poste", type: "text", label: "Poste occupé" },
    ],
  },
];

  const steps = [
    t.newRequest.selectType,
    t.newRequest.fillDetails,
    t.newRequest.reviewSubmit,
  ];

  const selectedRequest = requestTypes.find((r) => r.id === selectedType);
  //for validation 
const validateStep = () => {
  if (!selectedRequest) return false;

const result = validateRequestForm(selectedRequest.fields, formValues, selectedType);


  setErrors(result.errors);
  return result.isValid;
};

 const handleSubmit = async () => {
  setLoading(true);
  setSubmitError("");

  try {
    // ── Attestation — own endpoint ────────────────────────────
    if (selectedType === "attestation-travail") {
      await createAttestation({
        date_naissance: formValues["date_naissance"] ?? "",
        adresse:        formValues["adresse"]        ?? "",
        num_secu:       formValues["num_secu"]        ?? "",
        date_embauche:  formValues["date_embauche"]   ?? "",
        poste:          formValues["poste"]           ?? "",
      });
      setSubmitted(true);
      return;
    }

    // ── Congé (annual / sick / exceptional) ───────────────────
  if (
  selectedType === "vacation-annual" ||
  selectedType === "sick-leave" ||
  selectedType === "exceptional-leave"
) {
  const typeCongeMap: Record<string, "annuel" | "recuperation" | "sans_solde" | "autre"> = {
    "vacation-annual":   "annuel",
    "sick-leave":        "autre",
    "exceptional-leave": "autre",
  };

  const file = formFiles["medicalCertificate"] ?? formFiles["documents"] ?? null;
  const startDate = formValues["startDate"] ?? "";
  let endDate = formValues["endDate"] ?? "";
  let nbJours = formValues["nb_jours"] ? Number(formValues["nb_jours"]) : 0;

  if (selectedType === "sick-leave") {
    const duration = Number(formValues["expectedDuration"] || 0);
    if (startDate && duration > 0) {
      endDate = addDays(startDate, duration - 1);
      nbJours = duration;
    }
  }

  if (selectedType === "vacation-annual" || selectedType === "exceptional-leave") {
    if (startDate && endDate) {
      nbJours = computeDaysBetween(startDate, endDate);
    }
  }

  if (selectedType === "vacation-annual" && nbJours > 30) {
    throw new Error("Le congé annuel ne peut pas dépasser 30 jours.");
  }

  await createRequest({
    type: "conge",
    conge: {
      type_conge: typeCongeMap[selectedType],
      date_debut: startDate,
      date_fin:   endDate,
      nb_jours:   nbJours || 1,
      interim:    formValues["interim"] || undefined,
      adresse:    formValues["adresse"] || undefined,
      motif:      formValues["reason"]  || undefined,
      document:   file ?? undefined,
    },
  });

  setSubmitted(true);
  return;
}

    // ── Mission ───────────────────────────────────────────────
    if (selectedType === "mission-order") {
      await createRequest({
        type: "mission",
        mission: {
          destination:  formValues["destination"] ?? "",
          objet:        formValues["object"]      ?? "",
          itineraire:   formValues["itinerary"]   ?? "",
          duree:        formValues["duree"] ? Number(formValues["duree"]) : 1,
          date_depart:  formValues["startDate"]   ?? "",
          date_retour:  formValues["endDate"]     ?? "",
          transport:    formValues["transport"]   ?? "",
        },
      });
      setSubmitted(true);
      return;
    }

    // ── Sortie ────────────────────────────────────────────────
    if (selectedType === "absence-authorization") {
      await createRequest({
        type: "sortie",
        sortie: {
          date_sortie:  formValues["date"]      ?? "",
          heure_sortie: formValues["startTime"] ?? "",
          heure_retour: formValues["endTime"]   ?? "",
          motif:        formValues["reason"]    ?? "",
        },
      });
      setSubmitted(true);
      return;
    }

    // ── Formation ─────────────────────────────────────────────
    if (selectedType === "training") {
      const validFormationTypes = ["courte", "moyenne", "longue"] as const;
      type FormationType = typeof validFormationTypes[number];
      const rawType = formValues["type_formation"] ?? "courte";
      const safeType: FormationType = (validFormationTypes as readonly string[]).includes(rawType)
        ? rawType as FormationType
        : "courte";

      await createRequest({
        type: "formation",
        formation: {
          theme:          formValues["theme"]     ?? "",
          type_formation: safeType,
          periode:        formValues["duration"]  ?? "",
          objectifs:      formValues["objective"] ?? "",
        },
      });
      setSubmitted(true);
      return;
    }


    // ── Placement ─────────────────────────────────────────────
    if (selectedType === "placement") {
      await createRequest({
        type: "placement",
        placement: {
          host_structure: formValues["hostStructure"] ?? "",
          duration:       formValues["duration"]      ?? "",
          conditions:     formValues["conditions"]    ?? "",
        },
      });
      setSubmitted(true);
      return;
    }

    setSubmitError("Type de demande non reconnu.");
  } catch (err) {
    setSubmitError(
      err instanceof Error ? err.message : "Failed to submit request"
    );
  } finally {
    setLoading(false);
  }
};
  /* ───────── SUCCESS SCREEN ───────── */
  if (submitted) {
    return (
      <div className="success-screen animate-fade-in">
        <div className="success-icon">
          <CheckCircle size={36} />
        </div>

        <h2>{t.newRequest.successTitle}</h2>
        <p>{t.newRequest.successSub}</p>

        <div className="success-detail-box">
          <div className="success-detail-row">
            <span>ID</span>
            <span>REQ-{Date.now().toString().slice(-5)}</span>
          </div>

          <div className="success-detail-row">
            <span>{t.newRequest.type}</span>
            <span>{selectedRequest?.label}</span>
          </div>

          <div className="success-detail-row">
            <span>{t.newRequest.statusLabel}</span>
            <span className="pending-badge">
              <span className="pending-badge-dot" />
              {t.newRequest.pendingReview}
            </span>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/employee/requests")}
          >
            {t.newRequest.myRequests}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setStep(0);
              setSelectedType("");
              setSubmitted(false);
              setErrors({});
              setFormValues({});
            }}
          >
            {t.newRequest.newRequestBtn}
          </button>
        </div>
      </div>
    );
  }

  /* ───────── MAIN UI ───────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' }}>
      <div style={{ padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>{t.newRequest.title}</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>{t.newRequest.subtitle}</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, animation: 'app-fade-in 0.4s ease-out' }}>

      {/* STEPPER */}
      <div className="stepper">
        {steps.map((s, i) => (
          <div key={s} className="stepper-item">
            <div className="stepper-node">
              <div
                className={`stepper-circle ${
                  i < step ? "done" : i === step ? "active" : ""
                }`}
              >
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`stepper-label ${i === step ? "active" : ""}`}>
                {s}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ───────── STEP 1 ───────── */}
      {step === 0 && (
        <div>
          <div className="type-grid">
            {requestTypes.map((type) => (
              <button
                key={type.id}
                className={`type-card ${
                  selectedType === type.id ? "selected" : ""
                }`}
                onClick={() => { setSelectedType(type.id); setErrors({}); setFormValues({}); }}

              >
                <span className="type-card-icon">{type.icon}</span>
                <p className="type-card-label">{type.label}</p>
                <p className="type-card-desc">{type.desc}</p>
              </button>
            ))}
          </div>

          <div className="card-actions-end" style={{ marginTop: "1rem" }}>
            <button
              className="btn btn-primary"
              disabled={!selectedType}
              onClick={() => setStep(1)}
            >
              {t.newRequest.continue} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ───────── STEP 2 ───────── */}
      {step === 1 && (
        <div className="details-card">
          <div className="details-card-header">
            <span className="details-card-header-icon">
              {selectedRequest?.icon}
            </span>
            <div>
              <h3>{selectedRequest?.label}</h3>
              <p>{selectedRequest?.desc}</p>
            </div>
          </div>

          {selectedRequest?.fields?.map((field) => (
            
            <div key={field.name} className="field-group">
              <label className="field-label">{field.label}</label>
              {field.type === "textarea" && (
                <textarea
                  className="field-textarea"
                  rows={3}
                  value={formValues[field.name] ?? ""}
                  onChange={(e) => handleValueChange(field.name, e.target.value)}
                />
              )}

              {field.type === "file" && (
                <div>
                  <input
                    className="field-input"
                    type="file"
                    onChange={(e) =>
                      handleFileChange(
                        field.name,
                        e.target.files?.[0] ?? null,
                      )
                    }
                  />
                  {formValues[field.name] && (
                    <p style={{ marginTop: 6, fontSize: 12, color: "#444" }}>
                      Fichier sélectionné : {formValues[field.name]}
                    </p>
                  )}
                </div>
              )}

              {field.type !== "textarea" && field.type !== "file" && field.type !== "select" && (
                <input
                  className="field-input"
                  type={field.type}
                  value={formValues[field.name] ?? ""}
                  readOnly={field.name === "nb_jours" || (field.name === "endDate" && selectedType === "sick-leave")}
                  onChange={(e) => handleValueChange(field.name, e.target.value)}
                />
              )}
              {field.type === "select" && (
  <select
    className="field-input"
    value={formValues[field.name] ?? ""}
    onChange={(e) =>
      setFormValues((prev) => ({
        ...prev,
        [field.name]: e.target.value,
      }))
    }
  >
    <option value="">-- Choisir --</option>

    {(field as any).options?.map(
      (opt: { value: string; label: string }) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ),
    )}
  </select>
)}
              {errors[field.name] && (
  <p style={{ color: "red", fontSize: "12px", marginTop: 4 }}>
    {errors[field.name]}
  </p>
)}


            </div>
          ))}

          <div className="card-actions">
            <button className="btn btn-ghost" onClick={() => { setStep(0); setErrors({}); setFormValues({}); }}>
              <ArrowLeft size={14} /> {t.newRequest.back}
            </button>

            <button className="btn btn-primary" onClick={() => {
  if (validateStep()) setStep(2);
}}>
              {t.newRequest.review} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ───────── STEP 3 ───────── */}
      {step === 2 && (
        <div className="review-card">
          <h3>{t.newRequest.reviewTitle}</h3>

          <div className="review-rows">
            <div className="review-row">
              <span>Type</span>
              <span>{selectedRequest?.label}</span>
            </div>

            <div className="review-row">
              <span>Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="review-note">
            <Info size={14} />
            {t.newRequest.confirmNote}
          </div>

          <div className="card-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> {t.newRequest.back}
            </button>

            {submitError && (
              <p
                style={{
                  color: "var(--danger-600)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {submitError}
              </p>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "..." : t.newRequest.submit}
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

