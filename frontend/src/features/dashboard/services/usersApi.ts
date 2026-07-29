import api from "../../../services/api";

export interface StaffUserDTO {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: "employe" | "admin" | "super_admin";
}

export function listUsers(restaurantId: number) {
  return api.get<StaffUserDTO[]>(`/admin/users?restaurant_id=${restaurantId}`);
}

export function createUser(payload: {
  restaurant_id: number;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: "employe" | "admin";
}) {
  return api.post("/admin/users", payload);
}

export function updateUserRole(userId: number, role: "employe" | "admin") {
  return api.patch(`/admin/users/${userId}/role`, { role });
}