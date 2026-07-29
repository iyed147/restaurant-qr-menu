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
      await api.patch(`/staff/orders/${order.id}/status`, {
        status: next,
      });
      onUpdated();
    } catch {
      alert("Impossible de mettre à jour le statut.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-[#1C1917]">
            Table {order.table_id}
          </p>
          <p className="text-xs text-[#78716C]">
            Commande #{order.id}
          </p>
        </div>

        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#0F766E]/10 text-[#0F766E]">
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <ul className="text-sm text-[#1C1917] mb-3 space-y-1">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.name_fr}
            {item.note && (
              <span className="text-[#78716C]">
                {" "}
                — {item.note}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center">
        <span className="font-medium text-[#1C1917]">
          {order.total.toFixed(2)} DT
        </span>

        {next && (
          <button
            onClick={handleAdvance}
            className="bg-[#0F766E] text-white text-sm font-medium px-3 py-2 rounded-lg"
          >
            {NEXT_ACTION_LABELS[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}