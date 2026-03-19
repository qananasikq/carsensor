"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { MouseEvent } from "react";

const PLACEHOLDER = "https://placehold.co/1600x1000?text=Фото+отсутствует";

type Props = {
  title: string;
  images: string[];
  activeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onChange: (index: number) => void;
  showThumbnails?: boolean;
};

function clampIndex(index: number, total: number) {
  if (total <= 0) return 0;
  if (index < 0) return total - 1;
  if (index >= total) return 0;
  return index;
}

export default function PhotoLightbox({ title, images, activeIndex, isOpen, onClose, onChange, showThumbnails = true }: Props) {
  const total = images.length;
  const safeIndex = clampIndex(activeIndex, total);
  const activeSrc = images[safeIndex] || PLACEHOLDER;

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    onChange(clampIndex(safeIndex - 1, total));
  }, [onChange, safeIndex, total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    onChange(clampIndex(safeIndex + 1, total));
  }, [onChange, safeIndex, total]);

  useEffect(() => {
    if (total <= 1) return;

    const preloadTargets = [images[clampIndex(safeIndex - 1, total)], images[clampIndex(safeIndex + 1, total)]].filter(Boolean);
    preloadTargets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [images, safeIndex, total]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/92" onClick={onClose} role="dialog" aria-modal="true" aria-label={title || "Просмотр фотографий"}>
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
        <div className="rounded-full bg-black/35 px-3 py-1.5 text-xs text-white/90 ring-1 ring-white/15 sm:text-sm">
          {safeIndex + 1} / {total}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20 sm:text-sm"
          aria-label="Закрыть просмотр"
        >
          Закрыть
        </button>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-2 pb-2 pt-16 sm:px-6 sm:pb-4 sm:pt-20">
        <div
          className="relative flex w-full max-w-4xl flex-1 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04] px-2 py-2 shadow-2xl sm:rounded-[28px] sm:px-6 sm:py-4"
          onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
        >
          {total > 1 ? (
            <button
              type="button"
              onClick={goPrev}
              className="absolute bottom-3 left-3 z-10 rounded-full bg-black/55 px-3 py-2 text-sm text-white transition hover:bg-black/65 sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2 sm:px-3 sm:py-3 sm:text-lg"
              aria-label="Предыдущее фото"
            >
              ←
            </button>
          ) : null}

          <div className="relative h-[50vh] w-full max-w-3xl sm:h-[60vh]">
            <Image
              src={activeSrc}
              alt={`${title} ${safeIndex + 1}`}
              fill
              priority
              quality={80}
              sizes="80vw"
              className="object-contain"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect fill='%230f172a' width='1200' height='800'/%3E%3C/svg%3E"
            />
          </div>

          {total > 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="absolute bottom-3 right-3 z-10 rounded-full bg-black/55 px-3 py-2 text-sm text-white transition hover:bg-black/65 sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:px-3 sm:py-3 sm:text-lg"
              aria-label="Следующее фото"
            >
              →
            </button>
          ) : null}
        </div>

        {showThumbnails && total > 1 ? (
          <div className="mt-3 flex w-full max-w-4xl gap-2 overflow-x-auto px-1 pb-1 sm:mt-4 sm:gap-3" onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => onChange(index)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition sm:h-20 sm:w-28 sm:rounded-2xl ${
                  index === safeIndex ? "border-white ring-2 ring-white/80" : "border-white/15 hover:border-white/40"
                }`}
                aria-label={`Открыть фото ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${title} ${index + 1}`}
                  fill
                  quality={55}
                  sizes="112px"
                  className="object-cover"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 80'%3E%3Crect fill='%23334155' width='112' height='80'/%3E%3C/svg%3E"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
