"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import { Employee } from "@/types";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/services/employeeService";
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import ErrorToast from "@/components/layout/ErrorToast";
import { formatError } from "@/lib/formatError";

// ─── Constants ────────────────────────────────────────────────────────────────

const DATE_FIELDS = new Set<keyof Employee>([
  "date_naissance",
  "date_recrutement",
  "date_entree",
  "debut_contrat",
  "fin_contrat",
  "date_sortie",
  "derniere_visite_medicale",
]);

const COLUMNS: { heading: string; key: keyof Employee | null }[] = [
  { heading: "MATRICULE", key: "matricule" },
  { heading: "NOM", key: "nom" },
  { heading: "PRENOM", key: "prenom" },
  { heading: "FONCTION", key: "fonction" },
  { heading: "DATE NAISSANCE", key: "date_naissance" },
  { heading: "ADRESSE", key: "adresse" },
  { heading: "N° Telephone", key: "telephone" },
  { heading: "E-mail", key: "email" },
  { heading: "NIN", key: "nin" },
  { heading: "N° Assurance", key: "assurance" },
  { heading: "DATE ENTREE", key: "date_entree" },
  { heading: "DATE RECRUTEMENT", key: "date_recrutement" },
  { heading: "SIT-FAM", key: "sit_fam" },
  { heading: "NOMBRE ENFANTS", key: "nombre_enfants" },
  { heading: "Groupage", key: "groupage" },
  { heading: "N° COMPTE", key: "compte_banque" },
  { heading: "BANQUE /CCP", key: "categorie" },
  { heading: "Catégorie", key: "categorie" },
  { heading: "Affectation", key: "affectation" },
  { heading: "Diplôme", key: "diplome" },
  { heading: "TYPE DE CONTRAT", key: "type_contrat" },
  { heading: "DEBUT DE CONTRAT", key: "debut_contrat" },
  { heading: "FIN CONTRAT", key: "fin_contrat" },
  { heading: "DATE SORTIE", key: "date_sortie" },
  { heading: "Motif de sortie", key: "motif_sortie" },
  { heading: "Mesure disciplinaire", key: "mesure_disciplinaire" },
  { heading: "Derniere visite medicale", key: "derniere_visite_medicale" },
  { heading: "Manager ID", key: "manager_id" },
  { heading: "Actions", key: null },
];

// ─── Empty draft ──────────────────────────────────────────────────────────────

function emptyDraft(): Partial<Employee> {
  return {
    matricule: "",
    nom: "",
    prenom: "",
    fonction: "",
    date_naissance: null,
    date_recrutement: null,
    adresse: "",
    telephone: "",
    email: "",
    nin: "",
    assurance: "",
    date_entree: null,
    sit_fam: "",
    nombre_enfants: 0,
    groupage: "",
    compte_banque: "",
    categorie: "",
    affectation: "",
    diplome: "",
    type_contrat: "",
    debut_contrat: null,
    fin_contrat: null,
    date_sortie: null,
    motif_sortie: "",
    mesure_disciplinaire: "",
    derniere_visite_medicale: null,
    manager_id: null,
    role: "employee",
  };
}

// ─── Shared cell input (used in both new & edit rows) ─────────────────────────

function CellInput({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: keyof Employee;
  value: string | number | null | undefined;
  onChange: (key: keyof Employee, value: string) => void;
}) {
  const isDate = DATE_FIELDS.has(fieldKey);
  return (
    <input
      type={isDate ? "date" : "text"}
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      className="hr-table-input"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [draft, setDraft] = useState<Partial<Employee>>({});

  // Loading overlay
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("Processing...");

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);

  // ── Fetch on mount ──
  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (err) {
      setErrorMsg(formatError(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Add new row ──
  function handleAdd() {
    setDraft(emptyDraft());
    setEditingId(-1);
    setIsNewRow(true);
  }

  // ── Start editing existing row ──
  function handleEdit(emp: Employee) {
    setDraft({
      ...emp,
      date_naissance: emp.date_naissance ?? null,
      date_recrutement: emp.date_recrutement ?? null,
      date_entree: emp.date_entree ?? null,
      debut_contrat: emp.debut_contrat ?? null,
      fin_contrat: emp.fin_contrat ?? null,
      date_sortie: emp.date_sortie ?? null,
      derniere_visite_medicale: emp.derniere_visite_medicale ?? null,
    });
    setEditingId(emp.id);
    setIsNewRow(false);
  }

  // ── Save (create or update) ──
  async function handleSave() {
    setOverlayMessage(isNewRow ? "Creating employee..." : "Saving changes...");
    setOverlayOpen(true);
    try {
      if (isNewRow) {
        const created = await createEmployee(draft);
        setEmployees((prev) => [...prev, created]);
      } else if (editingId !== null) {
        const updated = await updateEmployee(editingId, draft);
        setEmployees((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e))
        );
      }
      setEditingId(null);
      setIsNewRow(false);
      setDraft({});
    } catch (err) {
      setErrorMsg(formatError(err));
    } finally {
      setOverlayOpen(false);
    }
  }

  // ── Cancel ──
  function handleCancel() {
    setEditingId(null);
    setIsNewRow(false);
    setDraft({});
  }

  // ── Request delete (open confirm dialog) ──
  function handleDeleteRequest(emp: Employee) {
    setPendingDelete(emp);
    setConfirmOpen(true);
  }

  // ── Confirmed delete ──
  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    setConfirmOpen(false);
    setOverlayMessage("Deleting employee...");
    setOverlayOpen(true);
    try {
      await deleteEmployee(pendingDelete.id);
      setEmployees((prev) => prev.filter((e) => e.id !== pendingDelete.id));
    } catch (err) {
      setErrorMsg(formatError(err));
    } finally {
      setOverlayOpen(false);
      setPendingDelete(null);
    }
  }

  // ── Draft field change ──
  function handleChange(key: keyof Employee, value: string) {
    setDraft((prev) => ({
      ...prev,
      [key]: DATE_FIELDS.has(key)
        ? value === "" ? null : value
        : value,
    }));
  }

  // ── Cell display value ──
  function cellValue(emp: Employee, key: keyof Employee): string {
    const v = emp[key];
    if (v === null || v === undefined) return "";
    return String(v);
  }

  // ── Shared Save/Cancel buttons ──
  function SaveCancelButtons({ saving = false }: { saving?: boolean }) {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={handleSave}
          className="hr-btn-save"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="hr-btn-cancel"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Modular overlays / dialogs ── */}
      <LoadingOverlay open={overlayOpen} message={overlayMessage} />

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Delete Employee"
        message={
          pendingDelete
            ? `Are you sure you want to delete ${pendingDelete.prenom} ${pendingDelete.nom}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />

      <ErrorToast message={errorMsg} onClose={() => setErrorMsg(null)} />

      {/* ── Table card ── */}
      <section
        className="hr-card"
        style={{ padding: "var(--space-6)", gap: "var(--space-5)" }}
      >
        <button
          onClick={handleAdd}
          disabled={editingId !== null}
          className="hr-btn-primary"
          style={{ marginBottom: "20px" }}
        >
          <Plus size={16} style={{ marginRight: "8px" }} />
          Add Employee
        </button>

        <div className="hr-table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead className="hr-table-header">
              <tr>
                {COLUMNS.map(({ heading }) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "16px",
                      borderBottom: "1px solid #eef0f4",
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "var(--neutral-400)",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                <>
                  {/* Existing employees */}
                  {employees.map((emp, index) => {
                    const isEditing = editingId === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        className="hr-table-row"
                      >
                        {COLUMNS.map(({ heading, key }) => (
                          <td
                            key={heading}
                            style={{
                              padding: "16px",
                              borderBottom: "1px solid #f1f5f9",
                              color: "#334155",
                              fontSize: "14px"
                            }}
                          >
                            {key === null ? (
                              isEditing ? (
                                <SaveCancelButtons />
                              ) : (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => handleEdit(emp)}
                                    disabled={editingId !== null}
                                    className="hr-btn-outline"
                                  >
                                    Modify
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRequest(emp)}
                                    disabled={editingId !== null}
                                    className="hr-btn-danger-ghost"
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              )
                            ) : isEditing ? (
                              <CellInput
                                fieldKey={key}
                                value={draft[key]}
                                onChange={handleChange}
                              />
                            ) : (
                              cellValue(emp, key)
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* New unsaved row */}
                  {isNewRow && (
                    <tr style={{ background: "#f8fafc" }}>
                      {COLUMNS.map(({ heading, key }) => (
                        <td
                          key={heading}
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid #eef0f4",
                          }}
                        >
                          {key === null ? (
                            <SaveCancelButtons />
                          ) : (
                            <CellInput
                              fieldKey={key}
                              value={draft[key]}
                              onChange={handleChange}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Empty state */}
                  {employees.length === 0 && !isNewRow && (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        style={{
                          padding: "32px",
                          textAlign: "center",
                          color: "var(--neutral-400)",
                        }}
                      >
                        No employees found. Click "Add Employee" to create one.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
