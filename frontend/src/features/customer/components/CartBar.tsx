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
      <div className="fixed bottom-0 left-0 right-0 bg-[#1F1B18] border-t border-[#2A241F] px-4 py-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold flex justify-between px-4"
        >
          <span>{items.reduce((n, i) => n + i.quantity, 0)} article(s)</span>
          <span>{total.toFixed(2)} DT</span>
        </button>
      </div>
      {showModal && <CartModal onClose={() => setShowModal(false)} />}
    </>
  );
}