import { useState } from "react";
import api from "../../../services/api";
import type { OrderDTO } from "../types";

export default function OrderEditModal({
  order,
  onUpdated,
  onClose,
}: {
  order: OrderDTO;
  onUpdated: (updated: OrderDTO) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState(
    order.items.map((i) => ({
      menu_item_id: i.menu_item_id,
      quantity: i.quantity,
      note: i.note ?? undefined,
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQty = (menuItemId: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.menu_item_id === menuItemId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setError("La commande ne peut pas être vide. Utilisez Annuler à la place.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.patch<OrderDTO>(`/orders/${order.id}`, { items });
      onUpdated(res.data);
    } catch {
      setError("Impossible de modifier (délai peut-être expiré, ou article indisponible).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-40">
      <div className="w-full bg-[#1F1B18] rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto border-t border-[#2A241F]">
        <div className="flex justify-between items-center mb-5">
          <h2
            className="text-lg font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Modifier la commande
          </h2>
          <button onClick={onClose} className="text-[#A89F91]">
            Fermer
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {order.items.map((originalItem) => {
            const current = items.find((i) => i.menu_item_id === originalItem.menu_item_id);
            const qty = current?.quantity ?? 0;
            return (
              <div
                key={originalItem.menu_item_id}
                className="flex justify-between items-center"
              >
                <span className="text-[#F5F1E8]">{originalItem.name_fr}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQty(originalItem.menu_item_id, -1)}
                    className="w-8 h-8 rounded-lg border border-[#2A241F] text-[#F5F1E8]"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-[#F5F1E8]">{qty}</span>
                  <button
                    onClick={() => updateQty(originalItem.menu_item_id, 1)}
                    className="w-8 h-8 rounded-lg border border-[#2A241F] text-[#F5F1E8]"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button
          onClick={handleSave}
          disabled={submitting}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}