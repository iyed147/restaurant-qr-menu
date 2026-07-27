import { useState } from "react";
import { updateMenuItem } from "../services/menuApi";
import type { MenuItemDTO } from "../../customer/types";

export default function MenuItemEditModal({
  item,
  onUpdated,
  onClose,
}: {
  item: MenuItemDTO;
  onUpdated: () => void;
  onClose: () => void;
}) {
  const [nameFr, setNameFr] = useState(item.name_fr);
  const [price, setPrice] = useState(String(item.price));
  const [description, setDescription] = useState(item.description_fr ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateMenuItem(item.id, {
        name_fr: nameFr,
        price: parseFloat(price),
        description_fr: description || undefined,
      });
      onUpdated();
      onClose();
    } catch {
      setError("Impossible de mettre à jour le produit.");
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
          <h2 className="text-lg font-semibold text-[#1C1917]">Modifier le produit</h2>
          <button type="button" onClick={onClose} className="text-[#78716C]">
            Fermer
          </button>
        </div>

        <label className="block text-sm text-[#1C1917] mb-1">Nom (FR)</label>
        <input
          required
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        <label className="block text-sm text-[#1C1917] mb-1">Prix (DT)</label>
        <input
          required
          type="number"
          step="0.1"
          min="0.1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}