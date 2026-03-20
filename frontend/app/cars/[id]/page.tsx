import Link from "next/link";
import { redirect } from "next/navigation";
import CarGallery from "@/components/CarGallery";
import { formatMoneyPair } from "@/lib/currency";
import { collapseRepeatedText, formatMileage, sanitizeUiText } from "@/lib/display";
import { fetchCarById } from "@/lib/api";
import { resolveMileageKm } from "@/lib/mileage";
import { translateColor } from "@/lib/translate";

type Props = {
  params: { id: string };
};

export default async function CarDetailPage({ params }: Props) {
  const car = await fetchCarById(params.id);

  if (car === null) {
    redirect("/login");
  }

  if (!car) {
    return (
      <main className="container-main py-8">
        <div className="panel p-6">
          <p>Автомобиль не найден.</p>
          <Link href="/cars" className="btn-soft mt-4 inline-flex items-center gap-2">
            <span aria-hidden="true">←</span>
            <span>Вернуться к списку</span>
          </Link>
        </div>
      </main>
    );
  }

  const carTitle = sanitizeUiText(car.title) || "Автомобиль";
  const mileageKm = resolveMileageKm(car);
  const toDisplay = (value: unknown, fallback = "—") => {
    const prepared = collapseRepeatedText(sanitizeUiText(String(value ?? "")));
    return prepared || fallback;
  };

  const priceSpecsRaw: [string, string][] = [
    ["Цена с расходами", formatMoneyPair(car.priceTotal, car.priceTotalRub)],
    ["Доп. расходы", formatMoneyPair(car.extraCosts, car.extraCostsRub)],
  ];
  const priceSpecs = priceSpecsRaw.filter(([, v]) => v !== "—");
  const mileageValue = formatMileage(mileageKm);

  const mainSpecs: [string, string][] = [
    ["Пробег", mileageValue],
    ["Год", String(car.year || "—")],
    ["Топливо", toDisplay(car.fuel)],
    ["КПП", toDisplay(car.transmission)],
    ["Привод", toDisplay(car.drive)],
    ["Руль", toDisplay(car.steering)],
    ["Цвет", collapseRepeatedText(translateColor(car.color) || "") || "—"],
    ["Кузов", toDisplay(car.bodyType)],
    ["Дверей", String(car.doors || "—")],
    ["Мест", String(car.seats || "—")],
    ["Объём двигателя", toDisplay(car.engineVolume)],
  ];

  const detailSpecs: [string, string][] = [
    ["Ремонтная история", toDisplay(car.repairHistory)],
    ["Один владелец", toDisplay(car.oneOwner)],
    ["Не курили в салоне", toDisplay(car.nonSmoking)],
    ["Гарантия", toDisplay(car.warranty)],
    ["Техосмотр", toDisplay(car.inspection)],
    ["Обслуживание", toDisplay(car.service)],
    ["VIN (последние цифры)", String(car.vinTail || "—")],
    ["Регион", toDisplay(car.region)],
  ];

  const sellerSpecsRaw: [string, string][] = [
    ["Продавец", toDisplay(car.seller)],
    ["Адрес", toDisplay(car.sellerAddress)],
    ["Телефон", toDisplay(car.dealerPhone)],
  ];
  const sellerSpecs = sellerSpecsRaw.filter(([, v]) => v !== "—");

  return (
    <main className="container-main py-4 md:py-8">
      <div className="mb-5 flex flex-col gap-3 md:mb-6 md:gap-4">
        <div>
          <Link
            href="/cars"
            className="btn-soft inline-flex items-center gap-2 border-slate-300 bg-white/95 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:shadow-md"
          >
            <span aria-hidden="true">←</span>
            <span>Назад к списку</span>
          </Link>
        </div>
        <div>
          <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            Карточка автомобиля
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {carTitle}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="overflow-hidden rounded-2xl">
            <CarGallery title={carTitle} images={car.imageUrls || []} />
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="panel p-4 sm:p-6">
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-500">Цена</div>
              <div className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{formatMoneyPair(car.price, car.priceRub)}</div>
              <div className="mt-1 text-xs text-slate-500">Базовая цена на аукционе</div>
            </div>
            {priceSpecs.length > 0 ? (
              <div className="space-y-2.5 border-t border-slate-200 pt-4">
                {priceSpecs.map(([label, value]) => (
                  <div key={String(label)} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-900 sm:text-right">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <a href={car.sourceUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-3 font-semibold">
              Открыть на carsensor.net
            </a>
          </div>

          {sellerSpecs.length > 0 ? (
            <div className="panel p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Продавец</h3>
              <div className="space-y-3">
                {sellerSpecs.map(([label, value]) => (
                  <div key={String(label)} className="border-b border-slate-200 pb-2.5 last:border-0">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="mt-1 break-words text-sm font-semibold text-slate-900">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="panel p-4 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Коротко</h3>
            <div className="space-y-3">
              {[
                ["Год выпуска", String(car.year || "—")],
                ["Пробег", mileageValue],
                ["КПП", toDisplay(car.transmission)],
                ["Привод", toDisplay(car.drive)],
                ["Топливо", toDisplay(car.fuel)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex flex-col gap-1 border-b border-slate-200 pb-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900 sm:text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:gap-6 lg:grid-cols-2">
        <div className="panel p-4 sm:p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Основные данные</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
            {mainSpecs.map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-xs font-medium text-slate-600">{label}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{String(value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-4 sm:p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Детальные характеристики</h2>
          <div className="space-y-3">
            {detailSpecs.map(([label, value]) => (
              <div key={String(label)} className="flex flex-col gap-1 border-b border-slate-200 pb-3 text-sm last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="break-words font-semibold text-slate-900 sm:max-w-[60%] sm:text-right">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6 lg:grid-cols-2">
        <div className="panel p-4 sm:p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">Описание</h2>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{sanitizeUiText(car.description) || "Описание в объявлении не указано."}</p>
        </div>

        <div className="panel p-4 sm:p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">Опции и оборудование</h2>
          <div className="flex flex-wrap gap-2">
            {car.features?.length ? car.features.map((feature: string) => {
              const translatedFeature = sanitizeUiText(feature);
              if (!translatedFeature) return null;
              return (
                <span key={feature} className="inline-block max-w-full truncate rounded-full bg-slate-100/90 px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">{translatedFeature}</span>
              );
            }).filter(Boolean) : <span className="text-sm text-slate-500">Опции не указаны</span>}
          </div>
        </div>
      </div>
    </main>
  );
}
