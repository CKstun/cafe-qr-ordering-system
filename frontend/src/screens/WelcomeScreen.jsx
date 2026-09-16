function WelcomeScreen({ onStart }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7eee1] px-8 text-center">
      <img
        src="/src/assets/logo.jpg"
        alt="Café Pepita"
        className="h-64 w-64 rounded-full object-cover shadow-md"
      />

      <div className="mt-6 text-[11px] font-medium tracking-[0.25em] text-[#9c8873]">
        SIP THE MOMENT
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-14 w-full max-w-[280px] rounded-xl bg-[#5a3e32] py-4 text-sm font-semibold text-white transition hover:bg-[#46281b] active:scale-[0.98]"
      >
        Start Ordering
      </button>
    </div>
  );
}

export default WelcomeScreen;
