function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  danger = true,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#fffdf8] p-6 shadow-xl">
        <h3 className="text-base font-semibold text-[#46281b]">{title}</h3>

        {message && <p className="mt-2 text-sm text-[#8a7863]">{message}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#e6d8c3] bg-white py-2.5 text-sm font-medium text-[#3a2a1e]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#5a3e32] hover:bg-[#46281b]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
