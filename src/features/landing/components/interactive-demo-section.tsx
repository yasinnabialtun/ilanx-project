"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"

export function InteractiveDemoSection() {
  const [currentPoint, setCurrentPoint] = useState(0)
  const [isDrawing, setIsDrawing] = useState(true)

  const points = [
    { x: 80, y: 120 },
    { x: 200, y: 80 },
    { x: 320, y: 100 },
    { x: 350, y: 200 },
    { x: 280, y: 280 },
    { x: 150, y: 300 },
    { x: 60, y: 240 },
  ]

  useEffect(() => {
    if (!isDrawing) return

    const interval = setInterval(() => {
      setCurrentPoint(prev => {
        if (prev >= points.length) {
          setIsDrawing(false)
          setTimeout(() => {
            setCurrentPoint(0)
            setIsDrawing(true)
          }, 3000)
          return prev
        }
        return prev + 1
      })
    }, 600)

    return () => clearInterval(interval)
  }, [isDrawing, points.length])

  const visiblePoints = points.slice(0, currentPoint)
  const polygonPath = visiblePoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/2 right-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4 rounded-full bg-chart-2/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Canlı Önizleme
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            İnteraktif Demo
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Polygon çizim ve ışık efektlerini gerçek zamanlı deneyimleyin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Demo Container */}
          <div className="glass-card rounded-3xl p-2 glow-secondary">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-chart-4/80" />
                  <div className="h-3 w-3 rounded-full bg-primary/80" />
                </div>
                <span className="text-sm text-muted-foreground">interaktif-demo.json</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Zoom: 100%</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative aspect-video bg-background/30 rounded-b-2xl overflow-hidden">
              {/* Terrain grid */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, oklch(0.25 0.02 260 / 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, oklch(0.25 0.02 260 / 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* SVG Canvas */}
              <svg 
                viewBox="0 0 400 280" 
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Completed polygon fill */}
                {currentPoint >= points.length && (
                  <motion.polygon
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="oklch(0.72 0.19 165 / 0.25)"
                    stroke="oklch(0.72 0.19 165)"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Drawing lines */}
                {visiblePoints.length > 1 && (
                  <motion.polyline
                    points={polygonPath}
                    fill="none"
                    stroke="oklch(0.72 0.19 165)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Close line when complete */}
                {currentPoint >= points.length && (
                  <motion.line
                    x1={points[points.length - 1].x}
                    y1={points[points.length - 1].y}
                    x2={points[0].x}
                    y2={points[0].y}
                    stroke="oklch(0.72 0.19 165)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Points */}
                {visiblePoints.map((point, i) => (
                  <motion.g key={i}>
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="8"
                      fill="oklch(0.72 0.19 165 / 0.3)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="oklch(0.72 0.19 165)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                    />
                  </motion.g>
                ))}

                {/* Cursor indicator */}
                {isDrawing && currentPoint < points.length && (
                  <motion.g
                    animate={{
                      x: points[currentPoint]?.x || 0,
                      y: points[currentPoint]?.y || 0,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <circle r="12" fill="oklch(0.98 0 0 / 0.1)" />
                    <circle r="3" fill="oklch(0.98 0 0)" />
                  </motion.g>
                )}

                {/* Light effects when complete */}
                {currentPoint >= points.length && (
                  <>
                    {[
                      { x: 150, y: 150 },
                      { x: 280, y: 180 },
                      { x: 120, y: 250 },
                    ].map((light, i) => (
                      <motion.circle
                        key={i}
                        cx={light.x}
                        cy={light.y}
                        r="15"
                        fill={`oklch(0.9 0.1 ${80 + i * 40} / 0.6)`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{ 
                          delay: 0.5 + i * 0.2,
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        style={{ filter: 'blur(6px)' }}
                      />
                    ))}
                  </>
                )}
              </svg>

              {/* Info panels */}
              {currentPoint >= points.length && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 left-4 glass-card rounded-xl px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">Çizilen Alan</p>
                    <p className="text-2xl font-bold text-primary">Parsel A</p>
                    <p className="text-xs text-muted-foreground mt-1">7 nokta - 1 katman</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 right-4 glass-card rounded-xl px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">Işık Noktaları</p>
                    <p className="text-lg font-semibold text-foreground">3 aktif</p>
                  </motion.div>
                </>
              )}

              {/* Status indicator */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isDrawing ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                <span className="text-xs text-muted-foreground">
                  {isDrawing ? 'Çizim yapılıyor...' : 'Tamamlandı'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
