"use client"

import { motion } from "framer-motion"

export function PlotDrawingAnimation() {
  const points = [
    { x: 100, y: 80 },
    { x: 280, y: 60 },
    { x: 320, y: 140 },
    { x: 300, y: 280 },
    { x: 120, y: 290 },
    { x: 60, y: 200 },
  ]

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")} Z`

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const strokeVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2 },
    },
  }

  const fillVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.15, 0.15, 0],
      transition: {
        delay: 2,
        duration: 1.5,
        times: [0, 0.3, 0.7, 1],
      },
    },
  }

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  }

  const pulseVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.1, 0.3, 0.1],
      transition: {
        delay: 2.5,
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  }

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <svg
        viewBox="0 0 400 380"
        className="w-full h-full max-w-md"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="smallGrid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="oklch(0.2 0.02 260 / 0.15)"
              strokeWidth="0.5"
            />
          </pattern>

          <filter id="plotGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.19 165)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="oklch(0.65 0.2 200)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect width="400" height="380" fill="oklch(0.09 0.01 260)" />
        <rect width="400" height="380" fill="url(#smallGrid)" />

        <motion.path
          d={pathD}
          fill="none"
          stroke="oklch(0.72 0.19 165)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#plotGlow)"
          variants={strokeVariants}
        />

        <motion.path
          d={pathD}
          fill="url(#plotGradient)"
          variants={fillVariants}
        />

        <motion.path
          d={pathD}
          fill="oklch(0.72 0.19 165)"
          variants={pulseVariants}
        />

        {points.map((point, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="oklch(0.72 0.19 165 / 0.2)"
              variants={dotVariants}
              transition={{
                delay: 1.8 + i * 0.1,
                duration: 0.5,
              }}
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="oklch(0.72 0.19 165)"
              variants={dotVariants}
              transition={{
                delay: 1.85 + i * 0.1,
                duration: 0.4,
              }}
              filter="url(#plotGlow)"
            />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  )
}
