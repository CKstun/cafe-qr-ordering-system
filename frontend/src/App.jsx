import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import MenuCard from "./components/MenuCard";
import CustomizationModal from "./components/CustomizationModal";
import backIcon from "./assets/back-icon.png";


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
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
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

    showToast(
      `Added ${item.product_name} to cart`
    );
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
          ((Array.isArray(value) &&
            value.length > 0) ||
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

    showToast(
      `Added ${item.product_name} to cart`
    );
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

    setPaymentStatus(
      paymentMethod === "Cash"
        ? "Unpaid"
        : "For Verification"
    );

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
      return;
    }

    setOrder(null);
    setOrderStatus("placed");
    setPaymentStatus("Unpaid");
    setScreen("menu");

    showToast("Order cancelled.");
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
    setDessertType(null);
    setPaymentMethod("Cash");
    setGcashProof(null);
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

                {/* Dessert category */}
                {selectedCategory ===
                  "Desserts" && (
                  <div className="mt-5 rounded-3xl bg-[#efe1cc] p-4">
                    <div className="text-center">
                      <h2 className="font-semibold text-[#46281b]">
                        Desserts
                      </h2>
                    </div>
                  </div>
                )}

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
            gcashProof={gcashProof}
            setGcashProof={
              setGcashProof
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


/* =========================================================
   WELCOME / SPLASH SCREEN
========================================================= */

function WelcomeScreen({ onStart }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7eee1] px-8 text-center">
      <img
        src="/src/assets/logo.jpg"
        alt="Café Pepita"
        className="h-64 w-64 rounded-full object-cover shadow-md"
      />

      <div className="mt-6 text-[11px] font-medium tracking-[0.25em] text-[#9c8873]">
        SIP THE MOMENT
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-14 w-full max-w-[280px] rounded-xl bg-[#5a3e32] py-4 text-sm font-semibold text-white transition hover:bg-[#46281b] active:scale-[0.98]"
      >
        Start Ordering
      </button>
    </div>
  );
}


/* =========================================================
   CUSTOMER DETAILS SCREEN
========================================================= */

