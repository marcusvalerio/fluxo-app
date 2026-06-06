"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export interface Transaction {
  id: number
  type: "income" | "expense"
  amount: number
  desc: string
  category: string
  date: string
}

export interface Goal {
  id: number
  name: string
  total: number
  saved: number
  isEmergency?: boolean
}

export interface FixedBill {
  id: number
  name: string
  amount: number
  dueDay: number
  paid: boolean
}

export interface PlanningItem {
  id: number
  desc: string
  amount: number
  category: string
}

export interface MonthlyPlanning {
  month: string
  incomes: PlanningItem[]
  expenses: PlanningItem[]
}

export interface FinanceState {
  user: string
  monthlyIncome: number
  limit: number
  transactions: Transaction[]
  goals: Goal[]
  fixedBills: FixedBill[]
  planning: MonthlyPlanning[]
  onboarded: boolean
}

const INCOME_CATEGORIES = ["Salário", "Freelance", "Projeto", "Venda", "Investimento", "Outro"]
const EXPENSE_CATEGORIES = ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Roupa", "Assinatura", "Educação", "Pet", "Outro"]

const CATEGORY_ICONS: Record<string, string> = {
  "Salário": "💼", "Freelance": "💻", "Projeto": "📋", "Venda": "🛍️",
  "Investimento": "📈", "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚌",
  "Saúde": "❤️", "Lazer": "🎉", "Roupa": "👕", "Assinatura": "📱",
  "Educação": "📚", "Pet": "🐾", "Outro": "📌",
}

interface FinanceContextType {
  state: FinanceState
  incomeCategories: string[]
  expenseCategories: string[]
  categoryIcons: Record<string, string>
  addTransaction: (tx: Omit<Transaction, "id">) => void
  updateTransaction: (id: number, tx: Partial<Transaction>) => void
  deleteTransaction: (id: number) => void
  addGoal: (goal: Omit<Goal, "id">) => void
  updateGoal: (id: number, goal: Partial<Goal>) => void
  deleteGoal: (id: number) => void
  addFixedBill: (bill: Omit<FixedBill, "id" | "paid">) => void
  updateFixedBill: (id: number, bill: Partial<FixedBill>) => void
  deleteFixedBill: (id: number) => void
  toggleBillPaid: (id: number) => void
  savePlanning: (planning: Omit<MonthlyPlanning, never>) => void
  getCurrentPlanning: () => MonthlyPlanning | null
  setUser: (name: string) => void
  setMonthlyIncome: (income: number) => void
  setLimit: (limit: number) => void
  completeOnboarding: () => void
  getMonthTransactions: (date?: Date) => Transaction[]
  getMonthStats: (date?: Date) => { income: number; expense: number; balance: number }
  getDayTransactions: (date: Date) => Transaction[]
  getHealthScore: () => { score: number; saving: boolean; limitOk: boolean; hasGoal: boolean }
  getContextualMessage: () => string
  getEmergencyGoalSuggestion: () => number
}

