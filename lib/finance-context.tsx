"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { supabase } from "./supabase"
import { useAuth } from "./auth-context"

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
  loading: boolean
  incomeCategories: string[]
  expenseCategories: string[]
  categoryIcons: Record<string, string>
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: number, tx: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>
  updateGoal: (id: number, goal: Partial<Goal>) => Promise<void>
  deleteGoal: (id: number) => Promise<void>
  addFixedBill: (bill: Omit<FixedBill, "id" | "paid">) => Promise<void>
  updateFixedBill: (id: number, bill: Partial<FixedBill>) => Promise<void>
  deleteFixedBill: (id: number) => Promise<void>
  toggleBillPaid: (id: number) => Promise<void>
  savePlanning: (planning: MonthlyPlanning) => Promise<void>
  getCurrentPlanning: () => MonthlyPlanning | null
  setUser: (name: string) => Promise<void>
  setMonthlyIncome: (income: number) => Promise<void>
  setLimit: (limit: number) => Promise<void>
  completeOnboarding: () => Promise<void>
  getMonthTransactions: (date?: Date) => Transaction[]
  getMonthStats: (date?: Date) => { income: number; expense: number; balance: number }
  getDayTransactions: (date: Date) => Transaction[]
  getHealthScore: () => { score: number; saving: boolean; limitOk: boolean; hasGoal: boolean }
  getContextualMessage: () => string
  getEmergencyGoalSuggestion: () => number
}

