"use client"

import { motion } from "framer-motion"

export function UploadIconAnimation() {
  const containerVariants = {
    rest: { opacity: 1 },
    hover: { opacity: 1 },
  }

  const documentVariants = {
    rest: { y: 20, opacity: 0 },
    hover: {
      y: -10,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const cloudVariants = {
    rest: { scale: 0.8, opacity: 0.3 },
    hover: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  }

  const arrowVariants = {
    rest: { y: 0, opacity: 0 },
    hover: {
      y: [0, -8, 0],
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.3,
        repeat: Infinity,
        repeatDelay: 0.3,
      },
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
          <filter id="uploadGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cloud */}
        <motion.path
          d="M 45 20 C 48 18 52 19 54 22 C 56 24 56 28 54 30 L 10 30 C 8 30 6 28 6 26 C 6 24 8 22 10 22 C 11 18 15 15 19 15 C 21 12 25 10 29 10 C 35 10 41 14 45 20"
          fill="none"
          stroke="oklch(0.72 0.19 165)"
          strokeWidth="1.5"
          filter="url(#uploadGlow)"
          variants={cloudVariants}
        />

        {/* Document */}
        <motion.g variants={documentVariants}>
          <rect
            x="24"
            y="35"
            width="16"
            height="20"
            rx="2"
            fill="oklch(0.72 0.19 165 / 0.3)"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1.5"
            filter="url(#uploadGlow)"
          />
          {/* Document lines */}
          <line
            x1="27"
            y1="40"
            x2="37"
            y2="40"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1"
            opacity="0.6"
          />
          <line
            x1="27"
            y1="45"
            x2="37"
            y2="45"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1"
            opacity="0.4"
          />
        </motion.g>

        {/* Arrows (pulsing) */}
        <motion.g variants={arrowVariants}>
          <path
            d="M 32 25 L 29 28 M 32 25 L 35 28"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#uploadGlow)"
          />
          <path
            d="M 32 32 L 29 35 M 32 32 L 35 35"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#uploadGlow)"
            opacity="0.5"
          />
        </motion.g>
      </svg>
    </motion.div>
  )
}
