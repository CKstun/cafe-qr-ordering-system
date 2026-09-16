import backIcon from "../assets/back-icon.png";
import { peso } from "../utils/format";

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

export default CartScreen;
