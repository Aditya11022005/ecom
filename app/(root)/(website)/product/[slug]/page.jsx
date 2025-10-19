import axios from 'axios'
import React from 'react'
import ProductDetails from './ProductDetails'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aruz.in'

export async function generateMetadata({ params, searchParams }) {
    const { slug } = await params
    try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`)
        if (!data?.success) return {}
        const product = data.data.product
        const variant = data.data.variant
    const title = `${product.name}`
    const description = product?.shortDescription || product?.description?.slice(0, 160) || 'Shop this product on Aruz India.'
        const url = `${SITE_URL}/product/${product.slug}`
        const image = variant?.media?.[0]?.secure_url || `${SITE_URL}/assets/images/img-placeholder.webp`

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url,
                images: [image]
            },
            twitter: {
                title,
                description,
                images: [image]
            }
        }
    } catch (err) {
        return {}
    }
}

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`

    if (color && size) {
        url += `?color=${color}&size=${size}`
    }

    const { data: getProduct } = await axios.get(url)

    if (!getProduct.success) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>Data not found.</h1>
            </div>
        )
    } else {

        const product = getProduct?.data?.product
        const variant = getProduct?.data?.variant

        // fetch review summary for aggregateRating
        let aggregateRating = null
        try {
            const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/review/details?productId=${product._id}`)
            const reviewJson = await reviewRes.json()
            if (reviewJson.success) {
                const { totalReview, averageRating } = reviewJson.data
                if (totalReview && averageRating) {
                    aggregateRating = {
                        "@type": "AggregateRating",
                        ratingValue: averageRating,
                        reviewCount: totalReview
                    }
                }
            }
        } catch (e) {
            // ignore fetch errors - we still render the page
        }

        const productJsonLd = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": variant?.media?.map(m => m.secure_url) || [],
            "description": product?.description || product?.shortDescription || '',
            "sku": variant?.sku || '',
            "mpn": variant?.sku || '',
            "offers": {
                "@type": "Offer",
                "url": `${SITE_URL}/product/${product.slug}`,
                "priceCurrency": "INR",
                "price": variant?.sellingPrice || '',
                "availability": variant?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
        }

        if (aggregateRating) productJsonLd.aggregateRating = aggregateRating

        return (
            <>
                <ProductDetails
                    product={product}
                    variant={variant}
                    colors={getProduct?.data?.colors}
                    sizes={getProduct?.data?.sizes}
                    reviewCount={getProduct?.data?.reviewCount}
                />

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
            </>
        )
    }

}

export default ProductPage