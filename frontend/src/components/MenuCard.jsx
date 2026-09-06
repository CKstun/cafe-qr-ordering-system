function MenuCard({ item, onAddToCart }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      {item.image ? (
        <img
          src={`http://localhost/cafe-qr-ordering-system/backend/uploads/${item.image}`}
          alt={item.product_name}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400">
          No Image
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {item.product_name}
          </h2>

          <span className="whitespace-nowrap font-semibold text-gray-900">
            ₱{Number(item.price).toFixed(2)}
          </span>
        </div>

        <p className="mt-2 text-sm leading-5 text-gray-500">
          {item.description}
        </p>

        <button
          onClick={() => onAddToCart(item)}
          className="mt-4 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default MenuCard;