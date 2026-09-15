import { useEffect, useState } from "react";
import { apiGet, peso } from "./adminApi";
import StatCard from "../statCard";

function Dashboard({ showToast, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet("dashboard.php");
      setStats(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !stats) {
    return <p className="text-sm text-[#8a7863]">Loading dashboard...</p>;
  }

  const queueRows = [
    ["Pending", stats.order_queue.pending, "bg-[#efe1cc] text-[#5a3e32]"],
    ["Preparing", stats.order_queue.preparing, "bg-amber-100 text-amber-700"],
    [
      "Ready for Pickup",
      stats.order_queue.ready,
      "bg-emerald-100 text-emerald-700",
    ],
    ["Completed", stats.order_queue.completed, "bg-[#f0ece4] text-[#8a7863]"],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Orders"
          value={stats.active_orders}
          sublabel="in queue"
        />
        <StatCard
          label="Revenue Today"
          value={peso(stats.revenue_today)}
          sublabel="from paid orders"
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats.low_stock_count}
          sublabel="need restocking"
          accent={stats.low_stock_count > 0 ? "text-red-600" : "text-[#46281b]"}
        />
        <StatCard
          label="Menu Items"
          value={stats.menu_items_total}
          sublabel={`${stats.menu_items_unavailable} unavailable`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold text-[#46281b]">Order Queue</h3>
          <div className="mt-4 space-y-2">
            {queueRows.map(([label, count, classes]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-[#f7eee1] px-4 py-3"
              >
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}
                >
                  {label}
                </span>
                <span className="text-sm font-semibold text-[#3a2a1e]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold text-[#46281b]">
            Recent Transactions
          </h3>
          <div className="mt-4 space-y-3">
            {stats.recent_transactions.length === 0 && (
              <p className="text-sm text-[#8a7863]">No transactions yet.</p>
            )}
            {stats.recent_transactions.map((tx) => (
              <div
                key={tx.order_id}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[#3a2a1e]">
                    {tx.customer_name}
                  </div>
                  <div className="text-xs text-[#8a7863]">
                    {tx.payment_method === "gcash" ? "GCash" : "Cash"} ·{" "}
                    {new Date(tx.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#5a3e32]">
                  {peso(tx.total_amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm lg:col-span-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9c8873]">
            Quick Actions
          </h3>
          <div className="mt-4 space-y-2">
            {[
              ["Manage Menu Items", "menu-items"],
              ["Manage Inventory", "inventory"],
              ["View Transactions", "transactions"],
              ["View Sales Reports", "reports"],
            ].map(([label, tab]) => (
              <button
                key={tab}
                type="button"
                onClick={() => onNavigate(tab)}
                className="block w-full rounded-xl bg-[#f7eee1] px-4 py-2.5 text-left text-sm font-medium text-[#5a3e32] hover:bg-[#efe1cc]"
              >
                → {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
