import { useEffect, useState } from "react";
import { apiGet, peso } from "./adminApi";
import StatCard from "../statCard";

const PERIODS = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "Last 7 Days" },
  { key: "monthly", label: "Last 30 Days" },
];

function Reports({ showToast }) {
  const [period, setPeriod] = useState("daily");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (dateFrom && dateTo) {
        params.set("date_from", dateFrom);
        params.set("date_to", dateTo);
      } else {
        params.set("period", period);
      }

      const data = await apiGet(`reports.php?${params.toString()}`);
      setReport(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [period, dateFrom, dateTo]);

  const usingCustomRange = Boolean(dateFrom && dateTo);

  const clearCustomRange = () => {
    setDateFrom("");
    setDateTo("");
  };

  const maxDaily = report?.sales_by_day?.length
    ? Math.max(...report.sales_by_day.map((d) => Number(d.total_sales)))
    : 0;

  return (
    <div>
      {/* FILTERS */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 rounded-xl bg-[#efe1cc] p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                clearCustomRange();
                setPeriod(p.key);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !usingCustomRange && period === p.key
                  ? "bg-[#5a3e32] text-white"
                  : "text-[#5a3e32]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-[#8a7863]">or select a date range:</span>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
        />
        <span className="text-sm text-[#8a7863]">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-[#e6d8c3] bg-white px-3 py-2 text-sm outline-none"
        />

        {usingCustomRange && (
          <button
            type="button"
            onClick={clearCustomRange}
            className="text-sm font-medium text-[#5a3e32] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-[#8a7863]">Loading report...</p>}

      {!loading && report && (
        <div className="space-y-6">
          <p className="text-xs text-[#9c8873]">
            Showing results from <strong>{report.date_from}</strong> to{" "}
            <strong>{report.date_to}</strong> (completed orders only)
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Sales" value={peso(report.total_sales)} />
            <StatCard
              label="Completed Orders"
              value={report.completed_orders}
            />
            <StatCard
              label="Products Sold"
              value={report.quantity_sold}
              sublabel="units"
            />
          </div>

          {/* SALES BY DAY CHART */}
          <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#46281b]">
              Sales by Day
            </h3>

            {report.sales_by_day.length === 0 ? (
              <p className="mt-4 text-sm text-[#8a7863]">
                No completed sales in this range yet.
              </p>
            ) : (
              <div className="mt-4 flex h-40 items-end gap-2">
                {report.sales_by_day.map((day) => {
                  const heightPct =
                    maxDaily > 0
                      ? Math.max(4, (Number(day.total_sales) / maxDaily) * 100)
                      : 4;

                  return (
                    <div
                      key={day.sales_date}
                      className="flex flex-1 flex-col items-center gap-1"
                      title={`${day.sales_date}: ${peso(day.total_sales)}`}
                    >
                      <div className="flex h-32 w-full items-end">
                        <div
                          className="w-full rounded-t-md bg-[#a9764c]"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#9c8873]">
                        {new Date(day.sales_date).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BEST SELLERS */}
          <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#46281b]">
              Best-Selling Products
            </h3>

            {report.best_sellers.length === 0 ? (
              <p className="mt-4 text-sm text-[#8a7863]">
                No product sales recorded in this range yet.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {report.best_sellers.map((product, index) => (
                  <div
                    key={product.menu_item_id}
                    className="flex items-center justify-between rounded-xl bg-[#f7eee1] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5a3e32] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-[#3a2a1e]">
                        {product.product_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-[#8a7863]">
                        {product.quantity_sold} sold
                      </span>
                      <span className="font-semibold text-[#5a3e32]">
                        {peso(product.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
