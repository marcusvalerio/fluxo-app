"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { FinanceProvider, useFinance, type Transaction, type Goal } from "@/lib/finance-context"
import { AuthScreen } from "@/components/screens/auth-screen"
import { OnboardingScreen } from "@/components/screens/onboarding-screen"
import { HomeScreen } from "@/components/screens/home-screen"
import { TransactionsScreen } from "@/components/screens/transactions-screen"
import { GoalsScreen } from "@/components/screens/goals-screen"
import { CalendarScreen } from "@/components/screens/calendar-screen"
import { BillsScreen } from "@/components/screens/bills-screen"
import { AnalyticsScreen } from "@/components/screens/analytics-screen"
import { PlanningScreen } from "@/components/screens/planning-screen"
import { BottomNav } from "@/components/bottom-nav"
import { DrawerMenu } from "@/components/drawer-menu"
import { FloatingActionButton } from "@/components/floating-action-button"
import { TransactionModal } from "@/components/modals/transaction-modal"
import { LimitModal } from "@/components/modals/limit-modal"
import { GoalModal } from "@/components/modals/goal-modal"
import { BillModal } from "@/components/modals/bill-modal"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { WalletDetector } from "@/components/wallet-detector"

type Screen = "home" | "transactions" | "goals" | "calendar" | "bills" | "analytics" | "planning"

function AppContent() {
  const { state, loading, deleteTransaction } = useFinance()
  const { signOut } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null)
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [billModalOpen, setBillModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F2F3F4" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#ED4B00] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm" style={{ color: "rgba(2,0,53,0.4)" }}>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!state.onboarded) return <OnboardingScreen />

  const handleOpenNewTransaction = (date?: string) => {
    setEditingTx(null); setPrefilledDate(date || null); setTxModalOpen(true)
  }

  const handleDeleteTransaction = (id: number) => {
    setPendingDeleteId(id); setConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (pendingDeleteId !== null) { deleteTransaction(pendingDeleteId); setPendingDeleteId(null) }
    setConfirmOpen(false)
  }

  const handleOpenGoalModal = (goal?: Goal) => {
    setEditingGoal(goal || null); setGoalModalOpen(true)
  }

  const hideFab = currentScreen === "analytics" || currentScreen === "planning"

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#F2F3F4" }}>
      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {currentScreen === "home" && <HomeScreen onOpenNewTransaction={handleOpenNewTransaction} onOpenLimitModal={() => setLimitModalOpen(true)} onNavigate={setCurrentScreen} onSignOut={signOut} />}
          {currentScreen === "transactions" && <TransactionsScreen onOpenNewTransaction={handleOpenNewTransaction} onDeleteTransaction={handleDeleteTransaction} />}
          {currentScreen === "goals" && <GoalsScreen onOpenNewGoal={() => handleOpenGoalModal()} onUpdateGoal={handleOpenGoalModal} />}
          {currentScreen === "calendar" && <CalendarScreen onOpenNewTransaction={handleOpenNewTransaction} />}
          {currentScreen === "bills" && <BillsScreen onOpenNewBill={() => setBillModalOpen(true)} />}
          {currentScreen === "analytics" && <AnalyticsScreen />}
          {currentScreen === "planning" && <PlanningScreen />}
        </motion.div>
      </AnimatePresence>

      <BottomNav current={currentScreen} onNavigate={setCurrentScreen} onOpenDrawer={() => setDrawerOpen(true)} />
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onNavigate={setCurrentScreen} current={currentScreen} />
      {!hideFab && <FloatingActionButton onClick={() => handleOpenNewTransaction()} visible />}
      <WalletDetector onOpenTransaction={() => handleOpenNewTransaction()} />

      <TransactionModal isOpen={txModalOpen} onClose={() => { setTxModalOpen(false); setEditingTx(null); setPrefilledDate(null) }} editingTransaction={editingTx} prefilledDate={prefilledDate} />
      <LimitModal isOpen={limitModalOpen} onClose={() => setLimitModalOpen(false)} />
      <GoalModal isOpen={goalModalOpen} onClose={() => { setGoalModalOpen(false); setEditingGoal(null) }} editingGoal={editingGoal} />
      <BillModal isOpen={billModalOpen} onClose={() => setBillModalOpen(false)} />
      <ConfirmDialog isOpen={confirmOpen} title="Excluir lançamento?" message="Essa ação não pode ser desfeita." confirmLabel="Excluir" cancelLabel="Cancelar" variant="danger" onConfirm={confirmDelete} onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null) }} />
    </div>
  )
}

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F2F3F4" }}>
        <div className="w-10 h-10 rounded-full border-2 border-[#ED4B00] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthScreen />

  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

export default function FluxoApp() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
