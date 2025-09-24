"use client";

import Image from "next/image";
import Link from "next/link";
import FooterRegion from "./footer-region";

const columns = [
  {
    title: "Featured",
    links: [
      { label: "Air Force 1", href: "/products?search=Air%20Force%201" },
      { label: "Huarache", href: "/products?search=Huarache" },
      { label: "Air Max 90", href: "/products?search=Air%20Max%2090" },
      { label: "Air Max 95", href: "/products?search=Air%20Max%2095" },
    ],
  },
  {
    title: "Shoes",
    links: [
      { label: "All Shoes", href: "/products" },
      { label: "Custom Shoes", href: "/products?category=custom" },
      { label: "Jordan Shoes", href: "/products?brand=jordan" },
      { label: "Running Shoes", href: "/products?category=running" },
    ],
  },
  {
    title: "Clothing",
    links: [
      { label: "All Clothing", href: "/products?category=clothing" },
      { label: "Modest Wear", href: "/products?category=modest" },
      { label: "Hoodies & Pullovers", href: "/products?category=hoodies" },
      { label: "Shirts & Tops", href: "/products?category=tops" },
    ],
  },
  {
    title: "Kids'",
    links: [
      { label: "Infant & Toddler Shoes", href: "/products?category=infant" },
      { label: "Kids' Shoes", href: "/products?category=kids" },
      { label: "Kids' Jordan Shoes", href: "/products?brand=jordan&category=kids" },
      { label: "Kids' Basketball Shoes", href: "/products?category=basketball&gender=kids" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="flex items-start md:col-span-3">
            <Image src="/logo.svg" alt="Nike" width={48} height={48} />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-heading-3">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-body text-light-400 hover:text-light-300"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex gap-4 md:col-span-2 md:justify-end">
            {[
              { src: "/x.svg", alt: "X", href: "https://x.com/nike" },
              { src: "/facebook.svg", alt: "Facebook", href: "https://facebook.com/nike" },
              { src: "/instagram.svg", alt: "Instagram", href: "https://instagram.com/nike" },
            ].map((s) => (
              <Link
                key={s.alt}
                href={s.href}
                aria-label={s.alt}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-light-100"
              >
                <Image src={s.src} alt={s.alt} width={18} height={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 text-light-400 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-caption">
            <Image src="/globe.svg" alt="" width={16} height={16} />
            <FooterRegion />
            <span>© {new Date().getFullYear()} Nike, Inc. All Rights Reserved</span>
          </div>
          <ul className="flex items-center gap-6 text-caption">
            {[
              { label: "Guides", href: "/collections" },
              { label: "Terms of Sale", href: "https://www.nike.com/help/a/terms-of-sale" },
              { label: "Terms of Use", href: "https://agreementservice.svs.nike.com/in/consent?continueUrl=https://www.nike.com" },
              { label: "Nike Privacy Policy", href: "https://www.nike.com/help/a/privacy-policy" },
            ].map((t) => (
              <li key={t.label}>
                <Link href={t.href} target={t.href.startsWith('http') ? '_blank' : undefined} rel={t.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{t.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
