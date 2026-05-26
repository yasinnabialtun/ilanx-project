"use client"

import { motion } from "framer-motion"
import { useEffect, useState, type ReactElement } from "react"

export function CanvasMockup() {
  const [lightOpacity, setLightOpacity] = useState([0.6, 0.4, 0.8, 0.5])

  useEffect(() => {
    const interval = setInterval(() => {
      setLightOpacity(prev => prev.map(() => 0.3 + Math.random() * 0.7))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Glow behind the mockup */}
      <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />
      
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="relative glass-card rounded-2xl p-1 glow-primary"
      >
        {/* Window Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/80" />
            <div className="h-3 w-3 rounded-full bg-chart-4/80" />
            <div className="h-3 w-3 rounded-full bg-primary/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground">arazi-proje-1.json</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Canvas Area */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-b-xl bg-background/50">
          {/* Grid overlay */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, oklch(0.3 0.02 260 / 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, oklch(0.3 0.02 260 / 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Terrain representation with polygons */}
          <svg 
            viewBox="0 0 400 300" 
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Main polygon area 1 */}
            <motion.polygon
              points="50,80 150,60 180,120 140,180 60,160"
              fill="oklch(0.72 0.19 165 / 0.3)"
              stroke="oklch(0.72 0.19 165)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            
            {/* Polygon area 2 */}
            <motion.polygon
              points="200,100 300,80 340,140 320,200 240,220 180,160"
              fill="oklch(0.65 0.2 200 / 0.3)"
              stroke="oklch(0.65 0.2 200)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />

            {/* Polygon area 3 */}
            <motion.polygon
              points="80,200 160,190 200,250 120,270"
              fill="oklch(0.75 0.15 85 / 0.3)"
              stroke="oklch(0.75 0.15 85)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            />

            {/* Control points */}
            {[[50,80], [150,60], [180,120], [140,180], [60,160]].map(([x, y], i) => (
              <motion.circle
                key={`p1-${i}`}
                cx={x}
                cy={y}
                r="5"
                fill="oklch(0.72 0.19 165)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              />
            ))}

            {[[200,100], [300,80], [340,140], [320,200], [240,220], [180,160]].map(([x, y], i) => (
              <motion.circle
                key={`p2-${i}`}
                cx={x}
                cy={y}
                r="5"
                fill="oklch(0.65 0.2 200)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.3 }}
              />
            ))}

            {/* Light effect points */}
            {[
              [100, 120],
              [260, 150],
              [140, 230],
              [300, 110]
            ].map(([x, y], i) => (
              <motion.circle
                key={`light-${i}`}
                cx={x}
                cy={y}
                r="12"
                fill={`oklch(0.9 0.15 ${60 + i * 30} / ${lightOpacity[i]})`}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  delay: 1 + i * 0.2, 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{ filter: 'blur(4px)' }}
              />
            ))}
          </svg>

          {/* Area label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute top-4 left-4 glass-card rounded-lg px-3 py-2"
          >
            <p className="text-xs text-muted-foreground">Seçili Alan</p>
            <p className="text-lg font-bold text-primary">Parsel A</p>
          </motion.div>

          {/* Layer indicator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.7, duration: 0.5 }}
            className="absolute top-4 right-4 glass-card rounded-lg px-3 py-2"
          >
            <p className="text-xs text-muted-foreground mb-1">Katmanlar</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-foreground">Alan 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-xs text-foreground">Alan 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-4" />
                <span className="text-xs text-foreground">Alan 3</span>
              </div>
            </div>
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.5 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-full px-4 py-2 flex items-center gap-3"
          >
            {['pencil', 'polygon', 'palette', 'lightbulb', 'layers'].map((tool, i) => (
              <button
                key={tool}
                className={`p-2 rounded-full transition-colors ${i === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                <ToolIcon name={tool} />
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function ToolIcon({ name }: { name: string }) {
  const icons: Record<string, ReactElement> = {
    pencil: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    polygon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l9 7-3.5 9h-11L3 9l9-7z" />
      </svg>
    ),
    palette: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
    lightbulb: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
    layers: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 12-8.58 3.9a2 2 0 0 1-1.66 0L2 12" />
        <path d="m22 17-8.58 3.9a2 2 0 0 1-1.66 0L2 17" />
      </svg>
    ),
  }
  return icons[name] || null
}
