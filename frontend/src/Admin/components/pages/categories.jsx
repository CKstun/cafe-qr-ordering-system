import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../adminApi";
import ConfirmDialog from "../components/ConfirmDialog";

function Categories({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setCategories(await apiGet("categories.php"));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      showToast("Category name is required.", "error");
      return;
    }

    try {
      await apiPost("categories.php", { category_name: newName.trim() });
      showToast("Category added.");
      setNewName("");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.category_id);
    setEditingName(category.category_name);
  };

  const saveEdit = async () => {
    if (!editingName.trim()) {
      showToast("Category name is required.", "error");
      return;
    }

    try {
      await apiPut("categories.php", {
        category_id: editingId,
        category_name: editingName.trim(),
      });
      showToast("Category updated.");
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiDelete(
        `categories.php?category_id=${pendingDelete.category_id}`,
      );
      showToast("Category deleted.");
      setPendingDelete(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
      setPendingDelete(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#46281b]">Add a Category</h3>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Iced Specialty Drinks"
            className="flex-1 rounded-xl border border-[#e6d8c3] bg-white px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-[#5a3e32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#46281b]"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading && (
          <p className="text-sm text-[#8a7863]">Loading categories...</p>
        )}

        {!loading && (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.category_id}
                className="flex items-center justify-between rounded-xl border border-[#e6d8c3] bg-[#fffdf8] px-4 py-3"
              >
                {editingId === cat.category_id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                    className="flex-1 rounded-lg border border-[#e6d8c3] px-3 py-1.5 text-sm outline-none"
                  />
                ) : (
                  <div>
                    <div className="text-sm font-medium text-[#3a2a1e]">
                      {cat.category_name}
                    </div>
                    <div className="text-xs text-[#9c8873]">
                      {cat.item_count} product
                      {cat.item_count === "1" ? "" : "s"}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {editingId === cat.category_id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#8a7863]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="rounded-lg bg-[#5a3e32] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(cat)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this category?"
          message={
            Number(pendingDelete.item_count) > 0
              ? `"${pendingDelete.category_name}" still has ${pendingDelete.item_count} product(s) assigned. Move or remove them first.`
              : `"${pendingDelete.category_name}" will be permanently deleted.`
          }
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default Categories;
s;
