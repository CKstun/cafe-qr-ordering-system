import { useEffect, useState } from "react";
import { apiGet, peso } from "./adminApi";
import OrderDetailModal from "./OrderDetailModal";

const STATUS_STYLES = {
  pending: "bg-[#efe1cc] text-[#5a3e32]",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  completed: "bg-[#f0ece4] text-[#8a7863]",
  cancelled: "bg-red-100 text-red-700",
};

function Transactions({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("payment_status", paymentFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (search.trim()) params.set("search", search.trim());

      const data = await apiGet(`orders.php?${params.toString()}`);
      setOrders(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, paymentFilter, dateFrom, dateTo, search]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or order #..."
          className="w-64 rounded-xl border border-[#e6d8c3] bg-white px-4 py-2.5 text-sm outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready for Pickup</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="all">All Payments</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        />
        <span className="text-sm text-[#8a7863]">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2.5 text-sm outline-none"
        />
      </div>

      {loading && (
        <p className="text-sm text-[#8a7863]">Loading transactions...</p>
      )}

      {!loading && orders.length === 0 && (
        <p className="py-12 text-center text-sm text-[#8a7863]">
          No transactions found for the selected filters.
        </p>
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7eee1] text-[11px] uppercase tracking-wide text-[#9c8873]">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-t border-[#e6d8c3]">
                  <td className="px-4 py-3 font-medium text-[#3a2a1e]">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 text-[#3a2a1e]">
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-[#8a7863] capitalize">
                    {order.order_type}
                  </td>
                  <td className="px-4 py-3 text-[#8a7863] capitalize">
                    {order.payment_method} · {order.payment_status}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#5a3e32]">
                    {peso(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                        STATUS_STYLES[order.order_status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9c8873]">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.order_id)}
                      className="rounded-lg border border-[#e6d8c3] bg-white px-3 py-1.5 text-xs font-medium text-[#5a3e32] hover:bg-[#f7eee1]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default Transactions;
