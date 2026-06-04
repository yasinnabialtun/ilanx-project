"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X, Sparkles, LogOut, User, PenTool } from "lucide-react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"

const navLinks = [
  { href: "#features", label: "Özellikler" },
  { href: "#demo", label: "Demo" },
  { href: "#how-it-works", label: "Nasıl Çalışır" },
  { href: "#use-cases", label: "Kullanım Alanları" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary neon-cyan">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l10 10-10 10L2 12 12 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              İlanX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <Link href="/editor">
              <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <PenTool className="w-4 h-4 mr-2" />
                Arsa İşaretleme
              </Button>
            </Link>
            <Link href="/ai-video">
              <Button variant="outline" size="sm" className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Video (Yeni)
              </Button>
            </Link>
            
            {session?.user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                <div className="flex items-center gap-2">
                  {session.user.image ? (
                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                      <User className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex flex-col text-xs">
                    <span className="text-white font-medium line-clamp-1 max-w-[100px]">{session.user.name}</span>
                    <span className="text-indigo-400 font-bold">{(session.user as any).credits || 0} Kredi</span>
                  </div>
                </div>
                <button onClick={() => signOut()} className="text-white/50 hover:text-white transition">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button onClick={() => signIn("google")} size="sm" className="bg-white text-black hover:bg-white/90 font-medium">
                Google ile Giriş
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link href="/editor" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-cyan-500/50 text-cyan-400">
                    <PenTool className="w-4 h-4 mr-2" />
                    Arsa İşaretleme
                  </Button>
                </Link>
                <Link href="/ai-video" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-indigo-500/50 text-indigo-400">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Video (Yeni)
                  </Button>
                </Link>
                {session?.user ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 mt-2">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <span>{session.user.name}</span>
                      <span className="text-indigo-400 font-bold ml-2">{(session.user as any).credits || 0} Kredi</span>
                    </div>
                    <button onClick={() => signOut()} className="text-white/50 hover:text-white p-2">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Button onClick={() => signIn("google")} size="sm" className="w-full bg-white text-black hover:bg-white/90 mt-2">
                    Google ile Giriş
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
