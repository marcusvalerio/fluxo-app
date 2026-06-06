"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
const CATEGORY_ICONS: Record<string, string> = {
  "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚌", "Saúde": "❤️",
  "Lazer": "🎉", "Roupa": "👕", "Assinatura": "📱", "Educação": "📚", "Pet": "🐾", "Outro": "📌",
}

export function AnalyticsScreen() {
  const { getMonthStats, getMonthTransactions } = useFinance()
  const [period, setPeriod] = useState<0 | 1 | 2>(0)

  const now = new Date()
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const stats = getMonthStats(now)
  const prevStats = getMonthStats(prevDate)
  const txs = getMonthTransactions(now)
  const expenses = txs.filter(t => t.type === "expense")

  // Variação vs mês anterior
  const variation = prevStats.expense > 0
    ? ((stats.expense - prevStats.expense) / prevStats.expense) * 100
    : 0

  // Por categoria
  const byCategory: Record<string, number> = {}
  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const topCategory = sortedCategories[0]

  // Semanas do mês
  const weeks: { label: string; income: number; expense: number }[] = []
  for (let w = 0; w < 4; w++) {
    const start = w * 7 + 1
    const end = Math.min(start + 6, 31)
    const weekTxs = txs.filter(t => {
      const day = new Date(t.date + "T00:00:00").getDate()
      return day >= start && day <= end
    })
    weeks.push({
      label: `S${w + 1}`,
      income: weekTxs.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0),
      expense: weekTxs.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0),
    })
  }
  const maxWeek = Math.max(...weeks.map(w => Math.max(w.income, w.expense)), 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F2F3F4] pb-32"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <p className="text-[#020035]/50 text-xs mb-0.5 uppercase tracking-widest">Visão geral</p>
        <h1 className="text-[#020035] text-2xl font-bold">Análise</h1>
      </div>

      <div className="px-6 space-y-4">
        {/* Período */}
        <div className="flex gap-2">
          {["Este mês", "Mês anterior", "Últimos 3m"].map((label, i) => (
            <button
              key={i}
              onClick={() => setPeriod(i as 0|1|2)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: period === i ? "#020035" : "white",
                color: period === i ? "white" : "rgba(2,0,53,0.4)",
                boxShadow: period === i ? "none" : "0 1px 8px rgba(2,0,53,0.06)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-premium">
            <p className="text-[#020035]/50 text-xs mb-2">Receitas</p>
            <p className="font-sans text-xl font-bold text-[#16a34a]">{formatCurrency(stats.income)}</p>
          </div>
          <div className="card-premium">
            <p className="text-[#020035]/50 text-xs mb-2">Despesas</p>
            <p className="font-sans text-xl font-bold text-[#ED4B00]">{formatCurrency(stats.expense)}</p>
          </div>
        </div>

        {/* Tendência vs mês anterior */}
        {prevStats.expense > 0 && (
          <div className="card-dark">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: variation > 0 ? "rgba(237,75,0,0.2)" : "rgba(22,163,74,0.2)" }}
              >
                {variation > 0
                  ? <TrendingUp className="w-5 h-5 text-[#ED4B00]" />
                  : variation < 0
                  ? <TrendingDown className="w-5 h-5 text-[#16a34a]" />
                  : <Minus className="w-5 h-5 text-white/40" />
                }
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  {Math.abs(variation) < 1
                    ? "Igual ao mês anterior."
                    : variation > 0
                    ? `Você gastou ${Math.round(variation)}% a mais que em ${MONTHS[prevDate.getMonth()]}.`
                    : `Você gastou ${Math.round(Math.abs(variation))}% a menos que em ${MONTHS[prevDate.getMonth()]}.`
                  }
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  {MONTHS[prevDate.getMonth()]}: {formatCurrency(prevStats.expense)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico semanal */}
        {txs.length > 0 && (
          <div className="card-premium">
            <p className="text-[#020035] font-semibold text-sm mb-4">Por semana</p>
            <div className="flex items-end gap-3 h-28">
              {weeks.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: 96 }}>
                    {/* Receita */}
                    {w.income > 0 && (
                      <div
                        className="w-full rounded-t-lg"
                        style={{
                          height: `${(w.income / maxWeek) * 80}%`,
                          background: "#02066F",
                          opacity: 0.7,
                          minHeight: 4,
                        }}
                      />
                    )}
                    {/* Despesa */}
                    {w.expense > 0 && (
                      <div
                        className="w-full rounded-b-lg"
                        style={{
                          height: `${(w.expense / maxWeek) * 80}%`,
                          background: "#ED4B00",
                          minHeight: 4,
                        }}
                      />
                    )}
                  </div>
                  <p className="text-[#020035]/40 text-[10px]">{w.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#02066F]/70" />
                <span className="text-[#020035]/50 text-xs">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#ED4B00]" />
                <span className="text-[#020035]/50 text-xs">Despesas</span>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição por categoria */}
        {sortedCategories.length > 0 && (
          <div className="card-premium">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[#020035] font-semibold text-sm">Por categoria</p>
            </div>

            {topCategory && (
              <div
                className="rounded-xl p-3 mb-3"
                style={{ background: "rgba(237,75,0,0.06)" }}
              >
                <p className="text-[#020035]/60 text-xs leading-relaxed">
                  <span className="font-bold text-[#020035]">{topCategory[0]}</span> foi seu maior gasto —{" "}
                  {formatCurrency(topCategory[1])}, {stats.expense > 0 ? Math.round((topCategory[1] / stats.expense) * 100) : 0}% do total.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {sortedCategories.map(([cat, val]) => {
                const pct = stats.expense > 0 ? (val / stats.expense) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{CATEGORY_ICONS[cat] || "📌"}</span>
                        <span className="text-[#020035] text-sm">{cat}</span>
                      </div>
                      <span className="text-[#020035] text-sm font-bold">{formatCurrency(val)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#020035]/06 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#02066F]"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {txs.length === 0 && (
          <div className="card-premium text-center py-10">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-[#020035]/50 text-sm">Nenhum dado para analisar ainda.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
