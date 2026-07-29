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
    <div className="fixed inset-0 bg-black/40 flex items-end z-20">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-t-2xl p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1C1917]">Nouvelle catégorie</h2>
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

        <label className="block text-sm text-[#1C1917] mb-1">
          Nom (EN) <span className="text-[#78716C]">(optionnel)</span>
        </label>
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-[#E7E5E4]"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Création…" : "Créer la catégorie"}
        </button>
      </form>
    </div>
  );
}