import { Suspense } from 'react'
import { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Collections | Nike',
  description: 'Explore our curated collections of premium footwear and apparel.',
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl?: string
  productCount: number
}

async function getCollections(): Promise<Collection[]> {
  try {
    const collections = await db.query.categories.findMany()

    // For now, return mock data since we don't have product counts
    return collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: `Explore our ${collection.name.toLowerCase()} collection`,
      imageUrl: undefined, // No imageUrl in schema
      productCount: Math.floor(Math.random() * 50) + 10, // Mock product count
    }))
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/products?category=${collection.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-light-100 to-light-200 transition-all duration-500 hover:shadow-glow hover:scale-105"
    >
      <div className="aspect-[4/3] relative">
        {collection.imageUrl ? (
          <Image
            src={collection.imageUrl}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <Package className="h-16 w-16 text-blue-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-heading-3 font-bold mb-2 group-hover:gradient-text">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-body text-white/90 mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-caption text-white/80">
            {collection.productCount} products
          </span>
          <ArrowRight className="h-4 w-4 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

function CollectionsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] rounded-2xl bg-light-200" />
          <div className="mt-4 space-y-2">
            <div className="h-6 w-3/4 rounded bg-light-200" />
            <div className="h-4 w-full rounded bg-light-200" />
            <div className="h-4 w-2/3 rounded bg-light-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-light-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-heading-1 font-bold text-white mb-4">
              Our Collections
            </h1>
            <p className="text-body-large text-white/80 max-w-2xl mx-auto">
              Discover our carefully curated collections of premium footwear and apparel, 
              designed to elevate your style and performance.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<CollectionsLoading />}>
            <CollectionsGrid />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

async function CollectionsGrid() {
  const collections = await getCollections()

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 text-dark-400 mx-auto mb-4" />
        <h3 className="text-heading-3 text-dark-700 mb-2">No Collections Found</h3>
        <p className="text-body text-dark-500">
          We&apos;re working on adding new collections. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  )
}
