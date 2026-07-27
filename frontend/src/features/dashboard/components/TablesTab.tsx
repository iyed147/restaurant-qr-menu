import { useEffect, useState, useCallback } from "react";
import { listTables, setTableActive } from "../services/tablesApi";
import type { TableDTO } from "../services/tablesApi";
import TableCreateForm from "./TableCreateForm";
import TableQRModal from "./TableQRModal";

const RESTAURANT_ID = 1;

export default function TablesTab() {
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [qrTable, setQrTable] = useState<TableDTO | null>(null);

  const load = useCallback(() => {
    listTables(RESTAURANT_ID)
      .then((res) => setTables(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (table: TableDTO) => {
    try {
      await setTableActive(table.id, !table.is_active);
      load();
    } catch {
      alert("Impossible de changer le statut de la table.");
    }
  };

  if (loading) return <div className="p-4 text-[#78716C]">Chargement…</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-medium mb-6"
      >
        + Ajouter une table
      </button>

      {tables.length === 0 ? (
        <p className="text-[#78716C]">Aucune table pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-xl border border-[#E7E5E4] p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#1C1917]">
                  Table {table.table_number}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    table.is_active
                      ? "bg-[#0F766E]/10 text-[#0F766E]"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {table.is_active ? "Active" : "Désactivée"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setQrTable(table)}
                  className="border border-[#E7E5E4] text-[#1C1917] text-sm font-medium px-3 py-2 rounded-lg"
                >
                  QR Code
                </button>
                <button
                  onClick={() => handleToggle(table)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg ${
                    table.is_active
                      ? "border border-red-200 text-red-600"
                      : "border border-[#0F766E]/30 text-[#0F766E]"
                  }`}
                >
                  {table.is_active ? "Désactiver" : "Activer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <TableCreateForm onCreated={load} onClose={() => setShowCreateForm(false)} />
      )}

      {qrTable && (
        <TableQRModal
          table={qrTable}
          restaurantId={RESTAURANT_ID}
          onClose={() => setQrTable(null)}
        />
      )}
    </div>
  );
}