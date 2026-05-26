import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/core/providers/theme-provider";

export const metadata: Metadata = {
  title: "ilanx - Gayrimenkul Görsel İşaretleme",
  description:
    "Arsa ve gayrimenkul fotoğrafları üzerinde nokta ile parsel çizimi, 3D metin, ok ve serbest çizim. Danışmanlar için profesyonel planlama aracı.",
  keywords: [
    "arazi planlama",
    "gayrimenkul",
    "parsel çizimi",
    "arsa işaretleme",
    "polygon çizimi",
  ],
  openGraph: {
    title: "ilanx - Gayrimenkul Görsel İşaretleme",
    description:
      "Arsa görselleri üzerinde interaktif çizim, parsel işaretleme ve profesyonel sunum.",
    type: "website",
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
