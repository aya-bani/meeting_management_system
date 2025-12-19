function FilterBar({ children }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap gap-3 items-center">{children}</div>
    </div>
  );
}

export default FilterBar;


