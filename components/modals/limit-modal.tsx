"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { X } from "lucide-react"

interface LimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LimitModal({ isOpen, onClose }: LimitModalProps) {
  const { state, setLimit } = useFinance()
  const [value, setValue] = useState("")
  const suggested = state.monthlyIncome > 0 ? Math.round(state.monthlyIncome * 0.7) : 0

  useEffect(() => {
    if (isOpen) setValue(state.limit > 0 ? state.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "")
  }, [isOpen, state.limit])

  const handleSubmit = () => {
    const num = parseFloat(value.replace(/\D/g, "")) / 100
    if (isNaN(num) || num <= 0) return
    setLimit(num)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[300]"
            style={{ background: "rgba(2,0,53,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 z-[301] rounded-t-3xl"
            style={{ bottom: 0, background: "white", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(2,0,53,0.15)" }} />
            </div>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold" style={{ color: "#020035" }}>Limite de gastos</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(2,0,53,0.06)" }}>
                <X className="w-4 h-4" style={{ color: "#020035" }} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
              <p className="text-sm mb-4" style={{ color: "rgba(2,0,53,0.5)" }}>
                Boa prática: comprometer no máximo 70% da renda com gastos.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>Novo limite (R$)</label>
                <input
                  type="text" inputMode="numeric" value={value}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "")
                    const num = parseInt(digits || "0", 10)
                    setValue((num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }))
                  }}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                />
              </div>

              {suggested > 0 && (
                <button
                  onClick={() => setValue((suggested).toLocaleString("pt-BR", { minimumFractionDigits: 2 }))}
                  className="text-sm font-medium mb-6 block"
                  style={{ color: "#ED4B00" }}
                >
                  Usar sugestão: R$ {suggested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </button>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-white"
                style={{ background: "#ED4B00" }}
              >
                Salvar limite
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
