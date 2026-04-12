"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import {
  apiAdminForgotPassword,
  apiAdminLogin,
  apiAdminResetPassword,
} from "@/services/api";

type ForgotStep = "none" | "request" | "verify";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("none");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { notify } = useFloatingNotice();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Veuillez renseigner l'email et le mot de passe.");
      notify("Veuillez renseigner l'email et le mot de passe.", "error", 3200);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email invalide.");
      notify("Email invalide.", "error", 3200);
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("Mot de passe trop court (minimum 6 caracteres).");
      notify("Mot de passe trop court (minimum 6 caracteres).", "error", 3200);
      return;
    }

    setError("");
    setLoading(true);
    notify("Traitement en cours...", "info", 1600);
    try {
      const { accessToken } = await apiAdminLogin(normalizedEmail, normalizedPassword);
      localStorage.setItem("nm_admin_token", accessToken);
      notify("Connexion admin reussie.", "success", 2600);
      router.replace("/admin");
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Connexion admin impossible";
      const message =
        rawMessage === "Failed to fetch"
          ? "Impossible de joindre le serveur. Verifiez le domaine frontend autorise dans CLIENT_URL."
          : rawMessage;
      setError(message);
      notify(message, "error", 3600);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Veuillez renseigner l'email admin.");
      notify("Veuillez renseigner l'email admin.", "error", 3200);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email invalide.");
      notify("Email invalide.", "error", 3200);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiAdminForgotPassword(normalizedEmail);
      notify(response.message, "info", 3200);
      setForgotStep("verify");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action impossible";
      setError(message);
      notify(message, "error", 3600);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = resetCode.trim();
    const normalizedPassword = newPassword.trim();
    const normalizedConfirm = confirmPassword.trim();

    if (!normalizedEmail || !normalizedCode || !normalizedPassword || !normalizedConfirm) {
      setError("Veuillez remplir tous les champs.");
      notify("Veuillez remplir tous les champs.", "error", 3200);
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("Mot de passe trop court (minimum 6 caracteres).");
      notify("Mot de passe trop court (minimum 6 caracteres).", "error", 3200);
      return;
    }

    if (normalizedPassword !== normalizedConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      notify("Les mots de passe ne correspondent pas.", "error", 3200);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiAdminResetPassword(
        normalizedEmail,
        normalizedCode,
        normalizedPassword
      );
      notify(response.message, "success", 3200);
      setForgotStep("none");
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action impossible";
      setError(message);
      notify(message, "error", 3600);
    } finally {
      setLoading(false);
    }
  };

  const returnToLogin = () => {
    setForgotStep("none");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="MARCHE DU NIGER" width={48} height={48} />
          <h1 className="text-2xl font-bold text-gray-900">Connexion admin</h1>
          <p className="text-sm text-gray-600">
            {forgotStep === "none"
              ? "Connexion: email + mot de passe."
              : forgotStep === "request"
              ? "Entrez votre email admin pour recevoir le code."
              : "Entrez le code recu par email et votre nouveau mot de passe."}
          </p>
        </div>

        <form
          onSubmit={
            forgotStep === "none"
              ? handleLogin
              : forgotStep === "request"
              ? handleForgotRequest
              : handleResetPassword
          }
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" /> Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ali@example.com"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
            />
          </label>

          {forgotStep === "none" && (
            <label className="block">
              <span className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <Lock className="h-4 w-4" /> Mot de passe
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="minimum 6 caracteres"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
              />
            </label>
          )}

          {forgotStep === "verify" && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Code de verification</span>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Code a 6 chiffres"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Lock className="h-4 w-4" /> Nouveau mot de passe
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="minimum 6 caracteres"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Lock className="h-4 w-4" /> Confirmer le mot de passe
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="retapez le mot de passe"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                />
              </label>
            </>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            {forgotStep !== "none" ? (
              <button
                type="button"
                onClick={returnToLogin}
                className="text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-800"
              >
                Retour a la connexion
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setForgotStep("request");
                  setError("");
                }}
                className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                Mot de passe oublie ?
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Traitement..."
              : forgotStep === "none"
              ? "Se connecter"
              : forgotStep === "request"
              ? "Envoyer le code"
              : "Reinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
