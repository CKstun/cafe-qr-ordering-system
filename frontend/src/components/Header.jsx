import logo from "../assets/logo.jpg";
import cartIcon from "../assets/cart-shopping-solid.png";

function Header({
  customerName,
  orderType,
  cartCount,
  onCart,
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#f7eee1] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <img
          src={logo}
          alt="Café Pepita Logo"
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-black">
            Café Pepita
          </h1>

          <p className="truncate text-xs text-[#8a7863]">
            {customerName || "Guest"} • {" "}
            {orderType}
          </p>
        </div>

        <button
          type="button"
          onClick={onCart}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black"
        >
          <img
            src={cartIcon}
            alt="Cart"
            className="h-5 w-5 object-contain"
          />

          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#b23a3a] px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;