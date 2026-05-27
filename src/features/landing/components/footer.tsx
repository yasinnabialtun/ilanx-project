"use client"

import Link from "next/link"
import { Globe, Mail, Share2 } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Özellikler", href: "#features" },
    { label: "Demo", href: "#demo" },
    { label: "Editör", href: "/editor" },
  ],
  company: [
    { label: "Hakkımızda", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Kariyer", href: "#careers" },
    { label: "İletişim", href: "#contact" },
  ],
  resources: [
    { label: "Dokümantasyon", href: "#docs" },
    { label: "API", href: "#api" },
    { label: "Destek", href: "#support" },
    { label: "SSS", href: "#faq" },
  ],
  legal: [
    { label: "Gizlilik", href: "#privacy" },
    { label: "Kullanım Şartları", href: "#terms" },
    { label: "Çerezler", href: "#cookies" },
  ],
}

interface FooterProps {
  content: {
    copyright: string;
    email: string;
    facebook: string;
    instagram: string;
    twitter: string;
  }
}

export function Footer({ content }: FooterProps) {
  const socialLinks = [
    { icon: Share2, href: content.facebook, label: "Facebook" },
    { icon: Globe, href: content.instagram, label: "Instagram" },
    { icon: Mail, href: `mailto:${content.email}`, label: "E-posta" },
  ];
  return (
    <footer className="relative border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">ilanx</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Arazi görselleri üzerinde interaktif çizim ve ölçüm yapabileceğiniz 
              modern planlama platformu.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Ürün</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Şirket</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Kaynaklar</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Yasal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {content.copyright}
          </p>
          <p className="text-sm text-muted-foreground">
            Türkiye&apos;de 🇹🇷 tasarlandı ve geliştirildi.
          </p>
        </div>
      </div>
    </footer>
  )
}
