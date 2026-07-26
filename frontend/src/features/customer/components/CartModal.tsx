import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCart } from "../store/cart";
import { useCustomerSession } from "../store/customerSession";
import api from "../../../services/api";
import OrderStatusView from "./OrderStatusView";
import type { OrderDTO } from "../types";

export default function CartModal({ onClose }: { onClose: () => void }) {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const removeItem = useCart((s) => s.removeItem);
  const clearCart = useCart((s) => s.clear);
  const clientSessionId = useCustomerSession((s) => s.clientSessionId);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDTO | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<OrderDTO>("/orders", {
        client_session_id: clientSessionId,
        idempotency_key: uuidv4(),
        items: items.map((i) => ({
          menu_item_id: i.menuItemId,
          quantity: i.quantity,
          note: i.note,
        })),
      });
      setOrder(res.data);
      clearCart();
    } catch {
      setError("Un article n'est plus disponible. Vérifiez votre panier.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return <OrderStatusView order={order} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-20">
      <div className="w-full bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1C1917]">Votre commande</h2>
          <button onClick={onClose} className="text-[#78716C]">
            Fermer
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between items-center">
              <div>
                <p className="text-[#1C1917]">
                  {item.quantity}× {item.nameFr}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#78716C]">
                  {(item.price * item.quantity).toFixed(2)} DT
                </span>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-red-600 text-sm"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E7E5E4] pt-3 flex justify-between font-semibold text-[#1C1917] mb-4">
          <span>Total</span>
          <span>{total.toFixed(2)} DT</span>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Envoi…" : "Confirmer la commande"}
        </button>
      </div>
    </div>
  );
}