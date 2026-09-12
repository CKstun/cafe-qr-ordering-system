import plusIcon from "../assets/plus-solid.png";

function MenuCard({ item, onAddToCart }) {
  const available =
    Number(item.is_available) !== 0 &&
    item.is_available !== false;

  /*
   * Use the API display price first.
   * For Party Trays this will be:
   * Baked Mac → 600.00
   * Palabok → 550.00
   *
   * For other items, fall back to item.price.
   */
  const displayPrice =
    Array.isArray(item.prices) &&
    item.prices.length > 0
      ? Number(item.prices[0].price || 0)
      : Number(item.price || 0);

  return (
    <div
      className={`flex min-h-[140px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e8dfd5] transition hover:shadow-md sm:min-h-[170px] sm:flex-col ${
        !available ? "opacity-60" : ""
      }`}
    >
      {item.image ? (
        <img
          src={`http://localhost/cafe-qr-ordering-system/backend/uploads/${item.image}`}
          alt={item.product_name}
          className="h-[140px] w-[140px] shrink-0 object-cover sm:h-48 sm:w-full"
        />
      ) : (
        <div className="flex h-[140px] w-[140px] shrink-0 items-center justify-center bg-[#f3eee8] text-sm text-[#9b8f82] sm:h-48 sm:w-full">
          No Image
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-[#3b2f2f] sm:text-lg">
            {item.product_name}
          </h2>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#85776b]">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {/* Display ONLY the base price */}
            <span className="text-base font-bold text-[#5a3e32] sm:text-lg">
              ₱{displayPrice.toFixed(2)}
            </span>
          </div>

          {available ? (
            <button
              type="button"
              onClick={() => onAddToCart(item)}
              className="flex h-9 w-16 shrink-0 items-center justify-center rounded-xl bg-[#5a3e32] transition hover:bg-[#4a3027] active:scale-95"
            >
              <img
                src={plusIcon}
                alt="Add to Cart"
                className="h-5 w-5 object-contain"
              />
            </button>
          ) : (
            <span className="rounded-full bg-[#efe1cc] px-3 py-2 text-xs font-medium text-[#8a7863]">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuCard;