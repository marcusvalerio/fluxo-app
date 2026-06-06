"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance, type Goal } from "@/lib/finance-context"
import { X, Shield } from "lucide-react"

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  editingGoal?: Goal | null
}

export function GoalModal({ isOpen, onClose, editingGoal }: GoalModalProps) {
  const { addGoal, updateGoal, getEmergencyGoalSuggestion } = useFinance()
  const [name, setName] = useState("")
  const [total, setTotal] = useState("")
  const [saved, setSaved] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const emergencySuggestion = getEmergencyGoalSuggestion()

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setName(editingGoal.name)
        setTotal(String(editingGoal.total))
        setSaved(String(editingGoal.saved))
        setIsEmergency(!!editingGoal.isEmergency)
      } else {
        setName(""); setTotal(""); setSaved(""); setIsEmergency(false)
      }
    }
  }, [isOpen, editingGoal])

  const handleSubmit = () => {
    const totalNum = parseFloat(total.replace(",", "."))
    const savedNum = parseFloat(saved.replace(",", ".")) || 0
    if (!name.trim() || isNaN(totalNum) || totalNum <= 0) return
    if (editingGoal) {
      updateGoal(editingGoal.id, { name: name.trim(), total: totalNum, saved: editingGoal.saved + savedNum, isEmergency })
    } else {
      addGoal({ name: name.trim(), total: totalNum, saved: savedNum, isEmergency })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300]"
            style={{ background: "rgba(2,0,53,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 z-[301] rounded-t-3xl"
            style={{ bottom: 0, left: 0, right: 0, width: "100%", background: "white", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(2,0,53,0.15)" }} />
            </div>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold" style={{ color: "#020035" }}>
                {editingGoal ? "Adicionar valor" : "Nova Meta"}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(2,0,53,0.06)" }}>
                <X className="w-4 h-4" style={{ color: "#020035" }} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
              {!editingGoal && (
                <button
                  onClick={() => { setIsEmergency(!isEmergency); if (!isEmergency) { setName("Reserva de Emergência"); setTotal(String(Math.round(emergencySuggestion))) } }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl mb-4 text-left"
                  style={{ background: isEmergency ? "rgba(237,75,0,0.08)" : "rgba(2,0,53,0.04)", border: `1.5px solid ${isEmergency ? "#ED4B00" : "transparent"}` }}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" style={{ color: "#ED4B00" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#020035" }}>Reserva de Emergência</p>
                    <p className="text-xs" style={{ color: "rgba(2,0,53,0.5)" }}>Sugestão: R$ {Math.round(emergencySuggestion).toLocaleString("pt-BR")}</p>
                  </div>
                </button>
              )}

              {!editingGoal && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>Nome da meta</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Ex: Viagem, Notebook..."
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                    style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>
                  {editingGoal ? "Valor a adicionar (R$)" : "Valor total (R$)"}
                </label>
                <input
                  type="text" inputMode="decimal"
                  value={editingGoal ? saved : total}
                  onChange={e => editingGoal ? setSaved(e.target.value) : setTotal(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                />
              </div>

              {!editingGoal && (
                <div className="mb-6">
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>Já guardei (R$) — opcional</label>
                  <input
                    type="text" inputMode="decimal" value={saved} onChange={e => setSaved(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                    style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                  />
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-white mt-2"
                style={{ background: "#ED4B00" }}
              >
                {editingGoal ? "Adicionar valor" : "Criar meta"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
