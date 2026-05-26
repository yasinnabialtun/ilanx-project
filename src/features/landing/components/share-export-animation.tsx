"use client"

import { motion } from "framer-motion"

export function ShareExportAnimation() {
  const containerVariants = {
    rest: { opacity: 1 },
    hover: { opacity: 1 },
  }

  const centerNodeVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  }

   const childNodeVariants = (angle: number, distance: number) => {
     const x = Math.cos(angle) * distance
     const y = Math.sin(angle) * distance

     return {
       rest: {
         x: 0,
         y: 0,
         scale: 0,
         opacity: 0,
       },
       hover: {
         x,
         y,
         scale: 1,
         opacity: 1,
         transition: {
           delay: 0.1,
         },
       },
     }
   }

  const childNodes = [
    { label: "PDF", angle: -Math.PI / 2, distance: 24 },
    { label: "Link", angle: Math.PI / 6, distance: 24 },
    { label: "Image", angle: (5 * Math.PI) / 6, distance: 24 },
  ]

  return (
    <motion.div
      className="w-16 h-16 flex items-center justify-center relative"
      variants={containerVariants}
      initial="rest"
      whileHover="hover"
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full absolute"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="shareGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center document node */}
        <motion.g variants={centerNodeVariants}>
          <circle
            cx="32"
            cy="32"
            r="6"
            fill="oklch(0.72 0.19 165 / 0.3)"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="1.5"
            filter="url(#shareGlow)"
          />
          <path
            d="M 30 29 L 34 29 L 34 33 L 30 33 Z"
            fill="oklch(0.72 0.19 165)"
            opacity="0.7"
          />
          <line
            x1="31"
            y1="31"
            x2="33"
            y2="31"
            stroke="oklch(0.72 0.19 165)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </motion.g>

        {/* Child nodes (PDF, Link, Image) */}
        {childNodes.map((node, i) => {
          const angle = node.angle
          const distance = node.distance
          const x = 32 + Math.cos(angle) * distance
          const y = 32 + Math.sin(angle) * distance

          return (
            <motion.g
              key={node.label}
              variants={childNodeVariants(angle, distance)}
            >
              {/* Connection line */}
              <line
                x1="32"
                y1="32"
                x2={x}
                y2={y}
                stroke="oklch(0.72 0.19 165)"
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Child circle */}
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="oklch(0.72 0.19 165 / 0.2)"
                stroke="oklch(0.72 0.19 165)"
                strokeWidth="1"
                filter="url(#shareGlow)"
              />

              {/* Icon placeholder */}
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="oklch(0.72 0.19 165)"
              />
            </motion.g>
          )
        })}
      </svg>
    </motion.div>
  )
}
