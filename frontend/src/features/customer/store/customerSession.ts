import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const SESSION_MAX_AGE_MS = 3 * 60 * 60 * 1000; // 3h

interface CustomerSession {
  clientSessionId: number | null;
  restaurantId: number | null;
  tableNumber: number | null;
  nom: string;
  prenom: string;
  lastOrderId: number | null;
  lastOrderStatus: string | null;
  sessionStartedAt: number | null;
  setSession: (data: {
    clientSessionId: number;
    restaurantId: number;
    tableNumber: number;
    nom: string;
    prenom: string;
  }) => void;
  setLastOrder: (orderId: number, status: string) => void;
  clearLastOrder: () => void;
  clear: () => void;
  isExpired: () => boolean;
}

export const useCustomerSession = create<CustomerSession>()(
  persist(
    (set, get) => ({
      clientSessionId: null,
      restaurantId: null,
      tableNumber: null,
      nom: "",
      prenom: "",
      lastOrderId: null,
      lastOrderStatus: null,
      sessionStartedAt: null,
      setSession: (data) =>
        set({
          clientSessionId: data.clientSessionId,
          restaurantId: data.restaurantId,
          tableNumber: data.tableNumber,
          nom: data.nom,
          prenom: data.prenom,
          sessionStartedAt: Date.now(),
        }),
      setLastOrder: (orderId, status) =>
        set({ lastOrderId: orderId, lastOrderStatus: status }),
      clearLastOrder: () =>
        set({ lastOrderId: null, lastOrderStatus: null }),
      clear: () =>
        set({
          clientSessionId: null,
          restaurantId: null,
          tableNumber: null,
          nom: "",
          prenom: "",
          lastOrderId: null,
          lastOrderStatus: null,
          sessionStartedAt: null,
        }),
      isExpired: () => {
        const startedAt = get().sessionStartedAt;
        if (!startedAt) return false;
        return Date.now() - startedAt > SESSION_MAX_AGE_MS;
      },
    }),
    {
      name: "customer-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);