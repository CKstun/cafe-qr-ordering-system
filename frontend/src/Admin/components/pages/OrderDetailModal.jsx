import { useEffect, useState } from "react";
import Modal from "../modal";
import { apiGet, peso } from "./adminApi";

function OrderDetailModal({ orderId, onClose, showToast }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet(`orders.php?order_id=${orderId}`);
        setOrder(data);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  return (
    <Modal title="Order Details" onClose={onClose} maxWidth="max-w-xl">
      {loading && <p className="text-sm text-[#8a7863]">Loading order...</p>}

      {!loading && order && (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-[#9c8873]">ORDER NUMBER</div>
              <div className="text-lg font-bold text-[#46281b]">
                #{order.order_number}
              </div>
            </div>
            <span className="rounded-full bg-[#efe1cc] px-3 py-1 text-xs font-medium text-[#5a3e32]">
              {order.order_type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-[#9c8873]">Customer</div>
              <div className="font-medium text-[#3a2a1e]">
                {order.customer_name}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#9c8873]">Placed</div>
              <div className="font-medium text-[#3a2a1e]">
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#9c8873]">Payment</div>
              <div className="font-medium text-[#3a2a1e]">
                {order.payment_method === "gcash"
                  ? "GCash"
                  : "Over-the-counter"}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#9c8873]">Payment Status</div>
              <div className="font-medium text-[#3a2a1e] capitalize">
                {order.payment_status}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9c8873]">
              Items
            </div>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.order_item_id}
                  className="rounded-xl border border-[#e6d8c3] bg-white px-4 py-3"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[#3a2a1e]">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-[#5a3e32]">
                      {peso(item.subtotal)}
                    </span>
                  </div>
                  {item.customizations?.length > 0 && (
                    <div className="mt-1 text-xs text-[#8a7863]">
                      {item.customizations
                        .map((c) => c.customization_name)
                        .join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between border-t border-[#e6d8c3] pt-3 text-base font-bold text-[#46281b]">
            <span>Total</span>
            <span>{peso(order.total_amount)}</span>
          </div>

          {order.cancellation_reason && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
              Cancellation reason: {order.cancellation_reason}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default OrderDetailModal;
