import { useState } from "react";
import { createCategory } from "../services/menuApi";

const RESTAURANT_ID = 1;

export default function CategoryCreateForm({
  onCreated,
  onClose,
}: {
  onCreated: () => void;
  onClose: () => void;
}) {
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createCategory({
        restaurant_id: RESTAURANT_ID,
        name_fr: nameFr,
        name_en: nameEn || nameFr,
      });
      onCreated();
      onClose();
    } catch {
      setError("Cette catégorie existe peut-être déjà.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-20">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#1F1B18] rounded-t-2xl p-5 border-t border-[#2A241F]"
      >
        <div className="flex justify-between items-center mb-5">
          <h2
            className="text-lg font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nouvelle catégorie
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

        <label className="block text-sm text-[#F5F1E8] mb-1">
          Nom (EN) <span className="text-[#A89F91]">(optionnel)</span>
        </label>
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-lg bg-[#141210] border border-[#2A241F] text-[#F5F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4A94A]"
        />

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Création…" : "Créer la catégorie"}
        </button>
      </form>
    </div>
  );
}