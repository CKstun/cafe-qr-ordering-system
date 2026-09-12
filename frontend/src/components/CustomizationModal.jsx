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
    GROUP ORDER

    1. Size / Drink Variant / Tray Size
    2. Flavor
    3. Add-ons
    Other customization groups
    4. Request
    5. Quantity
    6. Order Details
    7. Total
    8. Add Item
  */

  const orderedGroups = useMemo(() => {
    const entries = Object.entries(groups);

    const sizeGroups = [
      "Size",
      "Drink Variant",
      "Variant",
      "Tray Size",
    ];

    const flavorGroups = [
      "Flavor",
      "Flavors",
    ];

    const addOnGroups = [
      "Add-ons",
      "Add-ons",
    ];

    const sizeEntries = [];
    const flavorEntries = [];
    const addOnEntries = [];
    const otherEntries = [];

    entries.forEach(([group, options]) => {
      if (sizeGroups.includes(group)) {
        sizeEntries.push([group, options]);
      } else if (flavorGroups.includes(group)) {
        flavorEntries.push([group, options]);
      } else if (addOnGroups.includes(group)) {
        addOnEntries.push([group, options]);
      } else {
        otherEntries.push([group, options]);
      }
    });

    return [
      ...sizeEntries,
      ...flavorEntries,
      ...addOnEntries,
      ...otherEntries,
    ];
  }, [groups]);

  /*
    A size / variant selection replaces the base item price.
  */
  const replacingGroup = Object.keys(groups).find((group) =>
    PRICE_REPLACING_GROUPS.includes(group)
  );

  const hasRequiredPriceSelection = Boolean(replacingGroup);

  /*
    Check if the item has a Flavor group.
    If it does, Flavor is required.
  */
  const flavorGroup = Object.keys(groups).find((group) =>
    ["Flavor", "Flavors"].includes(group)
  );

  const hasFlavor = Boolean(flavorGroup);

  /*
    SIZE / VARIANT DEFAULT

    When the item opens:
    - Find the option whose price matches menu_items.price.
    - That option becomes active.
    - This prevents the base price from being added twice.
  */
  useEffect(() => {
    if (!replacingGroup) return;

    const options = groups[replacingGroup] || [];
    const basePrice = getPrice(item.price);

    if (selections[replacingGroup]) {
      return;
    }

    /*
      First try to find an option with the same price
      as the item's base price.
    */
    const basePriceOption = options.find(
      (option) => getPrice(option.price) === basePrice
    );

    /*
      If no exact base-price option exists,
      try Regular as a fallback.
    */
    const regularOption = options.find((option) =>
      String(option.option_name || "")
        .toLowerCase()
        .includes("regular")
    );

    const defaultOption =
      basePriceOption || regularOption;

    if (defaultOption) {
      setSelections((current) => ({
        ...current,
        [replacingGroup]: defaultOption,
      }));
    }
  }, [
    replacingGroup,
    groups,
    item.price,
    selections,
    setSelections,
  ]);

  const handleSelect = (group, option) => {
    setSelections((current) => {
      /*
        Add-ons allow multiple selections.
      */
      if (group === "Add-ons") {
        const currentAddOns = Array.isArray(current[group])
          ? current[group]
          : [];

        const exists = currentAddOns.some(
          (selected) =>
            selected.customization_id ===
            option.customization_id
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

      /*
        Other options allow one selection.
      */
      return {
        ...current,
        [group]: option,
      };
    });
  };

  /*
    PRICE CALCULATION

    - Start with 0.
    - Selected size/variant replaces menu_items.price.
    - Add-ons are added.
    - Flavor is FREE / 0 and does not affect price.
    - Request does not affect price.
  */
  const calculatePrice = () => {
    let price = 0;

    const selectedMainOption = replacingGroup
      ? selections[replacingGroup]
      : null;

    if (selectedMainOption) {
      price = getPrice(selectedMainOption.price);
    } else if (!hasRequiredPriceSelection) {
      /*
        If there is no size/variant group,
        use the menu item's base price.
      */
      price = getPrice(item.price);
    }

    /*
      Add-ons
    */
    const selectedAddOns = Array.isArray(
      selections["Add-ons"]
    )
      ? selections["Add-ons"]
      : [];

    selectedAddOns.forEach((option) => {
      price += getPrice(option.price);
    });

    /*
      Other paid options.

      Flavor is intentionally not added because
      flavor options have price 0.
    */
    Object.entries(selections).forEach(
      ([group, value]) => {
        if (
          group === "request" ||
          group === "Add-ons" ||
          group === replacingGroup ||
          group === "Flavor" ||
          group === "Flavors"
        ) {
          return;
        }

        if (value && typeof value === "object") {
          price += getPrice(value.price);
        }
      }
    );

    return price;
  };

  const unitPrice = calculatePrice();
  const total = unitPrice * quantity;

  /*
    VALIDATION

    Size is required when a size / variant group exists.

    Flavor is required when a Flavor group exists.
  */
  const isSizeSelected = replacingGroup
    ? Boolean(selections[replacingGroup])
    : true;

  const isFlavorSelected = hasFlavor
    ? Boolean(selections[flavorGroup])
    : true;

  const canAddToCart =
    isSizeSelected && isFlavorSelected;

  const handleAdd = () => {
    if (!isSizeSelected) {
      return;
    }

    if (!isFlavorSelected) {
      return;
    }

    onAdd(
      item,
      selections,
      unitPrice,
      quantity
    );
  };

  const getGroupTitle = (group) => {
    if (
      ["Size", "Drink Variant", "Variant", "Tray Size"].includes(
        group
      )
    ) {
      return "SIZE";
    }

    if (["Flavor", "Flavors"].includes(group)) {
      return "FLAVOR";
    }

    if (group === "Add-ons") {
      return "ADD-ONS";
    }

    return group.toUpperCase();
  };

  const selectedAddOns = Array.isArray(
    selections["Add-ons"]
  )
    ? selections["Add-ons"]
    : [];

  /*
    Selected options for Order Details.

    Flavor and Add-ons are shown here.
  */
  const selectedOptions = Object.entries(
    selections
  ).filter(
    ([group, value]) =>
      group !== "request" &&
      group !== "Add-ons" &&
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
          {/* =========================
              1. SIZE
              2. FLAVOR
              3. ADD-ONS
              ========================= */}
          {orderedGroups.map(([group, options]) => {
            const isSize = PRICE_REPLACING_GROUPS.includes(
              group
            );

            const isFlavor =
              group === "Flavor" ||
              group === "Flavors";

            const isAddOn = group === "Add-ons";

            return (
              <div
                key={group}
                className="mb-6"
              >
                <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
                  {getGroupTitle(group)}
                </h3>

                <div
                  className={
                    isSize
                      ? "grid grid-cols-2 gap-3"
                      : "flex flex-wrap gap-2"
                  }
                >
                  {options.map((option) => {
                    const selected = isAddOn
                      ? selectedAddOns.some(
                          (selectedOption) =>
                            selectedOption.customization_id ===
                            option.customization_id
                        )
                      : selections[group]
                          ?.customization_id ===
                        option.customization_id;

                    return (
                      <button
                        type="button"
                        key={option.customization_id}
                        onClick={() =>
                          handleSelect(
                            group,
                            option
                          )
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
                          DO NOT DISPLAY PRICE
                          for Flavor or Add-ons.
                        */}
                        {isSize && (
                          <div
                            className={`mt-1 text-xs ${
                              selected
                                ? "text-white/80"
                                : "text-[#8a7b70]"
                            }`}
                          >
                            ₱
                            {getPrice(
                              option.price
                            ).toFixed(2)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Validation message */}
                {isSize && !isSizeSelected && (
                  <p className="mt-2 text-xs text-red-600">
                    Please select a size.
                  </p>
                )}

                {isFlavor &&
                  !isFlavorSelected && (
                    <p className="mt-2 text-xs text-red-600">
                      Please select a flavor.
                    </p>
                  )}
              </div>
            );
          })}

          {/* =========================
              4. REQUEST
              ========================= */}
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

          {/* =========================
              5. QUANTITY
              ========================= */}
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
              QUANTITY
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
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
                  setQuantity(
                    (current) =>
                      current + 1
                  )
                }
                className="flex h-11 w-16 items-center justify-center rounded-full bg-[#f0e7de] text-xl text-[#3b2f2f]"
              >
                +
              </button>
            </div>
          </div>

          {/* =========================
              6. ORDER DETAILS
              ========================= */}
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
                  ₱
                  {selectedSize
                    ? getPrice(
                        selectedSize.price
                      ).toFixed(2)
                    : getPrice(
                        item.price
                      ).toFixed(2)}
                </span>
              </div>

              {/* Other Selected Options */}
              {selectedOptions.map(
                ([group, option]) => (
                  <div
                    key={group}
                    className="flex items-start justify-between gap-4 py-2"
                  >
                    <span className="min-w-0 text-[#85776b]">
                      {option.option_name}
                    </span>

                    <span className="shrink-0 font-medium text-[#3b2f2f]">
                      {getPrice(
                        option.price
                      ) > 0
                        ? `₱${getPrice(
                            option.price
                          ).toFixed(2)}`
                        : ""}
                    </span>
                  </div>
                )
              )}

              {/* Add-ons */}
              {selectedAddOns.map(
                (option) => (
                  <div
                    key={
                      option.customization_id
                    }
                    className="flex items-start justify-between gap-4 py-2"
                  >
                    <span className="min-w-0 text-[#85776b]">
                      {option.option_name}
                    </span>

                    <span className="shrink-0 font-medium text-[#3b2f2f]">
                      ₱
                      {getPrice(
                        option.price
                      ).toFixed(2)}
                    </span>
                  </div>
                )
              )}

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

          {/* =========================
              7. TOTAL
              ========================= */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[#8a6d5a]">
              TOTAL
            </span>

            <span className="text-xl font-bold text-[#5a3e32]">
              ₱{total.toFixed(2)}
            </span>
          </div>

          {/* =========================
              8. ADD ITEM
              ========================= */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAddToCart}
            className={`w-full rounded-2xl px-5 py-4 text-base font-medium text-white shadow-sm transition ${
              canAddToCart
                ? "bg-[#8b572f] hover:bg-[#754725] active:scale-[0.98]"
                : "cursor-not-allowed bg-[#b9aaa0]"
            }`}
          >
            Add Item · ₱
            {total.toFixed(2)}
          </button>

          {!canAddToCart && (
            <p className="mt-2 text-center text-xs text-red-600">
              Please select the required options before
              adding this item.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomizationModal;