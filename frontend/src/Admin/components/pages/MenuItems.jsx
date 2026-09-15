import { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete, peso, imageUrl } from "./adminApi";
import ConfirmDialog from "../confirmDialog";
import MenuItemModal from "./MenuItemModal";
import CustomizationsModal from "./CustomizationsModal";
import IngredientsModal from "./IngredientsModal";

function MenuItems({ showToast }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [recipeItem, setRecipeItem] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        apiGet("menu_items.php"),
        apiGet("categories.php"),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAvailability = async (item) => {
    try {
      await apiPut("menu_items.php", {
        menu_item_id: item.menu_item_id,
        is_available: !Number(item.is_available),
      });
      showToast(
        Number(item.is_available)
          ? "Marked as unavailable."
          : "Marked as available.",
      );
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiDelete(
        `menu_items.php?menu_item_id=${pendingDelete.menu_item_id}`,
      );
      showToast("Product removed.");
      setPendingDelete(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.product_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || String(item.category_id) === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && Number(item.is_available) === 1) ||
      (availabilityFilter === "unavailable" && Number(item.is_available) === 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div>
      {/* TOOLBAR */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-64 rounded-xl border border-[#e6d8c3] bg-white px-4 py-2.5 text-sm outline-none"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ml-auto rounded-xl bg-[#5a3e32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#46281b]"
        >
          + Add New Product
        </button>
      </div>

      {loading && <p className="text-sm text-[#8a7863]">Loading products...</p>}

      {!loading && filteredItems.length === 0 && (
        <p className="py-12 text-center text-sm text-[#8a7863]">
          No products found.
        </p>
      )}

      {/* PRODUCT GRID */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const available = Number(item.is_available) === 1;

            return (
              <div
                key={item.menu_item_id}
                className="overflow-hidden rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] shadow-sm"
              >
                <div className="h-32 w-full bg-[#efe1cc]">
                  {item.image ? (
                    <img
                      src={imageUrl(item.image)}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#9c8873]">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#3a2a1e]">
                        {item.product_name}
                      </div>
                      <div className="text-xs text-[#9c8873]">
                        {item.category_name}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold text-[#5a3e32]">
                    {peso(item.price)}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="rounded-lg border border-[#e6d8c3] bg-white py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomizingItem(item)}
                      className="rounded-lg border border-[#e6d8c3] bg-white py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                    >
                      Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipeItem(item)}
                      className="rounded-lg border border-[#e6d8c3] bg-white py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                    >
                      Recipe
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(item)}
                      className="rounded-lg border border-[#e6d8c3] bg-white py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                    >
                      {available ? "Mark Unavailable" : "Mark Available"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      className="col-span-2 rounded-lg border border-red-200 bg-white py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAddModal || editingItem) && (
        <MenuItemModal
          item={editingItem}
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSaved={load}
          showToast={showToast}
        />
      )}

      {customizingItem && (
        <CustomizationsModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          showToast={showToast}
        />
      )}

      {recipeItem && (
        <IngredientsModal
          item={recipeItem}
          onClose={() => setRecipeItem(null)}
          showToast={showToast}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove this product?"
          message={`"${pendingDelete.product_name}" will be permanently removed from the menu.`}
          confirmLabel="Remove"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default MenuItems;