const defaultState: FinanceState = {
  user: "",
  monthlyIncome: 0,
  limit: 0,
  transactions: [],
  goals: [],
  fixedBills: [],
  planning: [],
  onboarded: false,
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("fluxo_data")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState({ ...defaultState, ...parsed })
      } catch {
        setState(defaultState)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("fluxo_data", JSON.stringify(state))
    }
  }, [state, isLoaded])

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setState(prev => ({ ...prev, transactions: [...prev.transactions, { ...tx, id: Date.now() }] }))
  }, [])

  const updateTransaction = useCallback((id: number, tx: Partial<Transaction>) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === id ? { ...t, ...tx } : t) }))
  }, [])

  const deleteTransaction = useCallback((id: number) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }))
  }, [])

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    setState(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: Date.now() }] }))
  }, [])

  const updateGoal = useCallback((id: number, goal: Partial<Goal>) => {
    setState(prev => ({ ...prev, goals: prev.goals.map(g => g.id === id ? { ...g, ...goal } : g) }))
  }, [])

  const deleteGoal = useCallback((id: number) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))
  }, [])

  const addFixedBill = useCallback((bill: Omit<FixedBill, "id" | "paid">) => {
    setState(prev => ({ ...prev, fixedBills: [...prev.fixedBills, { ...bill, id: Date.now(), paid: false }] }))
  }, [])

  const updateFixedBill = useCallback((id: number, bill: Partial<FixedBill>) => {
    setState(prev => ({ ...prev, fixedBills: prev.fixedBills.map(b => b.id === id ? { ...b, ...bill } : b) }))
  }, [])

  const deleteFixedBill = useCallback((id: number) => {
    setState(prev => ({ ...prev, fixedBills: prev.fixedBills.filter(b => b.id !== id) }))
  }, [])

  const toggleBillPaid = useCallback((id: number) => {
    setState(prev => ({ ...prev, fixedBills: prev.fixedBills.map(b => b.id === id ? { ...b, paid: !b.paid } : b) }))
  }, [])

  const savePlanning = useCallback((planning: MonthlyPlanning) => {
    setState(prev => {
      const filtered = prev.planning.filter(p => p.month !== planning.month)
      return { ...prev, planning: [...filtered, planning] }
    })
  }, [])

  const getCurrentPlanning = useCallback(() => {
    const month = new Date().toISOString().slice(0, 7)
    return state.planning.find(p => p.month === month) || null
  }, [state.planning])

  const setUser = useCallback((name: string) => {
    setState(prev => ({ ...prev, user: name }))
  }, [])

  const setMonthlyIncome = useCallback((income: number) => {
    setState(prev => ({ ...prev, monthlyIncome: income }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setState(prev => ({ ...prev, limit }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, onboarded: true }))
  }, [])

  const getMonthTransactions = useCallback((date?: Date) => {
    const d = date || new Date()
    return state.transactions.filter(t => {
      const txDate = new Date(t.date + "T00:00:00")
      return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear()
    })
  }, [state.transactions])

  const getMonthStats = useCallback((date?: Date) => {
    const txs = getMonthTransactions(date)
    const income = txs.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
    const expense = txs.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [getMonthTransactions])

  const getDayTransactions = useCallback((date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return state.transactions.filter(t => t.date === dateStr)
  }, [state.transactions])

  const getHealthScore = useCallback(() => {
    const stats = getMonthStats()
    const saving = stats.income > 0 && stats.balance > 0
    const limitOk = state.limit > 0 ? stats.expense < state.limit * 0.8 : stats.expense < (state.monthlyIncome || 1) * 0.8
    const hasGoal = state.goals.length > 0
    const score = (saving ? 34 : 0) + (limitOk ? 33 : 0) + (hasGoal ? 33 : 0)
    return { score, saving, limitOk, hasGoal }
  }, [getMonthStats, state.limit, state.monthlyIncome, state.goals])

  const getContextualMessage = useCallback(() => {
    const stats = getMonthStats()
    const now = new Date()
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
    const limitRef = state.limit || state.monthlyIncome * 0.7 || 0
    const pct = limitRef > 0 ? stats.expense / limitRef : 0
    if (stats.expense === 0) return "Nenhum gasto registrado ainda. Que início promissor."
    if (pct >= 0.9) return `Atenção: você comprometeu ${Math.round(pct * 100)}% do seu limite.`
    if (pct >= 0.7 && daysLeft > 10) return `Mais da metade do limite usado. Ainda faltam ${daysLeft} dias.`
    if (pct < 0.5 && daysLeft < 10) return `Ótimo ritmo. Você está bem dentro do limite no final do mês.`
    if (stats.balance > 0) return `Você está guardando R$ ${(stats.balance).toLocaleString("pt-BR", { minimumFractionDigits: 0 })} este mês.`
    return `Faltam ${daysLeft} dias para o mês acabar.`
  }, [getMonthStats, state.limit, state.monthlyIncome])

  const getEmergencyGoalSuggestion = useCallback(() => {
    const last3Months = [0, 1, 2].map(i => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return getMonthStats(d).expense
    })
    const avg = last3Months.reduce((a, b) => a + b, 0) / 3
    return avg > 0 ? avg * 3 : (state.monthlyIncome || 3000) * 3
  }, [getMonthStats, state.monthlyIncome])

  if (!isLoaded) return null

  return (
    <FinanceContext.Provider value={{
      state, incomeCategories: INCOME_CATEGORIES, expenseCategories: EXPENSE_CATEGORIES,
      categoryIcons: CATEGORY_ICONS, addTransaction, updateTransaction, deleteTransaction,
      addGoal, updateGoal, deleteGoal, addFixedBill, updateFixedBill, deleteFixedBill,
      toggleBillPaid, savePlanning, getCurrentPlanning, setUser, setMonthlyIncome, setLimit,
      completeOnboarding, getMonthTransactions, getMonthStats, getDayTransactions,
      getHealthScore, getContextualMessage, getEmergencyGoalSuggestion,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider")
  return ctx
}
