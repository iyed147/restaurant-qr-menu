import { useEffect, useState } from "react";
import { useOrdersSocket } from "../../../shared/hooks/useOrdersSocket";
import api from "../../../services/api";
import type { OrderDTO } from "../types";
import OrderEditModal from "./OrderEditModal";
import { useCart } from "../store/cart";
import { useCustomerSession } from "../store/customerSession";

const STATUS_LABELS: Record<string, string> = {
  sent: "Commande envoyée",
  preparing: "En préparation",
  served: "Servie",
  completed: "Terminée",
  cancelled: "Annulée",
};

const EDIT_WINDOW_SECONDS = 30;

export default function OrderStatusView({
  order,
  createdAt,
  onClose,
}: {
  order: OrderDTO;
  createdAt: number;
  onClose: () => void;
}) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const clearCart = useCart((s) => s.clear);
  const setLastOrder = useCustomerSession((s) => s.setLastOrder);
  const clearLastOrder = useCustomerSession((s) => s.clearLastOrder);

  useOrdersSocket(order.restaurant_id, (event) => {
    if (event.order_id !== currentOrder.id) return;

    if (event.type === "order_status_updated") {
      setCurrentOrder((prev) => ({ ...prev, status: event.status }));
      setLastOrder(currentOrder.id, event.status);
    } else if (event.type === "order_updated" && event.order) {
      setCurrentOrder(event.order);
      setLastOrder(event.order.id, event.order.status);
    } else if (event.type === "order_cancelled") {
      setCancelled(true);
      clearLastOrder();
    }
  });

  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - createdAt) / 1000;
      const remaining = Math.max(0, Math.ceil(EDIT_WINDOW_SECONDS - elapsed));
      setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const canEdit = secondsLeft > 0 && currentOrder.status === "sent";

  const handleCancel = async () => {
    if (!confirm("Annuler cette commande ?")) return;
    setCancelling(true);
    try {
      await api.delete(`/orders/${currentOrder.id}`);
      setCancelled(true);
      clearLastOrder();
    } catch {
      alert("Impossible d'annuler (délai peut-être expiré).");
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnToMenu = () => {
    clearCart();
    onClose();
  };

  if (cancelled) {
    return (
      <div className="fixed inset-0 bg-white z-30 flex flex-col items-center justify-center px-4">
        <h2 className="text-xl font-semibold text-[#1C1917] mb-1">
          Commande annulée
        </h2>
        <button
          onClick={handleReturnToMenu}
          className="bg-[#0F766E] text-white px-6 py-3 rounded-lg font-medium mt-6"
        >
          Retour au menu
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-30 flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#0F766E]/10 flex items-center justify-center mb-4">
        <span className="text-2xl">✓</span>
      </div>
      <h2 className="text-xl font-semibold text-[#1C1917] mb-1">
        {STATUS_LABELS[currentOrder.status] || currentOrder.status}
      </h2>
      <p className="text-sm text-[#78716C] mb-6">
        Total : {currentOrder.total.toFixed(2)} DT
      </p>

      {canEdit && (
        <div className="w-full max-w-xs mb-6">
          <p className="text-center text-sm text-[#78716C] mb-3">
            Modification possible pendant {secondsLeft}s
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="flex-1 border border-[#E7E5E4] text-[#1C1917] py-3 rounded-lg font-medium"
            >
              Modifier
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 border border-red-200 text-red-600 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {cancelling ? "…" : "Annuler"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleReturnToMenu}
        className="bg-[#0F766E] text-white px-6 py-3 rounded-lg font-medium"
      >
        Retour au menu
      </button>

      {showEdit && (
        <OrderEditModal
          order={currentOrder}
          onUpdated={(updated) => {
            setCurrentOrder(updated);
            setShowEdit(false);
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}