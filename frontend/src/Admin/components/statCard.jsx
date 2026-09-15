function StatCard({ label, value, sublabel, accent = "text-[#46281b]" }) {
  return (
    <div className="rounded-2xl border border-[#e6d8c3] bg-[#fffdf8] p-5 shadow-sm">
      <div className="text-[11px] font-semibold tracking-wide text-[#9c8873]">
        {label.toUpperCase()}
      </div>

      <div className={`mt-2 text-3xl font-bold ${accent}`}>{value}</div>

      {sublabel && (
        <div className="mt-1 text-xs text-[#8a7863]">{sublabel}</div>
      )}
    </div>
  );
}

export default StatCard;
