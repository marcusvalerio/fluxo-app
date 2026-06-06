"use client"

import { motion } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { Plus, Shield, Target } from "lucide-react"
import type { Goal } from "@/lib/finance-context"

interface GoalsScreenProps {
  onOpenNewGoal: () => void
  onUpdateGoal: (goal: Goal) => void
}

export function GoalsScreen({ onOpenNewGoal, onUpdateGoal }: GoalsScreenProps) {
  const { state, getEmergencyGoalSuggestion } = useFinance()
  const emergencySuggestion = getEmergencyGoalSuggestion()

  const regularGoals = state.goals.filter(g => !g.isEmergency)
  const emergencyGoal = state.goals.find(g => g.isEmergency)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F2F3F4] pb-32"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <p className="text-[#020035]/50 text-xs mb-0.5 uppercase tracking-widest">Objetivos</p>
          <h1 className="text-[#020035] text-2xl font-bold">Minhas Metas</h1>
        </div>
        <button
          onClick={onOpenNewGoal}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: "#ED4B00" }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 space-y-4">
        {/* Reserva de Emergência */}
        <div>
          <p className="text-[#020035]/40 text-xs font-medium mb-2 uppercase tracking-widest">Prioridade máxima</p>
          {emergencyGoal ? (
            <GoalCard goal={emergencyGoal} onUpdate={onUpdateGoal} isEmergency />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 border-2 border-dashed"
              style={{ borderColor: "rgba(237,75,0,0.3)", background: "rgba(237,75,0,0.04)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ED4B00]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#ED4B00]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#020035] font-semibold text-sm">Reserva de Emergência</p>
                  <p className="text-[#020035]/50 text-xs mt-0.5 leading-relaxed">
                    Seu colchão de segurança ideal é{" "}
                    <span className="font-bold text-[#020035]">{formatCurrency(emergencySuggestion)}</span>
                    {" "}— 3 meses dos seus gastos.
                  </p>
                  <button
                    onClick={onOpenNewGoal}
                    className="mt-3 text-[#ED4B00] text-xs font-semibold"
                  >
                    Criar agora →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Metas regulares */}
        {regularGoals.length > 0 && (
          <div>
            <p className="text-[#020035]/40 text-xs font-medium mb-2 uppercase tracking-widest">Outros objetivos</p>
            <div className="space-y-3">
              {regularGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <GoalCard goal={goal} onUpdate={onUpdateGoal} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {state.goals.length === 0 && (
          <div className="card-premium text-center py-10">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-[#020035]/50 text-sm">Nenhuma meta criada ainda.</p>
            <p className="text-[#020035]/30 text-xs mt-1">Comece pela reserva de emergência.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function GoalCard({ goal, onUpdate, isEmergency }: { goal: Goal; onUpdate: (g: Goal) => void; isEmergency?: boolean }) {
  const pct = goal.total > 0 ? Math.min((goal.saved / goal.total) * 100, 100) : 0

  return (
    <div
      className="card-premium"
      style={isEmergency ? { borderLeft: "3px solid #ED4B00" } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isEmergency ? "rgba(237,75,0,0.1)" : "rgba(2,6,111,0.08)" }}
          >
            {isEmergency
              ? <Shield className="w-4 h-4 text-[#ED4B00]" />
              : <Target className="w-4 h-4 text-[#02066F]" />
            }
          </div>
          <div>
            <p className="text-[#020035] font-semibold text-sm">{goal.name}</p>
            <p className="text-[#020035]/40 text-xs">{Math.round(pct)}% concluído</p>
          </div>
        </div>
        <button
          onClick={() => onUpdate(goal)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
          style={{ color: isEmergency ? "#ED4B00" : "#02066F", borderColor: isEmergency ? "rgba(237,75,0,0.3)" : "rgba(2,6,111,0.2)" }}
        >
          + Valor
        </button>
      </div>

      <div className="w-full h-2 bg-[#020035]/06 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: isEmergency ? "#ED4B00" : "#02066F" }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[#020035] font-bold text-sm">{formatCurrency(goal.saved)}</span>
        <span className="text-[#020035]/40 text-xs">de {formatCurrency(goal.total)}</span>
      </div>
    </div>
  )
}
