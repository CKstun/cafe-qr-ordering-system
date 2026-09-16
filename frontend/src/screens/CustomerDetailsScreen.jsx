function CustomerDetailsScreen({
  name,
  setName,
  orderType,
  setOrderType,
  onBack,
  onContinue,
}) {
  const canContinue = name.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7eee1] px-6 pb-8 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-[#8a7863]"
      >
        <span aria-hidden="true">‹</span> Back
      </button>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <img
            src="/src/assets/logo.jpg"
            alt="Café Pepita"
            className="h-64 w-64 rounded-full object-cover shadow-sm"
          />
          <h1 className="mt-4 text-[22px] font-bold text-[#46281b]">
            Welcome!
          </h1>
          <p className="mt-1 text-sm text-[#8a7863]">
            Tell us your name so we know whose order is whose.
          </p>
        </div>

        <div className="mt-9 w-full max-w-sm">
          <label className="text-[11px] font-semibold tracking-wide text-[#9c8873]">
            YOUR NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Barbara"
            className="mt-2 w-full rounded-xl bg-[#efe1cc] px-4 py-3 text-[15px] text-[#3a2a1e] outline-none placeholder:text-[#9c8873]"
          />
        </div>

        <div className="mt-6 w-full max-w-sm">
          <label className="text-[11px] font-semibold tracking-wide text-[#9c8873]">
            ORDER TYPE
          </label>
          <div className="mt-2 flex gap-3">
            {["Dine-in", "Take-out"].map((type) => {
              const active = orderType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`flex-1 rounded-full py-3 text-[14px] font-medium transition-colors ${
                    active
                      ? "bg-[#5a3e32] text-white"
                      : "border border-[#e6d8c3] bg-white text-[#3a2a1e]"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 w-full max-w-sm">
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className={`w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition-opacity ${
              canContinue ? "bg-[#5a3e32]" : "bg-[#d9c6ac] opacity-90"
            }`}
          >
            View Menu →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailsScreen;
