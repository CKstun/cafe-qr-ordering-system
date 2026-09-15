import { useState } from "react";
import Modal from "../modal";
import { apiPost } from "./adminApi";

const TYPES = [
  { value: "stock-in", label: "Stock In (new stock received)" },
  { value: "waste", label: "Waste / Used up" },
  { value: "adjustment", label: "Correction (set exact quantity)" },
];

function StockAdjustModal({ item, onClose, onSaved, showToast }) {
  const [type, setType] = useState("stock-in");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const helperText = {
    "stock-in": `Amount of ${item.unit}(s) being added to current stock.`,
    waste: `Amount of ${item.unit}(s) being removed (spoiled, wasted, etc).`,
    adjustment: `The correct on-hand quantity after a physical count.`,
  }[type];

  const handleSubmit = async () => {
    if (quantity === "" || Number(quantity) < 0) {
      showToast("Please enter a valid quantity.", "error");
      return;
    }

    try {
      setSaving(true);

      const result = await apiPost("inventory_stock.php", {
        inventory_id: item.inventory_id,
        transaction_type: type,
        quantity: Number(quantity),
        notes: notes.trim() || null,
      });

      showToast(
        result.is_low_stock
          ? `Stock updated. Warning: ${item.item_name} is now at or below minimum stock.`
          : "Stock updated.",
      );

      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Adjust Stock · ${item.item_name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl bg-[#f7eee1] px-4 py-3 text-sm text-[#5a3e32]">
          Current stock:{" "}
          <strong>
            {item.quantity} {item.unit}
          </strong>{" "}
          · Minimum: {item.par_level} {item.unit}
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            ADJUSTMENT TYPE
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            {type === "adjustment" ? "NEW QUANTITY" : "QUANTITY"} ({item.unit})
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          />
          <p className="mt-1 text-xs text-[#9c8873]">{helperText}</p>
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            NOTES (OPTIONAL)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Delivery from supplier"
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="w-full rounded-xl bg-[#5a3e32] py-3 text-sm font-semibold text-white hover:bg-[#46281b] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Stock Update"}
        </button>
      </div>
    </Modal>
  );
}

export default StockAdjustModal;
