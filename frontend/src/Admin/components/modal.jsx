function Modal({ title, onClose, children, maxWidth = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-[#fffdf8] shadow-xl`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[#e6d8c3] bg-[#fffdf8] px-6 py-4">
          <h2 className="text-base font-semibold text-[#46281b]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a7863] hover:bg-[#efe1cc]"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
