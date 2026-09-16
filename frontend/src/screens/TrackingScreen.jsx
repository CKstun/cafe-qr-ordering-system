import { peso } from "../utils/format";

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
          <div
            className={`mt-6 rounded-2xl p-4 ${
              orderStatus === "ready"
                ? "border border-green-500 bg-green-50"
                : "bg-[#efe1cc]"
            }`}
          >
            <div
              className={`font-semibold ${
                orderStatus === "ready"
                  ? "text-green-600"
                  : "text-[#46281b]"
              }`}
            >
              {orderStatus === "placed"
                ? "Order Placed!"
                : orderStatus === "preparing"
                ? "Preparing your order"
                : (
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                      ✓
                    </span>
                    Ready!
                  </span>
                )}
            </div>

            <div
              className={`mt-1 text-xs ${
                orderStatus === "ready"
                  ? "text-green-600"
                  : "text-[#8a7863]"
              }`}
            >
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

export default TrackingScreen;
