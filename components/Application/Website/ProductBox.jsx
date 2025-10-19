import Image from 'next/image'
import React from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
const ProductBox = ({ product }) => {

    return (
        <div className='rounded-lg hover:shadow-lg border overflow-hidden relative'>
            <div>
                <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)} className='block'>
                    <div className='relative overflow-hidden'>
                        <Image
                                src={product?.media[0]?.secure_url || imgPlaceholder.src}
                                width={400}
                                height={400}
                                alt={product?.media[0]?.alt || product?.name}
                                title={product?.media[0]?.title || product?.name}
                                className='w-full lg:h-[300px] sm:h-[250px] h-[150px] object-cover object-top transform transition-transform duration-300 ease-in-out hover:scale-105'
                            />

                            {/* Discount badge (red) top-left */}
                            {product?.mrp > product?.sellingPrice && (
                                <span className='absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded'>
                                    {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% OFF
                                </span>
                            )}
                        </div>
                        <div className="p-3 border-t">
                            <h4>{product?.name}</h4>
                            <p className='flex gap-2 text-sm mt-2 items-center'>
                                <span className='line-through text-gray-400'>{product?.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                <span className='font-semibold'>{product?.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                            </p>
                        </div>
                </Link>

                {/* Rent removed - feature disabled */}
            </div>
        </div>
    )
}

export default ProductBox