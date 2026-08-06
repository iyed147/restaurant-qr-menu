import { useState } from "react";
import { useCart } from "../store/cart";
import CartModal from "./CartModal";

export default function CartBar() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E5E4] px-4 py-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium flex justify-between px-4"
        >
          <span>{items.reduce((n, i) => n + i.quantity, 0)} article(s)</span>
          <span>{total.toFixed(2)} DT</span>
        </button>
      </div>
      {showModal && <CartModal onClose={() => setShowModal(false)} />}
    </>
  );
}