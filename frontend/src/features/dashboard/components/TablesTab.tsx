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

  if (loading) return <div className="p-4 text-[#A89F91]">Chargement…</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full bg-[#D4A94A] text-[#141210] py-3 rounded-lg font-semibold mb-6"
      >
        + Ajouter une table
      </button>

      {tables.length === 0 ? (
        <p className="text-[#A89F91]">Aucune table pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-[#1F1B18] rounded-xl border border-[#2A241F] p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#F5F1E8]">
                  Table {table.table_number}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    table.is_active
                      ? "bg-[#D4A94A]/15 text-[#D4A94A]"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {table.is_active ? "Active" : "Désactivée"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setQrTable(table)}
                  className="border border-[#2A241F] text-[#F5F1E8] text-sm font-medium px-3 py-2 rounded-lg"
                >
                  QR Code
                </button>
                <button
                  onClick={() => handleToggle(table)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg ${
                    table.is_active
                      ? "border border-red-500/30 text-red-400"
                      : "border border-[#D4A94A]/30 text-[#D4A94A]"
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