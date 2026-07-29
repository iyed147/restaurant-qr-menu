import { useState } from "react";
import { createUser } from "../services/usersApi";

const RESTAURANT_ID = 1;

export default function UserCreateForm({
  onCreated,
  onClose,
}: {
  onCreated: () => void;
  onClose: () => void;
}) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createUser({
        restaurant_id: RESTAURANT_ID,
        email,
        password,
        nom,
        prenom,
        role: "employe",
      });
      onCreated();
      onClose();
    } catch {
      setError("Impossible de créer ce compte (email déjà utilisé ?).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-20">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1C1917]">Nouvel employé</h2>
          <button type="button" onClick={onClose} className="text-[#78716C]">
            Fermer
          </button>
        </div>

        <label className="block text-sm text-[#1C1917] mb-1">Nom</label>
        <input
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">Prénom</label>
        <input
          required
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">
          Mot de passe <span className="text-[#78716C]">(min. 8 caractères)</span>
        </label>
        <input
          required
          type="text"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Création…" : "Créer le compte"}
        </button>
      </form>
    </div>
  );
}