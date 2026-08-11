import { useState } from "react";
import { createMenuItem } from "../services/menuApi";
import type { CategoryDTO } from "../../customer/types";

const RESTAURANT_ID = 1;

export default function MenuItemForm({
  categories,
  onCreated,
  onClose,
}: {
  categories: CategoryDTO[];
  onCreated: () => void;
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 0);
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createMenuItem({
        restaurant_id: RESTAURANT_ID,
        category_id: categoryId,
        name_fr: nameFr,
        name_en: nameEn || nameFr,
        description_fr: description || undefined,
        price: parseFloat(price),
        is_available: true,
      });
      onCreated();
      onClose();
    } catch {
      setError("Impossible de créer le produit. Vérifiez les champs.");
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
            Nouveau produit
          </h2>
          <button type="button" onClick={onClose} className="text-[#A89F91]">
            Fermer
          </button>
        </div>

        <label className="block text-sm text-[#F5F1E8] mb-1">Catégorie</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8]"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_fr}
            </option>
          ))}
        </select>

        <label className="block text-sm text-[#F5F1E8] mb-1">Nom (FR)</label>
        <input
          required
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">
          Nom (EN) <span className="text-[#A89F91]">(optionnel)</span>
        </label>
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        <label className="block text-sm text-[#F5F1E8] mb-1">
          Description <span className="text-[#A89F91]">(optionnel)</span>
        </label>
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
          disabled={submitting || categories.length === 0}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Création…" : "Créer le produit"}
        </button>
      </form>
    </div>
  );
}