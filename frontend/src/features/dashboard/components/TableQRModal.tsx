import { QRCodeSVG } from "qrcode.react";
import type { TableDTO } from "../services/tablesApi";

export default function TableQRModal({
  table,
  restaurantId,
  onClose,
}: {
  table: TableDTO;
  restaurantId: number;
  onClose: () => void;
}) {
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const qrUrl = `${frontendUrl}/menu/${restaurantId}?table_token=${table.table_token}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-20 px-4">
      <div className="bg-[#1F1B18] rounded-2xl p-6 w-full max-w-sm border border-[#2A241F] print:shadow-none">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2
            className="text-lg font-semibold text-[#D4A94A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            QR — Table {table.table_number}
          </h2>
          <button onClick={onClose} className="text-[#A89F91]">
            Fermer
          </button>
        </div>

        <div className="flex flex-col items-center py-4 bg-[#F5F1E8] rounded-xl">
          <QRCodeSVG value={qrUrl} size={220} />
          <p className="mt-4 text-lg font-semibold text-[#141210]">
            Table {table.table_number}
          </p>
          <p className="text-xs text-[#2A241F] mt-1 break-all text-center px-4">
            {qrUrl}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold mt-4 print:hidden"
        >
          Imprimer
        </button>
      </div>
    </div>
  );
}