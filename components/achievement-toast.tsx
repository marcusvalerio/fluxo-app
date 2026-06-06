"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Achievement } from "@/lib/achievements"

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    if (!achievement) return
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [achievement])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          onClick={onDismiss}
          className="fixed top-14 left-4 right-4 z-[600] rounded-2xl overflow-hidden cursor-pointer"
          style={{
            background: "rgba(2,0,53,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(2,0,53,0.3)",
          }}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Ícone */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: achievement.bgColor }}
            >
              {achievement.icon}
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
                style={{ color: achievement.color }}>
                Conquista desbloqueada!
              </p>
              <p className="text-white font-bold text-sm">{achievement.title}</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">{achievement.desc}</p>
            </div>

            {/* Estrelas decorativas */}
            <div className="flex-shrink-0 text-lg" style={{ opacity: 0.6 }}>✦</div>
          </div>

          {/* Barra de progresso */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            style={{
              height: 2,
              background: achievement.color,
              transformOrigin: "left",
              opacity: 0.7,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