function CustomerDetailsScreen({
  name,
  setName,
  orderType,
  setOrderType,
  onBack,
  onContinue,
}) {
  const canContinue = name.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7eee1] px-6 pb-8 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-[#8a7863]"
      >
        <span aria-hidden="true">‹</span> Back
      </button>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <img
            src="/src/assets/logo.jpg"
            alt="Café Pepita"
            className="h-64 w-64 rounded-full object-cover shadow-sm"
          />
          <h1 className="mt-4 text-[22px] font-bold text-[#46281b]">
            Welcome!
          </h1>
          <p className="mt-1 text-sm text-[#8a7863]">
            Tell us your name so we know whose order is whose.
          </p>
        </div>

        <div className="mt-9 w-full max-w-sm">
          <label className="text-[11px] font-semibold tracking-wide text-[#9c8873]">
            YOUR NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Barbara"
            className="mt-2 w-full rounded-xl bg-[#efe1cc] px-4 py-3 text-[15px] text-[#3a2a1e] outline-none placeholder:text-[#9c8873]"
          />
        </div>

        <div className="mt-6 w-full max-w-sm">
          <label className="text-[11px] font-semibold tracking-wide text-[#9c8873]">
            ORDER TYPE
          </label>
          <div className="mt-2 flex gap-3">
            {["Dine-in", "Take-out"].map((type) => {
              const active = orderType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`flex-1 rounded-full py-3 text-[14px] font-medium transition-colors ${
                    active
                      ? "bg-[#5a3e32] text-white"
                      : "border border-[#e6d8c3] bg-white text-[#3a2a1e]"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 w-full max-w-sm">
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className={`w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition-opacity ${
              canContinue ? "bg-[#5a3e32]" : "bg-[#d9c6ac] opacity-90"
            }`}
          >
            View Menu →
          </button>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   CART SCREEN
========================================================= */

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

        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Menu"
            className="flex h-6 w-6 shrink-0 items-center justify-center"
          >
            <img
              src={backIcon}
              alt=""
              className="h-full w-full object-contain"
            />
          </button>

          <div>
            <h1 className="mt-4 text-[22px] font-bold text-[#46281b]">
              Your Cart
            </h1>
            <p className="mt-1 text-sm text-[#8a7863]">
              {customerName || "Guest"} • {orderType}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">

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
                          alt={
                            item.product_name
                          }
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
                                (
                                  option
                                ) =>
                                  option.option_name
                              )
                              .join(
                                " · "
                              )}
                          </div>
                        )}

                        {item.request && (
                          <div className="mt-1 text-xs text-[#8a7863]">
                            Request:{" "}
                            {
                              item.request
                            }
                          </div>
                        )}

                        <div className="mt-2 font-semibold text-[#5a3e32]">
                          {peso(
                            item.price
                          )}
                        </div>
                      </div>

                      <div className="text-right">

                        <div className="font-semibold text-[#3a2a1e]">
                          {peso(
                            Number(
                              item.price
                            ) *
                              Number(
                                item.quantity
                              )
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              onDecrease(
                                item.key
                              )
                            }
                            className="h-8 w-8 rounded-lg bg-[#efe1cc]"
                          >
                            −
                          </button>

                          <span className="w-5 text-center text-sm">
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              onIncrease(
                                item.key
                              )
                            }
                            className="h-8 w-8 rounded-lg bg-[#efe1cc]"
                          >
                            +
                          </button>

                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item.key)}
                      className="mt-3 ml-auto flex items-center justify-center"
                    >
                      <img
                        src="/src/assets/delete-icon.png"
                        alt="Delete"
                        className="h-5 w-5 object-contain"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#e6d8c3] pt-4">

              {/* ORDER SUMMARY */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-[#46281b]">
                  Order Summary
                </div>

                <div className="mt-2 space-y-1">
                  {cart.map((item) => (
                    <div
                      key={item.key}
                      className="flex justify-between text-sm text-[#8a7863]"
                    >
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>

                      <span>
                        {peso(
                          Number(item.price) *
                            Number(item.quantity)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL */}
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>

                <span className="text-[#5a3e32]">
                  {peso(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 w-full rounded-xl bg-[#5a3e32] py-4 text-sm font-semibold text-white"
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


/* =========================================================
   PAYMENT SCREEN
========================================================= */

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
  const handleProofUpload = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = "";
      return;
    }

    setGcashProof(file);
  };

  const removeProof = () => {
    setGcashProof(null);

    const input = document.getElementById("gcash-proof");
    if (input) {
      input.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#f7eee1]">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6">

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-[#8a7863]"
        >
          <span className="text-lg">‹</span>
          Back
        </button>

        {/* Header */}
        <div>
          <h1 className="mt-4 text-[22px] font-bold text-[#46281b]">
            Payment
          </h1>

          <p className="mt-1 text-sm text-[#8a7863]">
            Choose how you'd like to pay.
          </p>
        </div>

        {/* Order Summary */}
        <div className="mt-8 rounded-2xl bg-[#efe5d8] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#8a6f5c]">
                {customerName} · {orderType}
              </div>

              <div className="text-xs text-[#8a6f5c]">
                {cart.reduce(
                  (sum, item) =>
                    sum + Number(item.quantity || 0),
                  0
                )}{" "}
                item
                {cart.reduce(
                  (sum, item) =>
                    sum + Number(item.quantity || 0),
                  0
                ) !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

            <div className="text-xl font-bold text-[#7b4d2e]">
              {peso(total)}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 space-y-4">

          {/* CASH */}
          <button
            type="button"
            onClick={() => setPaymentMethod("Cash")}
            className={`w-full rounded-2xl border p-5 text-left transition ${
              paymentMethod === "Cash"
                ? "border-[#7b4d2e] bg-white"
                : "border-[#e0d8d0] bg-white"
            }`}
          >
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00a83b] text-white">
                <span className="text-xl">▣</span>
              </div>

              <div className="flex-1">
                <div className="font-semibold text-[#2f2119]">
                  Cash
                </div>

                <div className="mt-1 text-xs text-[#8a6f5c]">
                  Pay at the counter upon pickup
                </div>
              </div>

              {paymentMethod === "Cash" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7b4d2e] text-xs text-white">
                  ✓
                </div>
              )}
            </div>
          </button>

          {/* GCASH */}
          <button
            type="button"
            onClick={() => setPaymentMethod("GCash")}
            className={`w-full rounded-2xl border p-5 text-left transition ${
              paymentMethod === "GCash"
                ? "border-[#7b4d2e] bg-[#f8f1e9]"
                : "border-[#e0d8d0] bg-white"
            }`}
          >
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#287df5] text-white">
                <span className="text-xl">▯</span>
              </div>

              <div className="flex-1">
                <div className="font-semibold text-[#2f2119]">
                  GCash
                </div>

                <div className="mt-1 text-xs text-[#8a6f5c]">
                  Pay via GCash +63 911 1111111
                </div>
              </div>

              {paymentMethod === "GCash" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7b4d2e] text-xs text-white">
                  ✓
                </div>
              )}
            </div>
          </button>

        </div>

        {/* GCASH PAYMENT */}
        {paymentMethod === "GCash" && (
        <div className="mt-6 rounded-2xl border border-blue-300 bg-[#eef6ff] p-4">

          <div className="text-sm font-semibold text-blue-700">
            GCash Payment
          </div>

          <p className="mt-1 text-xs leading-5 text-blue-600">
            Tap again to change the uploaded image.
          </p>

          {/* CUSTOMER UPLOADS PROOF */}
          {!gcashProof ? (
            <label
              htmlFor="gcash-proof"
              className="mt-4 block cursor-pointer rounded-xl border border-dashed border-blue-300 bg-white p-4 text-center"
            >
              <div className="text-sm font-medium text-blue-600">
                Upload payment proof
              </div>

              <input
                id="gcash-proof"
                type="file"
                accept="image/*"
                onChange={handleProofUpload}
                className="hidden"
              />
            </label>
          ) : (
            /* IMAGE PREVIEW - CLICK IMAGE TO CHANGE */
            <div className="relative mt-4">

              <label
                htmlFor="gcash-proof"
                className="block cursor-pointer overflow-hidden rounded-xl bg-white"
              >
                <img
                  src={URL.createObjectURL(gcashProof)}
                  alt="GCash payment proof"
                  className="max-h-64 w-full object-contain"
                />

                <input
                  id="gcash-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="hidden"
                />
              </label>

              {/* REMOVE IMAGE */}
              <button
                type="button"
                onClick={() => {
                  setGcashProof(null);

                  const input =
                    document.getElementById("gcash-proof");

                  if (input) {
                    input.value = "";
                  }
                }}
                className="absolute -right-2 -top-2 z-10"
                aria-label="Remove payment proof"
              >
                <img
                  src="/src/assets/xmark-solid.png"
                  alt="Remove"
                  className="h-7 w-7"
                />
              </button>

            </div>
          )}

        </div>
      )}

      </div>

      {/* PLACE ORDER AT BOTTOM */}
      <div className="mx-auto w-full max-w-2xl px-4 pb-5 pt-6 sm:px-6">
        <button
          type="button"
          onClick={onPlaceOrder}
          className="w-full rounded-xl bg-[#7b4d2e] py-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#684025] active:scale-[0.99]"
        >
          Place Order · {peso(total)}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TRACKING SCREEN
========================================================= */

function TrackingScreen({
  order,
  orderStatus,
  paymentStatus,
  onCancel,
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

  const canCancel = orderStatus === "placed";

  return (
    <div className="min-h-screen bg-[#f7eee1]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">

        <div className="rounded-3xl bg-[#fffdf8] p-5 shadow-sm">

          {/* ORDER HEADER */}
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

          {/* STATUS MESSAGE */}
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

          {/* ORDER STATUS */}
          <div className="mt-6">
            {statuses.map(([key, label], index) => {
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

                    {index < statuses.length - 1 && (
                      <div
                        className={`min-h-8 w-px ${
                          index < currentIndex
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
                      {index < currentIndex
                        ? "Completed"
                        : index === currentIndex
                        ? "In progress"
                        : "Waiting"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
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
                    {item.product_name} × {item.quantity}
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
              Payment · {order.paymentMethod} · {paymentStatus}
            </div>

          </div>

          {/* CANCEL ORDER */}
          <button
            type="button"
            onClick={onCancel}
            disabled={!canCancel}
            className={`mt-5 w-full rounded-xl py-4 text-sm font-semibold transition ${
              canCancel
                ? "bg-[#ead8c5] text-[#7b4d2e] hover:bg-[#dfc9b3]"
                : "cursor-not-allowed bg-[#eee8e1] text-[#b5aaa0]"
            }`}
          >
            Cancel Order
          </button>

          {/* ORDER MORE ITEMS */}
          <button
            type="button"
            onClick={onOrderMore}
            className="mt-2 w-full rounded-xl bg-[#5a3e32] py-4 text-sm font-semibold text-white"
          >
            Order More Items
          </button>

          {/* DONE */}
          <button
            type="button"
            onClick={onDone}
            className="mt-2 w-full rounded-xl bg-[#d9c6ac] py-4 text-sm font-semibold text-[#46281b]"
          >
            Done
          </button>

        </div>
      </div>
    </div>
  );
}

export default App;