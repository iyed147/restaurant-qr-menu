import api from "../../../services/api";

export interface TableDTO {
  id: number;
  table_number: number;
  table_token: string;
  is_active: boolean;
}

export function listTables(restaurantId: number) {
  return api.get<TableDTO[]>(`/admin/tables?restaurant_id=${restaurantId}`);
}

export function createTable(payload: { restaurant_id: number; table_number: number }) {
  return api.post<{ id: number; table_token: string; message: string }>(
    "/admin/tables",
    payload
  );
}

export function setTableActive(tableId: number, is_active: boolean) {
  return api.patch(`/admin/tables/${tableId}/active`, { is_active });
}