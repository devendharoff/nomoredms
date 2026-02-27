import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'No More DMs - The Creator Resource Hub',
    description: 'Stop begging for links. Access all resources instantly.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={inter.className} suppressHydrationWarning={true}>{children}</body>
        </html>
    );
}
