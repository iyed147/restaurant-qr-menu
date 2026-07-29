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
    <div className="fixed inset-0 bg-black/40 flex items-end z-40">
      <div className="w-full bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1C1917]">Modifier la commande</h2>
          <button onClick={onClose} className="text-[#78716C]">
            Fermer
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {order.items.map((originalItem) => {
            const current = items.find((i) => i.menu_item_id === originalItem.menu_item_id);
            const qty = current?.quantity ?? 0;
            return (
              <div
                key={originalItem.menu_item_id}
                className="flex justify-between items-center"
              >
                <span className="text-[#1C1917]">{originalItem.name_fr}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQty(originalItem.menu_item_id, -1)}
                    className="w-8 h-8 rounded-lg border border-[#E7E5E4] text-[#1C1917]"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-[#1C1917]">{qty}</span>
                  <button
                    onClick={() => updateQty(originalItem.menu_item_id, 1)}
                    className="w-8 h-8 rounded-lg border border-[#E7E5E4] text-[#1C1917]"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}