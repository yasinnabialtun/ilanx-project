"use client"

import { motion } from "framer-motion"

export function DrawToolAnimation() {
  const containerVariants = {
    rest: { opacity: 1 },
    hover: { opacity: 1 },
  }

  const cursorVariants = {
    rest: { x: 0, y: 0 },
    hover: {
      x: 0,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const dotVariants = (delay: number) => ({
    rest: { scale: 0, opacity: 0 },
    hover: {
      scale: 1,
      opacity: 1,
      transition: { delay, duration: 0.3 },
    },
  })

  const lineVariants = {
    rest: { pathLength: 0, opacity: 0 },
    hover: {
      pathLength: 1,
      opacity: 1,
      transition: { delay: 0.9, duration: 0.6 },
    },
  }

  const polygonVariants = {
    rest: { pathLength: 0, opacity: 0 },
    hover: {
      pathLength: 1,
      opacity: 1,
      transition: { delay: 1.5, duration: 0.4 },
    },
  }

  return (
    <motion.div
      className="w-16 h-16 flex items-center justify-center"
      variants={containerVariants}
      initial="rest"
      whileHover="hover"
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="drawGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid background */}
        <rect
          x="8"
          y="8"
          width="48"
          height="48"
          rx="4"
          fill="oklch(0.14 0.015 260 / 0.5)"
          stroke="oklch(0.25 0.02 260 / 0.5)"
          strokeWidth="1"
        />

        {/* Cursor/pointer tool */}
        <motion.g variants={cursorVariants}>
          <path
            d="M 14 14 L 20 18 L 18 26 Z"
            fill="oklch(0.72 0.19 165)"
            opacity="0.8"
            filter="url(#drawGlow)"
          />
        </motion.g>

        {/* Three clicking points */}
        <motion.circle
          cx="20"
          cy="22"
          r="2.5"
          fill="oklch(0.72 0.19 165)"
          variants={dotVariants(0.3)}
          filter="url(#drawGlow)"
        />
        <motion.circle
          cx="44"
          cy="20"
          r="2.5"
          fill="oklch(0.72 0.19 165)"
          variants={dotVariants(0.6)}
          filter="url(#drawGlow)"
        />
        <motion.circle
          cx="36"
          cy="44"
          r="2.5"
          fill="oklch(0.72 0.19 165)"
          variants={dotVariants(0.9)}
          filter="url(#drawGlow)"
        />

        {/* Lines connecting points */}
        <motion.path
          d="M 20 22 L 44 20 L 36 44 Z"
          fill="none"
          stroke="oklch(0.72 0.19 165)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={lineVariants}
          filter="url(#drawGlow)"
        />

        {/* Completed polygon fill */}
        <motion.path
          d="M 20 22 L 44 20 L 36 44 Z"
          fill="oklch(0.72 0.19 165)"
          fillOpacity="0.15"
          variants={polygonVariants}
        />
      </svg>
    </motion.div>
  )
}
