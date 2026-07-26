import { useCart } from "../store/cart";
import type { CategoryDTO } from "../types";

export default function MenuBrowser({ categories }: { categories: CategoryDTO[] }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <div className="px-4 py-4 space-y-6">
      {categories.map((cat) => (
        <section key={cat.id}>
          <h2 className="text-base font-semibold text-[#1C1917] mb-3">
            {cat.name_fr}
          </h2>
          <div className="space-y-3">
            {cat.items
              .filter((item) => item.is_available)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#E7E5E4] p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-[#1C1917]">{item.name_fr}</p>
                    {item.description_fr && (
                      <p className="text-sm text-[#78716C]">{item.description_fr}</p>
                    )}
                    <p className="text-sm text-[#0F766E] mt-1">
                      {item.price.toFixed(2)} DT
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addItem({
                        menuItemId: item.id,
                        nameFr: item.name_fr,
                        price: item.price,
                        quantity: 1,
                      })
                    }
                    className="bg-[#0F766E] text-white text-sm font-medium px-4 py-2 rounded-lg"
                  >
                    Ajouter
                  </button>
                </div>
              ))}
            {cat.items.filter((i) => i.is_available).length === 0 && (
              <p className="text-sm text-[#78716C]">Aucun produit disponible.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}