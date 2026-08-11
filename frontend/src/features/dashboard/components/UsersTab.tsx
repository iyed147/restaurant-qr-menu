import { useEffect, useState, useCallback } from "react";
import { listUsers, updateUserRole } from "../services/usersApi";
import type { StaffUserDTO } from "../services/usersApi";
import { useAuthStore } from "../../auth/store/authStore";
import UserCreateForm from "./UserCreateForm";

const RESTAURANT_ID = 1;

const ROLE_LABELS: Record<string, string> = {
  employe: "Employé",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function UsersTab() {
  const [users, setUsers] = useState<StaffUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const currentUserId = useAuthStore((s) => s.userId);

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
      !confirm(`Changer le rôle de ${user.prenom} ${user.nom} en "${ROLE_LABELS[newRole]}" ?`)
    )
      return;
    try {
      await updateUserRole(user.id, newRole as "employe" | "admin");
      load();
    } catch {
      alert("Impossible de changer le rôle.");
    }
  };

  if (loading) return <div className="p-4 text-[#A89F91]">Chargement…</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold mb-6"
      >
        + Ajouter un employé
      </button>

      {users.length === 0 ? (
        <p className="text-[#A89F91]">Aucun compte pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-[#1F1B18] rounded-xl border border-[#2A241F] p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#F5F1E8]">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-sm text-[#A89F91]">{user.email}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                    user.role === "admin" || user.role === "super_admin"
                      ? "bg-[#D4A94A]/15 text-[#D4A94A]"
                      : "bg-[#A89F91]/15 text-[#A89F91]"
                  }`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              {user.role !== "super_admin" && user.id !== currentUserId && (
                <button
                  onClick={() => handleToggleRole(user)}
                  className="border border-[#2A241F] text-[#F5F1E8] text-sm font-medium px-3 py-2 rounded-lg"
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