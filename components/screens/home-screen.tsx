"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, getGreeting, formatFullDate } from "@/lib/format"
import { Shield, Target, PiggyBank, TrendingDown, ChevronRight, Zap } from "lucide-react"
import { Logo } from "../logo"

interface HomeScreenProps {
  onOpenNewTransaction: (date?: string) => void
  onOpenLimitModal: () => void
  onNavigate: (screen: "home" | "transactions" | "goals" | "calendar" | "bills" | "analytics" | "planning") => void
}

export function HomeScreen({ onOpenNewTransaction, onOpenLimitModal, onNavigate }: HomeScreenProps) {
  const { state, getMonthStats, getHealthScore, getContextualMessage } = useFinance()
  const stats = getMonthStats()
  const { score, saving, limitOk, hasGoal } = getHealthScore()
  const message = getContextualMessage()
  const recentTxs = [...state.transactions].reverse().slice(0, 5)
  const limitRef = state.limit || state.monthlyIncome * 0.7 || 0
  const limitPct = limitRef > 0 ? Math.min((stats.expense / limitRef) * 100, 100) : 0

  const scoreColor = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#ED4B00"
  const today = new Date()

  const CATEGORY_ICONS: Record<string, string> = {
    "Salário": "💼", "Freelance": "💻", "Projeto": "📋", "Venda": "🛍️",
    "Investimento": "📈", "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚌",
    "Saúde": "❤️", "Lazer": "🎉", "Roupa": "👕", "Assinatura": "📱",
    "Educação": "📚", "Pet": "🐾", "Outro": "📌",
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F2F3F4] pb-32"
    >
      {/* Header com motion */}
      <GreetingHeader user={state.user} today={today} />

      <div className="px-6 space-y-4">
        {/* Score de Saúde Financeira */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="card-dark"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Saúde Financeira</p>
            <span className="text-white/40 text-xs">este mês</span>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <span
              className="font-sans text-6xl font-bold leading-none"
              style={{ color: scoreColor }}
            >
              {score}
            </span>
            <div className="pb-1">
              <span className="text-white/40 text-sm">/100</span>
            </div>
          </div>

          {/* Barra de score */}
          <div className="w-full h-1.5 bg-white/10 rounded-full mb-5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: scoreColor }}
            />
          </div>

          {/* Indicadores */}
          <div className="flex gap-3">
            {[
              { label: "Guardando", ok: saving, icon: PiggyBank },
              { label: "Limite ok", ok: limitOk, icon: Shield },
              { label: "Meta ativa", ok: hasGoal, icon: Target },
            ].map(({ label, ok, icon: Icon }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: ok ? "rgba(22,163,74,0.2)" : "rgba(237,75,0,0.2)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: ok ? "#16a34a" : "#ED4B00" }} />
                </div>
                <span className="text-white/50 text-[10px] text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Micro-feedback */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(237,75,0,0.06)" }}
        >
          <Zap className="w-4 h-4 text-[#ED4B00] flex-shrink-0" />
          <p className="text-[#020035]/70 text-sm leading-snug">{message}</p>
        </motion.div>

        {/* Receitas e Gastos */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="card-premium">
            <p className="text-[#020035]/50 text-xs mb-2 font-medium">Receitas</p>
            <p className="text-[#16a34a] font-sans text-xl font-bold">
              {formatCurrency(stats.income)}
            </p>
          </div>
          <div className="card-premium">
            <p className="text-[#020035]/50 text-xs mb-2 font-medium">Gastos</p>
            <p className="font-sans text-xl font-bold" style={{ color: "#ED4B00" }}>
              {formatCurrency(stats.expense)}
            </p>
          </div>
        </motion.div>

        {/* Limite mensal */}
        {limitRef > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card-premium"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#020035]/60 text-xs font-medium">Limite mensal</p>
              <button onClick={onOpenLimitModal} className="text-[#ED4B00] text-xs font-medium">Ajustar</button>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-[#020035] font-bold text-sm">{formatCurrency(stats.expense)}</span>
              <span className="text-[#020035]/40 text-xs">de {formatCurrency(limitRef)}</span>
            </div>
            <div className="w-full h-2 bg-[#020035]/06 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${limitPct}%` }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="h-full rounded-full transition-colors"
                style={{
                  background: limitPct >= 90 ? "#ED4B00" : limitPct >= 70 ? "#d97706" : "#02066F",
                }}
              />
            </div>
            <p className="text-[#020035]/40 text-xs mt-1.5">{Math.round(limitPct)}% utilizado</p>
          </motion.div>
        )}

        {/* Últimas transações */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="card-premium"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#020035] font-semibold text-sm">Últimos lançamentos</p>
            <button
              onClick={() => onNavigate("transactions")}
              className="flex items-center gap-1 text-[#ED4B00] text-xs font-medium"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTxs.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-4xl mb-2">💸</p>
              <p className="text-[#020035]/40 text-sm">Nenhum lançamento ainda.</p>
              <button
                onClick={() => onOpenNewTransaction()}
                className="mt-3 text-[#ED4B00] text-sm font-medium"
              >
                Adicionar o primeiro
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTxs.map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
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
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Saldo */}
        {stats.income > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card-premium flex items-center justify-between"
          >
            <div>
              <p className="text-[#020035]/50 text-xs mb-1">Saldo do mês</p>
              <p
                className="font-sans text-2xl font-bold"
                style={{ color: stats.balance >= 0 ? "#16a34a" : "#ED4B00" }}
              >
                {stats.balance >= 0 ? "+" : ""}{formatCurrency(stats.balance)}
              </p>
            </div>
            <TrendingDown className={`w-8 h-8 ${stats.balance >= 0 ? "text-green-500 rotate-180" : "text-[#ED4B00]"}`} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}


/* ─── Greeting Header Component ─────────────────────────────────── */
/* ─── Greeting Header ───────────────────────────────────────────── */
/* ─── Greeting Header ───────────────────────────────────────────── */
function GreetingHeader({ user, today }: { user: string; today: Date }) {
  const hour = today.getHours()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const label = hour >= 5 && hour < 12 ? "Bom dia"
    : hour >= 12 && hour < 18 ? "Boa tarde"
    : "Boa noite"

  const enter = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(14px)",
    filter: visible ? "blur(0px)" : "blur(6px)",
    transition: `opacity 0.55s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.55s ${delay}s cubic-bezier(0.22,1,0.36,1), filter 0.5s ${delay}s ease`,
  })

  return (
    <div className="px-6 pt-12 pb-5 flex items-start justify-between">
      <div>
        <div style={enter(0)}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ED4B00" }}>
            {label}
          </span>
        </div>
        <h1 style={{ ...enter(0.09), color: "#020035", fontSize: "clamp(1.4rem, 6vw, 1.75rem)" }} className="font-bold leading-tight mt-1">
          {user ? `Olá, ${user}.` : "Olá."}
        </h1>
        <p style={{ ...enter(0.18), color: "rgba(2,0,53,0.45)" }} className="text-sm mt-0.5 capitalize">
          {today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.85)", transition: "opacity 0.4s 0.3s ease, transform 0.4s 0.3s ease" }}>
        <Logo size={32} showText={false} />
      </div>
    </div>
  )
}
