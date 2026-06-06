"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { Plus, Trash2, ChevronRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { PlanningItem } from "@/lib/finance-context"

const EXPENSE_CATEGORIES = ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Roupa", "Assinatura", "Educação", "Pet", "Outro"]
const INCOME_CATEGORIES = ["Salário", "Freelance", "Projeto", "Venda", "Investimento", "Outro"]

export function PlanningScreen() {
  const { state, savePlanning, getCurrentPlanning } = useFinance()
  const [step, setStep] = useState(0)
  const [incomes, setIncomes] = useState<Omit<PlanningItem, "id">[]>([{ desc: "", amount: 0, category: "Salário" }])
  const [expenses, setExpenses] = useState<Omit<PlanningItem, "id">[]>([])
  const [saved, setSaved] = useState(false)

  const month = new Date().toISOString().slice(0, 7)
  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
  const monthLabel = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`

  useEffect(() => {
    const existing = getCurrentPlanning()
    if (existing) {
      setIncomes(existing.incomes.map(({ id, ...rest }) => rest))
      setExpenses(existing.expenses.map(({ id, ...rest }) => rest))
      setSaved(true)
    } else if (state.fixedBills.length > 0) {
      setExpenses(state.fixedBills.map(b => ({ desc: b.name, amount: b.amount, category: "Moradia" })))
    }
  }, [])

  const totalIncome = incomes.reduce((a, i) => a + (i.amount || 0), 0)
  const totalExpense = expenses.reduce((a, e) => a + (e.amount || 0), 0)
  const surplus = totalIncome - totalExpense
  const pct = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0

  const health = surplus > totalIncome * 0.2
    ? { label: "Plano saudável", msg: "Considere direcionar a sobra para suas metas.", icon: CheckCircle, color: "#16a34a" }
    : surplus > 0
    ? { label: "Plano apertado", msg: "Revise algum item antes de o mês começar.", icon: AlertTriangle, color: "#d97706" }
    : { label: "Plano no vermelho", msg: `Você precisa de ${formatCurrency(Math.abs(surplus))} a mais ou cortar gastos.`, icon: XCircle, color: "#ED4B00" }

  const formatVal = (val: string) => {
    const digits = val.replace(/\D/g, "")
    const num = parseInt(digits || "0", 10)
    return (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  }

  const updateIncome = (idx: number, field: string, val: string | number) => {
    setIncomes(prev => prev.map((item, i) => i === idx ? { ...item, [field]: field === "amount" ? parseFloat((val as string).replace(/\D/g, "")) / 100 || 0 : val } : item))
  }

  const updateExpense = (idx: number, field: string, val: string | number) => {
    setExpenses(prev => prev.map((item, i) => i === idx ? { ...item, [field]: field === "amount" ? parseFloat((val as string).replace(/\D/g, "")) / 100 || 0 : val } : item))
  }

  const handleSave = () => {
    savePlanning({
      month,
      incomes: incomes.filter(i => i.amount > 0).map((i, idx) => ({ ...i, id: idx + 1 })),
      expenses: expenses.filter(e => e.amount > 0).map((e, idx) => ({ ...e, id: idx + 1 })),
    })
    setSaved(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F2F3F4] pb-32"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <p className="text-[#020035]/50 text-xs mb-1 uppercase tracking-widest">Planejamento</p>
        <h1 className="text-[#020035] text-2xl font-bold">{monthLabel}</h1>
      </div>

      {/* Steps nav */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          {["Receitas", "Gastos", "Análise"].map((label, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: step === i ? "#020035" : "white",
                color: step === i ? "white" : "rgba(2,0,53,0.4)",
                boxShadow: step === i ? "none" : "0 1px 8px rgba(2,0,53,0.06)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {/* PASSO 1 — Receitas */}
          {step === 0 && (
            <motion.div
              key="incomes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {incomes.map((item, idx) => (
                <div key={idx} className="card-premium space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[#020035]/50 text-xs font-medium">Fonte {idx + 1}</p>
                    {incomes.length > 1 && (
                      <button onClick={() => setIncomes(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-4 h-4 text-[#ED4B00]/60" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: Salário CLT"
                    value={item.desc}
                    onChange={e => updateIncome(idx, "desc", e.target.value)}
                    className="w-full text-[#020035] text-sm bg-transparent border-b border-[#020035]/10 pb-1.5 outline-none placeholder:text-[#020035]/30"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-0 top-1 text-[#020035]/40 text-sm">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={item.amount > 0 ? item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
                        onChange={e => updateIncome(idx, "amount", e.target.value)}
                        className="w-full pl-8 text-[#020035] font-bold text-lg bg-transparent border-b border-[#020035]/10 pb-1 outline-none placeholder:text-[#020035]/20 font-sans"
                      />
                    </div>
                    <select
                      value={item.category}
                      onChange={e => updateIncome(idx, "category", e.target.value)}
                      className="text-xs text-[#020035]/60 bg-[#F2F3F4] rounded-lg px-2 outline-none"
                    >
                      {INCOME_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIncomes(prev => [...prev, { desc: "", amount: 0, category: "Freelance" }])}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[#020035]/15 text-[#020035]/40 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar fonte
              </button>

              {totalIncome > 0 && (
                <div className="card-dark flex items-center justify-between">
                  <p className="text-white/60 text-sm">Total previsto</p>
                  <p className="font-sans text-xl font-bold text-[#16a34a]">{formatCurrency(totalIncome)}</p>
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                disabled={totalIncome === 0}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ background: "#ED4B00" }}
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* PASSO 2 — Gastos */}
          {step === 1 && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Barra de comprometimento */}
              {totalIncome > 0 && (
                <div className="card-premium">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#020035]/50 text-xs">Comprometido da renda</p>
                    <p className="text-[#020035] text-xs font-bold">{Math.round(pct)}%</p>
                  </div>
                  <div className="w-full h-2 bg-[#020035]/06 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: pct > 90 ? "#ED4B00" : pct > 70 ? "#d97706" : "#02066F",
                      }}
                    />
                  </div>
                </div>
              )}

              {expenses.map((item, idx) => (
                <div key={idx} className="card-premium space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[#020035]/50 text-xs font-medium">Item {idx + 1}</p>
                    <button onClick={() => setExpenses(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4 text-[#ED4B00]/60" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: Aluguel"
                    value={item.desc}
                    onChange={e => updateExpense(idx, "desc", e.target.value)}
                    className="w-full text-[#020035] text-sm bg-transparent border-b border-[#020035]/10 pb-1.5 outline-none placeholder:text-[#020035]/30"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-0 top-1 text-[#020035]/40 text-sm">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={item.amount > 0 ? item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
                        onChange={e => updateExpense(idx, "amount", e.target.value)}
                        className="w-full pl-8 text-[#020035] font-bold text-lg bg-transparent border-b border-[#020035]/10 pb-1 outline-none placeholder:text-[#020035]/20 font-sans"
                      />
                    </div>
                    <select
                      value={item.category}
                      onChange={e => updateExpense(idx, "category", e.target.value)}
                      className="text-xs text-[#020035]/60 bg-[#F2F3F4] rounded-lg px-2 outline-none"
                    >
                      {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setExpenses(prev => [...prev, { desc: "", amount: 0, category: "Outro" }])}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[#020035]/15 text-[#020035]/40 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar item
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: "#ED4B00" }}
              >
                Ver análise <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* PASSO 3 — Análise */}
          {step === 2 && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Card resultado */}
              <div className="card-dark">
                <div className="flex items-center gap-2 mb-4">
                  <health.icon className="w-5 h-5" style={{ color: health.color }} />
                  <p className="text-white font-semibold text-sm">{health.label}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm">Receita prevista</span>
                    <span className="text-[#16a34a] font-bold">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm">Comprometido</span>
                    <span className="text-[#ED4B00] font-bold">{formatCurrency(totalExpense)}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-white text-sm font-semibold">Sobra prevista</span>
                    <span
                      className="font-sans text-xl font-bold"
                      style={{ color: surplus >= 0 ? "#16a34a" : "#ED4B00" }}
                    >
                      {surplus >= 0 ? "+" : ""}{formatCurrency(surplus)}
                    </span>
                  </div>
                </div>

                <div className="bg-white/05 rounded-xl p-3">
                  <p className="text-white/60 text-xs leading-relaxed">{health.msg}</p>
                </div>

                {/* Barra visual */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>0%</span>
                    <span>70%</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: pct > 90 ? "#ED4B00" : pct > 70 ? "#d97706" : "#16a34a",
                      }}
                    />
                    {/* Marcador 70% */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/20" style={{ left: "70%" }} />
                  </div>
                  <p className="text-white/40 text-xs mt-1 text-right">{Math.round(pct)}% comprometido</p>
                </div>
              </div>

              {/* Resumo por item */}
              {expenses.filter(e => e.amount > 0).length > 0 && (
                <div className="card-premium">
                  <p className="text-[#020035] font-semibold text-sm mb-3">Detalhamento</p>
                  <div className="space-y-2">
                    {expenses.filter(e => e.amount > 0).map((e, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[#020035]/60 text-sm">{e.desc || e.category}</span>
                        <span className="text-[#020035] text-sm font-semibold">{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: saved ? "#16a34a" : "#ED4B00" }}
              >
                {saved ? "✓ Planejamento salvo" : "Salvar planejamento"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
