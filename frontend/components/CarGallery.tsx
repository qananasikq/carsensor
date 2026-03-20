"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import PhotoLightbox from "@/components/PhotoLightbox";
import { getDisplayImageUrls, PLACEHOLDER_IMAGE } from "@/lib/images";

type Props = {
  title: string;
  images: string[];
};

export default function CarGallery({ title, images }: Props) {
  const normalized = useMemo(() => {
    const filtered = getDisplayImageUrls(images || []);
    return filtered.length ? filtered : [PLACEHOLDER_IMAGE];
  }, [images]);

  const [active, setActive] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const activeSrc = normalized[Math.min(active, normalized.length - 1)] || PLACEHOLDER_IMAGE;

  const openLightbox = (index: number) => {
    setActive(index);
    setIsOpen(true);
  };

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(normalized.length - 1, 0)));
  }, [normalized.length]);

  useEffect(() => {
    const preloadTargets = normalized.slice(0, Math.min(8, normalized.length));
    preloadTargets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [normalized]);

  useEffect(() => {
    const preloadTargets = normalized.slice(active, Math.min(active + 3, normalized.length));
    preloadTargets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [active, normalized]);

  const sideImages = normalized.slice(0, 5);
  const hasMultiple = normalized.length > 1;

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className={`grid ${hasMultiple ? "grid-cols-1 md:grid-cols-[1fr_120px] lg:grid-cols-[1fr_140px]" : "grid-cols-1"} gap-1`}>
          <button
            type="button"
            onClick={() => openLightbox(active)}
            className="group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left"
            aria-label="Открыть галерею"
          >
            <Image
              src={activeSrc}
              alt={title}
              fill
              priority
              unoptimized
              loading="eager"
              fetchPriority="high"
              quality={72}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3C/svg%3E"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1} / {normalized.length}
            </div>
            <div className="absolute bottom-3 right-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
              Открыть
            </div>
          </button>

          {hasMultiple ? (
            <div className="flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-visible md:p-0">
              {sideImages.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 transition md:h-auto md:w-auto md:flex-1 md:min-h-0 md:rounded-none ${
                    index === active
                      ? "ring-2 ring-inset ring-slate-700"
                      : "hover:opacity-85"
                  }`}
                  aria-label={`Открыть фото ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${title} ${index + 1}`}
                    fill
                    unoptimized
                    quality={60}
                    sizes="140px"
                    className="object-cover"
                    loading={index < 3 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 140'%3E%3Crect fill='%23f1f5f9' width='140' height='140'/%3E%3C/svg%3E"
                  />
                  {index === sideImages.length - 1 && normalized.length > 5 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                      +{normalized.length - 5}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {hasMultiple ? (
          <div className="flex justify-end border-t border-slate-200 px-3 py-2">
            <button
              type="button"
              onClick={() => openLightbox(active)}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Все фото ({normalized.length})
            </button>
          </div>
        ) : null}
      </div>

      <PhotoLightbox
        title={title}
        images={normalized}
        activeIndex={active}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onChange={setActive}
      />
    </>
  );
}
