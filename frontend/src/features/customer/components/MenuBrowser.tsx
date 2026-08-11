import { useCart } from "../store/cart";
import type { CategoryDTO } from "../types";

const CATEGORY_ICONS: Record<string, string> = {
  boissons: "☕",
  drinks: "☕",
  desserts: "🍰",
  plats: "🍽️",
  entrées: "🥗",
  entrees: "🥗",
};

function getIcon(nameFr: string) {
  const key = nameFr.toLowerCase();
  return CATEGORY_ICONS[key] || "🍴";
}

export default function MenuBrowser({ categories }: { categories: CategoryDTO[] }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <div className="px-4 py-6 space-y-8">
      {categories.map((cat, catIndex) => (
        <section
          key={cat.id}
          className="animate-fade-in"
          style={{ animationDelay: `${catIndex * 60}ms`, animationFillMode: "backwards" }}
        >
          <h2
            className="text-lg font-semibold text-[#D4A94A] mb-4 tracking-wide flex items-center gap-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span>{getIcon(cat.name_fr)}</span>
            {cat.name_fr}
          </h2>
          <div className="space-y-3">
            {cat.items
              .filter((item) => item.is_available)
              .map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="bg-[#1F1B18] rounded-xl border border-[#2A241F] p-4 flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${catIndex * 60 + itemIndex * 40}ms`, animationFillMode: "backwards" }}
                >
                  <div className="pr-3">
                    <p className="font-medium text-[#F5F1E8]">{item.name_fr}</p>
                    {item.description_fr && (
                      <p className="text-sm text-[#A89F91] mt-0.5">
                        {item.description_fr}
                      </p>
                    )}
                    <p className="text-sm text-[#D4A94A] font-semibold mt-1.5">
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
                    className="bg-[#D4A94A] text-[#141210] text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap active:scale-95 transition-transform"
                  >
                    Ajouter
                  </button>
                </div>
              ))}
            {cat.items.filter((i) => i.is_available).length === 0 && (
              <p className="text-sm text-[#A89F91]">Aucun produit disponible.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}