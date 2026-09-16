import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import MenuCard from "./components/MenuCard";
import CustomizationModal from "./components/CustomizationModal";

import WelcomeScreen from "./screens/WelcomeScreen";
import CustomerDetailsScreen from "./screens/CustomerDetailsScreen";
import CartScreen from "./screens/CartScreen";
import PaymentScreen from "./screens/PaymentScreen";
import TrackingScreen from "./screens/TrackingScreen";

import { API_BASE } from "./utils/format";

function App() {
  const [screen, setScreen] = useState("welcome");

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dessertType, setDessertType] = useState(null);
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [customizations, setCustomizations] = useState([]);
  const [selections, setSelections] = useState({});
  const [loadingCustomizations, setLoadingCustomizations] =
    useState(false);

  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("Dine-in");

  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState("placed");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    window.clearTimeout(window.__pepitaToast);

    window.__pepitaToast = window.setTimeout(
      () => setToast(""),
      2600
    );
  };

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/menu.php`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch menu.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Failed to load menu."
          );
        }

        const data = Array.isArray(result.data)
          ? result.data
          : [];

        setMenuItems(data);

        const uniqueCategories = [
          ...new Set(
            data
              .map((item) => item.category_name)
              .filter(Boolean)
          ),
        ];

        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
        setError("Unable to load the menu.");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const cartCount = useMemo(
    () => cart.length,
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch =
        selectedCategory === "All"
          ? true
          : item.category_name === selectedCategory;

      const searchMatch = String(
        item.product_name || ""
      )
        .toLowerCase()
        .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [
    menuItems,
    selectedCategory,
    search,
  ]);

  const selectCategory = (category) => {
    setSelectedCategory(category);

    if (category !== "Desserts") {
      setDessertType(null);
    }
  };

  const openItem = async (item) => {
    if (
      Number(item.is_available) === 0 ||
      item.is_available === false
    ) {
      return;
    }

    try {
      setLoadingCustomizations(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/customization.php?menu_item_id=${item.menu_item_id}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch customizations."
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load customizations."
        );
      }

      const options = Array.isArray(result.data)
        ? result.data
        : [];

      if (options.length === 0) {
        addSimpleItem(item);
        return;
      }

      setSelectedItem(item);
      setCustomizations(options);
      setSelections({});
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load customization options."
      );
    } finally {
      setLoadingCustomizations(false);
    }
  };

  const addSimpleItem = (item) => {
    const basePrice = Number(item.price || 0);

    setCart((current) => {
      const existingItem = current.find(
        (cartItem) =>
          cartItem.menu_item_id === item.menu_item_id &&
          cartItem.customizations?.length === 0 &&
          !cartItem.request
      );

      if (existingItem) {
        return current.map((cartItem) =>
          cartItem.key === existingItem.key
            ? {
                ...cartItem,
                quantity:
                  Number(cartItem.quantity || 0) + 1,
              }
            : cartItem
        );
      }

      return [
        ...current,
        {
          key: `${item.menu_item_id}-${Date.now()}-${Math.random()}`,
          menu_item_id: item.menu_item_id,
          product_name: item.product_name,
          image: item.image,
          description: item.description,
          price: basePrice,
          quantity: 1,
          customizations: [],
          request: "",
        },
      ];
    });

    showToast("Item successfully added to cart");
  };

  const handleAddCustomizedToCart = (
    item,
    selectedOptions,
    finalPrice,
    quantity = 1
  ) => {
    const customizationList = Object.entries(
      selectedOptions
    )
      .filter(
        ([group, value]) =>
          group !== "request" &&
          value &&
          ((Array.isArray(value) && value.length > 0) ||
            (!Array.isArray(value) && typeof value === "object"))
      )
      .flatMap(([group, value]) => {
        if (Array.isArray(value)) {
          return value.map((option) => ({
            ...option,
            selected_group: group,
          }));
        }

        return [
          {
            ...value,
            selected_group: group,
          },
        ];
      });

    const request = selectedOptions.request || "";

    setCart((current) => {
      const existingItem = current.find((cartItem) => {
        if (cartItem.menu_item_id !== item.menu_item_id) {
          return false;
        }

        if ((cartItem.request || "") !== request) {
          return false;
        }

        const oldCustomizations = cartItem.customizations || [];

        if (oldCustomizations.length !== customizationList.length) {
          return false;
        }

        return customizationList.every((newOption) =>
          oldCustomizations.some(
            (oldOption) =>
              oldOption.option_name === newOption.option_name &&
              oldOption.selected_group === newOption.selected_group
          )
        );
      });

      if (existingItem) {
        return current.map((cartItem) =>
          cartItem.key === existingItem.key
            ? {
                ...cartItem,
                quantity:
                  Number(cartItem.quantity || 0) +
                  Number(quantity || 1),
              }
            : cartItem
        );
      }

      return [
        ...current,
        {
          key: `${item.menu_item_id}-${Date.now()}-${Math.random()}`,
          menu_item_id: item.menu_item_id,
          product_name: item.product_name,
          image: item.image,
          description: item.description,
          price: Number(finalPrice || 0),
          quantity: Number(quantity || 1),
          customizations: customizationList,
          request,
        },
      ];
    });

    setSelectedItem(null);
    setCustomizations([]);
    setSelections({});

    showToast("Item successfully added to cart");
  };

  const increaseQuantity = (key) => {
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity:
                Number(item.quantity) + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (key) => {
    setCart((current) =>
      current
        .map((item) =>
          item.key === key
            ? {
                ...item,
                quantity:
                  Number(item.quantity) - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart((current) =>
      current.filter((item) => item.key !== key)
    );

    showToast("Item removed from cart");
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty.");
      return;
    }

    const orderNumber = `ORD-${Date.now()
      .toString()
      .slice(-6)}`;

    const newOrder = {
      number: orderNumber,
      name: customerName,
      type: orderType,
      items: cart,
      total: cartTotal,
      paymentMethod,
    };

    setOrder(newOrder);
    setOrderStatus("placed");
    setPaymentStatus("Unpaid");

    setScreen("tracking");

    showToast(
      `Order #${orderNumber} received.`
    );
  };

  useEffect(() => {
    if (
      screen !== "tracking" ||
      !order
    ) {
      return;
    }

    if (orderStatus === "ready") {
      return;
    }

    const timer = setTimeout(() => {
      if (orderStatus === "placed") {
        setOrderStatus("preparing");
      } else if (
        orderStatus === "preparing"
      ) {
        setOrderStatus("ready");

        showToast(
          "Your order is ready for pickup!"
        );
      }
    }, 4200);

    return () =>
      clearTimeout(timer);
  }, [
    screen,
    order,
    orderStatus,
  ]);

  const startOrdering = () => {
    setScreen("details");
  };

  const continueToMenu = () => {
    if (!customerName.trim()) {
      showToast(
        "Please enter your name."
      );
      return;
    }

    setScreen("menu");
  };

  const cancelOrder = () => {
    if (orderStatus !== "placed") {
      showToast("Cannot cancel order at this stage.");
      return;
    }

    setOrder(null);
    setOrderStatus("placed");
    setPaymentStatus("Unpaid");

    setScreen("cart");

    showToast("Order cancelled.");
  };

  const orderMore = () => {
    setCart([]); // Clear the completed order from cart
    setScreen("menu");
    setOrder(null);
    setOrderStatus("placed");
    setPaymentStatus("Unpaid");
  };

  const endSession = () => {
    setCart([]);
    setOrder(null);
    setSelectedItem(null);
    setCustomizations([]);
    setSelections({});
    setCustomerName("");
    setSearch("");
    setSelectedCategory("All");
    setDessertType(null);
    setPaymentMethod("Cash");
    setScreen("welcome");
  };

  return (
    <div className="min-h-screen bg-[#f7eee1] text-[#3a2a1e]">
      {toast && (
        <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-xl bg-[#46281b] px-6 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto min-h-screen w-full max-w-[1100px]">

        {/* =========================
            WELCOME / SPLASH SCREEN
        ========================= */}
        {screen === "welcome" && (
          <WelcomeScreen
            onStart={startOrdering}
          />
        )}

        {/* =========================
            CUSTOMER DETAILS
        ========================= */}
        {screen === "details" && (
          <CustomerDetailsScreen
            name={customerName}
            setName={setCustomerName}
            orderType={orderType}
            setOrderType={setOrderType}
            onBack={() => setScreen("welcome")}
            onContinue={continueToMenu}
          />
        )}

        {/* =========================
            MENU
        ========================= */}
        {screen === "menu" && (
          <>
            <Header
              customerName={customerName}
              orderType={orderType}
              cartCount={cartCount}
              onCart={() =>
                setScreen("cart")
              }
            />

            <main className="px-4 py-5 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">

                <div className="mb-5">
                  <div className="flex items-center rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] px-4 py-3 shadow-sm">
                    <img
                      src="/src/assets/magnifying-glass-solid.png"
                      alt="Search"
                      className="mr-3 h-5 w-5 object-contain"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search Menu"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[#9c8873]"
                    />
                  </div>
                </div>

                <CategoryFilter
                  categories={categories}
                  selectedCategory={
                    selectedCategory
                  }
                  onSelectCategory={
                    selectCategory
                  }
                />


                {loading && (
                  <p className="py-12 text-center text-sm text-[#8a7863]">
                    Loading menu...
                  </p>
                )}

                {error && (
                  <p className="py-8 text-center text-sm text-red-600">
                    {error}
                  </p>
                )}

                {!loading &&
                  !error &&
                  filteredItems.length === 0 && (
                    <p className="py-12 text-center text-sm text-[#8a7863]">
                      No menu items found.
                    </p>
                  )}

                {!loading &&
                  !error &&
                  filteredItems.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map(
                      (item) => (
                        <MenuCard
                          key={
                            item.menu_item_id
                          }
                          item={item}
                          onAddToCart={
                            openItem
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </main>
          </>
        )}

        {/* =========================
            CART
        ========================= */}
        {screen === "cart" && (
          <CartScreen
            customerName={customerName}
            orderType={orderType}
            cart={cart}
            total={cartTotal}
            onBack={() =>
              setScreen("menu")
            }
            onIncrease={
              increaseQuantity
            }
            onDecrease={
              decreaseQuantity
            }
            onRemove={
              removeFromCart
            }
            onCheckout={() =>
              setScreen("payment")
            }
          />
        )}

        {/* =========================
            PAYMENT
        ========================= */}
        {screen === "payment" && (
          <PaymentScreen
            customerName={customerName}
            orderType={orderType}
            cart={cart}
            total={cartTotal}
            paymentMethod={
              paymentMethod
            }
            setPaymentMethod={
              setPaymentMethod
            }
            onBack={() =>
              setScreen("cart")
            }
            onPlaceOrder={
              placeOrder
            }
          />
        )}

        {/* =========================
            TRACKING
        ========================= */}
        {screen === "tracking" &&
          order && (
            <TrackingScreen
              order={order}
              orderStatus={orderStatus}
              paymentStatus={paymentStatus}
              onCancel={cancelOrder}
              onOrderMore={orderMore}
              onDone={endSession}
            />
          )}
      </div>

      {/* =========================
          CUSTOMIZATION MODAL
      ========================= */}
      {selectedItem && (
        <CustomizationModal
          item={selectedItem}
          customizations={
            customizations
          }
          selections={selections}
          setSelections={
            setSelections
          }
          onAdd={
            handleAddCustomizedToCart
          }
          onClose={() => {
            setSelectedItem(null);
            setCustomizations([]);
            setSelections({});
          }}
        />
      )}

      {loadingCustomizations && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30">
          <div className="rounded-2xl bg-[#fffdf8] px-5 py-4 text-sm shadow-lg">
            Loading options...
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
