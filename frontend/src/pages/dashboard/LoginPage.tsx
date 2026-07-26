import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { decodeJwtPayload } from "../../services/jwt";
import { useAuthStore } from "../../features/auth/store/authStore";
import type { UserRole } from "../../features/auth/store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;
      const payload = decodeJwtPayload(token);
      if (!payload) throw new Error("Token invalide");

      login(token, payload.role as UserRole, Number(payload.sub));
      navigate("/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-[#E7E5E4] p-6"
      >
        <h1 className="text-xl font-semibold text-[#1C1917] mb-1">Connexion</h1>
        <p className="text-sm text-[#78716C] mb-6">Espace Employé / Gérant</p>

        <label className="block text-sm text-[#1C1917] mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}