import { useEffect, useState } from "react";
import Modal from "../modal";
import ConfirmDialog from "../confirmDialog";
import { apiGet, apiPost, apiDelete } from "./adminApi";

function IngredientsModal({ item, onClose, showToast }) {
  const [ingredients, setIngredients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [quantityRequired, setQuantityRequired] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [ingredientsData, inventoryData] = await Promise.all([
        apiGet(`ingredients.php?menu_item_id=${item.menu_item_id}`),
        apiGet("inventory.php"),
      ]);
      setIngredients(ingredientsData);
      setInventoryItems(inventoryData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [item.menu_item_id]);

  const linkedIds = new Set(ingredients.map((i) => i.inventory_id));
  const availableInventory = inventoryItems.filter(
    (i) => !linkedIds.has(i.inventory_id),
  );

  const handleAdd = async () => {
    if (!selectedInventoryId) {
      showToast("Please choose an inventory item.", "error");
      return;
    }
    if (!quantityRequired || Number(quantityRequired) <= 0) {
      showToast("Please enter a quantity used per order.", "error");
      return;
    }

    try {
      await apiPost("ingredients.php", {
        menu_item_id: item.menu_item_id,
        inventory_id: Number(selectedInventoryId),
        quantity_required: Number(quantityRequired),
      });
      showToast("Ingredient linked.");
      setSelectedInventoryId("");
      setQuantityRequired("");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiDelete(
        `ingredients.php?menu_item_ingredient_id=${pendingDelete}`,
      );
      showToast("Ingredient removed.");
      setPendingDelete(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <>
      <Modal
        title={`Recipe · ${item.product_name}`}
        onClose={onClose}
        maxWidth="max-w-lg"
      >
        <p className="text-xs text-[#8a7863]">
          Define which inventory items this product uses and how much per order.
          Stock is deducted automatically once the order is confirmed.
        </p>

        <div className="mt-4 rounded-xl bg-[#f7eee1] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#9c8873]">
                INVENTORY ITEM
              </label>
              <select
                value={selectedInventoryId}
                onChange={(e) => setSelectedInventoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="">Select item...</option>
                {availableInventory.map((inv) => (
                  <option key={inv.inventory_id} value={inv.inventory_id}>
                    {inv.item_name} ({inv.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9c8873]">
                QTY USED PER ORDER
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={quantityRequired}
                onChange={(e) => setQuantityRequired(e.target.value)}
                placeholder="e.g. 1"
                className="mt-1 w-full rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 w-full rounded-lg bg-[#5a3e32] py-2 text-xs font-semibold text-white hover:bg-[#46281b]"
          >
            + Link Ingredient
          </button>
        </div>

        <div className="mt-4">
          {loading && (
            <p className="text-sm text-[#8a7863]">Loading recipe...</p>
          )}

          {!loading && ingredients.length === 0 && (
            <p className="py-4 text-center text-sm text-[#8a7863]">
              No ingredients linked yet. This product won't affect inventory
              when ordered.
            </p>
          )}

          {!loading && ingredients.length > 0 && (
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div
                  key={ing.menu_item_ingredient_id}
                  className="flex items-center justify-between rounded-xl border border-[#e6d8c3] bg-white px-4 py-3"
                >
                  <div className="text-sm text-[#3a2a1e]">
                    {ing.item_name}{" "}
                    <span className="text-xs text-[#9c8873]">
                      · {ing.quantity_required} {ing.unit} / order
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPendingDelete(ing.menu_item_ingredient_id)
                    }
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {pendingDelete && (
        <ConfirmDialog
          title="Unlink this ingredient?"
          confirmLabel="Remove"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

export default IngredientsModal;
