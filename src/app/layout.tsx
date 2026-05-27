import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/core/providers/theme-provider";

const siteUrl = "https://ilanx.com.tr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "İlanX | Gayrimenkul İlan Görseli Hazırlama Aracı",
    template: "%s | İlanX",
  },
  description:
    "Emlak danışmanları için geliştirilmiş arazi ve gayrimenkul işaretleme platformu. Harita görseli üzerine parsel çizin, metrekare ve fiyat etiketi ekleyin, Instagram ve ilan sitelerine uygun profesyonel görseller üretin.",
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
    title: "İlanX | Gayrimenkul İlan Görseli Hazırlama Aracı",
    description:
      "Emlak danışmanları için geliştirilmiş arazi ve gayrimenkul işaretleme platformu. Profesyonel ilan görselleri saniyeler içinde hazır.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "İlanX - Gayrimenkul İlan Görseli Hazırlama Aracı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "İlanX | Gayrimenkul İlan Görseli Hazırlama Aracı",
    description:
      "Emlak danışmanları için geliştirilmiş arazi ve gayrimenkul işaretleme platformu. Profesyonel ilan görselleri saniyeler içinde hazır.",
    images: ["/og-image.png"],
    creator: "@ilanxapp",
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
      <body className="min-h-full font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
