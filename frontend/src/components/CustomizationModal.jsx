function CustomizationModal({
  item,
  customizations,
  selections,
  setSelections,
  onClose,
  onAdd,
}) {
  const groups = customizations.reduce((result, option) => {
    const group = option.option_group || "Options";

    if (!result[group]) {
      result[group] = [];
    }

    result[group].push(option);
    return result;
  }, {});

  const handleSelect = (group, option) => {
    setSelections((current) => ({
      ...current,
      [group]: option,
    }));
  };

  const calculatePrice = () => {
    let price = Number(item.price);

    Object.values(selections).forEach((option) => {
      if (option.option_group === "Drink Variant") {
        price = Number(option.price);
      } else {
        price += Number(option.price);
      }
    });

    return price;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {item.product_name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Customize your order
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {Object.entries(groups).map(([group, options]) => (
          <div key={group} className="mb-6">
            <h3 className="mb-3 font-semibold text-gray-900">
              {group}
            </h3>

            <div className="space-y-2">
              {options.map((option) => {
                const selected =
                  selections[group]?.customization_id ===
                  option.customization_id;

                return (
                  <button
                    key={option.customization_id}
                    onClick={() => handleSelect(group, option)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                      selected
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <span>{option.option_name}</span>

                    <span className="font-medium">
                      {Number(option.price) > 0
                        ? `+₱${Number(option.price).toFixed(2)}`
                        : "Free"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mb-4 flex items-center justify-between border-t pt-4">
          <span className="font-semibold">Total</span>

          <span className="text-xl font-bold">
            ₱{calculatePrice().toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onAdd(item, selections, calculatePrice())}
          className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white hover:bg-gray-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default CustomizationModal;