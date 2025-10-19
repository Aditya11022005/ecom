import GlobalProvider from "@/components/Application/GlobalProvider";
import "./globals.css";
import { Assistant } from 'next/font/google'
import { ToastContainer } from 'react-toastify';
const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aruz.in'
export const metadata = {
  title: {
    default: 'Aruz India - Quality Products',
    template: '%s | Aruz India'
  },
  description: 'Aruz India - Handpicked products for your everyday needs. Shop quality products with fast delivery.',
  applicationName: 'Aruz India',
  openGraph: {
    title: 'Aruz India - Quality Products',
    description: 'Handpicked products for your everyday needs. Shop quality products with fast delivery.',
    url: SITE_URL,
    siteName: 'Aruz India',
    images: [
      `${SITE_URL}/assets/images/logo-black.png`
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aruz India - Quality Products',
    description: 'Handpicked products for your everyday needs.',
    images: [`${SITE_URL}/assets/images/logo-black.png`]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  },
  metadataBase: new URL(SITE_URL)
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${assistantFont.className} antialiased`}
      >
        <GlobalProvider>
          <ToastContainer />
          {/* Organization structured data for SEO and knowledge panels */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Aruz India",
            "url": SITE_URL,
            "logo": `${SITE_URL}/assets/images/logo-black.png`,
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+91-9561680380",
              "contactType": "customer service",
              "areaServed": "IN"
            }]
          }) }} />

          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
