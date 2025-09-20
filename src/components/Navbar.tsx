'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { ShoppingBag } from 'lucide-react'
import SearchBar from './SearchBar'

const NAV_LINKS = [
    { label: 'Men', href: '/products?gender=men' },
    { label: 'Women', href: '/products?gender=women' },
    { label: 'Kids', href: '/products?gender=unisex' },
    { label: 'Collections', href: '/collections' },
    { label: 'Contact', href: '/contact' },
] as const

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const { items, fetchCart } = useCartStore()

    // Fetch cart on mount
    useEffect(() => {
        fetchCart()
    }, [fetchCart])

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <header className="sticky top-0 z-50 glass-effect border-b border-light-300">
            <nav
                className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
                aria-label="Primary"
            >
                <Link href="/" aria-label="Nike Home" className="flex items-center">
                    <Image src="/logo.svg" alt="Nike" width={28} height={28} priority className="invert" />
                </Link>

                <ul className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className="text-body text-dark-900 transition-colors hover:text-dark-700"
                            >
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="hidden items-center gap-6 md:flex">
                    <SearchBar className="w-64" />

                    <Link
                        href="/cart"
                        className="btn-hover relative flex items-center gap-2 text-body text-dark-900 transition-all duration-200 hover:text-blue-600 focus-ring rounded-lg px-3 py-2"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        Cart
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-xs font-bold text-white shadow-lg animate-bounce-slow">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/sign-in"
                        className="btn-hover text-body text-dark-900 transition-all duration-200 hover:text-blue-600 focus-ring rounded-lg px-3 py-2"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
                    aria-controls="mobile-menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="sr-only">Toggle navigation</span>
                    <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
                    <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
                    <span className="block h-0.5 w-6 bg-dark-900"></span>
                </button>
            </nav>

            {/* Mobile Menu */}
            <div id="mobile-menu" className={`border-t border-light-300 md:hidden ${open ? 'block' : 'hidden'}`}>
                <ul className="space-y-2 px-4 py-3">
                    {NAV_LINKS.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className="block py-2 text-body text-dark-900 hover:text-dark-700"
                                onClick={() => setOpen(false)}
                            >
                                {l.label}
                            </Link>
                        </li>
                    ))}

                    <li className="flex items-center justify-between pt-2">
                        <button className="text-body">Search</button>
                        <Link href="/cart" className="text-body relative flex items-center gap-1">
                            Cart
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {totalItems}
                </span>
                            )}
                        </Link>
                        <Link
                            href="/sign-in"
                            className="text-left text-body text-dark-900 hover:text-dark-700"
                            onClick={() => setOpen(false)}
                        >
                            Sign In
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    )
}
