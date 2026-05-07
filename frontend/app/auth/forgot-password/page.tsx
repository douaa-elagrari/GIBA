"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Input from "@/components/ui/input/input";
import Button from "@/components/ui/button/button";
import { useLang } from "@/contexts/LangContext";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">
          {t.auth.checkEmail}
        </h2>
        <p className="text-neutral-500 text-sm">{t.auth.checkEmailSub}</p>
        <Link href="/auth/login">
          <Button className="w-full mt-4 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            {t.auth.backToLoginBtn}
          </Button>
        </Link>
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
          {t.auth.forgotPasswordTitle}
        </h2>
        <p className="text-neutral-500 text-sm">{t.auth.forgotPasswordSub}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="email"
          label={t.auth.workEmail}
          type="email"
          placeholder={t.auth.workEmailPlaceholder}
          leftIcon={<Mail size={16} />}
        />
        <Button
          type="submit"
          loading={loading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {t.auth.sendResetLink}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-600">
        {t.auth.contactHREmail}
      </p>
    </div>
  );
}
