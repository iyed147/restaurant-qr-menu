import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import { useOrdersSocket } from "../hooks/useOrdersSocket";
import OrderCard from "./OrderCard";
import type { StaffOrder } from "../types";

const RESTAURANT_ID = 1; // TODO: rendre dynamique multi-restaurant plus tard

export default function OrdersTab() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    api
      .get<StaffOrder[]>(`/staff/orders?restaurant_id=${RESTAURANT_ID}`)
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const { connected } = useOrdersSocket(RESTAURANT_ID, (event) => {
    if (event.type === "order_created" || event.type === "order_status_updated") {
      fetchOrders();
    }
  });

  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled"
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"}`}
        />
        <span className="text-xs text-[#78716C]">
          {connected ? "Connecté en temps réel" : "Déconnecté"}
        </span>
      </div>

      {loading ? (
        <p className="text-[#78716C]">Chargement…</p>
      ) : activeOrders.length === 0 ? (
        <p className="text-[#78716C]">Aucune commande en cours.</p>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  );
}