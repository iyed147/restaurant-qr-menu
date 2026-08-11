import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useOrdersSocket } from "../../shared/hooks/useOrdersSocket";
import { useCustomerSession } from "../../features/customer/store/customerSession";
import StartSessionForm from "../../features/customer/components/StartSessionForm";
import MenuBrowser from "../../features/customer/components/MenuBrowser";
import CartBar from "../../features/customer/components/CartBar";
import type { CategoryDTO } from "../../features/customer/types";

export default function CustomerMenuPage() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableToken = searchParams.get("table_token");

  const session = useCustomerSession();

  useEffect(() => {
    if (session.clientSessionId && session.isExpired()) {
      session.clear();
    }
  }, [session]);

  useOrdersSocket(Number(restaurantId), (event) => {
    if (event.order_id === session.lastOrderId) {
      if (event.type === "order_status_updated") {
        session.setLastOrder(event.order_id, event.status);
      } else if (event.type === "order_cancelled") {
        session.clearLastOrder();
      }
    }
  });

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    api
      .get<CategoryDTO[]>(`/menu/${restaurantId}`)
      .then((res) => setCategories(res.data))
      .catch(() => setError("Impossible de charger le menu."))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (!tableToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141210] px-4">
        <p className="text-[#A89F91] text-center">
          QR Code invalide. Merci de scanner le QR posé sur votre table.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
    <div className="min-h-screen bg-[#141210] px-4 py-6">
      <div className="skeleton h-6 w-32 rounded-lg mb-6" />
      {[1, 2].map((i) => (
        <div key={i} className="mb-8">
          <div className="skeleton h-5 w-24 rounded-lg mb-4" />
          {[1, 2, 3].map((j) => (
            <div
            key={j}
            className="bg-[#1F1B18] rounded-xl border border-[#2A241F] p-4 mb-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="skeleton h-4 w-28 rounded mb-2" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="skeleton h-9 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141210] px-4">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!session.clientSessionId) {
    return (
      <StartSessionForm
        restaurantId={Number(restaurantId)}
        tableToken={tableToken}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#141210] pb-24">
      <header className="bg-[#1F1B18] border-b border-[#2A241F] px-4 py-5 sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Table {session.tableNumber}
          </h1>
          <p className="text-sm text-[#A89F91]">
            Bonjour {session.prenom} {session.nom}
          </p>
        </div>

        {session.lastOrderStatus && (
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              session.lastOrderStatus === "completed"
                ? "bg-[#D4A94A]/15 text-[#D4A94A]"
                : session.lastOrderStatus === "cancelled"
                ? "bg-red-500/15 text-red-400"
                : "bg-amber-500/15 text-amber-400"
            }`}
          >
            {
              {
                sent: "Envoyée",
                preparing: "En préparation",
                served: "Servie",
                completed: "Terminée",
                cancelled: "Annulée",
              }[session.lastOrderStatus]
            }
          </span>
        )}
      </header>

      <MenuBrowser categories={categories} />
      <CartBar />
    </div>
  );
}