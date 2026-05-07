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

export default function SignupPage() {
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/employee/dashboard");
  };

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
