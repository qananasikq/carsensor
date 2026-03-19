"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import PhotoLightbox from "@/components/PhotoLightbox";

type Props = {
  title: string;
  images: string[];
};

const PLACEHOLDER = "https://placehold.co/1200x800?text=Фото+отсутствует";

export default function CarGallery({ title, images }: Props) {
  const normalized = useMemo(() => {
    const unique = Array.from(new Set((images || []).filter(Boolean)));
    return unique.length ? unique : [PLACEHOLDER];
  }, [images]);

  const [active, setActive] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const activeSrc = normalized[Math.min(active, normalized.length - 1)] || PLACEHOLDER;

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
        <div className={`grid ${hasMultiple ? "grid-cols-[1fr_120px] sm:grid-cols-[1fr_140px]" : "grid-cols-1"} gap-1`}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left"
          >
            <Image
              src={activeSrc}
              alt={title}
              fill
              priority
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3C/svg%3E"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1} / {normalized.length}
            </div>
            <div className="absolute bottom-3 right-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 opacity-0 transition group-hover:opacity-100">
              Открыть
            </div>
          </button>

          {hasMultiple ? (
            <div className="flex flex-col gap-1">
              {sideImages.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`relative flex-1 min-h-0 overflow-hidden bg-slate-100 transition ${
                    index === active
                      ? "ring-2 ring-inset ring-slate-700"
                      : "hover:opacity-85"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${title} ${index + 1}`}
                    fill
                    quality={60}
                    sizes="140px"
                    className="object-cover"
                    loading="lazy"
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
