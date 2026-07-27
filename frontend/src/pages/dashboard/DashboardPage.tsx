import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import OrdersTab from "../../features/dashboard/components/OrdersTab";
import MenuTab from "../../features/dashboard/components/MenuTab";
import TablesTab from "../../features/dashboard/components/TablesTab";
type Tab = "orders" | "menu" | "tables" | "users";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>("orders");

  const isAdmin = role === "admin" || role === "super_admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-white border-b border-[#E7E5E4] px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-[#1C1917]">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-[#78716C] border border-[#E7E5E4] px-3 py-1.5 rounded-lg"
        >
          Déconnexion
        </button>
      </header>

      <nav className="bg-white border-b border-[#E7E5E4] px-4 flex gap-4 overflow-x-auto">
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
          Commandes
        </TabButton>
        {isAdmin && (
          <>
            <TabButton active={tab === "menu"} onClick={() => setTab("menu")}>
              Menu
            </TabButton>
            <TabButton active={tab === "tables"} onClick={() => setTab("tables")}>
              Tables
            </TabButton>
            <TabButton active={tab === "users"} onClick={() => setTab("users")}>
              Employés
            </TabButton>
          </>
        )}
      </nav>

      {tab === "orders" && <OrdersTab />}
      {tab === "menu" && isAdmin && <MenuTab />}
      {tab === "tables" && isAdmin && <TablesTab />}
      {tab === "users" && isAdmin && (
        <div className="p-4 text-[#78716C]">Gestion des employés — à construire</div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
        active
          ? "border-[#0F766E] text-[#0F766E]"
          : "border-transparent text-[#78716C]"
      }`}
    >
      {children}
    </button>
  );
}