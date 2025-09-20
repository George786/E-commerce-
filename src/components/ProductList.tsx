"use client";

import Card from "@/components/Card";

interface Product {
    id: string;
    name: string;
    subtitle?: string | null;
    imageUrl?: string | null;
    minPrice: number | null;
    maxPrice: number | null;
}

export default function ProductList({ products }: { products: Product[] }) {
    if (products.length === 0) {
        return (
            <div className="rounded-lg border border-light-300 p-8 text-center">
                <p className="text-body text-dark-700">No products match your filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-6">
            {products.map((p) => {
                const price =
                    p.minPrice !== null &&
                    p.maxPrice !== null &&
                    p.minPrice !== p.maxPrice
                        ? `$${p.minPrice.toFixed(2)} - $${p.maxPrice.toFixed(2)}`
                        : p.minPrice !== null
                            ? `$${p.minPrice.toFixed(2)}`
                            : undefined;

                return (
                    <Card
                        key={p.id}
                        title={p.name}
                        subtitle={p.subtitle ?? undefined}
                        imageSrc={p.imageUrl ?? "/shoes/shoe-1.jpg"}
                        price={price}
                        href={`/products/${p.id}`}

                    />
                );
            })}
        </div>
    );
}
