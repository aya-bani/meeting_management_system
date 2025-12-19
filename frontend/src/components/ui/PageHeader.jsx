function PageHeader({ title, description, actions, className = "" }) {
  return (
    <header
      className={`border-b border-slate-200 bg-white/60 backdrop-blur-sm sticky top-0 z-10`}
    >
      <div className={`px-8 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 md:gap-3 justify-start md:justify-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;


