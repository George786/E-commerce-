'use client';

import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { CartItem } from '@/store/cartStore';

interface AddToCartButtonProps {
    productId: string;
    variantId: string;
    quantity?: number;
    title: string;  // matches CartItem.title
    price: number;
}

export default function AddToCartButton({
                                            productId,
                                            variantId,
                                            quantity = 1,
                                            title,
                                            price,
                                        }: AddToCartButtonProps) {
    const { addItem } = useCartStore();

    const handleAdd = () => {
        addItem({
            productId,
            productVariantId: variantId,
            quantity,
            price,
            title,  // direct match with CartItem
        });
    };

    return (
        <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
        >
            <ShoppingBag className="h-5 w-5" />
            Add to Bag
        </button>
    );
}
