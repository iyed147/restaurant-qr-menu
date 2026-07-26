import { useState } from "react";
import api from "../../../services/api";
import { useCustomerSession } from "../store/customerSession";

interface Props {
  restaurantId: number;
  tableToken: string;
}

export default function StartSessionForm({ restaurantId, tableToken }: Props) {
  const setSession = useCustomerSession((s) => s.setSession);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/client-sessions/start", {
        restaurant_id: restaurantId,
        table_token: tableToken,
        nom,
        prenom,
        telephone: telephone || undefined,
      });
      setSession({
        clientSessionId: res.data.client_session_id,
        restaurantId: res.data.restaurant_id,
        tableNumber: res.data.table_number,
        nom: res.data.nom,
        prenom: res.data.prenom,
      });
    } catch {
      setError("QR Code invalide ou expiré. Appelez un serveur si le problème persiste.");
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
        <h1 className="text-xl font-semibold text-[#1C1917] mb-1">Bienvenue</h1>
        <p className="text-sm text-[#78716C] mb-6">
          Merci de vous présenter avant de commander.
        </p>

        <label className="block text-sm text-[#1C1917] mb-1">Nom</label>
        <input
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">Prénom</label>
        <input
          required
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">
          Téléphone <span className="text-[#78716C]">(optionnel)</span>
        </label>
        <input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Connexion…" : "Continuer"}
        </button>
      </form>
    </div>
  );
}