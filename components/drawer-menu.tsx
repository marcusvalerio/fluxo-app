"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Receipt, BarChart2, ClipboardList, X, Trophy } from "lucide-react"
import { Logo } from "./logo"

import type { Screen } from "./bottom-nav"

interface DrawerMenuProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (screen: Screen) => void
  current: Screen
}

const DRAWER_ITEMS = [
  { key: "planning", label: "Planejamento", desc: "Organize o mês antes de gastar", icon: ClipboardList },
  { key: "analytics", label: "Análise", desc: "Visão detalhada dos seus gastos", icon: BarChart2 },
  { key: "calendar", label: "Reflexão", desc: "Gastos por dia do mês", icon: Calendar },
  { key: "bills", label: "Contas Fixas", desc: "Recorrências mensais", icon: Receipt },
  { key: "achievements", label: "Medalhas", desc: "Suas conquistas financeiras", icon: Trophy },
]

export function DrawerMenu({ isOpen, onClose, onNavigate, current }: DrawerMenuProps) {
  const handleNav = (screen: Screen) => {
    onNavigate(screen)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(2,0,53,0.4)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl safe-bottom"
            style={{ background: "white", boxShadow: "0 -4px 40px rgba(2,0,53,0.15)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#020035]/15" />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <Logo size={28} showText />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(2,0,53,0.06)" }}
              >
                <X className="w-4 h-4 text-[#020035]" />
              </button>
            </div>
            <div className="px-4 pb-8 space-y-2">
              {DRAWER_ITEMS.map(({ key, label, desc, icon: Icon }) => {
                const active = current === key
                return (
                  <button
                    key={key}
                    onClick={() => handleNav(key as Screen)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all"
                    style={{ background: active ? "rgba(237,75,0,0.08)" : "rgba(2,0,53,0.03)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: active ? "#ED4B00" : "#020035" }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[#020035] font-semibold text-sm">{label}</p>
                      <p className="text-[#020035]/40 text-xs">{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