const defaultState: FinanceState = {
  user: "", monthlyIncome: 0, limit: 0,
  transactions: [], goals: [], fixedBills: [], planning: [], onboarded: false,
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth()
  const [state, setState] = useState<FinanceState>(defaultState)
  const [loading, setLoading] = useState(true)

  // Carregar dados do Supabase quando usuário logar
  useEffect(() => {
    if (!authUser) { setState(defaultState); setLoading(false); return }
    loadData()
  }, [authUser])

  const loadData = async () => {
    if (!authUser) return
    setLoading(true)
    try {
      const [profileRes, txRes, goalsRes, billsRes, planningRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUser.id).single(),
        supabase.from("transactions").select("*").eq("user_id", authUser.id).order("date", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", authUser.id),
        supabase.from("fixed_bills").select("*").eq("user_id", authUser.id),
        supabase.from("planning").select("*").eq("user_id", authUser.id),
      ])

      const profile = profileRes.data
      const transactions: Transaction[] = (txRes.data || []).map(t => ({
        id: t.id, type: t.type, amount: Number(t.amount),
        desc: t.desc, category: t.category, date: t.date,
      }))
      const goals: Goal[] = (goalsRes.data || []).map(g => ({
        id: g.id, name: g.name, total: Number(g.total),
        saved: Number(g.saved), isEmergency: g.is_emergency,
      }))
      const fixedBills: FixedBill[] = (billsRes.data || []).map(b => ({
        id: b.id, name: b.name, amount: Number(b.amount),
        dueDay: b.due_day, paid: b.paid,
      }))
      const planning: MonthlyPlanning[] = (planningRes.data || []).map(p => ({
        month: p.month, incomes: p.incomes, expenses: p.expenses,
      }))

      setState({
        user: profile?.name || "",
        monthlyIncome: Number(profile?.monthly_income || 0),
        limit: Number(profile?.spending_limit || 0),
        onboarded: profile?.onboarded || false,
        transactions, goals, fixedBills, planning,
      })
    } catch (e) {
      console.error("Erro ao carregar dados:", e)
    }
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<{ name: string; monthly_income: number; spending_limit: number; onboarded: boolean }>) => {
    if (!authUser) return
    await supabase.from("profiles").upsert({ id: authUser.id, ...updates })
  }

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id">) => {
    if (!authUser) return
    const { data } = await supabase.from("transactions").insert({
      user_id: authUser.id, type: tx.type, amount: tx.amount,
      desc: tx.desc, category: tx.category, date: tx.date,
    }).select().single()
    if (data) setState(prev => ({ ...prev, transactions: [{ ...tx, id: data.id }, ...prev.transactions] }))
  }, [authUser])

  const updateTransaction = useCallback(async (id: number, tx: Partial<Transaction>) => {
    if (!authUser) return
    await supabase.from("transactions").update({
      type: tx.type, amount: tx.amount, desc: tx.desc,
      category: tx.category, date: tx.date,
    }).eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === id ? { ...t, ...tx } : t) }))
  }, [authUser])

  const deleteTransaction = useCallback(async (id: number) => {
    if (!authUser) return
    await supabase.from("transactions").delete().eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }))
  }, [authUser])

  const addGoal = useCallback(async (goal: Omit<Goal, "id">) => {
    if (!authUser) return
    const { data } = await supabase.from("goals").insert({
      user_id: authUser.id, name: goal.name, total: goal.total,
      saved: goal.saved, is_emergency: goal.isEmergency || false,
    }).select().single()
    if (data) setState(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: data.id }] }))
  }, [authUser])

  const updateGoal = useCallback(async (id: number, goal: Partial<Goal>) => {
    if (!authUser) return
    await supabase.from("goals").update({
      name: goal.name, total: goal.total, saved: goal.saved,
      is_emergency: goal.isEmergency,
    }).eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, goals: prev.goals.map(g => g.id === id ? { ...g, ...goal } : g) }))
  }, [authUser])

  const deleteGoal = useCallback(async (id: number) => {
    if (!authUser) return
    await supabase.from("goals").delete().eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))
  }, [authUser])

  const addFixedBill = useCallback(async (bill: Omit<FixedBill, "id" | "paid">) => {
    if (!authUser) return
    const { data } = await supabase.from("fixed_bills").insert({
      user_id: authUser.id, name: bill.name, amount: bill.amount,
      due_day: bill.dueDay, paid: false,
    }).select().single()
    if (data) setState(prev => ({ ...prev, fixedBills: [...prev.fixedBills, { ...bill, id: data.id, paid: false }] }))
  }, [authUser])

  const updateFixedBill = useCallback(async (id: number, bill: Partial<FixedBill>) => {
    if (!authUser) return
    await supabase.from("fixed_bills").update({
      name: bill.name, amount: bill.amount, due_day: bill.dueDay, paid: bill.paid,
    }).eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, fixedBills: prev.fixedBills.map(b => b.id === id ? { ...b, ...bill } : b) }))
  }, [authUser])

  const deleteFixedBill = useCallback(async (id: number) => {
    if (!authUser) return
    await supabase.from("fixed_bills").delete().eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, fixedBills: prev.fixedBills.filter(b => b.id !== id) }))
  }, [authUser])

  const toggleBillPaid = useCallback(async (id: number) => {
    if (!authUser) return
    const bill = state.fixedBills.find(b => b.id === id)
    if (!bill) return
    await supabase.from("fixed_bills").update({ paid: !bill.paid }).eq("id", id).eq("user_id", authUser.id)
    setState(prev => ({ ...prev, fixedBills: prev.fixedBills.map(b => b.id === id ? { ...b, paid: !b.paid } : b) }))
  }, [authUser, state.fixedBills])

  const savePlanning = useCallback(async (planning: MonthlyPlanning) => {
    if (!authUser) return
    await supabase.from("planning").upsert({
      user_id: authUser.id, month: planning.month,
      incomes: planning.incomes, expenses: planning.expenses,
    }, { onConflict: "user_id,month" })
    setState(prev => ({
      ...prev,
      planning: [...prev.planning.filter(p => p.month !== planning.month), planning],
    }))
  }, [authUser])

  const getCurrentPlanning = useCallback(() => {
    const month = new Date().toISOString().slice(0, 7)
    return state.planning.find(p => p.month === month) || null
  }, [state.planning])

  const setUser = useCallback(async (name: string) => {
    await updateProfile({ name })
    setState(prev => ({ ...prev, user: name }))
  }, [authUser])

  const setMonthlyIncome = useCallback(async (income: number) => {
    await updateProfile({ monthly_income: income })
    setState(prev => ({ ...prev, monthlyIncome: income }))
  }, [authUser])

  const setLimit = useCallback(async (limit: number) => {
    await updateProfile({ spending_limit: limit })
    setState(prev => ({ ...prev, limit }))
  }, [authUser])

  const completeOnboarding = useCallback(async () => {
    await updateProfile({ onboarded: true })
    setState(prev => ({ ...prev, onboarded: true }))
  }, [authUser])

  const getMonthTransactions = useCallback((date?: Date) => {
    const d = date || new Date()
    return state.transactions.filter(t => {
      const txDate = new Date(t.date + "T00:00:00")
      return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear()
    })
  }, [state.transactions])

  const getMonthStats = useCallback((date?: Date) => {
    const txs = getMonthTransactions(date)
    const income = txs.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0)
    const expense = txs.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0)
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
    return { score: (saving ? 34 : 0) + (limitOk ? 33 : 0) + (hasGoal ? 33 : 0), saving, limitOk, hasGoal }
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
    if (stats.balance > 0) return `Você está guardando R$ ${stats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} este mês.`
    return `Faltam ${daysLeft} dias para o mês acabar.`
  }, [getMonthStats, state.limit, state.monthlyIncome])

  const getEmergencyGoalSuggestion = useCallback(() => {
    const last3 = [0, 1, 2].map(i => { const d = new Date(); d.setMonth(d.getMonth() - i); return getMonthStats(d).expense })
    const avg = last3.reduce((a, b) => a + b, 0) / 3
    return avg > 0 ? avg * 3 : (state.monthlyIncome || 3000) * 3
  }, [getMonthStats, state.monthlyIncome])

  return (
    <FinanceContext.Provider value={{
      state, loading, incomeCategories: INCOME_CATEGORIES, expenseCategories: EXPENSE_CATEGORIES,
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
