import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: 'AUTONEX - Solutions Automobiles Tout-en-Un en RDC',
    template: '%s | AUTONEX'
  },
  description: 'AUTONEX propose des services automobiles de premier ordre, notamment la maintenance, la réparation et la vente de voitures en République Démocratique du Congo.',
  keywords: [
    'automobile',
    'voiture',
    'RDC',
    'Congo',
    'Kinshasa',
    'garage',
    'réparation',
    'pièces détachées',
    'assurance auto',
    'auto-école',
    'sécurité automobile',
    'stations-service',
    'AUTONEX'
  ],
  authors: [{ name: 'AUTONEX Team' }],
  creator: 'AUTONEX',
  publisher: 'AUTONEX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://autonex.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-CD': '/fr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CD',
    url: '/',
    title: 'AUTONEX - Solutions Automobiles Tout-en-Un en RDC',
    description: 'Découvrez AUTONEX, votre partenaire automobile de confiance en République Démocratique du Congo.',
    siteName: 'AUTONEX',
    images: [
      {
        url: '/Nzilalogo.png',
        width: 1200,
        height: 630,
        alt: 'AUTONEX - Solutions Automobiles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AUTONEX - Solutions Automobiles Tout-en-Un en RDC',
    description: 'Découvrez AUTONEX, votre partenaire automobile de confiance en République Démocratique du Congo.',
    images: ['/Nzilalogo.png'],
    creator: '@autonex_rdc',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: 'automotive',
};