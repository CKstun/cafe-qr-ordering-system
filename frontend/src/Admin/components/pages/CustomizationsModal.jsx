import { useEffect, useState } from "react";
import Modal from "../modal";
import ConfirmDialog from "../confirmDialog";
import { apiGet, apiPost, apiPut, apiDelete, peso } from "./adminApi";

const OPTION_TYPES = ["size", "sugar", "topping", "add-on", "other"];

const emptyForm = {
  option_name: "",
  option_group: "General",
  option_type: "other",
  price: "0",
  is_available: true,
};

function CustomizationsModal({ item, onClose, showToast }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet(
        `customizations.php?menu_item_id=${item.menu_item_id}`,
      );
      setOptions(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [item.menu_item_id]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (option) => {
    setEditingId(option.customization_id);
    setForm({
      option_name: option.option_name,
      option_group: option.option_group,
      option_type: option.option_type,
      price: option.price,
      is_available: Boolean(Number(option.is_available)),
    });
  };

  const handleSubmit = async () => {
    if (!form.option_name.trim()) {
      showToast("Option name is required.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiPut("customizations.php", {
          customization_id: editingId,
          ...form,
          price: Number(form.price || 0),
        });
        showToast("Option updated.");
      } else {
        await apiPost("customizations.php", {
          menu_item_id: item.menu_item_id,
          ...form,
          price: Number(form.price || 0),
        });
        showToast("Option added.");
      }

      resetForm();
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const toggleAvailability = async (option) => {
    try {
      await apiPut("customizations.php", {
        customization_id: option.customization_id,
        is_available: !Number(option.is_available),
      });
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiDelete(`customizations.php?customization_id=${pendingDelete}`);
      showToast("Option removed.");
      setPendingDelete(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <>
      <Modal
        title={`Customization Options · ${item.product_name}`}
        onClose={onClose}
        maxWidth="max-w-2xl"
      >
        {/* ADD / EDIT FORM */}
        <div className="rounded-xl bg-[#f7eee1] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#9c8873]">
                OPTION NAME
              </label>
              <input
                type="text"
                value={form.option_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, option_name: e.target.value }))
                }
                placeholder="e.g. 16oz Regular"
                className="mt-1 w-full rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9c8873]">
                GROUP
              </label>
              <input
                type="text"
                value={form.option_group}
                onChange={(e) =>
                  setForm((f) => ({ ...f, option_group: e.target.value }))
                }
                placeholder="e.g. Size, Flavor, Add-ons"
                className="mt-1 w-full rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9c8873]">
                TYPE
              </label>
              <select
                value={form.option_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, option_type: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
              >
                {OPTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9c8873]">
                PRICE (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#3a2a1e]">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_available: e.target.checked }))
                }
              />
              Available
            </label>

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#e6d8c3] bg-white px-4 py-2 text-xs font-medium text-[#5a3e32]"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-[#5a3e32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#46281b]"
              >
                {editingId ? "Save Option" : "+ Add Option"}
              </button>
            </div>
          </div>
        </div>

        {/* OPTIONS LIST */}
        <div className="mt-5">
          {loading && (
            <p className="text-sm text-[#8a7863]">Loading options...</p>
          )}

          {!loading && options.length === 0 && (
            <p className="py-6 text-center text-sm text-[#8a7863]">
              No customization options yet. This product is a straightforward,
              single-price item.
            </p>
          )}

          {!loading && options.length > 0 && (
            <div className="space-y-2">
              {options.map((option) => (
                <div
                  key={option.customization_id}
                  className="flex items-center justify-between rounded-xl border border-[#e6d8c3] bg-white px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-[#3a2a1e]">
                      {option.option_name}{" "}
                      <span className="text-xs font-normal text-[#9c8873]">
                        ({option.option_group} · {option.option_type})
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-[#8a7863]">
                      {Number(option.price) > 0
                        ? `+${peso(option.price)}`
                        : "No extra charge"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(option)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        Number(option.is_available)
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#f0ece4] text-[#9c8873]"
                      }`}
                    >
                      {Number(option.is_available) ? "Available" : "Hidden"}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(option)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingDelete(option.customization_id)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {pendingDelete && (
        <ConfirmDialog
          title="Remove this option?"
          message="This customization option will be permanently deleted."
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

export default CustomizationsModal;
