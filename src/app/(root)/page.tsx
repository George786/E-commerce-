import React from "react";
import { Card } from "@/components";
import { getAllProducts } from "@/lib/actions/product"; // ✅ import real product fetch function

const Home = async () => {
    // ✅ Define filters — adjust as needed
    const filters = {
        search: undefined,
        genderSlugs: [],         // e.g., ['men'] for men's shoes only
        brandSlugs: [],
        categorySlugs: [],
        sizeSlugs: [],
        colorSlugs: [],
        priceMin: undefined,
        priceMax: undefined,
        priceRanges: [],
        sort: "newest",
        page: 1,
        limit: 6,                // show 6 products
    };

    // ✅ Fetch real products
    const { products } = await getAllProducts(filters);

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section aria-labelledby="latest" className="pb-12">
                <h2 id="latest" className="mb-6 text-heading-3 text-dark-900">
                    Latest shoes
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <Card
                            key={p.id}
                            title={p.name}
                            subtitle={p.subtitle || ""}
                            imageSrc={p.imageUrl || "/fallback-image.jpg"}
                            price={p.minPrice !== null ? p.minPrice.toFixed(2) : undefined}
                            href={`/products/${p.id}`}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Home;
