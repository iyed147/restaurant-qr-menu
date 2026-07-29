import { useAuthStore } from "../../auth/store/authStore";
import { useEffect, useState, useCallback } from "react";
import { listUsers, updateUserRole } from "../services/usersApi";
import type { StaffUserDTO } from "../services/usersApi";
import UserCreateForm from "./UserCreateForm";

const RESTAURANT_ID = 1;

const ROLE_LABELS: Record<string, string> = {
  employe: "Employé",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function UsersTab() {
  
  const currentUserId = useAuthStore((s) => s.userId);  
  const [users, setUsers] = useState<StaffUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = useCallback(() => {
    listUsers(RESTAURANT_ID)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleRole = async (user: StaffUserDTO) => {
    const newRole = user.role === "admin" ? "employe" : "admin";
    if (
      !confirm(
        `Changer le rôle de ${user.prenom} ${user.nom} en "${ROLE_LABELS[newRole]}" ?`
      )
    )
      return;
    try {
      await updateUserRole(user.id, newRole as "employe" | "admin");
      load();
    } catch {
      alert("Impossible de changer le rôle.");
    }
  };

  if (loading) return <div className="p-4 text-[#78716C]">Chargement…</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium mb-6"
      >
        + Ajouter un employé
      </button>

      {users.length === 0 ? (
        <p className="text-[#78716C]">Aucun compte pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-[#E7E5E4] p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#1C1917]">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-sm text-[#78716C]">{user.email}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                    user.role === "admin" || user.role === "super_admin"
                      ? "bg-[#0F766E]/10 text-[#0F766E]"
                      : "bg-[#78716C]/10 text-[#78716C]"
                  }`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              {user.role !== "super_admin" && user.id !== currentUserId && (
                <button
                  onClick={() => handleToggleRole(user)}
                  className="border border-[#E7E5E4] text-[#1C1917] text-sm font-medium px-3 py-2 rounded-lg"
                >
                  {user.role === "admin" ? "Rétrograder" : "Promouvoir admin"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <UserCreateForm onCreated={load} onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}