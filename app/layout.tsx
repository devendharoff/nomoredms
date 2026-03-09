import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://nomoredms.com'),
    title: {
        default: 'No More DMs | The World\'s #1 Creator Resource Hub (AI, Coding, Design)',
        template: '%s | No More DMs'
    },
    description: 'Stop waiting for DMs. No More DMs is the first centralized link repository for elite digital creators. Download trending AI Prompts (Midjourney, Sora), Next.js SaaS starters, Python automation scripts, and premium Figma design kits instantly.',
    applicationName: 'No More DMs',
    authors: [{ name: 'NOMOREDMS Optimization Engine' }],
    generator: 'Next.js',
    keywords: [
        'No More DMs', 'creator resource hub', 'link in bio alternative', 'curated digital assets',
        'exclusive AI prompts', 'Midjourney v6 prompts', 'Stable Diffusion prompt engineer',
        'Sora video prompts', 'coding templates for SaaS', 'Next.js 15 starter kits',
        'React component library', 'Python automation scripts', 'verified digital creators',
        'influencer tools portal', 'Figma design systems', 'UI/UX templates download',
        'premium notion templates', 'digital product marketplace', 'monetization for creators',
        'best productivity tools 2024', 'AI tool directory', 'developer resources repository',
        'first creator resource hub', 'link repository for influencers', 'no more begging for links',
        'social media asset manager', 'content creator workflow', 'viral resource library'
    ],
    alternates: {
        canonical: '/',
    },
    referrer: 'origin-when-cross-origin',
    category: 'Technology',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://nomoredms.com',
        title: 'No More DMs | Stop Asking for Links. Start Building.',
        description: 'Instant access to premium coding, design, and AI resources. The DM era is officially over.',
        siteName: 'No More DMs',
        images: [
            {
                url: 'https://nomoredms.com/og-image.png',
                width: 1200,
                height: 630,
                alt: 'No More DMs Dashboard Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'No More DMs | The Creator Hub',
        description: 'Access the world\'s best digital resources instantly. No more waiting for DMs.',
        creator: '@nomoredms',
        images: ['https://nomoredms.com/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-icon.png',
    }
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'No More DMs',
    url: 'https://nomoredms.com',
    description: 'The first centralized link and resource hub for digital creators and builders.',
    potentialAction: {
        '@type': 'SearchAction',
        target: 'https://nomoredms.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <Script
                    id="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={inter.className} suppressHydrationWarning={true}>{children}</body>
        </html>
    );
}

