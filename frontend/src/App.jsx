import { useEffect, useState } from "react";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import MenuCard from "./components/MenuCard";
import CustomizationModal from "./components/CustomizationModal";

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [customizations, setCustomizations] = useState([]);
  const [selections, setSelections] = useState({});
  const [customerName, setCustomerName] = useState("Cheska");
  const [orderType, setOrderType] = useState("Dine-in");
  const [loadingCustomizations, setLoadingCustomizations] =
    useState(false);

  // Load menu
  useEffect(() => {
    fetch(
      "http://localhost/cafe-qr-ordering-system/backend/api/menu.php"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch menu.");
        }

        return response.json();
      })
      .then((result) => {
        if (!result.success) {
          throw new Error("Failed to load menu.");
        }

        setMenuItems(result.data);

        const uniqueCategories = [
          ...new Set(
            result.data.map((item) => item.category_name)
          ),
        ];

        setCategories(uniqueCategories);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load the menu.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add item to cart
  const handleAddToCart = async (item) => {
    try {
      setLoadingCustomizations(true);
      setError("");

      const response = await fetch(
        `http://localhost/cafe-qr-ordering-system/backend/api/customization.php?menu_item_id=${item.menu_item_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customizations.");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Failed to load customizations.");
      }

      // No customization options
      if (result.data.length === 0) {
        setCart((currentCart) => {
          const existingItem = currentCart.find(
            (cartItem) =>
              cartItem.menu_item_id === item.menu_item_id
          );

          if (existingItem) {
            return currentCart.map((cartItem) =>
              cartItem.menu_item_id === item.menu_item_id
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + 1,
                  }
                : cartItem
            );
          }

          return [
            ...currentCart,
            {
              ...item,
              quantity: 1,
            },
          ];
        });

        return;
      }

      // Has customization options
      setSelectedItem(item);
      setCustomizations(result.data);
      setSelections({});
    } catch (err) {
      console.error(err);
      setError("Unable to load customization options.");
    } finally {
      setLoadingCustomizations(false);
    }
  };

  // Add customized item to cart
  const handleAddCustomizedToCart = (
    item,
    selectedOptions,
    finalPrice
  ) => {
    const customizationList =
      Object.values(selectedOptions);

    setCart((currentCart) => [
      ...currentCart,
      {
        ...item,
        price: finalPrice,
        quantity: 1,
        customizations: customizationList,
      },
    ]);

    setSelectedItem(null);
    setCustomizations([]);
    setSelections({});
  };

  // Increase quantity
  const increaseQuantity = (menuItemId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.menu_item_id === menuItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (menuItemId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.menu_item_id === menuItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeFromCart = (menuItemId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.menu_item_id !== menuItemId
      )
    );
  };

  // Calculate total
  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // Search and category filtering
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.category_name === selectedCategory;

    const matchesSearch = item.product_name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        customerName={customerName}
        orderType={orderType}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-400"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500">
            Loading menu...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-600">
            {error}
          </p>
        )}

        {/* Menu */}
        {!loading && !error && (
          <>
            {filteredItems.length === 0 ? (
              <p className="py-10 text-center text-gray-500">
                No menu items found.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.menu_item_id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Cart */}
        <div className="mt-10 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Your Cart
            </h2>

            <span className="text-sm text-gray-500">
              {cart.reduce(
                (total, item) =>
                  total + item.quantity,
                0
              )}{" "}
              item(s)
            </span>
          </div>

          {cart.length === 0 ? (
            <p className="mt-5 text-center text-gray-500">
              Your cart is empty.
            </p>
          ) : (
            <div className="mt-5 space-y-4">

              {cart.map((item, index) => (
                <div
                  key={`${item.menu_item_id}-${index}`}
                  className="flex items-center justify-between gap-4 border-b pb-4"
                >

                  <div className="flex-1">

                    <h3 className="font-semibold text-gray-900">
                      {item.product_name}
                    </h3>

                    {/* Customizations */}
                    {item.customizations &&
                      item.customizations.length > 0 && (
                        <div className="mt-1 text-sm text-gray-500">
                          {item.customizations.map(
                            (customization, index) => (
                              <div key={index}>
                                {customization.option_name}
                              </div>
                            )
                          )}
                        </div>
                      )}

                    <p className="mt-1 text-sm text-gray-500">
                      ₱
                      {Number(item.price).toFixed(2)}
                    </p>

                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.menu_item_id
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                    >
                      −
                    </button>

                    <span className="w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.menu_item_id
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                    >
                      +
                    </button>

                  </div>

                  {/* Subtotal */}
                  <div className="w-20 text-right font-semibold">
                    ₱
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() =>
                      removeFromCart(
                        item.menu_item_id
                      )
                    }
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>

                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between pt-2 text-lg font-bold">
                <span>Total</span>

                <span>
                  ₱{cartTotal.toFixed(2)}
                </span>
              </div>

              {/* Checkout */}
              <button
                className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800"
              >
                Proceed to Checkout
              </button>

            </div>
          )}
        </div>

      </main>

      {/* Customization Modal */}
      {selectedItem && (
        <CustomizationModal
          item={selectedItem}
          customizations={customizations}
          selections={selections}
          setSelections={setSelections}
          onAddCustomized={
            handleAddCustomizedToCart
          }
          onClose={() => {
            setSelectedItem(null);
            setCustomizations([]);
            setSelections({});
          }}
        />
      )}

    </div>
  );
}

export default App;