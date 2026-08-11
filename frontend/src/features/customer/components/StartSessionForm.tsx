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
    <div className="min-h-screen flex items-center justify-center bg-[#141210] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1F1B18] rounded-2xl border border-[#2A241F] p-7"
      >
        <h1
          className="text-2xl font-semibold text-[#D4A94A] mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Bienvenue
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-[#D4A94A]/40">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          
        </h1>
        <p className="text-sm text-[#A89F91] mb-6">
          Merci de vous présenter avant de commander.
        </p>

        <label className="block text-sm text-[#F5F1E8] mb-1">Nom</label>
        <input
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">Prénom</label>
        <input
          required
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">
          Téléphone <span className="text-[#A89F91]">(optionnel)</span>
        </label>
        <input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="w-full mb-6 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Connexion…" : "Continuer"}
        </button>
      </form>
    </div>
  );
}