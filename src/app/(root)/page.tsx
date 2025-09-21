import React from "react";
export const dynamic = 'force-dynamic'
import { Card } from "@/components";
import { getAllProducts } from "@/lib/actions/product";
import { NormalizedProductFilters } from "@/lib/utils/query";
import { formatUSD } from "@/lib/utils/currency";
import OffersSection from "@/components/OffersSection";
import Image from "next/image";

const Home = async () => {
    const filters: NormalizedProductFilters = {
        search: undefined,
        genderSlugs: [],
        brandSlugs: [],
        categorySlugs: [],
        sizeSlugs: [],
        colorSlugs: [],
        priceMin: undefined,
        priceMax: undefined,
        priceRanges: [],
        sort: "newest",
        page: 1,
        limit: 6,
    };

    const { products } = await getAllProducts(filters);

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section className="mb-12">
                <Image
                    src="/hero-section-v1.jpg"  // Put your hero.webp in the public folder
                    alt="Hero Banner"
                    width={1200}
                    height={400}
                    className="w-full rounded-md object-cover"
                    priority // loads eagerly
                />
            </section>
            
            {/* Offers Section */}
            <OffersSection />
            
            <section aria-labelledby="latest" className="pb-12">
                <h2 id="latest" className="mb-6 text-heading-3 text-dark-900">
                    Latest shoes
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p, index) => {
                        // Add sample offers to some products
                        const hasOffer = index < 2 // First 2 products have offers
                        const originalPrice = hasOffer && p.minPrice ? p.minPrice * 1.3 : undefined
                        const offer = hasOffer ? {
                            type: index === 0 ? 'festive' as const : 'percentage' as const,
                            value: index === 0 ? 'BBD' : '30% OFF',
                            label: index === 0 ? 'Big Billion Day' : 'Special Offer'
                        } : undefined

                        return (
                            <Card
                                key={p.id}
                                title={p.name}
                                subtitle={p.subtitle || ""}
                                imageSrc={p.imageUrl || "/fallback-image.jpg"}
                                price={p.minPrice !== null ? formatUSD(p.minPrice) : undefined}
                                originalPrice={originalPrice ? formatUSD(originalPrice) : undefined}
                                offer={offer}
                                href={`/products/${p.id}`}
                            />
                        )
                    })}
                </div>
            </section>
        </main>
    );
};

export default Home;
