import logo from "../../assets/cafe-pepita-logo.png";

const links = [
  ["dashboard", "Dashboard", "▦"],
  ["menu-items", "Menu Items", "☕"],
  ["categories", "Categories", "▤"],
  ["inventory", "Inventory", "▣"],
  ["transactions", "Transactions", "↔"],
  ["reports", "Reports", "▥"],
];

export default function Sidebar({ activeTab, onSelectTab, onLogout }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#46281b] px-4 py-6 text-white">
      <div className="mb-8 flex items-center gap-3 border-b border-white/15 px-2 pb-6">
        <img src={logo} alt="Café Pepita logo" className="h-14 w-14 rounded-full border-2 border-[#e8c98d] bg-white object-contain p-1" />
        <div><p className="text-lg font-bold">Café Pepita</p><p className="text-xs text-[#e8c98d]">Admin workspace</p></div>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map(([id, label, icon]) => (
          <button key={id} onClick={() => onSelectTab(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${activeTab === id ? "bg-[#e8c98d] text-[#46281b]" : "text-white/85 hover:bg-white/10"}`}>
            <span aria-hidden="true" className="w-5 text-center text-base">{icon}</span>{label}
          </button>
        ))}
      </nav>
      <button onClick={onLogout} className="mt-6 rounded-xl border border-white/25 px-4 py-3 text-left text-sm font-semibold hover:bg-white/10">↪　Log out</button>
    </aside>
  );
}
