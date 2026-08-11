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
  const clientSessionId = useCustomerSession((s) => s.clientSessionId);
  const setLastOrder = useCustomerSession((s) => s.setLastOrder);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [orderCreatedAt, setOrderCreatedAt] = useState<number>(0);

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
      setOrderCreatedAt(Date.now());
      setLastOrder(res.data.id, res.data.status);
    } catch {
      setError("Un article n'est plus disponible. Vérifiez votre panier.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return <OrderStatusView order={order} createdAt={orderCreatedAt} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-20">
      <div className="w-full bg-[#1F1B18] rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto border-t border-[#2A241F]">
        <div className="flex justify-between items-center mb-5">
          <h2
            className="text-lg font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Votre commande
          </h2>
          <button onClick={onClose} className="text-[#A89F91]">
            Fermer
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between items-center">
              <div>
                <p className="text-[#F5F1E8]">
                  {item.quantity}× {item.nameFr}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#A89F91]">
                  {(item.price * item.quantity).toFixed(2)} DT
                </span>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-red-400 text-sm"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2A241F] pt-4 flex justify-between font-semibold text-[#F5F1E8] mb-5">
          <span>Total</span>
          <span className="text-[#D4A94A]">{total.toFixed(2)} DT</span>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Envoi…" : "Confirmer la commande"}
        </button>
      </div>
    </div>
  );
}