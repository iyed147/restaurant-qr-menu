import { useState } from "react";
import { createTable } from "../services/tablesApi";

const RESTAURANT_ID = 1;

export default function TableCreateForm({
  onCreated,
  onClose,
}: {
  onCreated: () => void;
  onClose: () => void;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createTable({
        restaurant_id: RESTAURANT_ID,
        table_number: parseInt(tableNumber, 10),
      });
      onCreated();
      onClose();
    } catch {
      setError("Ce numéro de table existe déjà, ou une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-20">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-t-2xl p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1C1917]">Nouvelle table</h2>
          <button type="button" onClick={onClose} className="text-[#78716C]">
            Fermer
          </button>
        </div>

        <label className="block text-sm text-[#1C1917] mb-1">Numéro de table</label>
        <input
          required
          type="number"
          min="1"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Création…" : "Créer la table"}
        </button>
      </form>
    </div>
  );
}