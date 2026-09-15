import { useEffect, useState } from "react";
import Sidebar from "../sidebar";
import Dashboard from "./Dashboard";
import MenuItems from "./MenuItems";
import Categories from "./categories";
import Inventory from "./inventory";
import Transactions from "./Transactions";
import Reports from "./reports";
import Login from "./Login";
import { apiGet, apiPost } from "./adminApi";

const TAB_LABELS = {
  dashboard: "Dashboard",
  "menu-items": "Menu Items",
  categories: "Categories",
  inventory: "Inventory",
  transactions: "Transactions",
  reports: "Reports",
};

function AdminApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authChecked, setAuthChecked] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [toast, setToast] = useState(null);
  const [loginNotice, setLoginNotice] = useState("");

  useEffect(() => {
    let active = true;
    apiGet("auth.php")
      .then((user) => {
        if (active) setAdmin(user);
      })
      .catch(() => {
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__pepitaAdminToast);
    window.__pepitaAdminToast = window.setTimeout(() => setToast(null), 3200);
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7eee1] text-sm text-[#8a7863]">
        Checking admin session...
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await apiPost("logout.php", {});
    } catch (err) {
      // Clear the local admin view even if the server session endpoint fails.
    }
    setAdmin(null);
    setLoginNotice("You have been logged out successfully.");
  };

  if (!admin) {
    return <Login onLoggedIn={(user) => { setAdmin(user); setLoginNotice(""); }} statusMessage={loginNotice} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f7eee1] text-[#3a2a1e]">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-[#e6d8c3] bg-[#f7eee1]/95 px-8 py-5 backdrop-blur">
          <h1 className="text-xl font-bold text-[#46281b]">
            {TAB_LABELS[activeTab]}
          </h1>
          <p className="text-sm text-[#8a7863]">Hi, {admin?.username || admin?.name || "Admin"} · Café Pepita Admin Panel</p>
        </header>

        <main className="px-8 py-6">
          {activeTab === "dashboard" && (
            <Dashboard showToast={showToast} onNavigate={setActiveTab} />
          )}
          {activeTab === "menu-items" && <MenuItems showToast={showToast} />}
          {activeTab === "categories" && <Categories showToast={showToast} />}
          {activeTab === "inventory" && <Inventory showToast={showToast} />}
          {activeTab === "transactions" && (
            <Transactions showToast={showToast} />
          )}
          {activeTab === "reports" && <Reports showToast={showToast} />}
        </main>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "error" ? "bg-red-600" : "bg-[#46281b]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminApp;
