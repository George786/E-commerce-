import Image from "next/image";
import Link from "next/link";
import { Tag, Percent } from "lucide-react";

export interface CardProps {
  title: string;
  description?: string;
  subtitle?: string;
  meta?: string | string[];
  imageSrc: string;
  imageAlt?: string;
  price?: string | number;
  originalPrice?: string | number;
  offer?: {
    type: 'percentage' | 'fixed' | 'bogo' | 'festive';
    value: string;
    label?: string;
  };
  href?: string;
  className?: string;
}

export default function Card({
  title,
  description,
  subtitle,
  meta,
  imageSrc,
  imageAlt = title,
  price,
  originalPrice,
  offer,
  href,
  className = "",
}: CardProps) {
  const displayPrice =
    price === undefined ? undefined : typeof price === "number" ? `$${price.toFixed(2)}` : price;
  const content = (
    <article
      className={`group card-hover rounded-2xl bg-light-100 shadow-lg ring-1 ring-light-300 transition-all duration-300 hover:ring-blue-500 hover:shadow-glow ${className}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-light-200 to-light-300">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 360px, (min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-all duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Offer Badge */}
        {offer && (
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              offer.type === 'festive' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : offer.type === 'percentage'
                ? 'bg-blue-500 text-white'
                : offer.type === 'bogo'
                ? 'bg-green-500 text-white'
                : 'bg-purple-500 text-white'
            }`}>
              {offer.type === 'percentage' ? (
                <Percent className="h-3 w-3" />
              ) : (
                <Tag className="h-3 w-3" />
              )}
              {offer.value}
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h3 className="text-heading-3 text-dark-900 group-hover:gradient-text transition-all duration-300">{title}</h3>
          {displayPrice && (
            <div className="text-right">
              {originalPrice && offer && (
                <span className="text-caption text-dark-500 line-through block">
                  {typeof originalPrice === "number" ? `$${originalPrice.toFixed(2)}` : originalPrice}
                </span>
              )}
              <span className="text-body-medium font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                {displayPrice}
              </span>
            </div>
          )}
        </div>
        {description && <p className="text-body text-dark-700 line-clamp-2">{description}</p>}
        {subtitle && <p className="text-body text-dark-600 font-medium">{subtitle}</p>}
        {meta && (
          <p className="mt-2 text-caption text-dark-500 bg-light-200 px-2 py-1 rounded-md">
            {Array.isArray(meta) ? meta.join(" • ") : meta}
          </p>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link
      href={href}
      aria-label={title}
      className="block rounded-2xl focus-ring"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
