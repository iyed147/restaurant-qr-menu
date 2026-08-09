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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
        <p className="text-[#78716C] text-center">
          QR Code invalide. Merci de scanner le QR posé sur votre table.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <p className="text-[#78716C]">Chargement du menu…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
        <p className="text-red-600 text-center">{error}</p>
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
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      <header className="bg-white border-b border-[#E7E5E4] px-4 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917]">
            Table {session.tableNumber}
          </h1>
          <p className="text-sm text-[#78716C]">
            Bonjour {session.prenom} {session.nom}
          </p>
        </div>

        {session.lastOrderStatus && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              session.lastOrderStatus === "completed"
                ? "bg-[#0F766E]/10 text-[#0F766E]"
                : session.lastOrderStatus === "cancelled"
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-700"
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