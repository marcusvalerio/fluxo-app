"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { X } from "lucide-react"

interface BillModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BillModal({ isOpen, onClose }: BillModalProps) {
  const { addFixedBill } = useFinance()
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDay, setDueDay] = useState("")

  useEffect(() => {
    if (isOpen) { setName(""); setAmount(""); setDueDay("") }
  }, [isOpen])

  const handleSubmit = () => {
    if (!name.trim()) return
    const amountNum = parseFloat(amount.replace(",", "."))
    const dueDayNum = parseInt(dueDay)
    if (isNaN(amountNum) || amountNum <= 0) return
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) return
    addFixedBill({ name: name.trim(), amount: amountNum, dueDay: dueDayNum })
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
            style={{ bottom: 0, background: "white", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(2,0,53,0.15)" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold" style={{ color: "#020035" }}>Nova Conta Fixa</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(2,0,53,0.06)" }}>
                <X className="w-4 h-4" style={{ color: "#020035" }} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>Nome</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: Aluguel, Netflix..."
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>Valor (R$)</label>
                <input
                  type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.5)" }}>Dia de vencimento</label>
                <input
                  type="number" inputMode="numeric" min={1} max={31}
                  value={dueDay} onChange={e => setDueDay(e.target.value)}
                  placeholder="Ex: 10"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-semibold text-white"
                style={{ background: "#ED4B00" }}
              >
                Adicionar conta
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
