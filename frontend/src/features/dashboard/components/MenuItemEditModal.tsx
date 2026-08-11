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
    <div className="fixed inset-0 bg-black/60 flex items-end z-20">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#1F1B18] rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto border-t border-[#2A241F]"
      >
        <div className="flex justify-between items-center mb-5">
          <h2
            className="text-lg font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Modifier le produit
          </h2>
          <button type="button" onClick={onClose} className="text-[#A89F91]">
            Fermer
          </button>
        </div>

        <label className="block text-sm text-[#F5F1E8] mb-1">Nom (FR)</label>
        <input
          required
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">Prix (DT)</label>
        <input
          required
          type="number"
          step="0.1"
          min="0.1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}