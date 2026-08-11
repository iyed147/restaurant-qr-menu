import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import OrdersTab from "../../features/dashboard/components/OrdersTab";
import MenuTab from "../../features/dashboard/components/MenuTab";
import TablesTab from "../../features/dashboard/components/TablesTab";
import UsersTab from "../../features/dashboard/components/UsersTab";

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
    <div className="min-h-screen bg-[#141210]">
      <header className="bg-[#1F1B18] border-b border-[#2A241F] px-4 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#D4A94A]/40">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1
            className="text-lg font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#A89F91] border border-[#2A241F] px-3 py-1.5 rounded-lg"
        >
          Déconnexion
        </button>
      </header>

      <nav className="bg-[#1F1B18] border-b border-[#2A241F] px-4 flex gap-4 overflow-x-auto">
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
      {tab === "users" && isAdmin && <UsersTab />}
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
      className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
        active
          ? "border-[#D4A94A] text-[#D4A94A]"
          : "border-transparent text-[#A89F91]"
      }`}
    >
      {children}
    </button>
  );
}