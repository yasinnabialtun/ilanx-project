import { Providers } from "@/providers";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { CSPostHogProvider } from "@/core/providers/posthog-provider";
import { Inter } from "next/font/google";
import { cn } from "@/shared/utils/cn";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = "https://siteniz.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "İlanX | Yapay Zeka Emlak Video Stüdyosu",
    template: "%s | İlanX",
  },
  description:
    "Emlak fotoğraflarınızı saniyeler içinde müzikli, sinematik ve profesyonel videolara dönüştürün. İlanX ile portföyünüzü parlatın.",
  keywords: [
    "gayrimenkul ilan görseli",
    "emlak ilan hazırlama",
    "arazi işaretleme",
    "parsel çizimi",
    "arsa fotoğrafı düzenleme",
    "emlak danışmanı araçları",
    "gayrimenkul pazarlama",
    "ilan görseli oluşturma",
    "harita üzerine çizim",
    "arsa sınır çizimi",
    "gayrimenkul instagram görseli",
    "emlakçı araçları",
    "arazi ölçüm aracı",
    "metrekare hesaplama",
    "satılık arsa görseli",
    "konut projesi görseli",
    "ilanx",
  ],
  authors: [{ name: "İlanX", url: siteUrl }],
  creator: "İlanX",
  publisher: "İlanX",
  category: "Real Estate Technology",
  applicationName: "İlanX",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "tr-TR": siteUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "İlanX",
    title: "İlanX | Yapay Zeka Emlak Video Stüdyosu",
    description:
      "Sıradan ilan fotoğraflarınızı tek tıkla müzikli, sinematik ve büyüleyici videolara dönüştürün. Emlakçılar için özel geliştirildi.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "İlanX Yapay Zeka Video Stüdyosu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "İlanX | Yapay Zeka Emlak Video Stüdyosu",
    description:
      "Sıradan ilan fotoğraflarınızı tek tıkla büyüleyici videolara dönüştürün.",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200"],
    creator: "@ilanx",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    "geo.region": "TR",
    "geo.placename": "Türkiye",
    "geo.position": "39.9334;32.8597",
    "ICBM": "39.9334, 32.8597",
  },
};

export const viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="h-full antialiased">
      <body className={cn("min-h-full font-sans", inter.variable)}>
        <Providers>
          <CSPostHogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </CSPostHogProvider>
        </Providers>
      </body>
    </html>
  );
}
