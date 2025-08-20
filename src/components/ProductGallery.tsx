"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

type Variant = {
  color: string;
  images: string[];
};

export interface ProductGalleryProps {
  variants: Variant[];
  initialVariantIndex?: number;
  className?: string;
}

function isValidSrc(src: string | undefined | null) {
  return typeof src === "string" && src.trim().length > 0;
}

export default function ProductGallery({
  variants,
  initialVariantIndex = 0,
  className = "",
}: ProductGalleryProps) {
  const validVariants = useMemo(
    () => variants.filter((v) => Array.isArray(v.images) && v.images.some(isValidSrc)),
    [variants]
  );

  const [variantIndex, setVariantIndex] = useState(() =>
    Math.min(initialVariantIndex, Math.max(validVariants.length - 1, 0))
  );

  const images = validVariants[variantIndex]?.images?.filter(isValidSrc) ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [variantIndex]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (images.length === 0) return;
      setActiveIndex((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!mainRef.current) return;
      if (!document.activeElement) return;
      if (!mainRef.current.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section className={`flex w-full flex-col gap-4 lg:flex-row ${className}`}>
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            aria-label={`Thumbnail ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-light-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${i === activeIndex ? "ring-[--color-dark-500]" : ""}`}
          >
            <Image src={src} alt={`Thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      <div ref={mainRef} className="order-1 relative aspect-square w-full overflow-hidden rounded-xl bg-light-200 lg:order-2">
        {images.length > 0 ? (
          <>
            <Image
              src={images[activeIndex]}
              alt="Product image"
              fill
              sizes="(min-width:1024px) 720px, 100vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
              <span className="rounded-full bg-light-100/80 p-2 ring-1 ring-light-300">
                <ChevronLeft className="h-5 w-5 text-dark-900" />
              </span>
              <span className="rounded-full bg-light-100/80 p-2 ring-1 ring-light-300">
                <ChevronRight className="h-5 w-5 text-dark-900" />
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button
                aria-label="Previous image"
                onClick={() => go(-1)}
                className="rounded-full bg-light-100/80 p-2 ring-1 ring-light-300 transition hover:bg-light-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
              >
                <ChevronLeft className="h-5 w-5 text-dark-900" />
              </button>
              <button
                aria-label="Next image"
                onClick={() => go(1)}
                className="rounded-full bg-light-100/80 p-2 ring-1 ring-light-300 transition hover:bg-light-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
              >
                <ChevronRight className="h-5 w-5 text-dark-900" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dark-700">
            <div className="flex items-center gap-2 rounded-lg border border-light-300 bg-light-100 px-4 py-3">
              <ImageOff className="h-5 w-5" />
              <span className="text-body">No images available</span>
            </div>
          </div>
        )}
      </div>

      <div className="order-3 mt-1 flex gap-3 lg:order-3">
        {validVariants.map((v, i) => {
          const thumb = v.images.find(isValidSrc);
          if (!thumb) return null;
          const selected = i === variantIndex;
          return (
            <button
              key={`${v.color}-${i}`}
              aria-label={`Color ${v.color}`}
              onClick={() => setVariantIndex(i)}
              className={`relative h-16 w-20 overflow-hidden rounded-lg ring-1 ring-light-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${selected ? "ring-[--color-dark-500]" : ""}`}
            >
              <Image src={thumb} alt={v.color} fill sizes="80px" className="object-cover" />
              {selected && (
                <span className="absolute right-1 top-1 rounded-full bg-light-100 p-1">
                  <Check className="h-4 w-4 text-dark-900" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
