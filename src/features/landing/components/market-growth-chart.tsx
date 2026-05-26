"use client"

import { motion } from "framer-motion"

export function MarketGrowthChart() {
  // Chart data points
  const dataPoints = [
    { x: 20, y: 80 },
    { x: 60, y: 60 },
    { x: 100, y: 50 },
    { x: 140, y: 35 },
    { x: 180, y: 20 },
    { x: 220, y: 10 },
    { x: 260, y: 5 },
  ]

  // Create path from points
  const linePath = `M ${dataPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`

  // Grid lines
  const gridLines = Array.from({ length: 6 }).map((_, i) => ({
    y: 20 + i * 20,
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  }

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { delay: 0.3, duration: 1.2 },
    },
  }

  const dotVariants = (delay: number) => ({
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay, duration: 0.3 },
    },
  })

  const scannerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.5, 0],
      x: [0, 280, 280],
      transition: {
        delay: 1.5,
        duration: 1,
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  }

  const fillVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.08, 0],
      transition: {
        delay: 0.3,
        duration: 1.2,
        times: [0, 0.3, 1],
      },
    },
  }

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <svg
        viewBox="0 0 320 200"
        className="w-full h-full max-w-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="chartGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient
            id="chartGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="oklch(0.72 0.19 165)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 165)" stopOpacity="0" />
          </linearGradient>

          <pattern
            id="gridPattern"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="320"
              y2="0"
              stroke="oklch(0.2 0.02 260 / 0.2)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="320" height="200" fill="oklch(0.09 0.01 260)" />

        {/* Grid pattern */}
        <motion.rect
          width="320"
          height="200"
          fill="url(#gridPattern)"
          variants={gridVariants}
        />

        {/* Axes */}
        <line
          x1="10"
          y1="10"
          x2="10"
          y2="180"
          stroke="oklch(0.25 0.02 260 / 0.5)"
          strokeWidth="1"
        />
        <line
          x1="10"
          y1="180"
          x2="310"
          y2="180"
          stroke="oklch(0.25 0.02 260 / 0.5)"
          strokeWidth="1"
        />

        {/* Area under curve */}
        <motion.path
          d={`${linePath} L 260,180 L 20,180 Z`}
          fill="url(#chartGradient)"
          variants={fillVariants}
        />

        {/* Main trending line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="oklch(0.72 0.19 165)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#chartGlow)"
          variants={lineVariants}
        />

        {/* Data point dots */}
        {dataPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x + 10}
            cy={point.y}
            r="2"
            fill="oklch(0.72 0.19 165)"
            filter="url(#chartGlow)"
            variants={dotVariants(0.5 + i * 0.08)}
          />
        ))}

        {/* Scanner line effect */}
        <motion.g variants={scannerVariants}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="200"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1.5"
            filter="url(#chartGlow)"
          />
          <circle
            cx="0"
            cy="100"
            r="8"
            fill="oklch(0.72 0.19 165)"
            opacity="0.3"
            filter="url(#chartGlow)"
          />
        </motion.g>

        {/* Labels */}
        <text
          x="5"
          y="195"
          fontSize="10"
          fill="oklch(0.65 0 0)"
          opacity="0.5"
        >
          Time
        </text>
        <text
          x="280"
          y="175"
          fontSize="10"
          fill="oklch(0.65 0 0)"
          opacity="0.5"
        >
          Growth
        </text>
      </svg>
    </motion.div>
  )
}
