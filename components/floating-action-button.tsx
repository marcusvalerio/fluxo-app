"use client"

import { Plus } from "lucide-react"
import { motion } from "framer-motion"

interface FloatingActionButtonProps {
  onClick: () => void
  visible?: boolean
}

export function FloatingActionButton({ onClick, visible = true }: FloatingActionButtonProps) {
  if (!visible) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="fixed right-5 bottom-24 w-14 h-14 rounded-2xl flex items-center justify-center z-40"
      style={{
        background: "#ED4B00",
        boxShadow: "0 4px 20px rgba(237,75,0,0.35)",
      }}
    >
      <Plus className="w-6 h-6 text-white" />
    </motion.button>
  )
}
