"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance, type Transaction } from "@/lib/finance-context"
import { X, ArrowUpRight, ArrowDownRight, Check } from "lucide-react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  editingTransaction?: Transaction | null
  prefilledDate?: string | null
}

export function TransactionModal({ isOpen, onClose, editingTransaction, prefilledDate }: TransactionModalProps) {
  const { incomeCategories, expenseCategories, addTransaction, updateTransaction } = useFinance()
  const [type, setType] = useState<"income" | "expense">("expense")
  const [saving, setSaving] = useState(false)
  const [amount, setAmount] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type)
        setAmount(String(editingTransaction.amount))
        setDesc(editingTransaction.desc)
        setCategory(editingTransaction.category)
        setDate(editingTransaction.date)
      } else {
        setType("expense"); setAmount(""); setDesc(""); setCategory("")
        setDate(prefilledDate || new Date().toISOString().split("T")[0])
      }
    }
  }, [editingTransaction, prefilledDate, isOpen])

  const categories = type === "income" ? incomeCategories : expenseCategories

  const handleAmount = (val: string) => {
    const digits = val.replace(/\D/g, "")
    const num = parseInt(digits || "0", 10)
    setAmount(num > 0 ? (num / 100).toFixed(2) : "")
  }

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0 || !date) return
    setSaving(true)
    const txData = { type, amount: amountNum, desc: desc || category || "Lançamento", category: category || "Outro", date }
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, txData)
      } else {
        await addTransaction(txData)
      }
      onClose()
    } catch (e) {
      console.error("Erro ao salvar:", e)
    }
    setSaving(false)
  }

  const accentColor = type === "income" ? "#16a34a" : "#ED4B00"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[300]"
            style={{ background: "rgba(2,0,53,0.55)", backdropFilter: "blur(6px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 z-[301] rounded-t-3xl"
            style={{ bottom: 0, left: 0, right: 0, width: "100%", background: "white", maxHeight: "92dvh", display: "flex", flexDirection: "column" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(2,0,53,0.12)" }} />
            </div>

            {/* Header fixo */}
            <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
              <h2 className="text-lg font-bold" style={{ color: "#020035" }}>
                {editingTransaction ? "Editar lançamento" : "Novo lançamento"}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(2,0,53,0.06)" }}>
                <X className="w-4 h-4" style={{ color: "#020035" }} />
              </button>
            </div>

            {/* Toggle tipo — fixo */}
            <div className="px-5 pb-3 flex-shrink-0">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl" style={{ background: "#F2F3F4" }}>
                {(["expense", "income"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: type === t ? "white" : "transparent",
                      color: type === t ? (t === "income" ? "#16a34a" : "#ED4B00") : "rgba(2,0,53,0.4)",
                      boxShadow: type === t ? "0 1px 8px rgba(2,0,53,0.1)" : "none",
                    }}
                  >
                    {t === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {t === "income" ? "Entrada" : "Saída"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo rolável */}
            <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ WebkitOverflowScrolling: "touch" }}>

              {/* Valor */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.45)" }}>Valor</label>
                <div className="relative rounded-2xl overflow-hidden" style={{ border: `2px solid ${accentColor}30`, background: `${accentColor}06` }}>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: accentColor }}>R$</span>
                  <input
                    type="text" inputMode="numeric"
                    value={amount ? Number(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
                    onChange={e => handleAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-right bg-transparent outline-none"
                    style={{ color: accentColor }}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.45)" }}>Descrição</label>
                <input
                  type="text" value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Almoço, Salário..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.08)" }}
                />
              </div>

              {/* Categoria */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.45)" }}>Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: category === cat ? accentColor : "#F2F3F4",
                        color: category === cat ? "white" : "rgba(2,0,53,0.6)",
                      }}
                    >
                      {category === cat && <Check className="w-3 h-3" />}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data */}
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.45)" }}>Data</label>
                <input
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#F2F3F4", color: "#020035", border: "1.5px solid rgba(2,0,53,0.08)" }}
                />
              </div>

              {/* Botão */}
              <motion.button
                whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || saving}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
                style={{ background: accentColor }}
              >
                {saving ? "Salvando..." : editingTransaction ? "Salvar alteração" : "Salvar lançamento"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
