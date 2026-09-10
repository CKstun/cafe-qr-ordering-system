import { useEffect, useState } from "react";

function CustomizationModal({
  item,
  customizations,
  selections,
  setSelections,
  onClose,
  onAdd,
}) {
  const [quantity, setQuantity] = useState(1);

  const groups = customizations.reduce((result, option) => {
    const group = option.option_group || "Options";

    if (!result[group]) {
      result[group] = [];
    }

    result[group].push(option);
    return result;
  }, {});

  // Automatically select Regular as the default size
  useEffect(() => {
    const drinkVariants = customizations.filter(
      (option) => option.option_group === "Drink Variant"
    );

    if (
      drinkVariants.length > 0 &&
      !selections["Drink Variant"]
    ) {
      const regularOption = drinkVariants.find((option) =>
        option.option_name.toLowerCase().includes("regular")
      );

      if (regularOption) {
        setSelections((current) => ({
          ...current,
          "Drink Variant": regularOption,
        }));
      }
    }
  }, [customizations, selections, setSelections]);

  // Select customization
  const handleSelect = (group, option) => {
    setSelections((current) => {
      // Add-ons allow multiple selections
      if (group === "Add-ons") {
        const currentAddOns = current[group] || [];

        const alreadySelected = currentAddOns.some(
          (selected) =>
            selected.customization_id ===
            option.customization_id
        );

        return {
          ...current,
          [group]: alreadySelected
            ? currentAddOns.filter(
                (selected) =>
                  selected.customization_id !==
                  option.customization_id
              )
            : [...currentAddOns, option],
        };
      }

      // All other customization groups allow only one selection
      return {
        ...current,
        [group]: option,
      };
    });
  };

  // Calculate unit price
  const calculatePrice = () => {
    let price = Number(item.price);

    Object.entries(selections).forEach(([group, value]) => {
      // Customer request does not affect price
      if (group === "request") {
        return;
      }

      // Multiple add-ons
      if (group === "Add-ons") {
        if (Array.isArray(value)) {
          value.forEach((option) => {
            price += Number(option.price) || 0;
          });
        }

        return;
      }

      // Ignore invalid values
      if (!value || typeof value !== "object") {
        return;
      }

      // Drink Variant replaces the base item price
      if (value.option_group === "Drink Variant") {
        price = Number(value.price) || 0;
      } else {
        price += Number(value.price) || 0;
      }
    });

    return price;
  };

  const unitPrice = calculatePrice();
  const total = unitPrice * quantity;

  // Quantity controls
  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    onAdd(
      item,
      selections,
      unitPrice,
      quantity
    );
  };

  const getGroupTitle = (group) => {
    if (group === "Drink Variant") {
      return "SIZE";
    }

    return group.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="min-h-full w-full bg-[#fbf6f0] shadow-xl sm:min-h-0 sm:max-h-[90vh] sm:max-w-md sm:overflow-y-auto sm:rounded-3xl">

        {/* Product Image */}
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

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-xl text-white transition hover:bg-black/60"
          >
            ×
          </button>

          {/* Product Name */}
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

        {/* Customization Content */}
        <div className="px-5 pb-8 pt-5">

          {/* Customization Groups */}
          {Object.entries(groups).map(([group, options]) => (
            <div key={group} className="mb-6">

              <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
                {getGroupTitle(group)}
              </h3>

              {/* SIZE OPTIONS */}
              {group === "Drink Variant" ? (
                <div className="grid grid-cols-2 gap-3">
                  {options.map((option) => {
                    const selected =
                      selections[group]?.customization_id ===
                      option.customization_id;

                    return (
                      <button
                        type="button"
                        key={option.customization_id}
                        onClick={() =>
                          handleSelect(group, option)
                        }
                        className={`w-full rounded-2xl border px-4 py-3 text-center transition ${
                          selected
                            ? "border-[#8b572f] bg-[#8b572f] text-white"
                            : "border-[#e3dbd3] bg-white text-[#3b2f2f] hover:border-[#8b572f]"
                        }`}
                      >
                        <div className="font-medium">
                          {option.option_name}
                        </div>

                        <div
                          className={`mt-1 text-xs ${
                            selected
                              ? "text-white/80"
                              : "text-[#8a7b70]"
                          }`}
                        >
                          ₱{Number(option.price).toFixed(0)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* OTHER OPTIONS */
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => {
                    const selected =
                      group === "Add-ons"
                        ? (selections[group] || []).some(
                            (selectedOption) =>
                              selectedOption.customization_id ===
                              option.customization_id
                          )
                        : selections[group]?.customization_id ===
                          option.customization_id;

                    return (
                      <button
                        type="button"
                        key={option.customization_id}
                        onClick={() =>
                          handleSelect(group, option)
                        }
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selected
                            ? "border-[#8b572f] bg-[#8b572f] text-white"
                            : "border-[#e3dbd3] bg-white text-[#3b2f2f] hover:border-[#8b572f]"
                        }`}
                      >
                        <div className="font-medium">
                          {option.option_name}
                        </div>

                        {Number(option.price) > 0 ? (
                          <div
                            className={`mt-1 text-xs ${
                              selected
                                ? "text-white/80"
                                : "text-[#8a7b70]"
                            }`}
                          >
                            +₱{Number(option.price).toFixed(0)}
                          </div>
                        ) : (
                          <div
                            className={`mt-1 text-xs ${
                              selected
                                ? "text-white/80"
                                : "text-[#8a7b70]"
                            }`}
                          >
                            Free
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Request */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium tracking-wide text-[#8a6d5a]">
              REQUEST
            </h3>

            <input
              type="text"
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

              {/* Minus */}
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity === 1}
                className="flex h-11 w-16 items-center justify-center rounded-full bg-[#f0e7de] text-xl text-[#3b2f2f] transition hover:bg-[#e5d9ce] disabled:cursor-not-allowed disabled:opacity-50"
              >
                −
              </button>

              {/* Quantity */}
              <span className="flex h-11 min-w-8 items-center justify-center text-lg font-medium text-[#3b2f2f]">
                {quantity}
              </span>

              {/* Plus */}
              <button
                type="button"
                onClick={increaseQuantity}
                className="flex h-11 w-16 items-center justify-center rounded-full bg-[#f0e7de] text-xl text-[#3b2f2f] transition hover:bg-[#e5d9ce]"
              >
                +
              </button>

            </div>
          </div>

          {/* Total */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[#8a6d5a]">
              TOTAL
            </span>

            <span className="text-xl font-bold text-[#5a3e32]">
              ₱{total.toFixed(0)}
            </span>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-2xl bg-[#8b572f] px-5 py-4 text-base font-medium text-white shadow-sm transition hover:bg-[#754725] active:scale-[0.98]"
          >
            Add to Cart · ₱{total.toFixed(0)}
          </button>

        </div>
      </div>
    </div>
  );
}

export default CustomizationModal;