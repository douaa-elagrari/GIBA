"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { updateEmployee } from "@/services/employeeService";
import Card from "@/components/ui/cards/cards";
import Input from "@/components/ui/input/input";
import Button from "@/components/ui/button/button";
import ErrorToast from "@/components/layout/ErrorToast";
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import { formatError } from "@/lib/formatError";
import "./page.css";

import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Hash,
  UserCheck,
  CalendarDays,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Globe,
  CheckCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";

type Tab = "personal" | "security" | "preferences";

export default function EmployeeSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const emp = user?.employee;
  const fullName = emp ? `${emp.prenom ?? ""} ${emp.nom ?? ""}`.trim() : "—";
  const initials =
    fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  // ── Tabs & edit mode ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [editing, setEditing] = useState(false);

  // ── Editable profile fields ───────────────────────────────────
  const [phone, setPhone] = useState(emp?.telephone ?? "");
  const [emailVal, setEmailVal] = useState(emp?.email ?? user?.email ?? "");

  // ── Profile save state ────────────────────────────────────────
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Password fields ───────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Notifications ─────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    requestUpdates: true,
  });

  // ── Dialogs ───────────────────────────────────────────────────
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

 async function handleSave() {
  const originalPhone = emp?.telephone ?? "";
  const originalEmail = emp?.email ?? user?.email ?? "";

  if (phone === originalPhone && emailVal === originalEmail) {
    setEditing(false);
    return;
  }

  if (!emp?.id) {
    setSaveError("Employee record not found.");
    return;
  }

  setSaveLoading(true);
  setSaveError(null);

  try {
    // If email changed, update both tables via the auth endpoint
    if (emailVal !== originalEmail) {
      await apiRequest("/auth/update-email", {
        method: "PUT",
        body: JSON.stringify({ new_email: emailVal }),
      });
    }

    // If phone (or other employee-only fields) changed, update employee table
    if (phone !== originalPhone) {
      await updateEmployee(emp.id, { telephone: phone });
    }

    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  } catch (err: unknown) {
    setSaveError(formatError(err));
  } finally {
    setSaveLoading(false);
  }
}

  function handleCancelClick() {
    const originalPhone = emp?.telephone ?? "";
    const originalEmail = emp?.email ?? user?.email ?? "";
    const dirty = phone !== originalPhone || emailVal !== originalEmail;

    if (dirty) {
      setCancelDialogOpen(true);
    } else {
      discardEdits();
    }
  }

  function discardEdits() {
    setPhone(emp?.telephone ?? "");
    setEmailVal(emp?.email ?? user?.email ?? "");
    setSaveError(null);
    setEditing(false);
    setCancelDialogOpen(false);
  }

  async function handleChangePassword() {
    setPwError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }

    setPwLoading(true);

    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwError(formatError(err));
    } finally {
      setPwLoading(false);
    }
  }

  function handleLogoutConfirm() {
    logout();
    router.push("/auth/login");
  }

  const tabs = [
    { key: "personal", label: "My Profile" },
    { key: "security", label: "Security" },
    { key: "preferences", label: "Preferences" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' }}>
      {/* ── Global overlays & toasts ──────────────────────────────── */}

      <LoadingOverlay open={saveLoading} message="Saving changes…" />

      <ErrorToast
        message={saveError}
        onClose={() => setSaveError(null)}
      />

      <ErrorToast
        message={pwError}
        onClose={() => setPwError(null)}
      />

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Sign Out"
        message="Are you sure you want to log out from this device?"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        danger
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutDialogOpen(false)}
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        danger
        onConfirm={discardEdits}
        onCancel={() => setCancelDialogOpen(false)}
      />

      <div style={{ padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Account Settings</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>Manage your profile, security, and personal preferences.</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, animation: 'app-fade-in 0.4s ease-out' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Card className="emp-settings__hero">
        <div className="emp-settings__hero-banner" />

        <div className="emp-settings__hero-body">
          <div className="emp-settings__avatar">{initials}</div>

          <div className="emp-settings__hero-info">
            <h2>{fullName || "Employee"}</h2>
            <p>{emp?.fonction ?? "Employee"}</p>

            <div className="emp-settings__badges">
              <span className="badge badge--purple">
                <Hash size={12} />
                {emp?.matricule ?? "—"}
              </span>

              <span className="badge badge--green">
                <CheckCircle size={12} />
                Active
              </span>
            </div>
          </div>

          {!editing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="emp-settings__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`emp-settings__tab ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.key as Tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="alert success">
          <CheckCircle size={16} />
          Profile updated successfully.
        </div>
      )}

      {/* ── PERSONAL TAB ─────────────────────────────────────────── */}
      {activeTab === "personal" && (
        <div className="emp-settings__section">
          <Card>
            <p className="section-title">
              <User size={16} />
              Personal Information
            </p>

            <div className="settings-grid">
              <Input
                label="Full Name"
                value={fullName}
                disabled
                leftIcon={<User size={16} />}
              />

              <Input
                label="Email"
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                disabled={!editing}
                leftIcon={<Mail size={16} />}
              />

              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                leftIcon={<Phone size={16} />}
              />

              <Input
                label="Matricule"
                value={emp?.matricule ?? "—"}
                disabled
                leftIcon={<Hash size={16} />}
              />
            </div>
          </Card>

          <Card>
            <p className="section-title">
              <Briefcase size={16} />
              Work Information
            </p>

            <div className="settings-grid">
              <Input
                label="Department"
                value={emp?.affectation ?? "—"}
                disabled
                leftIcon={<Building2 size={16} />}
              />

              <Input
                label="Role"
                value={emp?.role ?? "—"}
                disabled
                leftIcon={<UserCheck size={16} />}
              />

              <Input
                label="Position"
                value={emp?.fonction ?? "—"}
                disabled
                leftIcon={<Briefcase size={16} />}
              />

              <Input
                label="Start Date"
                value={emp?.date_entree ?? "—"}
                disabled
                leftIcon={<CalendarDays size={16} />}
              />
            </div>
          </Card>

          {editing && (
            <div className="settings-actions">
              <Button variant="secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saveLoading}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── SECURITY TAB ─────────────────────────────────────────── */}
      {activeTab === "security" && (
        <Card>
          <p className="section-title">
            <ShieldCheck size={16} />
            Password & Security
          </p>

          {pwSuccess && (
            <div className="alert success">
              <CheckCircle size={16} />
              Password updated successfully.
            </div>
          )}

          <div className="security-fields">
            <Input
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="New Password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          <Button onClick={handleChangePassword} loading={pwLoading}>
            Update Password
          </Button>
        </Card>
      )}

      {/* ── PREFERENCES TAB ──────────────────────────────────────── */}
      {activeTab === "preferences" && (
        <div className="emp-settings__section">
          <Card>
            <p className="section-title">
              <Globe size={16} />
              Language
            </p>
            <p className="muted-text">Language options coming soon.</p>
          </Card>

          <Card>
            <p className="section-title">
              <Bell size={16} />
              Notifications
            </p>

            {[
              {
                key: "email",
                label: "Email Notifications",
                desc: "Receive updates through email",
              },
              {
                key: "push",
                label: "Push Notifications",
                desc: "Receive browser notifications",
              },
              {
                key: "requestUpdates",
                label: "Request Updates",
                desc: "Status changes on your requests",
              },
            ].map((item) => (
              <div className="toggle-row" key={item.key}>
                <div>
                  <p>{item.label}</p>
                  <span>{item.desc}</span>
                </div>

                <button
                  className={`toggle ${
                    notifications[item.key as keyof typeof notifications]
                      ? "on"
                      : "off"
                  }`}
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[
                        item.key as keyof typeof notifications
                      ],
                    }))
                  }
                >
                  <span />
                </button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Logout ───────────────────────────────────────────────── */}
      <Card>
        <div className="danger-zone">
          <div>
            <h3>Sign Out</h3>
            <p>Log out securely from this device.</p>
          </div>

          <button
            className="logout-btn"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </Card>
        </div>
      </div>
    </div>
  );
}
