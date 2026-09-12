import logo from "../assets/cafe-pepita-logo.png";

function WelcomeScreen({ onStart }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf5] px-6">
      <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-[#e5ddd4] bg-white shadow-sm">
        <img
          src={logo}
          alt="Café Pepita Logo"
          className="h-full w-full object-contain"
        />
      </div>

      <p className="mt-6 text-xs font-medium tracking-[0.2em] text-[#9b8f82]">
        SIP THE MOMENT.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-16 w-full max-w-xs rounded-2xl bg-[#5a3e32] px-6 py-4 text-base font-medium text-white shadow-sm transition hover:bg-[#4a3027] active:scale-[0.98]"
      >
        Start Ordering
      </button>
    </div>
  );
}

export default WelcomeScreen;
