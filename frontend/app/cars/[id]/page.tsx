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
          <Link href="/cars" className="mt-4 inline-block text-sm text-blue-600">Вернуться к списку</Link>
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
      <div className="mb-6">
        <Link href="/cars" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900">
          Назад к списку
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{carTitle}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="overflow-hidden rounded-2xl">
            <CarGallery title={carTitle} images={car.imageUrls || []} />
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="panel p-6">
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-500">Цена</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{formatMoneyPair(car.price, car.priceRub)}</div>
              <div className="mt-1 text-xs text-slate-500">Базовая цена на аукционе</div>
            </div>
            {priceSpecs.length > 0 ? (
              <div className="space-y-2.5 border-t border-slate-200 pt-4">
                {priceSpecs.map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <a href={car.sourceUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-3 font-semibold">
              Открыть на carsensor.net
            </a>
          </div>

          {sellerSpecs.length > 0 ? (
            <div className="panel p-6">
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

          <div className="panel p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Коротко</h3>
            <div className="space-y-3">
              {[
                ["Год выпуска", String(car.year || "—")],
                ["Пробег", mileageValue],
                ["КПП", toDisplay(car.transmission)],
                ["Привод", toDisplay(car.drive)],
                ["Топливо", toDisplay(car.fuel)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between border-b border-slate-200 pb-2.5 last:border-0">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Основные данные</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mainSpecs.map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-xs font-medium text-slate-600">{label}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{String(value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Детальные характеристики</h2>
          <div className="space-y-3">
            {detailSpecs.map(([label, value]) => (
              <div key={String(label)} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 text-sm last:border-0">
                <span className="text-slate-600 font-medium">{label}</span>
                <span className="max-w-[60%] break-words text-right font-semibold text-slate-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800">Описание</h2>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{sanitizeUiText(car.description) || "Описание в объявлении не указано."}</p>
        </div>

        <div className="panel p-5">
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
