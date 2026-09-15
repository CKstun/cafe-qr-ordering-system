import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "./adminApi";
import ConfirmDialog from "../confirmDialog";
import InventoryItemModal from "./InventoryItemModal";
import StockAdjustModal from "./stockAdjustModal";
import StockHistoryModal from "./StockHistoryModal";

function Inventory({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await apiGet("inventory.php"));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    try {
      await apiDelete(
        `inventory.php?inventory_id=${pendingDelete.inventory_id}`,
      );
      showToast("Inventory item deleted.");
      setPendingDelete(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = items.filter((i) => i.status === "low").length;

  return (
    <div>
      {lowStockCount > 0 && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ {lowStockCount} item{lowStockCount === 1 ? " is" : "s are"} at or
          below its minimum stock level.
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-64 rounded-xl border border-[#e6d8c3] bg-white px-4 py-2.5 text-sm outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
        </select>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ml-auto rounded-xl bg-[#5a3e32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#46281b]"
        >
          + Add Inventory Item
        </button>
      </div>

      {loading && (
        <p className="text-sm text-[#8a7863]">Loading inventory...</p>
      )}

      {!loading && filteredItems.length === 0 && (
        <p className="py-12 text-center text-sm text-[#8a7863]">
          No inventory items found.
        </p>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7eee1] text-[11px] uppercase tracking-wide text-[#9c8873]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Min. Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.inventory_id}
                  className="border-t border-[#e6d8c3]"
                >
                  <td className="px-4 py-3 font-medium text-[#3a2a1e]">
                    {item.item_name}
                  </td>
                  <td className="px-4 py-3 text-[#8a7863]">{item.unit}</td>
                  <td className="px-4 py-3 text-[#3a2a1e]">{item.quantity}</td>
                  <td className="px-4 py-3 text-[#8a7863]">{item.par_level}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        item.status === "low"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status === "low" ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjustingItem(item)}
                        className="rounded-lg bg-[#5a3e32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#46281b]"
                      >
                        Adjust Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryItem(item)}
                        className="rounded-lg border border-[#e6d8c3] bg-white px-3 py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                      >
                        History
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="rounded-lg border border-[#e6d8c3] bg-white px-3 py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || editingItem) && (
        <InventoryItemModal
          item={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSaved={load}
          showToast={showToast}
        />
      )}

      {adjustingItem && (
        <StockAdjustModal
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onSaved={load}
          showToast={showToast}
        />
      )}

      {historyItem && (
        <StockHistoryModal
          item={historyItem}
          onClose={() => setHistoryItem(null)}
          showToast={showToast}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this inventory item?"
          message={`"${pendingDelete.item_name}" and its stock history will be permanently deleted.`}
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default Inventory;
