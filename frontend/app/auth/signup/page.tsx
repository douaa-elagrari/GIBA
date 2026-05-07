"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Hash,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Input from "@/components/ui/input/input";
import Button from "@/components/ui/button/button";

import { useLang } from "@/contexts/LangContext";
import { signupUser, verifyEmail } from "@/services/authService";

export default function SignupPage() {
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirmPassword = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;
    const employeeId = (
      form.elements.namedItem("employeeId") as HTMLInputElement
    ).value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!employeeId || isNaN(Number(employeeId))) {
      setError("Employee ID must be a number");
      return;
    }

    setLoading(true);
    try {
      await signupUser({
        employee_id: Number(employeeId),
        email,
        password,
        role: "employee",
      });
      setPendingEmail(email);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyLoading(true);
    try {
      await verifyEmail({ email: pendingEmail, code: verifyCode });
      router.push("/auth/login");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Verify your email
          </h2>
          <p className="text-neutral-500 text-sm">
            A 6-digit code was printed in your backend console. Enter it below.
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}
          <Input
            name="code"
            label="Verification Code"
            type="text"
            placeholder="123456"
            value={verifyCode}
            onChange={(e) =>
              setVerifyCode((e.target as HTMLInputElement).value)
            }
          />
          <Button type="submit" loading={verifyLoading} className="w-full">
            Verify & Sign In <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> {t.auth.backToLogin}
        </Link>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          {t.auth.createAccount}
        </h2>
        <p className="text-neutral-500 text-sm">{t.auth.createAccountSub}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Input
          name="fullName"
          label={t.auth.fullName}
          type="text"
          placeholder={t.auth.fullNamePlaceholder}
          leftIcon={<User size={16} />}
        />
        <Input
          name="email"
          label={t.auth.workEmail}
          type="email"
          placeholder={t.auth.workEmailPlaceholder}
          leftIcon={<Mail size={16} />}
        />
        <Input
          name="employeeId"
          label={t.auth.employeeId}
          type="text"
          placeholder={t.auth.employeeIdPlaceholder}
          leftIcon={<Hash size={16} />}
          helperText={t.auth.employeeIdHelper}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            name="password"
            label={t.auth.password}
            type={showPassword ? "text" : "password"}
            placeholder={t.auth.minPasswordPlaceholder}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Input
            name="confirmPassword"
            label={t.auth.confirmPassword}
            type={showConfirm ? "text" : "password"}
            placeholder={t.auth.confirmPasswordPlaceholder}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>
        <Button
          type="submit"
          loading={loading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mt-2"
        >
          {t.auth.createAccountBtn} <ArrowRight size={16} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {t.auth.alreadyHaveAccount}{" "}
        <Link
          href="/auth/login"
          className="text-indigo-600 font-semibold hover:text-indigo-700"
        >
          {t.auth.signInLink}
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">
        {t.auth.noEmployeeId}
      </p>
    </div>
  );
}
