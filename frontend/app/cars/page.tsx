import Link from "next/link";
import { redirect } from "next/navigation";
import CarCard from "@/components/CarCard";
import FilterBar from "@/components/FilterBar";
import { fetchCars } from "@/lib/api";

type Props = {
  searchParams: Record<string, string | undefined>;
};

const MAX_VISIBLE_PAGES = 7;

function normalizePageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function buildSearchQuery(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  params.set("page", String(page));
  return `/cars?${params.toString()}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const visibleCount = Math.min(totalPages, MAX_VISIBLE_PAGES);

  if (totalPages <= MAX_VISIBLE_PAGES || currentPage <= 4) {
    return Array.from({ length: visibleCount }, (_, index) => index + 1);
  }

  if (currentPage >= totalPages - 3) {
    return Array.from({ length: visibleCount }, (_, index) => totalPages - visibleCount + index + 1);
  }

  return Array.from({ length: visibleCount }, (_, index) => currentPage - 3 + index);
}

export default async function CarsPage({ searchParams }: Props) {
  const currentPage = normalizePageNumber(searchParams.page);
  const response = await fetchCars({
    ...searchParams,
    page: String(currentPage),
    limit: searchParams.limit || "12"
  });

  if (!response) {
    redirect("/login");
  }

  const visiblePages = getVisiblePages(currentPage, response.pagination.pages);

  function buildLink(page: number) {
    return buildSearchQuery(searchParams, page);
  }

  return (
    <main className="container-main py-6 md:py-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Каталог автомобилей</h1>
          <p className="mt-1.5 text-sm text-slate-500">Актуальные объявления из базы с поиском по основным параметрам</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="panel px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Всего</div>
            <div className="mt-1 text-xl font-semibold leading-tight text-slate-900">{response.pagination.total}</div>
            <div className="mt-1 text-xs text-slate-500">объявлений</div>
          </div>
          <div className="panel px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Страница</div>
            <div className="mt-1 text-xl font-semibold leading-tight text-slate-900">
              {currentPage}
              <span className="ml-1 text-sm font-normal text-slate-400">из {response.pagination.pages}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">текущий результат</div>
          </div>
        </div>
      </div>

      <FilterBar current={searchParams} />

      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Показано <span className="font-medium text-slate-700">{response.items.length}</span> из{" "}
          <span className="font-medium text-slate-700">{response.pagination.total}</span>
        </p>
        {response.pagination.pages > 1 ? (
          <p className="text-sm text-slate-400">
            Стр. {currentPage} / {response.pagination.pages}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {response.items.map((car: any) => <CarCard key={car._id} car={car} />)}
      </div>

      {response.items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <div className="text-xl font-semibold text-slate-400">−</div>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-700">Ничего не найдено</p>
            <p className="mt-1 text-sm text-slate-500">Попробуйте убрать часть ограничений или изменить запрос.</p>
          </div>
          <Link href="/cars" className="btn-primary mt-2">Очистить фильтры</Link>
        </div>
      ) : null}

      {response.pagination.pages > 1 ? (
        <div className="mt-10">
          <div className="panel flex flex-wrap items-center justify-center gap-2 px-3 py-3 sm:px-4">
            {currentPage > 1 ? (
              <Link href={buildLink(currentPage - 1)} className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Назад
              </Link>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-1 px-1">
              {visiblePages.map((page) => (
                <Link
                  key={page}
                  href={buildLink(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition ${
                    page === currentPage
                      ? "bg-slate-900 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
            {currentPage < response.pagination.pages ? (
              <Link href={buildLink(currentPage + 1)} className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Вперёд
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
