function Header({ customerName, orderType }) {
  return (
    <header className="border-b border-[#e8dfd5] bg-[#fffaf5]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#5a3e32]">
            Café Pepita
          </h1>

          <p className="mt-1 text-sm text-[#85776b]">
            {customerName && orderType
              ? `${customerName} · ${orderType}`
              : "Order your favorites"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6f4e37] text-lg text-white">
          🛒
        </div>
      </div>
    </header>
  );
}

export default Header;