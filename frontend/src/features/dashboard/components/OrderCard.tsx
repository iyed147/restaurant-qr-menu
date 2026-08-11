import api from "../../../services/api";
import type { StaffOrder } from "../types";

const NEXT_STATUS: Record<string, string | null> = {
  sent: "preparing",
  preparing: "served",
  served: "completed",
  completed: null,
  cancelled: null,
};

const STATUS_LABELS: Record<string, string> = {
  sent: "Envoyée",
  preparing: "En préparation",
  served: "Servie",
  completed: "Terminée",
  cancelled: "Annulée",
};

const NEXT_ACTION_LABELS: Record<string, string> = {
  sent: "Démarrer la préparation",
  preparing: "Marquer servie",
  served: "Marquer terminée",
};

export default function OrderCard({
  order,
  onUpdated,
}: {
  order: StaffOrder;
  onUpdated: () => void;
}) {
  const next = NEXT_STATUS[order.status];

  const handleAdvance = async () => {
    if (!next) return;
    try {
      await api.patch(`/staff/orders/${order.id}/status`, { status: next });
      onUpdated();
    } catch {
      alert("Impossible de mettre à jour le statut.");
    }
  };

  return (
    <div className="bg-[#1F1B18] rounded-xl border border-[#2A241F] p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-[#F5F1E8]">Table {order.table_id}</p>
          <p className="text-xs text-[#A89F91]">Commande #{order.id}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#D4A94A]/15 text-[#D4A94A]">
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <ul className="text-sm text-[#F5F1E8] mb-3 space-y-1">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.name_fr}
            {item.note && <span className="text-[#A89F91]"> — {item.note}</span>}
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center">
        <span className="font-medium text-[#D4A94A]">{order.total.toFixed(2)} DT</span>
        {next && (
          <button
            onClick={handleAdvance}
            className="bg-[#D4A94A] text-[#141210] text-sm font-semibold px-3 py-2 rounded-lg"
          >
            {NEXT_ACTION_LABELS[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}