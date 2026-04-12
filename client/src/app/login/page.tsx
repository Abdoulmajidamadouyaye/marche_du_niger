"use client";

import { useCustomer } from "@/context/CustomerContext";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import { apiAdminLogin, apiCustomerForgotPassword, apiCustomerResetPassword } from "@/services/api";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";
type ForgotStep = "none" | "request" | "verify";

const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").trim();

export default function LoginPage() {
  const router = useRouter();
  const { customer, login, register, loading } = useCustomer();
  const { notify } = useFloatingNotice();
  const [mode, setMode] = useState<AuthMode>("login");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("none");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && customer) {
      router.replace("/");
    }
  }, [customer, loading, router]);

  const pageTitle = useMemo(
    () => (mode === "login" ? "Connexion client" : "Creation de compte"),
    [mode]
  );

  const resetForgotFlow = () => {
    setForgotStep("none");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleLoginOrRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const compactPhone = normalizePhone(phone);
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

    if (mode === "register") {
      if (!firstName.trim() || !lastName.trim() || !compactPhone) {
        setError("Veuillez renseigner le nom, le prenom et le numero.");
        notify("Veuillez renseigner le nom, le prenom et le numero.", "error", 3200);
        return;
      }

      if (!/^\+?[0-9]{8,15}$/.test(compactPhone)) {
        setError("Numero invalide. Exemple: +22790000000");
        notify("Numero invalide. Exemple: +22790000000", "error", 3200);
        return;
      }

      if (normalizedPassword !== confirmPassword.trim()) {
        setError("La confirmation du mot de passe ne correspond pas.");
        notify("La confirmation du mot de passe ne correspond pas.", "error", 3200);
        return;
      }
    }

    setSubmitting(true);
    setError("");
    notify("Traitement en cours...", "info", 1600);

    try {
      if (mode === "login") {
        try {
          await login(normalizedEmail, normalizedPassword);
          notify("Connexion client reussie.", "success", 2600);
          router.replace("/");
          return;
        } catch {
          const { accessToken } = await apiAdminLogin(normalizedEmail, normalizedPassword);
          localStorage.removeItem("nm_customer_token");
          localStorage.setItem("nm_admin_token", accessToken);
          notify("Connexion admin reussie.", "success", 2600);
          router.replace("/admin");
          return;
        }
      } else {
        await register(
          firstName.trim(),
          lastName.trim(),
          compactPhone,
          normalizedEmail,
          normalizedPassword
        );
        notify("Compte cree avec succes.", "success", 2800);
        router.replace("/");
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de continuer.";
      setError(message);
      notify(message, "error", 3600);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Veuillez renseigner votre email.");
      notify("Veuillez renseigner votre email.", "error", 3200);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email invalide.");
      notify("Email invalide.", "error", 3200);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await apiCustomerForgotPassword(normalizedEmail);
      notify(result.message, "success", 3800);
      setForgotStep("verify");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de generer le code.";
      setError(message);
      notify(message, "error", 3600);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = resetCode.trim();
    const cleanNewPassword = newPassword.trim();
    const cleanConfirm = confirmNewPassword.trim();

    if (!normalizedEmail || !cleanCode || !cleanNewPassword || !cleanConfirm) {
      setError("Veuillez renseigner email, code et nouveau mot de passe.");
      notify("Veuillez renseigner email, code et nouveau mot de passe.", "error", 3200);
      return;
    }

    if (cleanCode.length < 6) {
      setError("Code invalide.");
      notify("Code invalide.", "error", 3200);
      return;
    }

    if (cleanNewPassword.length < 6) {
      setError("Nouveau mot de passe trop court (minimum 6 caracteres).");
      notify("Nouveau mot de passe trop court (minimum 6 caracteres).", "error", 3200);
      return;
    }

    if (cleanNewPassword !== cleanConfirm) {
      setError("La confirmation du mot de passe ne correspond pas.");
      notify("La confirmation du mot de passe ne correspond pas.", "error", 3200);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await apiCustomerResetPassword(normalizedEmail, cleanCode, cleanNewPassword);
      notify(result.message, "success", 3200);
      resetForgotFlow();
      setPassword("");
      setMode("login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de reinitialiser le mot de passe.";
      setError(message);
      notify(message, "error", 3600);
    } finally {
      setSubmitting(false);
    }
  };

    return (
      <div className="mx-auto max-w-xl py-10">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                resetForgotFlow();
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              }`}
            >
              J&apos;ai deja un compte
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                resetForgotFlow();
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              }`}
            >
              Creer un compte
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {mode === "login" ? "Connexion" : "Inscription"}
            </p>
          </div>

          {mode === "login" && forgotStep !== "none" ? (
            <form className="space-y-4" onSubmit={forgotStep === "request" ? handleForgotRequest : handleResetSubmit}>
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {forgotStep === "request"
                  ? "Entrez votre email. Un code sera envoye pour reinitialiser votre mot de passe."
                  : "Entrez le code recu par email puis votre nouveau mot de passe."}
              </p>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                  placeholder="ali@example.com"
                />
              </div>

              {forgotStep === "verify" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Code d&apos;authentification</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(event) => setResetCode(event.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                      placeholder="Ex: 123456"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                      placeholder="minimum 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                      placeholder="retapez le nouveau mot de passe"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={resetForgotFlow}
                  className="text-sm font-medium text-gray-600 hover:underline"
                >
                  Retour connexion
                </button>
                {forgotStep === "verify" && (
                  <button
                    type="button"
                    onClick={() => setForgotStep("request")}
                    className="text-sm font-medium text-emerald-700 hover:underline"
                  >
                    Renvoyer un code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? "Traitement..."
                  : forgotStep === "request"
                    ? "Envoyer le code"
                    : "Reinitialiser le mot de passe"}
              </button>
            </form>
          ) : (
          <form className="space-y-4" onSubmit={handleLoginOrRegister}>
            {mode === "register" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Prenom</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                      placeholder="Issa"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                      placeholder="Abdou"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Numero de telephone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                    placeholder="+22790000000"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                    placeholder="retapez le mot de passe"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                placeholder="ali@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                placeholder="minimum 6 caracteres"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotStep("request");
                  setError("");
                }}
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Mot de passe oublie ?
              </button>
              {mode !== "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    resetForgotFlow();
                  }}
                  className="text-sm font-medium text-gray-600 hover:underline"
                >
                  Retour connexion
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Traitement..."
                : mode === "login"
                  ? "Se connecter"
                  : "Creer mon compte"}
            </button>
          </form>
          )}
        </div>
      </div>
    );
}
