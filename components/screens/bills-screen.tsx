"use client"

import { motion } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { Plus, Check, Calendar } from "lucide-react"

interface BillsScreenProps {
  onOpenNewBill: () => void
}

export function BillsScreen({ onOpenNewBill }: BillsScreenProps) {
  const { state, toggleBillPaid, deleteFixedBill } = useFinance()
  const total = state.fixedBills.reduce((a, b) => a + b.amount, 0)
  const paid = state.fixedBills.filter(b => b.paid).reduce((a, b) => a + b.amount, 0)
  const pctIncome = state.monthlyIncome > 0 ? Math.round((total / state.monthlyIncome) * 100) : 0

  const sorted = [...state.fixedBills].sort((a, b) => a.dueDay - b.dueDay)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F2F3F4] pb-32">
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <p className="text-[#020035]/50 text-xs mb-0.5 uppercase tracking-widest">Recorrentes</p>
          <h1 className="text-[#020035] text-2xl font-bold">Contas Fixas</h1>
        </div>
        <button
          onClick={onOpenNewBill}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: "#ED4B00" }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 space-y-4">
        {state.fixedBills.length > 0 && (
          <div className="card-dark">
            <p className="text-white/60 text-xs mb-3 uppercase tracking-widest">Resumo do mês</p>
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-white/50 text-xs mb-1">Total fixo</p>
                <p className="font-sans text-2xl font-bold text-white">{formatCurrency(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs mb-1">Já pago</p>
                <p className="font-sans text-2xl font-bold text-[#16a34a]">{formatCurrency(paid)}</p>
              </div>
            </div>
            {pctIncome > 0 && (
              <p className="text-white/40 text-xs">
                Suas fixas comprometem <span className="text-white font-bold">{pctIncome}%</span> da sua renda
                {pctIncome > 50 ? " — atenção, acima do ideal." : "."}
              </p>
            )}
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="card-premium text-center py-10">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-[#020035]/50 text-sm">Nenhuma conta fixa cadastrada.</p>
            <button onClick={onOpenNewBill} className="mt-3 text-[#ED4B00] text-sm font-medium">
              Adicionar conta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((bill, idx) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-premium flex items-center gap-3"
                style={{ opacity: bill.paid ? 0.6 : 1 }}
              >
                <button
                  onClick={() => toggleBillPaid(bill.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: bill.paid ? "rgba(22,163,74,0.15)" : "rgba(2,0,53,0.06)" }}
                >
                  <Check className="w-4 h-4" style={{ color: bill.paid ? "#16a34a" : "rgba(2,0,53,0.3)" }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${bill.paid ? "line-through text-[#020035]/40" : "text-[#020035]"}`}>
                    {bill.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#020035]/30" />
                    <p className="text-[#020035]/40 text-xs">Vence dia {bill.dueDay}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#020035] font-bold text-sm">{formatCurrency(bill.amount)}</p>
                  {!bill.paid && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: bill.dueDay <= new Date().getDate() ? "rgba(237,75,0,0.1)" : "rgba(2,0,53,0.06)",
                        color: bill.dueDay <= new Date().getDate() ? "#ED4B00" : "rgba(2,0,53,0.4)",
                      }}
                    >
                      {bill.dueDay <= new Date().getDate() ? "Venceu" : `Dia ${bill.dueDay}`}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
