"use client"

import { Home, List, Target, MoreHorizontal } from "lucide-react"

type Screen = "home" | "transactions" | "goals" | "calendar" | "bills" | "analytics" | "planning"

interface BottomNavProps {
  current: Screen
  onNavigate: (screen: Screen) => void
  onOpenDrawer: () => void
}

const NAV_ITEMS = [
  { key: "home", label: "Início", icon: Home },
  { key: "transactions", label: "Histórico", icon: List },
  { key: "goals", label: "Metas", icon: Target },
]

export function BottomNav({ current, onNavigate, onOpenDrawer }: BottomNavProps) {
  const isDrawerScreen = ["calendar", "bills", "analytics", "planning"].includes(current)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 safe-bottom z-40"
      style={{ background: "white", boxShadow: "0 -1px 0 rgba(2,0,53,0.06), 0 -8px 24px rgba(2,0,53,0.06)" }}
    >
      <div className="flex items-center px-2 pt-2 pb-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key as Screen)}
              className="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all"
              style={{ background: active ? "rgba(237,75,0,0.08)" : "transparent" }}
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: active ? "#ED4B00" : "rgba(2,0,53,0.35)" }}
              />
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: active ? "#ED4B00" : "rgba(2,0,53,0.35)" }}
              >
                {label}
              </span>
            </button>
          )
        })}

        {/* Botão Mais */}
        <button
          onClick={onOpenDrawer}
          className="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all"
          style={{ background: isDrawerScreen ? "rgba(237,75,0,0.08)" : "transparent" }}
        >
          <MoreHorizontal
            className="w-5 h-5"
            style={{ color: isDrawerScreen ? "#ED4B00" : "rgba(2,0,53,0.35)" }}
          />
          <span
            className="text-[10px] font-semibold"
            style={{ color: isDrawerScreen ? "#ED4B00" : "rgba(2,0,53,0.35)" }}
          >
            Mais
          </span>
        </button>
      </div>
    </div>
  )
}
