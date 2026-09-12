import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import MenuCard from "./components/MenuCard";
import CustomizationModal from "./components/CustomizationModal";

const API_BASE =
  "http://localhost/cafe-qr-ordering-system/backend/api";

const peso = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function App() {
  const [screen, setScreen] = useState("welcome");
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
  const [loadingCustomizations, setLoadingCustomizations] =
    useState(false);

  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("Dine-in");

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [gcashProof, setGcashProof] = useState(null);

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

        const response = await fetch(`${API_BASE}/menu.php`);

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
    () =>
      cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),
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

      const searchMatch = String(item.product_name || "")
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
        throw new Error("Failed to fetch customizations.");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load customizations."
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

    setCart((current) => [
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
    ]);

    showToast(`Added ${item.product_name} to cart`);
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
            (!Array.isArray(value) &&
              typeof value === "object"))
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

    setCart((current) => [
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
        request: selectedOptions.request || "",
      },
    ]);

    setSelectedItem(null);
    setCustomizations([]);
    setSelections({});

    showToast(`Added ${item.product_name} to cart`);
  };

  const increaseQuantity = (key) => {
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Number(item.quantity) + 1,
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
                quantity: Number(item.quantity) - 1,
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
    setPaymentStatus(
      paymentMethod === "Cash"
        ? "Unpaid"
        : "For Verification"
    );
    setScreen("tracking");

    showToast(`Order #${orderNumber} received.`);
  };

  useEffect(() => {
    if (screen !== "tracking" || !order) {
      return;
    }

    if (orderStatus === "ready") {
      return;
    }

    const timer = setTimeout(() => {
      if (orderStatus === "placed") {
        setOrderStatus("preparing");
      } else if (orderStatus === "preparing") {
        setOrderStatus("ready");
        showToast("Your order is ready for pickup!");
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [screen, order, orderStatus]);

  const startOrdering = () => {
    setScreen("welcome");
  };

  const continueToMenu = () => {
    if (!customerName.trim()) {
      showToast("Please enter your name.");
      return;
    }

    setScreen("menu");
  };

  const orderMore = () => {
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
    setPaymentMethod("Cash");
    setGcashProof(null);
    setScreen("welcome");
  };

  return (
    <div className="min-h-screen bg-[#f7eee1] text-[#3a2a1e]">
      {toast && (
        <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-full bg-[#46281b] px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto min-h-screen w-full max-w-[1100px]">
        {screen === "welcome" && (
          <WelcomeScreen
            name={customerName}
            setName={setCustomerName}
            orderType={orderType}
            setOrderType={setOrderType}
            onStart={startOrdering}
            onContinue={continueToMenu}
          />
        )}

        {screen === "menu" && (
          <>
            <Header
              customerName={customerName}
              orderType={orderType}
              cartCount={cartCount}
              onCart={() => setScreen("cart")}
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
                        setSearch(e.target.value)
                      }
                      placeholder="Search Menu"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[#9c8873]"
                    />
                  </div>
                </div>

                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={selectCategory}
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
                      {filteredItems.map((item) => (
                        <MenuCard
                          key={item.menu_item_id}
                          item={item}
                          onAddToCart={openItem}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </main>
          </>
        )}

        {screen === "cart" && (
          <CartScreen
            customerName={customerName}
            orderType={orderType}
            cart={cart}
            total={cartTotal}
            onBack={() => setScreen("menu")}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onRemove={removeFromCart}
            onCheckout={() => setScreen("payment")}
          />
        )}

        {screen === "payment" && (
          <PaymentScreen
            customerName={customerName}
            orderType={orderType}
            cart={cart}
            total={cartTotal}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            gcashProof={gcashProof}
            setGcashProof={setGcashProof}
            onBack={() => setScreen("cart")}
            onPlaceOrder={placeOrder}
          />
        )}

        {screen === "tracking" && order && (
          <TrackingScreen
            order={order}
            orderStatus={orderStatus}
            paymentStatus={paymentStatus}
            onOrderMore={orderMore}
            onDone={endSession}
          />
        )}
      </div>

      {selectedItem && (
        <CustomizationModal
          item={selectedItem}
          customizations={customizations}
          selections={selections}
          setSelections={setSelections}
          onAdd={handleAddCustomizedToCart}
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

function WelcomeScreen({
  name,
  setName,
  orderType,
  setOrderType,
  onContinue,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-8">
      <div className="w-full max-w-md rounded-[30px] bg-[#fffdf8] p-7 shadow-xl">
        <div className="text-center">
          <img
            src="/src/assets/logo.jpg"
            alt="Café Pepita"
            className="mx-auto h-28 w-28 rounded-full object-cover"
          />

          <h1 className="mt-5 text-2xl font-semibold text-[#46281b]">
            Welcome to Café Pepita
          </h1>

          <p className="mt-2 text-sm text-[#8a7863]">
            Tell us your name and order type to start.
          </p>
        </div>

        <div className="mt-8">
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            YOUR NAME
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Enter your name"
            className="mt-2 w-full rounded-2xl border border-[#e6d8c3] bg-[#f7eee1] px-4 py-3 text-sm outline-none focus:border-[#5a3e32]"
          />
        </div>

        <div className="mt-6">
          <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
            ORDER TYPE
          </label>

          <div className="mt-2 flex gap-3">
            {["Dine-in", "Take-out"].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setOrderType(type)
                  }
                  className={`flex-1 rounded-full border px-4 py-3 text-sm font-medium ${
                    orderType === type
                      ? "border-[#5a3e32] bg-[#5a3e32] text-white"
                      : "border-[#9b8f82] bg-white text-[#5a3e32]"
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full rounded-full bg-[#5a3e32] py-4 text-sm font-semibold text-white transition hover:bg-[#46281b]"
        >
          View Menu →
        </button>
      </div>
    </div>
  );
}

function CartScreen({
  customerName,
  orderType,
  cart,
  total,
  onBack,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}) {
  return (
    <div className="min-h-screen bg-[#f7eee1]">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-sm font-medium text-[#8a7863]"
        >
          ← Back to Menu
        </button>

        <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#46281b]">
            Your Cart
          </h1>

          <p className="mt-1 text-sm text-[#8a7863]">
            {customerName} · {orderType}
          </p>

          {cart.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#8a7863]">
              Your cart is empty.
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-[#e6d8c3] bg-white p-4"
                  >
                    <div className="flex gap-3">
                      {item.image ? (
                        <img
                          src={`http://localhost/cafe-qr-ordering-system/backend/uploads/${item.image}`}
                          alt={item.product_name}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-[#efe1cc]" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[#3a2a1e]">
                          {item.product_name}
                        </div>

                        {item.customizations?.length >
                          0 && (
                          <div className="mt-1 text-xs text-[#8a7863]">
                            {item.customizations
                              .map(
                                (option) =>
                                  option.option_name
                              )
                              .join(" · ")}
                          </div>
                        )}

                        {item.request && (
                          <div className="mt-1 text-xs text-[#8a7863]">
                            Request: {item.request}
                          </div>
                        )}

                        <div className="mt-2 font-semibold text-[#5a3e32]">
                          {peso(item.price)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-[#3a2a1e]">
                          {peso(
                            Number(item.price) *
                              Number(item.quantity)
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onDecrease(item.key)
                            }
                            className="h-8 w-8 rounded-full bg-[#efe1cc]"
                          >
                            −
                          </button>

                          <span className="w-5 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              onIncrease(item.key)
                            }
                            className="h-8 w-8 rounded-full bg-[#efe1cc]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(item.key)
                      }
                      className="mt-3 text-xs font-medium text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#e6d8c3] pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#5a3e32]">
                    {peso(total)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onCheckout}
                  className="mt-4 w-full rounded-full bg-[#5a3e32] py-4 text-sm font-semibold text-white"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentScreen({
  customerName,
  orderType,
  cart,
  total,
  paymentMethod,
  setPaymentMethod,
  gcashProof,
  setGcashProof,
  onBack,
  onPlaceOrder,
}) {
  return (
    <div className="min-h-screen bg-[#f7eee1]">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-sm font-medium text-[#8a7863]"
        >
          ← Back to Cart
        </button>

        <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#46281b]">
            Payment
          </h1>

          <p className="mt-1 text-sm text-[#8a7863]">
            {customerName} · {orderType}
          </p>

          <div className="mt-5 rounded-2xl bg-[#efe1cc] p-4">
            <div className="text-xs text-[#8a7863]">
              ORDER TOTAL
            </div>

            <div className="mt-1 text-2xl font-bold text-[#5a3e32]">
              {peso(total)}
            </div>

            <div className="mt-1 text-xs text-[#8a7863]">
              {cart.reduce(
                (sum, item) =>
                  sum + Number(item.quantity),
                0
              )}{" "}
              item(s)
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() =>
                setPaymentMethod("Cash")
              }
              className={`w-full rounded-2xl border p-4 text-left ${
                paymentMethod === "Cash"
                  ? "border-[#5a3e32] bg-[#efe1cc]"
                  : "border-[#e6d8c3] bg-white"
              }`}
            >
              <div className="font-semibold text-[#3a2a1e]">
                Cash
              </div>

              <div className="mt-1 text-xs text-[#8a7863]">
                Pay at the counter upon pickup.
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setPaymentMethod("GCash")
              }
              className={`w-full rounded-2xl border p-4 text-left ${
                paymentMethod === "GCash"
                  ? "border-[#5a3e32] bg-[#efe1cc]"
                  : "border-[#e6d8c3] bg-white"
              }`}
            >
              <div className="font-semibold text-[#3a2a1e]">
                GCash
              </div>

              <div className="mt-1 text-xs text-[#8a7863]">
                Pay using GCash and upload your
                payment proof.
              </div>
            </button>
          </div>

          {paymentMethod === "GCash" && (
            <div className="mt-4 rounded-2xl border border-[#e6d8c3] bg-white p-4">
              <div className="text-sm font-semibold text-[#46281b]">
                GCash Payment
              </div>

              <p className="mt-1 text-xs leading-5 text-[#8a7863]">
                After sending the payment, upload your
                screenshot or receipt below for staff
                verification.
              </p>

              <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-[#9b8f82] bg-[#f7eee1] p-4 text-center text-sm text-[#5a3e32]">
                {gcashProof
                  ? gcashProof.name
                  : "Choose payment proof"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setGcashProof(
                      e.target.files?.[0] || null
                    )
                  }
                />
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={onPlaceOrder}
            className="mt-6 w-full rounded-full bg-[#5a3e32] py-4 text-sm font-semibold text-white"
          >
            Place Order · {peso(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackingScreen({
  order,
  orderStatus,
  paymentStatus,
  onOrderMore,
  onDone,
}) {
  const statuses = [
    ["placed", "Order Placed"],
    ["preparing", "Preparing"],
    ["ready", "Ready for Pickup"],
  ];

  const currentIndex = statuses.findIndex(
    ([key]) => key === orderStatus
  );

  return (
    <div className="min-h-screen bg-[#f7eee1]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-[#8a7863]">
                ORDER NUMBER
              </div>

              <h1 className="mt-1 text-2xl font-bold text-[#46281b]">
                #{order.number}
              </h1>
            </div>

            <div className="rounded-full bg-[#efe1cc] px-3 py-1 text-xs font-medium text-[#5a3e32]">
              {order.type}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#efe1cc] p-4">
            <div className="font-semibold text-[#46281b]">
              {orderStatus === "placed"
                ? "Order Placed!"
                : orderStatus === "preparing"
                ? "Preparing your order"
                : "Ready!"}
            </div>

            <div className="mt-1 text-xs text-[#8a7863]">
              {orderStatus === "placed"
                ? "We've received your order."
                : orderStatus === "preparing"
                ? "Our staff is preparing your order."
                : "Your order is ready for pickup."}
            </div>
          </div>

          <div className="mt-6">
            {statuses.map(
              ([key, label], index) => {
                const done = index <= currentIndex;

                return (
                  <div
                    key={key}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                          done
                            ? "bg-[#5a3e32] text-white"
                            : "bg-[#efe1cc] text-[#9c8873]"
                        }`}
                      >
                        {done ? "✓" : "○"}
                      </div>

                      {index <
                        statuses.length - 1 && (
                        <div
                          className={`min-h-8 w-px ${
                            index <
                            currentIndex
                              ? "bg-[#5a3e32]"
                              : "bg-[#e6d8c3]"
                          }`}
                        />
                      )}
                    </div>

                    <div className="pb-5">
                      <div
                        className={`text-sm font-medium ${
                          done
                            ? "text-[#3a2a1e]"
                            : "text-[#9c8873]"
                        }`}
                      >
                        {label}
                      </div>

                      <div className="mt-1 text-xs text-[#8a7863]">
                        {index <
                        currentIndex
                          ? "Completed"
                          : index ===
                            currentIndex
                          ? "In progress"
                          : "Waiting"}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-2 rounded-2xl border border-[#e6d8c3] bg-white p-4">
            <div className="text-xs font-semibold tracking-wide text-[#9c8873]">
              ORDER SUMMARY
            </div>

            <div className="mt-3 space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span>
                    {item.product_name} ×
                    {item.quantity}
                  </span>

                  <span className="font-medium">
                    {peso(
                      Number(item.price) *
                        Number(item.quantity)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between border-t border-[#e6d8c3] pt-3 font-semibold">
              <span>Total</span>

              <span className="text-[#5a3e32]">
                {peso(order.total)}
              </span>
            </div>

            <div className="mt-3 border-t border-[#e6d8c3] pt-3 text-xs text-[#8a7863]">
              Payment · {order.paymentMethod} ·{" "}
              {paymentStatus}
            </div>
          </div>

          <button
            type="button"
            onClick={onOrderMore}
            className="mt-5 w-full rounded-full bg-[#5a3e32] py-4 text-sm font-semibold text-white"
          >
            Order More Items
          </button>

          <button
            type="button"
            onClick={onDone}
            className="mt-2 w-full rounded-full bg-[#d9c6ac] py-4 text-sm font-semibold text-[#46281b]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;