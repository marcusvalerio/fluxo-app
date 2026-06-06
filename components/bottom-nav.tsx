"use client"

import { Home, List, Target, MoreHorizontal } from "lucide-react"

export type Screen = "home" | "transactions" | "goals" | "calendar" | "bills" | "analytics" | "planning" | "achievements"

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
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-5 px-4">
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-full"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: "0 0 0 0.5px rgba(2,0,53,0.08), 0 8px 32px rgba(2,0,53,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key as Screen)}
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all"
              style={{
                background: active ? "rgba(237,75,0,0.1)" : "transparent",
                minWidth: 64,
              }}
            >
              <Icon
                className="w-5 h-5 transition-all"
                style={{
                  color: active ? "#ED4B00" : "rgba(2,0,53,0.4)",
                  strokeWidth: active ? 2.2 : 1.8,
                }}
              />
              <span
                className="text-[10px] font-semibold transition-all"
                style={{ color: active ? "#ED4B00" : "rgba(2,0,53,0.4)" }}
              >
                {label}
              </span>
            </button>
          )
        })}

        {/* Separador */}
        <div className="w-px h-6 mx-1 rounded-full" style={{ background: "rgba(2,0,53,0.08)" }} />

        {/* Botão Mais */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all"
          style={{
            background: isDrawerScreen ? "rgba(237,75,0,0.1)" : "transparent",
            minWidth: 64,
          }}
        >
          <MoreHorizontal
            className="w-5 h-5"
            style={{
              color: isDrawerScreen ? "#ED4B00" : "rgba(2,0,53,0.4)",
              strokeWidth: isDrawerScreen ? 2.2 : 1.8,
            }}
          />
          <span
            className="text-[10px] font-semibold"
            style={{ color: isDrawerScreen ? "#ED4B00" : "rgba(2,0,53,0.4)" }}
          >
            Mais
          </span>
        </button>
      </div>
    </div>
  )
}
