export interface StaffOrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  note: string | null;
}

export interface StaffOrder {
  id: number;
  restaurant_id: number;
  table_id: number;
  client_session_id: number;
  status: "sent" | "preparing" | "served" | "completed" | "cancelled";
  total: number;
  idempotency_key: string;
  items: StaffOrderItem[];
}