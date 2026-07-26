export interface MenuItemDTO {
  id: number;
  category_id: number;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

export interface CategoryDTO {
  id: number;
  name_fr: string;
  name_en: string;
  items: MenuItemDTO[];
}

export interface OrderDTO {
  id: number;
  restaurant_id: number;
  table_id: number;
  client_session_id: number;
  status: string;
  total: number;
  idempotency_key: string;
  items: Array<{
    id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    line_total: number;
    note: string | null;
  }>;
}