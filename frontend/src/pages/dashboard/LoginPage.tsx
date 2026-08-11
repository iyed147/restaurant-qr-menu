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
    <div className="min-h-screen flex items-center justify-center bg-[#141210] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1F1B18] rounded-2xl border border-[#2A241F] p-7"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-5 border-2 border-[#D4A94A]/40">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <h1
          className="text-2xl font-semibold text-[#D4A94A] mb-1 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Connexion
        </h1>
        <p className="text-sm text-[#A89F91] mb-6 text-center">Espace Employé / Gérant</p>

        <label className="block text-sm text-[#F5F1E8] mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}