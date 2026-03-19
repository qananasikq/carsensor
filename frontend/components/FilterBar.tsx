type Props = {
  current: Record<string, string | undefined>;
};

export default function FilterBar({ current }: Props) {
  return (
    <form className="panel overflow-hidden border-slate-200/90">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-sm font-semibold tracking-wide text-slate-700">
          Поиск и фильтры
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2 xl:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Поиск</label>
          <input name="search" defaultValue={current.search || ""} placeholder="По названию, бренду или модели" className="field w-full" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Марка</label>
          <input name="brand" defaultValue={current.brand || ""} placeholder="Например, BMW" className="field w-full" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Модель</label>
          <input name="model" defaultValue={current.model || ""} placeholder="Например, X5" className="field w-full" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Регион</label>
          <input name="region" defaultValue={current.region || ""} placeholder="Например, Токио" className="field w-full" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Год выпуска</label>
          <div className="flex gap-2">
            <input name="yearFrom" defaultValue={current.yearFrom || ""} placeholder="От" className="field w-full" />
            <input name="yearTo" defaultValue={current.yearTo || ""} placeholder="До" className="field w-full" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Цена</label>
          <div className="flex gap-2">
            <input name="priceFrom" defaultValue={current.priceFrom || ""} placeholder="От" className="field w-full" />
            <input name="priceTo" defaultValue={current.priceTo || ""} placeholder="До" className="field w-full" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Пробег</label>
          <div className="flex gap-2">
            <input name="mileageFrom" defaultValue={current.mileageFrom || ""} placeholder="От" className="field w-full" />
            <input name="mileageTo" defaultValue={current.mileageTo || ""} placeholder="До" className="field w-full" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Сортировать по</label>
          <div className="relative">
            <select name="sortBy" defaultValue={current.sortBy || "scrapedAt"} className="field field-select w-full pr-10">
              <option value="scrapedAt">Дате добавления</option>
              <option value="price">Цене</option>
              <option value="year">Году выпуска</option>
              <option value="mileage">Пробегу</option>
              <option value="brand">Марке</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">▾</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Порядок</label>
          <div className="relative">
            <select name="sortOrder" defaultValue={current.sortOrder || "desc"} className="field field-select w-full pr-10">
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">▾</span>
          </div>
        </div>

        <input type="hidden" name="page" value="1" />
        <div className="col-span-2 flex items-end sm:col-span-1">
          <button className="btn-primary w-full active:scale-[0.98]">Применить</button>
        </div>
      </div>
    </form>
  );
}
