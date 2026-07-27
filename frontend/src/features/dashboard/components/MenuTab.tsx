import { useEffect, useState, useCallback } from "react";
import { fetchFullMenu, toggleAvailability } from "../services/menuApi";
import MenuItemForm from "./MenuItemForm";
import MenuItemEditModal from "./MenuItemEditModal";
import type { CategoryDTO, MenuItemDTO } from "../../customer/types";

const RESTAURANT_ID = 1;

export default function MenuTab() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDTO | null>(null);

  const load = useCallback(() => {
    fetchFullMenu(RESTAURANT_ID)
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (item: MenuItemDTO) => {
    try {
      await toggleAvailability(item.id, !item.is_available);
      load();
    } catch {
      alert("Impossible de changer la disponibilité.");
    }
  };

  if (loading) return <div className="p-4 text-[#78716C]">Chargement…</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium mb-6"
      >
        + Ajouter un produit
      </button>

      {categories.length === 0 && (
        <p className="text-[#78716C]">
          Aucune catégorie en base. Crée d'abord une catégorie via la base de
          données (pas encore géré depuis l'interface).
        </p>
      )}

      {categories.map((cat) => (
        <section key={cat.id} className="mb-6">
          <h2 className="text-base font-semibold text-[#1C1917] mb-3">
            {cat.name_fr}
          </h2>
          <div className="space-y-3">
            {cat.items.length === 0 && (
              <p className="text-sm text-[#78716C]">Aucun produit.</p>
            )}
            {cat.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E7E5E4] p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-[#1C1917]">{item.name_fr}</p>
                    {item.description_fr && (
                      <p className="text-sm text-[#78716C]">
                        {item.description_fr}
                      </p>
                    )}
                    <p className="text-sm text-[#0F766E] mt-1">
                      {item.price.toFixed(2)} DT
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.is_available
                        ? "bg-[#0F766E]/10 text-[#0F766E]"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.is_available ? "Disponible" : "Indisponible"}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="flex-1 border border-[#E7E5E4] text-[#1C1917] text-sm font-medium py-2 rounded-lg"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggle(item)}
                    className={`flex-1 text-sm font-medium py-2 rounded-lg ${
                      item.is_available
                        ? "border border-red-200 text-red-600"
                        : "border border-[#0F766E]/30 text-[#0F766E]"
                    }`}
                  >
                    {item.is_available ? "Marquer indisponible" : "Marquer disponible"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {showCreateForm && (
        <MenuItemForm
          categories={categories}
          onCreated={load}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editingItem && (
        <MenuItemEditModal
          item={editingItem}
          onUpdated={load}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}