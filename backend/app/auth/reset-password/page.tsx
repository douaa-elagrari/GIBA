"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Input from "@/components/ui/input/input";
import Button from "@/components/ui/button/button";
import { useLang } from "@/contexts/LangContext";

export default function ResetPasswordPage() {
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    window.location.href = "/auth/login";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          {t.auth.resetPassword}
        </h2>
        <p className="text-neutral-500 text-sm">{t.auth.resetPasswordSub}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="password"
          label={t.auth.newPassword}
          type={showPassword ? "text" : "password"}
          placeholder={t.auth.minPasswordPlaceholder}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-neutral-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          helperText={t.auth.passwordHelper}
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
              className="hover:text-neutral-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Button
          type="submit"
          loading={loading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mt-2"
        >
          {t.auth.resetPasswordBtn} <ArrowRight size={16} />
        </Button>
      </form>
      <p className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          {t.auth.backToLogin}
        </Link>
      </p>
    </div>
  );
}
