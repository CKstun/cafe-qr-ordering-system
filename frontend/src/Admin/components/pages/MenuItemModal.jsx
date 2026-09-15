import { useState } from "react";
import Modal from "../modal";
import { apiPost, apiPut, uploadImage, imageUrl } from "./adminApi";

/**
 * Add / Edit Product modal.
 *
 * Image handling:
 * 1. Admin picks a file -> we show a local preview immediately.
 * 2. On Save, if a new file was picked, we upload it first via
 *    upload_image.php, which stores it on disk and returns a filename.
 * 3. That filename is then saved into the menu_items.image column
 *    (create via POST, or update via PUT) alongside the rest of the
 *    product's fields (name, description, price, category, availability).
 */
function MenuItemModal({ item, categories, onClose, onSaved, showToast }) {
  const isEdit = Boolean(item);

  const [form, setForm] = useState({
    category_id: item?.category_id ?? categories[0]?.category_id ?? "",
    product_name: item?.product_name ?? "",
    description: item?.description ?? "",
    price: item?.price ?? "",
    is_available: item ? Boolean(Number(item.is_available)) : true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    imageUrl(item?.image) || null,
  );
  const [existingImage, setExistingImage] = useState(item?.image || null);
  const [saving, setSaving] = useState(false);

  const updateField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.", "error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  const handleSave = async () => {
    if (!form.product_name.trim()) {
      showToast("Product name is required.", "error");
      return;
    }

    if (!form.category_id) {
      showToast("Please select a category.", "error");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      showToast("Please enter a valid price.", "error");
      return;
    }

    try {
      setSaving(true);

      // Step 1: upload the new image file first, if one was picked.
      let imageFilename = existingImage;

      if (imageFile) {
        imageFilename = await uploadImage(imageFile);
      }

      const payload = {
        category_id: Number(form.category_id),
        product_name: form.product_name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        image: imageFilename,
        is_available: form.is_available,
      };

      // Step 2: save the product record (image filename included).
      if (isEdit) {
        await apiPut("menu_items.php", {
          menu_item_id: item.menu_item_id,
          ...payload,
        });
        showToast("Product updated.");
      } else {
        await apiPost("menu_items.php", payload);
        showToast("Product added.");
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
      title={isEdit ? "Edit Product" : "Add New Product"}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* IMAGE UPLOAD */}
        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            PRODUCT IMAGE
          </label>

          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#efe1cc]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-[#9c8873]">No image</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-lg border border-[#e6d8c3] bg-white px-3 py-2 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]">
                {imagePreview ? "Change image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImagePick}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            CATEGORY
          </label>
          <select
            value={form.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* NAME */}
        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            PRODUCT NAME
          </label>
          <input
            type="text"
            value={form.product_name}
            onChange={(e) => updateField("product_name", e.target.value)}
            placeholder="e.g. Caramel Macchiato"
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            DESCRIPTION
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Optional short description"
            rows={3}
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>

        {/* PRICE */}
        <div>
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            BASE PRICE (₱)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>

        {/* AVAILABILITY */}
        <label className="flex items-center gap-3 rounded-xl bg-[#f7eee1] px-4 py-3">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => updateField("is_available", e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-[#3a2a1e]">Available for ordering</span>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-[#5a3e32] py-3 text-sm font-semibold text-white hover:bg-[#46281b] disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </Modal>
  );
}

export default MenuItemModal;
