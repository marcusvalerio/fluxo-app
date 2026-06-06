"use client"

import { motion } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { ACHIEVEMENTS, buildStats, type EarnedAchievement } from "@/lib/achievements"
import { Lock } from "lucide-react"

export function AchievementsScreen() {
  const { state } = useFinance()
  const earned: EarnedAchievement[] = state.achievements || []

  const stats = buildStats(
    state.transactions,
    state.goals,
    state.planning,
    state.monthlyIncome,
    state.limit
  )

  const earnedIds = new Set(earned.map(e => e.id))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32" style={{ background: "#F2F3F4" }}>
      <div className="px-6 pt-12 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(2,0,53,0.4)" }}>
          Conquistas
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "#020035" }}>Medalhas</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(2,0,53,0.45)" }}>
          {earned.length} de {ACHIEVEMENTS.length} desbloqueadas
        </p>

        {/* Barra de progresso geral */}
        <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(2,0,53,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earned.length / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "#ED4B00" }}
          />
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, idx) => {
          const isEarned = earnedIds.has(a.id)
          const earnedDate = earned.find(e => e.id === a.id)?.earnedAt

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-2xl p-4"
              style={{
                background: isEarned ? "white" : "rgba(255,255,255,0.5)",
                boxShadow: isEarned ? "0 2px 16px rgba(2,0,53,0.08)" : "none",
                opacity: isEarned ? 1 : 0.6,
              }}
            >
              {/* Ícone */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                style={{ background: isEarned ? a.bgColor : "rgba(2,0,53,0.06)" }}
              >
                {isEarned ? a.icon : <Lock className="w-5 h-5" style={{ color: "rgba(2,0,53,0.2)" }} />}
              </div>

              <p className="font-bold text-sm leading-tight" style={{ color: isEarned ? "#020035" : "rgba(2,0,53,0.4)" }}>
                {a.title}
              </p>
              <p className="text-xs mt-1 leading-snug" style={{ color: "rgba(2,0,53,0.4)" }}>
                {a.desc}
              </p>

              {isEarned && earnedDate && (
                <p className="text-[10px] mt-2 font-semibold uppercase tracking-wide" style={{ color: a.color }}>
                  {new Date(earnedDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
