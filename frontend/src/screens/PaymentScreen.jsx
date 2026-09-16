import { peso } from "../utils/format";
import gcashQR from "../assets/gcash-qr.png";

function PaymentScreen({
  customerName,
  orderType,
  cart,
  total,
  paymentMethod,
  setPaymentMethod,
  onBack,
  onPlaceOrder,
}) {
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
                  (sum, item) => sum + Number(item.quantity || 0),
                  0
                )}{" "}
                item
                {cart.reduce(
                  (sum, item) => sum + Number(item.quantity || 0),
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
                  Pay using GCash
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
              Scan the QR code below using your GCash app to make your payment.
            </p>

            {/* OWNER GCASH QR CODE */}
            <div className="mt-4 flex justify-center rounded-xl bg-white p-5">
              <img
                src={gcashQR}
                alt="Café GCash QR Code"
                className="h-64 w-64 object-contain"
              />
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-blue-600">
              After payment, show your Proof of Payment to the cashier
              before claiming your order.
            </p>

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

export default PaymentScreen;