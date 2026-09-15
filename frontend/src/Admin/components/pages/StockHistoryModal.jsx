import { useEffect, useState } from "react";
import Modal from "../modal";
import { apiGet } from "./adminApi";

const TYPE_LABELS = {
  "stock-in": { label: "Stock In", classes: "bg-emerald-100 text-emerald-700" },
  waste: { label: "Waste", classes: "bg-red-100 text-red-700" },
  adjustment: { label: "Correction", classes: "bg-amber-100 text-amber-700" },
  sale: { label: "Sale", classes: "bg-[#efe1cc] text-[#5a3e32]" },
};

function StockHistoryModal({ item, onClose, showToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet(
          `inventory_transactions.php?inventory_id=${item.inventory_id}`,
        );
        setHistory(data);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [item.inventory_id]);

  return (
    <Modal
      title={`Stock History · ${item.item_name}`}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      {loading && <p className="text-sm text-[#8a7863]">Loading history...</p>}

      {!loading && history.length === 0 && (
        <p className="py-6 text-center text-sm text-[#8a7863]">
          No stock movements recorded yet.
        </p>
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-2">
          {history.map((entry) => {
            const meta = TYPE_LABELS[entry.transaction_type] || {
              label: entry.transaction_type,
              classes: "bg-gray-100 text-gray-700",
            };
            const qty = Number(entry.quantity);

            return (
              <div
                key={entry.transaction_id}
                className="flex items-center justify-between rounded-xl border border-[#e6d8c3] bg-white px-4 py-3"
              >
                <div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.classes}`}
                  >
                    {meta.label}
                  </span>
                  {entry.notes && (
                    <p className="mt-1 text-xs text-[#8a7863]">{entry.notes}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-[#9c8873]">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>

                <div
                  className={`text-sm font-semibold ${
                    qty >= 0 ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {qty >= 0 ? "+" : ""}
                  {qty} {entry.unit}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default StockHistoryModal;
