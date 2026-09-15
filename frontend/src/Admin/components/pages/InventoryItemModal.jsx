import { useState } from "react";
import Modal from "../modal";
import { apiPost, apiPut } from "./adminApi";

const COMMON_UNITS = [
  "piece",
  "pack",
  "box",
  "bag",
  "bottle",
  "can",
  "cup",
  "lid",
  "kg",
  "g",
  "l",
  "ml",
];

function InventoryItemModal({ item, onClose, onSaved, showToast }) {
  const isEdit = Boolean(item);

  const [form, setForm] = useState({
    item_name: item?.item_name ?? "",
    unit: item?.unit ?? "piece",
    quantity: item?.quantity ?? "0",
    par_level: item?.par_level ?? "0",
  });
  const [saving, setSaving] = useState(false);

  const updateField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    if (!form.item_name.trim()) {
      showToast("Item name is required.", "error");
      return;
    }

    if (!form.unit.trim()) {
      showToast("Unit is required.", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        await apiPut("inventory.php", {
          inventory_id: item.inventory_id,
          item_name: form.item_name.trim(),
          unit: form.unit.trim(),
          par_level: Number(form.par_level || 0),
        });
        showToast("Inventory item updated.");
      } else {
        await apiPost("inventory.php", {
          item_name: form.item_name.trim(),
          unit: form.unit.trim(),
          quantity: Number(form.quantity || 0),
          par_level: Number(form.par_level || 0),
        });
        showToast("Inventory item added.");
      }

      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Inventory Item" : "Add Inventory Item"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            ITEM NAME
          </label>
          <input
            type="text"
            value={form.item_name}
            onChange={(e) => updateField("item_name", e.target.value)}
            placeholder="e.g. 16oz Plastic Cups"
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
              UNIT
            </label>
            <input
              list="unit-options"
              type="text"
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              placeholder="e.g. pack"
              className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
            />
            <datalist id="unit-options">
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
              MINIMUM STOCK LEVEL
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.par_level}
              onChange={(e) => updateField("par_level", e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {!isEdit && (
          <div>
            <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
              STARTING QUANTITY
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.quantity}
              onChange={(e) => updateField("quantity", e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
            />
          </div>
        )}

        {isEdit && (
          <p className="text-xs text-[#8a7863]">
            To change the on-hand quantity, use "Adjust Stock" instead so the
            change is recorded in the stock history.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-[#5a3e32] py-3 text-sm font-semibold text-white hover:bg-[#46281b] disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
        </button>
      </div>
    </Modal>
  );
}

export default InventoryItemModal;
