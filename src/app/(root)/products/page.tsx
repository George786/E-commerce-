import { Card } from "@/components";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import { parseFilterParams } from "@/lib/utils/query";
import { getAllProducts } from "@/lib/actions/product";
import ProductList from "@/components/ProductList";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
                                               searchParams,
                                           }: {
    searchParams: Promise<SearchParams>;
}) {
    const sp = await searchParams;
    const parsed = parseFilterParams(sp);
    const { products, totalCount } = await getAllProducts(parsed);

    const activeBadges: string[] = [];
    (sp.gender ? (Array.isArray(sp.gender) ? sp.gender : [sp.gender]) : []).forEach((g) =>
        activeBadges.push(String(g)[0].toUpperCase() + String(g).slice(1))
    );
    (sp.size ? (Array.isArray(sp.size) ? sp.size : [sp.size]) : []).forEach((s) =>
        activeBadges.push(`Size: ${s}`)
    );
    (sp.color ? (Array.isArray(sp.color) ? sp.color : [sp.color]) : []).forEach((c) =>
        activeBadges.push(String(c)[0].toUpperCase() + String(c).slice(1))
    );
    (sp.price ? (Array.isArray(sp.price) ? sp.price : [sp.price]) : []).forEach((p) => {
        const [min, max] = String(p).split("-");
        const label =
            min && max
                ? `$${min} - $${max}`
                : min && !max
                    ? `Over $${min}`
                    : `$0 - $${max}`;
        activeBadges.push(label);
    });

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="flex items-center justify-between py-6">
                <h1 className="text-heading-3 text-dark-900">New ({totalCount})</h1>
                <Sort />
            </header>

            {activeBadges.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {activeBadges.map((b, i) => (
                        <span
                            key={`${b}-${i}`}
                            className="rounded-full border border-light-300 px-3 py-1 text-caption text-dark-900"
                        >
              {b}
            </span>
                    ))}
                </div>
            )}

            <section className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
                <Filters />
                <div>
                    <ProductList products={products} /> {/* ✅ Use reusable component */}
                </div>
            </section>
        </main>
    );
}
