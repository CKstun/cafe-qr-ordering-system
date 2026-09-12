function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const orderedCategories = [
    ...categories,
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <button
        type="button"
        onClick={() =>
          onSelectCategory("All")
        }
        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
          selectedCategory === "All"
            ? "border-[#5a3e32] bg-[#5a3e32] text-white"
            : "border-[#9b8f82] bg-white text-[#5a3e32] hover:bg-[#5a3e32] hover:text-white"
        }`}
      >
        All
      </button>

      {orderedCategories.map(
        (category) => (
          <button
            type="button"
            key={category}
            onClick={() =>
              onSelectCategory(category)
            }
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? "border-[#5a3e32] bg-[#5a3e32] text-white"
                : "border-[#9b8f82] bg-white text-[#5a3e32] hover:bg-[#5a3e32] hover:text-white"
            }`}
          >
            {category}
          </button>
        )
      )}
    </div>
  );
}

export default CategoryFilter;