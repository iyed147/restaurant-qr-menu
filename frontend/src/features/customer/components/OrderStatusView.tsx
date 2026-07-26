import type { OrderDTO } from "../types";

const STATUS_LABELS: Record<string, string> = {
  sent: "Commande envoyée",
  preparing: "En préparation",
  served: "Servie",
  completed: "Terminée",
  cancelled: "Annulée",
};

export default function OrderStatusView({
  order,
  onClose,
}: {
  order: OrderDTO;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-white z-30 flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#0F766E]/10 flex items-center justify-center mb-4">
        <span className="text-2xl">✓</span>
      </div>
      <h2 className="text-xl font-semibold text-[#1C1917] mb-1">
        {STATUS_LABELS[order.status] || order.status}
      </h2>
      <p className="text-sm text-[#78716C] mb-6">
        Total : {order.total.toFixed(2)} DT
      </p>
      <button
        onClick={onClose}
        className="bg-[#0F766E] text-white px-6 py-3 rounded-lg font-medium"
      >
        Retour au menu
      </button>
    </div>
  );
}