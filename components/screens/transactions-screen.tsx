"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { Search, Trash2 } from "lucide-react"

const CATEGORY_ICONS: Record<string, string> = {
  "Salário": "💼", "Freelance": "💻", "Projeto": "📋", "Venda": "🛍️",
  "Investimento": "📈", "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚌",
  "Saúde": "❤️", "Lazer": "🎉", "Roupa": "👕", "Assinatura": "📱",
  "Educação": "📚", "Pet": "🐾", "Outro": "📌",
}

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

interface TransactionsScreenProps {
  onOpenNewTransaction: () => void
  onDeleteTransaction: (id: number) => void
}

export function TransactionsScreen({ onOpenNewTransaction, onDeleteTransaction }: TransactionsScreenProps) {
  const { state, getMonthStats } = useFinance()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const stats = getMonthStats()

  const filtered = [...state.transactions]
    .reverse()
    .filter(t => {
      const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === "all" || t.type === filter
      return matchSearch && matchFilter
    })

  // Agrupar por data
  const groups: Record<string, typeof filtered> = {}
  filtered.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = []
    groups[tx.date].push(tx)
  })

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return "Hoje"
    if (d.toDateString() === yesterday.toDateString()) return "Ontem"
    return `${d.getDate()} de ${MONTHS[d.getMonth()]}`
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F2F3F4] pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <p className="text-[#020035]/50 text-xs mb-0.5 uppercase tracking-widest">Registro</p>
        <h1 className="text-[#020035] text-2xl font-bold mb-5">Histórico</h1>

        {/* Totais do mês */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card-premium py-3">
            <p className="text-[#020035]/50 text-xs mb-1">Receitas</p>
            <p className="text-[#16a34a] font-bold text-lg">{formatCurrency(stats.income)}</p>
          </div>
          <div className="card-premium py-3">
            <p className="text-[#020035]/50 text-xs mb-1">Despesas</p>
            <p className="text-[#ED4B00] font-bold text-lg">{formatCurrency(stats.expense)}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#020035]/30" />
          <input
            type="text"
            placeholder="Buscar lançamento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-[#020035] text-sm placeholder:text-[#020035]/30 outline-none shadow-sm"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "Todos" },
            { key: "income", label: "Receitas" },
            { key: "expense", label: "Despesas" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as "all" | "income" | "expense")}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === key ? "#020035" : "white",
                color: filter === key ? "white" : "rgba(2,0,53,0.4)",
                boxShadow: filter === key ? "none" : "0 1px 6px rgba(2,0,53,0.06)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {Object.keys(groups).length === 0 ? (
          <div className="card-premium text-center py-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-[#020035]/50 text-sm">
              {search ? "Nenhum resultado encontrado." : "Nenhum lançamento ainda."}
            </p>
            {!search && (
              <button onClick={onOpenNewTransaction} className="mt-3 text-[#ED4B00] text-sm font-medium">
                Adicionar o primeiro
              </button>
            )}
          </div>
        ) : (
          Object.entries(groups).map(([date, txs]) => (
            <div key={date}>
              <p className="text-[#020035]/40 text-xs font-semibold mb-2 uppercase tracking-wide">
                {formatDateLabel(date)}
              </p>
              <div className="card-premium space-y-3 py-3">
                {txs.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: tx.type === "income" ? "rgba(22,163,74,0.1)" : "rgba(237,75,0,0.08)" }}
                    >
                      {CATEGORY_ICONS[tx.category] || "📌"}
                    </div>
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
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(237,75,0,0.08)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#ED4B00]" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
