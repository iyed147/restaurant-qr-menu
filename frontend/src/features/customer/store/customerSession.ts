import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CustomerSession {
  clientSessionId: number | null;
  restaurantId: number | null;
  tableNumber: number | null;
  nom: string;
  prenom: string;
  setSession: (data: {
    clientSessionId: number;
    restaurantId: number;
    tableNumber: number;
    nom: string;
    prenom: string;
  }) => void;
  clear: () => void;
}

export const useCustomerSession = create<CustomerSession>()(
  persist(
    (set) => ({
      clientSessionId: null,
      restaurantId: null,
      tableNumber: null,
      nom: "",
      prenom: "",
      setSession: (data) =>
        set({
          clientSessionId: data.clientSessionId,
          restaurantId: data.restaurantId,
          tableNumber: data.tableNumber,
          nom: data.nom,
          prenom: data.prenom,
        }),
      clear: () =>
        set({
          clientSessionId: null,
          restaurantId: null,
          tableNumber: null,
          nom: "",
          prenom: "",
        }),
    }),
    {
      name: "customer-session",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);