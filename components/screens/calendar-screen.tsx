"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarScreenProps {
  onOpenNewTransaction: (date?: string) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  "Salário": "💼", "Freelance": "💻", "Projeto": "📋", "Venda": "🛍️",
  "Investimento": "📈", "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚌",
  "Saúde": "❤️", "Lazer": "🎉", "Roupa": "👕", "Assinatura": "📱",
  "Educação": "📚", "Pet": "🐾", "Outro": "📌",
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

export function CalendarScreen({ onOpenNewTransaction }: CalendarScreenProps) {
  const { state, getMonthTransactions } = useFinance()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const txs = getMonthTransactions(currentDate)

  // Agrupar por dia
  const byDay: Record<string, typeof txs> = {}
  txs.forEach(tx => {
    if (!byDay[tx.date]) byDay[tx.date] = []
    byDay[tx.date].push(tx)
  })

  // Dias com movimentação, ordenados
  const activeDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a))

  // Valor máximo de gasto do dia (para barra proporcional)
  const maxDayExpense = Math.max(
    ...activeDays.map(d => byDay[d].filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0)),
    1
  )

  const prevMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
    setExpandedDay(null)
  }

  const nextMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
    setExpandedDay(null)
  }

  const formatDayLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return "Hoje"
    if (d.toDateString() === yesterday.toDateString()) return "Ontem"
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F2F3F4] pb-32"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-[#020035] text-2xl font-bold mb-5">Reflexão de Gastos</h1>

        {/* Navegação de mês */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-[#020035]" />
          </button>
          <p className="text-[#020035] font-semibold capitalize">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-[#020035]" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {activeDays.length === 0 ? (
          <div className="card-premium text-center py-10">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-[#020035]/50 text-sm">Nenhum lançamento neste mês.</p>
            <button
              onClick={() => onOpenNewTransaction()}
              className="mt-3 text-[#ED4B00] text-sm font-medium"
            >
              Adicionar lançamento
            </button>
          </div>
        ) : (
          activeDays.map((dateStr, idx) => {
            const dayTxs = byDay[dateStr]
            const income = dayTxs.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0)
            const expense = dayTxs.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0)
            const expensePct = (expense / maxDayExpense) * 100
            const isExpanded = expandedDay === dateStr

            // Agrupar por categoria
            const byCategory: Record<string, { total: number; count: number }> = {}
            dayTxs.filter(t => t.type === "expense").forEach(t => {
              if (!byCategory[t.category]) byCategory[t.category] = { total: 0, count: 0 }
              byCategory[t.category].total += t.amount
              byCategory[t.category].count++
            })

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                  className="w-full card-premium text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[#020035]/60 text-xs font-medium">{formatDayLabel(dateStr)}</p>
                    <ChevronRight
                      className="w-4 h-4 text-[#020035]/30 transition-transform"
                      style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </div>

                  <div className="flex items-end justify-between mb-3">
                    <div>
                      {expense > 0 && (
                        <p className="font-sans text-xl font-bold text-[#ED4B00]">
                          -{formatCurrency(expense)}
                        </p>
                      )}
                      {income > 0 && (
                        <p className="text-sm font-semibold text-[#16a34a]">
                          +{formatCurrency(income)}
                        </p>
                      )}
                    </div>
                    <p className="text-[#020035]/40 text-xs">
                      {dayTxs.length} lançamento{dayTxs.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {expense > 0 && (
                    <div className="w-full h-1 bg-[#020035]/06 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ED4B00]"
                        style={{ width: `${expensePct}%` }}
                      />
                    </div>
                  )}
                </button>

                {/* Expansão com categorias */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-b-2xl px-5 pb-4 -mt-2 pt-4 shadow-sm border-t border-[#020035]/04">
                        <div className="space-y-2.5">
                          {dayTxs.map(tx => (
                            <div key={tx.id} className="flex items-center gap-3">
                              <span className="text-xl">{CATEGORY_ICONS[tx.category] || "📌"}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#020035] text-sm font-medium truncate">{tx.desc}</p>
                                <p className="text-[#020035]/40 text-xs">{tx.category}</p>
                              </div>
                              <span
                                className="text-sm font-bold flex-shrink-0"
                                style={{ color: tx.type === "income" ? "#16a34a" : "#020035" }}
                              >
                                {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => onOpenNewTransaction(dateStr)}
                          className="mt-4 w-full py-2 rounded-xl text-[#ED4B00] text-sm font-medium border border-[#ED4B00]/30"
                        >
                          + Adicionar neste dia
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
