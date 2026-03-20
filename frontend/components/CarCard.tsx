"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import PhotoLightbox from "@/components/PhotoLightbox";
import { formatPriceWithKnownRub } from "@/lib/currency";
import { formatMileage, sanitizeUiText } from "@/lib/display";
import { getDisplayImageUrls, PLACEHOLDER_IMAGE } from "@/lib/images";
import { resolveMileageKm } from "@/lib/mileage";

type Car = {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  price: number | null;
  priceRub?: number | null;
  region: string;
  imageUrls: string[];
  rawSpecs?: {
    normalized?: {
      mileage?: number | null;
    };
    [key: string]: unknown;
  };
};

export default function CarCard({ car }: { car: Car }) {
  const normalizedImages = useMemo(() => {
    const filtered = getDisplayImageUrls(car.imageUrls || []);
    return filtered.length ? filtered : [PLACEHOLDER_IMAGE];
  }, [car.imageUrls]);

  const fallback = (value: string, empty = "—") => value || empty;

  const image = normalizedImages[0];
  const title = sanitizeUiText(car.title);
  const brand = sanitizeUiText(car.brand);
  const model = sanitizeUiText(car.model);
  const region = sanitizeUiText(car.region);
  const mileageKm = resolveMileageKm(car);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const cleanPrice = formatPriceWithKnownRub(car.price, car.priceRub);
  const cleanMileage = formatMileage(mileageKm);
  const displayTitle = title || "Без названия";
  const displaySubtitle = fallback([brand, model].filter(Boolean).join(" "));
  const displayRegion = fallback(region);

  return (
    <>
      <article className="group panel flex h-full flex-col overflow-hidden border-slate-200/90 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setActivePreviewIndex(0);
              setIsPreviewOpen(true);
            }}
            className="relative block aspect-[3/2] w-full overflow-hidden bg-slate-100 text-left"
          >
            <Image
              src={image}
              alt={title || "Автомобиль"}
              fill
              unoptimized
              quality={68}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="eager"
              fetchPriority="high"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 266'%3E%3Crect fill='%23f1f5f9' width='400' height='266'/%3E%3C/svg%3E"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/10" />
          </button>
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-sm">
            {car.year || "—"}
          </span>
          {normalizedImages.length > 1 ? (
            <span className="absolute right-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              {normalizedImages.length}
            </span>
          ) : null}
          <div className="absolute bottom-2.5 left-2.5 rounded-md bg-slate-900/85 px-2.5 py-1 text-sm font-bold text-white">
            {cleanPrice}
          </div>
        </div>

        <Link href={`/cars/${car._id}`} className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">{displayTitle}</h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{displaySubtitle}</p>

          <div className="mt-3 flex-1 space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Пробег:</span>
              <span className="font-semibold text-slate-900">{cleanMileage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Регион:</span>
              <span className="font-semibold text-slate-900">{displayRegion}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-400">ID: {car._id.slice(-6)}</span>
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50">
              Подробнее
            </span>
          </div>
        </Link>
      </article>

      <PhotoLightbox
        title={title || "Автомобиль"}
        images={normalizedImages}
        activeIndex={activePreviewIndex}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onChange={setActivePreviewIndex}
        showThumbnails={false}
      />
    </>
  );
}
