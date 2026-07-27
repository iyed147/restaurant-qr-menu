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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm print:shadow-none">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-lg font-semibold text-[#1C1917]">
            QR — Table {table.table_number}
          </h2>
          <button onClick={onClose} className="text-[#78716C]">
            Fermer
          </button>
        </div>

        <div className="flex flex-col items-center py-4">
          <QRCodeSVG value={qrUrl} size={220} />
          <p className="mt-4 text-lg font-semibold text-[#1C1917]">
            Table {table.table_number}
          </p>
          <p className="text-xs text-[#78716C] mt-1 break-all text-center">
            {qrUrl}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium mt-4 print:hidden"
        >
          Imprimer
        </button>
      </div>
    </div>
  );
}