import { useEffect, useMemo, useState } from "react";

const getPrice = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const PRICE_REPLACING_GROUPS = [
  "Drink Variant",
  "Size",
  "Variant",
  "Tray Size",
];

const REQUIRED_GROUPS = [
  "Flavor",
  "Drink Variant",
  "Size",
  "Variant",
  "Tray Size",
];

function CustomizationModal({
  item,
  customizations,
  selections,
  setSelections,
  onClose,
  onAdd,
}) {
  const [quantity, setQuantity] = useState(1);

  const groups = useMemo(
    () =>
      customizations.reduce((result, option) => {
        const group = option.option_group || "Options";

        if (!result[group]) {
          result[group] = [];
        }

        result[group].push(option);
        return result;
      }, {}),
    [customizations]
  );

  /*
   * Find the actual price-replacing group.
   *
   * Flavor is NOT a price group.
   * This is important for Flavored Latte:
   *
   * Flavor
   *   - Roasted Almond
   *   - Caramel Macchiato
   *
   * Drink Variant
   *   - 12oz Regular
   *   - 12oz Sub-oat
   */
  const replacingGroup = Object.keys(groups).find((group) =>
    PRICE_REPLACING_GROUPS.includes(group)
  );

  /*
   * Automatically select the base-price option.
   *
   * Example:
   * Cappuccino base price = 119
   * 12oz Regular = 119
   *
   * Therefore 12oz Regular becomes active automatically.
   *
   * Party Tray:
   * menu_items.price = 0
   * Small = 550
   *
   * Therefore Small becomes the default instead.
   */
  useEffect(() => {
    if (!replacingGroup) return;

    const options = groups[replacingGroup] || [];

    if (selections[replacingGroup]) return;

    let defaultOption = null;

    // First try to find an option matching the base price.
    const basePrice = getPrice(item.price);

    if (basePrice > 0) {
      defaultOption = options.find(
        (option) => getPrice(option.price) === basePrice
      );
    }

    // If no matching base-price option exists,
    // use the first available price option.
    if (!defaultOption && options.length > 0) {
      defaultOption = options[0];
    }

    if (defaultOption) {
      setSelections((current) => ({
        ...current,
        [replacingGroup]: defaultOption,
      }));
    }
  }, [
    replacingGroup,
    groups,
    selections,
    setSelections,
    item.price,
  ]);

  const handleSelect = (group, option) => {
    setSelections((current) => {
      // Add-ons allow multiple selections.
      if (group === "Add-ons") {
        const currentAddOns = Array.isArray(current[group])
          ? current[group]
          : [];

        const exists = currentAddOns.some(
          (selected) =>
            selected.customization_id === option.customization_id
        );

        return {
          ...current,
          [group]: exists
            ? currentAddOns.filter(
                (selected) =>
                  selected.customization_id !==
                  option.customization_id
              )
            : [...currentAddOns, option],
        };
      }

      // All other groups allow one selection.
      return {
        ...current,
        [group]: option,
      };
    });
  };

  /*
   * Required validation.
   *
   * Flavor is required when the item has a Flavor group.
   * Size/Drink Variant/etc. is required when the item has
   * one of those groups.
   */
  const missingRequiredGroups = REQUIRED_GROUPS.filter((group) => {
    if (!groups[group]) return false;

    const selected = selections[group];

    if (group === "Add-ons") {
      return false;
    }

    return !selected;
  });

  const canAddToCart = missingRequiredGroups.length === 0;

  const calculatePrice = () => {
    /*
     * PRICING RULE
     *
     * 1. Start at ZERO.
     * 2. Selected size/variant replaces the base price.
     * 3. Add-ons are added on top.
     * 4. Flavor does NOT add any price.
     * 5. Request does NOT affect price.
     *
     * For example:
     *
     * Latte = 119
     * 12oz Regular = 119
     *
     * Result = 119, NOT 238.
     */

    let price = 0;

    const selectedMainOption = replacingGroup
      ? selections[replacingGroup]
      : null;

    if (selectedMainOption) {
      price = getPrice(selectedMainOption.price);
    } else if (!replacingGroup) {
      price = getPrice(item.price);
    }

    // Add-ons are added on top.
    const selectedAddOns = Array.isArray(
      selections["Add-ons"]
    )
      ? selections["Add-ons"]
      : [];

    selectedAddOns.forEach((option) => {
      price += getPrice(option.price);
    });

    /*
     * Other paid customization groups.
     *
     * IMPORTANT:
     * Flavor is intentionally excluded because
     * Flavor has no price.
     */
    Object.entries(selections).forEach(([group, value]) => {
      if (
        group === "request" ||
        group === "Add-ons" ||
        group === replacingGroup ||
        group === "Flavor"
      ) {
        return;
      }

      if (value && typeof value === "object") {
        price += getPrice(value.price);
      }
    });

    return price;
  };

  const unitPrice = calculatePrice();
  const total = unitPrice * quantity;

  const handleAdd = () => {
    if (!canAddToCart) {
      return;
    }

    onAdd(item, selections, unitPrice, quantity);
  };

  const getGroupTitle = (group) => {
    if (
      group === "Drink Variant" ||
      group === "Size" ||
      group === "Variant" ||
      group === "Tray Size"
    ) {
      return "SIZE";
    }

    return group.toUpperCase();
  };

  const selectedAddOns = Array.isArray(
    selections["Add-ons"]
  )
    ? selections["Add-ons"]
    : [];

  const selectedOptions = Object.entries(selections).filter(
    ([group, value]) =>
      group !== "request" &&
      group !== "Add-ons" &&
      group !== "Flavor" &&
      group !== replacingGroup &&
      value &&
      typeof value === "object"
  );

  const selectedSize = replacingGroup
    ? selections[replacingGroup]
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="min-h-full w-full bg-[#fbf6f0] sm:min-h-0 sm:max-h-[90vh] sm:max-w-md sm:overflow-y-auto sm:rounded-3xl">

        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden sm:h-60">
          {item.image ? (
            <img
              src={`http://localhost/cafe-qr-ordering-system/backend/uploads/${item.image}`}
              alt={item.product_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#eee5dc] text-[#9b8f82]">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-black/25" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-xl text-white"
          >
            ×
          </button>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h2 className="text-2xl font-semibold">
              {item.product_name}
            </h2>

            {item.description && (
              <p className="mt-1 text-sm text-white/90">
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pb-8 pt-5">

          {/* Customization Groups */}
          {Object.entries(groups).map(([group, options]) => (
            <div key={group} className="mb-6">

              <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
                {getGroupTitle(group)}
                {REQUIRED_GROUPS.includes(group) && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </h3>

              <div
                className={
                  PRICE_REPLACING_GROUPS.includes(group)
                    ? "grid grid-cols-2 gap-3"
                    : "flex flex-wrap gap-2"
                }
              >
                {options.map((option) => {
                  const selected =
                    group === "Add-ons"
                      ? selectedAddOns.some(
                          (selectedOption) =>
                            selectedOption.customization_id ===
                            option.customization_id
                        )
                      : selections[group]?.customization_id ===
                        option.customization_id;

                  const isSize =
                    PRICE_REPLACING_GROUPS.includes(group);

                  const isFlavor = group === "Flavor";

                  const isAddOn = group === "Add-ons";

                  return (
                    <button
                      type="button"
                      key={option.customization_id}
                      onClick={() =>
                        handleSelect(group, option)
                      }
                      className={`transition ${
                        isSize
                          ? "w-full rounded-2xl border px-4 py-3 text-center"
                          : "rounded-full border px-4 py-2 text-sm"
                      } ${
                        selected
                          ? "border-[#8b572f] bg-[#8b572f] text-white"
                          : "border-[#e3dbd3] bg-white text-[#3b2f2f] hover:border-[#8b572f]"
                      }`}
                    >
                      <div className="font-medium">
                        {option.option_name}
                      </div>

                      {/*
                       * NO PRICE for:
                       *
                       * Flavor
                       * Add-ons
                       *
                       * Their prices should not appear
                       * beside the customization buttons.
                       */}
                      {isSize && !isFlavor && !isAddOn && (
                        <div
                          className={`mt-1 text-xs ${
                            selected
                              ? "text-white/80"
                              : "text-[#8a7b70]"
                          }`}
                        >
                          ₱{getPrice(option.price).toFixed(2)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Request */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
              REQUEST
            </h3>

            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Less sugar, less ice, no ice..."
              value={selections.request || ""}
              onChange={(e) =>
                setSelections((current) => ({
                  ...current,
                  request: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#e3dbd3] bg-white px-4 py-3 text-sm text-[#3b2f2f] outline-none placeholder:text-[#b9aaa0] focus:border-[#8b572f]"
            />
          </div>

          {/* Quantity */}
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
              QUANTITY
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={quantity === 1}
                className="flex h-11 w-16 items-center justify-center rounded-full bg-[#f0e7de] text-xl text-[#3b2f2f] disabled:opacity-50"
              >
                −
              </button>

              <span className="flex h-11 min-w-8 items-center justify-center text-lg font-medium">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
                className="flex h-11 w-16 items-center justify-center rounded-full bg-[#f0e7de] text-xl text-[#3b2f2f]"
              >
                +
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-5 rounded-2xl bg-white p-4">
            <h3 className="mb-4 text-sm font-medium tracking-wide text-[#8a6d5a]">
              ORDER DETAILS
            </h3>

            <div className="text-sm">

              {/* Header */}
              <div className="mb-2 flex items-center justify-between border-b border-[#eee5dc] pb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[#9b8f82]">
                  Description
                </span>

                <span className="text-xs font-medium uppercase tracking-wide text-[#9b8f82]">
                  Price
                </span>
              </div>

              {/* Main Item */}
              <div className="flex items-start justify-between gap-4 py-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#3b2f2f]">
                    {item.product_name}
                  </p>

                  {selectedSize && (
                    <p className="mt-1 text-xs text-[#85776b]">
                      {selectedSize.option_name}
                    </p>
                  )}
                </div>

                <span className="shrink-0 font-medium text-[#3b2f2f]">
                  ₱{unitPrice.toFixed(2)}
                </span>
              </div>

              {/* Flavor */}
              {selections.Flavor && (
                <div className="flex items-start justify-between gap-4 py-2">
                  <span className="min-w-0 text-[#85776b]">
                    Flavor
                  </span>

                  <span className="max-w-[65%] text-right font-medium text-[#3b2f2f]">
                    {selections.Flavor.option_name}
                  </span>
                </div>
              )}

              {/* Other Selected Options */}
              {selectedOptions.map(([group, option]) => (
                <div
                  key={group}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <span className="min-w-0 text-[#85776b]">
                    {option.option_name}
                  </span>

                  <span className="shrink-0 font-medium text-[#3b2f2f]">
                    ₱{getPrice(option.price).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Add-ons */}
              {selectedAddOns.map((option) => (
                <div
                  key={option.customization_id}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <span className="min-w-0 text-[#85776b]">
                    {option.option_name}
                  </span>

                  <span className="shrink-0 font-medium text-[#3b2f2f]">
                    ₱{getPrice(option.price).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Request */}
              {selections.request?.trim() && (
                <div className="mt-1 flex items-start justify-between gap-4 border-t border-[#eee5dc] pt-3">
                  <span className="shrink-0 text-[#85776b]">
                    Request
                  </span>

                  <span className="max-w-[65%] text-right font-medium text-[#3b2f2f]">
                    {selections.request}
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-2 flex items-center justify-between border-t border-[#eee5dc] pt-3">
                <span className="text-[#85776b]">
                  Quantity
                </span>

                <span className="font-medium text-[#3b2f2f]">
                  {quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[#8a6d5a]">
              TOTAL
            </span>

            <span className="text-xl font-bold text-[#5a3e32]">
              ₱{total.toFixed(2)}
            </span>
          </div>

          {/* Validation Message */}
          {!canAddToCart && (
            <p className="mb-3 text-center text-sm text-red-500">
              Please select{" "}
              {missingRequiredGroups
                .map((group) =>
                  group === "Drink Variant" ||
                  group === "Size" ||
                  group === "Variant" ||
                  group === "Tray Size"
                    ? "Size"
                    : group
                )
                .join(" and ")}{" "}
              before adding to cart.
            </p>
          )}

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAddToCart}
            className={`w-full rounded-2xl px-5 py-4 text-base font-medium text-white shadow-sm transition active:scale-[0.98] ${
              canAddToCart
                ? "bg-[#8b572f] hover:bg-[#754725]"
                : "cursor-not-allowed bg-[#b9aaa0]"
            }`}
          >
            Add to Cart · ₱{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationModal;