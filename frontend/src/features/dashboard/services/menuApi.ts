import api from "../../../services/api";
import type { CategoryDTO } from "../../customer/types";

export function fetchFullMenu(restaurantId: number) {
  return api.get<CategoryDTO[]>(`/menu/${restaurantId}?include_unavailable=true`);
}

export function createMenuItem(payload: {
  restaurant_id: number;
  category_id: number;
  name_fr: string;
  name_en: string;
  description_fr?: string;
  description_en?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}) {
  return api.post("/admin/menu-items", payload);
}

export function updateMenuItem(
  itemId: number,
  payload: Partial<{
    name_fr: string;
    name_en: string;
    description_fr: string;
    description_en: string;
    price: number;
    image_url: string;
  }>
) {
  return api.patch(`/admin/menu-items/${itemId}`, payload);
}

export function toggleAvailability(itemId: number, is_available: boolean) {
  return api.patch(`/admin/menu-items/${itemId}/availability`, { is_available });
}