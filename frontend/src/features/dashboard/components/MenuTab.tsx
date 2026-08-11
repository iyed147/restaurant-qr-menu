import { useEffect, useState, useCallback } from "react";
import { fetchFullMenu, toggleAvailability, deleteMenuItem, deleteCategory } from "../services/menuApi";
import MenuItemForm from "./MenuItemForm";
import MenuItemEditModal from "./MenuItemEditModal";
import CategoryCreateForm from "./CategoryCreateForm";
import type { CategoryDTO, MenuItemDTO } from "../../customer/types";

const RESTAURANT_ID = 1;

export default function MenuTab() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
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

  const handleDeleteItem = async (item: MenuItemDTO) => {
    if (!confirm(`Supprimer "${item.name_fr}" ?`)) return;
    try {
      await deleteMenuItem(item.id);
      load();
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Impossible de supprimer ce produit.";
      alert(message);
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Supprimer la catégorie "${categoryName}" ?`)) return;
    try {
      await deleteCategory(categoryId);
      load();
    } catch {
      alert("Impossible de supprimer cette catégorie (contient peut-être des produits).");
    }
  };

  if (loading) {
    return <div className="p-4 text-[#A89F91]">Chargement…</div>;
  }

  return (
    <div className="p-4">
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex-1 bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold"
        >
          + Produit
        </button>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="flex-1 bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold"
        >
          + Catégorie
        </button>
      </div>

      {categories.length === 0 && (
        <p className="text-[#A89F91]">Aucune catégorie pour le moment.</p>
      )}

      {categories.map((cat) => (
        <section key={cat.id} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-base font-semibold text-[#D4A94A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {cat.name_fr}
            </h2>
            <button
              onClick={() => handleDeleteCategory(cat.id, cat.name_fr)}
              className="text-xs text-red-400 border border-red-500/30 px-2 py-1 rounded-lg"
            >
              Supprimer catégorie
            </button>
          </div>

          <div className="space-y-3">
            {cat.items.length === 0 && (
              <p className="text-sm text-[#A89F91]">Aucun produit.</p>
            )}

            {cat.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#1F1B18] rounded-xl border border-[#2A241F] p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-[#F5F1E8]">{item.name_fr}</p>
                    {item.description_fr && (
                      <p className="text-sm text-[#A89F91]">{item.description_fr}</p>
                    )}
                    <p className="text-sm text-[#D4A94A] font-semibold mt-1">
                      {item.price.toFixed(2)} DT
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.is_available
                        ? "bg-[#D4A94A]/15 text-[#D4A94A]"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {item.is_available ? "Disponible" : "Indisponible"}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="flex-1 border border-[#2A241F] text-[#F5F1E8] text-sm font-medium py-2 rounded-lg"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggle(item)}
                    className={`flex-1 text-sm font-medium py-2 rounded-lg ${
                      item.is_available
                        ? "border border-red-500/30 text-red-400"
                        : "border border-[#D4A94A]/30 text-[#D4A94A]"
                    }`}
                  >
                    {item.is_available ? "Marquer indisponible" : "Marquer disponible"}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="border border-red-500/30 text-red-400 text-sm font-medium px-3 py-2 rounded-lg"
                  >
                    🗑
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
      {showCategoryForm && (
        <CategoryCreateForm onCreated={load} onClose={() => setShowCategoryForm(false)} />
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