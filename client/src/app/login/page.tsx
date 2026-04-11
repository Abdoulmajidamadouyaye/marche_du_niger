"use client";

import { useCustomer } from "@/context/CustomerContext";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import { apiAdminLogin } from "@/services/api";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";

const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").trim();

export default function LoginPage() {
  const router = useRouter();
  const { customer, login, register, loading } = useCustomer();
  const { notify } = useFloatingNotice();
  const [mode, setMode] = useState<AuthMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    return (
      <div className="mx-auto max-w-xl py-10">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              }`}
            >
              J&apos;ai deja un compte
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
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
              Connexion
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
        </div>
      </div>
    );
}
