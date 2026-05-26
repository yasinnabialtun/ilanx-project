"use client"

import { motion } from "framer-motion"

const techStack = [
  { name: "Next.js", color: "foreground" },
  { name: "TypeScript", color: "chart-2" },
  { name: "Fabric.js", color: "primary" },
  { name: "Zustand", color: "chart-4" },
  { name: "TailwindCSS", color: "chart-1" },
  { name: "shadcn/ui", color: "foreground" },
]

export function TechStackSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-xl font-semibold text-muted-foreground">
            Modern Teknolojilerle Geliştirildi
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card rounded-full px-6 py-2.5 border border-border hover:border-primary/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
