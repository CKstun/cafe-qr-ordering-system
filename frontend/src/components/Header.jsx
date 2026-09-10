import logo from "../assets/cafe-pepita-logo.png";
import cartIcon from "../assets/cart-shopping-solid.png";

function Header({ customerName, orderType }) {
  return (
    <header className="bg-[#fffaf5]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">

        {/* Logo + Café Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5ddd4] bg-white">
            <img
              src={logo}
              alt="Café Pepita Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#000000]">
              Café Pepita
            </h1>

            <p className="text-sm text-[#967966]">
              {customerName && orderType
                ? `${customerName} · ${orderType}`
                : "Order your favorites"}
            </p>
          </div>
        </div>

        {/* Cart */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1713]">
          <img
            src={cartIcon}
            alt="Cart"
            className="h-5 w-5 object-contain"
          />
        </div>

      </div>
    </header>
  );
}

export default Header;