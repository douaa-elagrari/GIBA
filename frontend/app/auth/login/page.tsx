"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserCircle,
  ShieldCheck,
} from "lucide-react";

import Input from "@/components/ui/input/input";
import Button from "@/components/ui/button/button";
import { useLang } from "@/contexts/LangContext";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
  const { t } = useLang();

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"employee" | "hr">("employee");

  const { loading, errors, setErrors, handleLogin } = useLogin(role);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)
      .value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    await handleLogin(email, password, t);
  };
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          {t.auth.welcomeBack}
        </h2>
        <p className="text-neutral-500 text-sm">
          {t.auth.signInSubtitle}
        </p>
      </div>
         <div className="auth-role-toggle">
        {(["employee", "hr"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={role === r ? "active" : ""}
          >
            {r === "employee" ? (
              <UserCircle size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            {r === "employee" ? t.auth.employee : t.auth.hrAdmin}
          </button>
        ))}
      </div>
         <form onSubmit={onSubmit} className="space-y-5">
        {errors.general && (
          <p className="text-red-500 text-sm">{errors.general}</p>
        )}

        <Input
          name="email"
          label={t.auth.emailOrId}
          type="text"
          placeholder={t.auth.emailOrIdPlaceholder}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          onChange={() => setErrors((prev) => ({ ...prev, email: "" }))}
        />
 <Input
          name="password"
          label={t.auth.password}
          type={showPassword ? "text" : "password"}
          placeholder={t.auth.passwordPlaceholder}
          error={errors.password}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          onChange={() =>
            setErrors((prev) => ({ ...prev, password: "" }))
          }
        />     <Button type="submit" loading={loading} className="w-full">
          {t.auth.signIn} <ArrowRight size={16} />
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/auth/signup">
          {t.auth.firstTime}
        </Link>
      </div>
    </div>
  );
}