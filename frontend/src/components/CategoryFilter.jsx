function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectCategory("All")}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
          selectedCategory === "All"
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
            selectedCategory === category
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;