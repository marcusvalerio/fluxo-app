export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  color: string
  bgColor: string
  check: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  totalTransactions: number
  totalGoals: number
  completedGoals: number
  hasEmergencyGoal: boolean
  monthsPositive: number
  monthsUnderLimit: number
  consecutiveDaysRecording: number
  totalPlanning: number
  firstTransaction: boolean
}

export interface EarnedAchievement {
  id: string
  earnedAt: string
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    title: "Primeiro Passo",
    desc: "Registrou seu primeiro lançamento.",
    icon: "🚀",
    color: "#ED4B00",
    bgColor: "rgba(237,75,0,0.12)",
    check: (s) => s.firstTransaction,
  },
  {
    id: "planner",
    title: "Planejador",
    desc: "Criou seu primeiro planejamento mensal.",
    icon: "📋",
    color: "#02066F",
    bgColor: "rgba(2,6,111,0.1)",
    check: (s) => s.totalPlanning >= 1,
  },
  {
    id: "goal_setter",
    title: "Sonhador",
    desc: "Criou sua primeira meta financeira.",
    icon: "🎯",
    color: "#7C3AED",
    bgColor: "rgba(124,58,237,0.1)",
    check: (s) => s.totalGoals >= 1,
  },
  {
    id: "emergency_started",
    title: "Guardião",
    desc: "Iniciou sua reserva de emergência.",
    icon: "🛡️",
    color: "#059669",
    bgColor: "rgba(5,150,105,0.1)",
    check: (s) => s.hasEmergencyGoal,
  },
  {
    id: "goal_completed",
    title: "Realizador",
    desc: "Completou uma meta financeira.",
    icon: "⭐",
    color: "#D97706",
    bgColor: "rgba(217,119,6,0.1)",
    check: (s) => s.completedGoals >= 1,
  },
  {
    id: "positive_month",
    title: "No Azul",
    desc: "Fechou um mês com saldo positivo.",
    icon: "📈",
    color: "#16a34a",
    bgColor: "rgba(22,163,74,0.1)",
    check: (s) => s.monthsPositive >= 1,
  },
  {
    id: "limit_respected",
    title: "Disciplinado",
    desc: "Respeitou o limite de gastos por um mês inteiro.",
    icon: "💪",
    color: "#0284C7",
    bgColor: "rgba(2,132,199,0.1)",
    check: (s) => s.monthsUnderLimit >= 1,
  },
  {
    id: "streak_7",
    title: "Sequência de 7",
    desc: "Registrou lançamentos por 7 dias seguidos.",
    icon: "🔥",
    color: "#EA580C",
    bgColor: "rgba(234,88,12,0.1)",
    check: (s) => s.consecutiveDaysRecording >= 7,
  },
  {
    id: "consistent_planner",
    title: "Consistente",
    desc: "Planejou 3 meses seguidos.",
    icon: "🏆",
    color: "#B45309",
    bgColor: "rgba(180,83,9,0.1)",
    check: (s) => s.totalPlanning >= 3,
  },
  {
    id: "three_goals",
    title: "Ambicioso",
    desc: "Tem 3 metas ativas ao mesmo tempo.",
    icon: "💎",
    color: "#6D28D9",
    bgColor: "rgba(109,40,217,0.1)",
    check: (s) => s.totalGoals >= 3,
  },
]

export function checkNewAchievements(
  stats: AchievementStats,
  earned: EarnedAchievement[]
): Achievement[] {
  const earnedIds = new Set(earned.map(e => e.id))
  return ACHIEVEMENTS.filter(a => !earnedIds.has(a.id) && a.check(stats))
}

export function buildStats(
  transactions: { date: string; type: string; amount: number }[],
  goals: { total: number; saved: number; isEmergency?: boolean }[],
  planning: { month: string }[],
  monthlyIncome: number,
  limit: number
): AchievementStats {
  const now = new Date()

  // Meses positivos
  let monthsPositive = 0
  let monthsUnderLimit = 0
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthTxs = transactions.filter(t => {
      const td = new Date(t.date + "T00:00:00")
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    })
    const inc = monthTxs.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0)
    const exp = monthTxs.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0)
    if (inc > exp && inc > 0) monthsPositive++
    const lim = limit || monthlyIncome * 0.7
    if (lim > 0 && exp < lim && exp > 0) monthsUnderLimit++
  }

  // Dias consecutivos
  let consecutiveDaysRecording = 0
  const today = new Date().toISOString().split("T")[0]
  const txDates = new Set(transactions.map(t => t.date))
  let checkDate = new Date()
  while (txDates.has(checkDate.toISOString().split("T")[0])) {
    consecutiveDaysRecording++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return {
    totalTransactions: transactions.length,
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.saved >= g.total && g.total > 0).length,
    hasEmergencyGoal: goals.some(g => g.isEmergency),
    monthsPositive,
    monthsUnderLimit,
    consecutiveDaysRecording,
    totalPlanning: planning.length,
    firstTransaction: transactions.length >= 1,
  }
}
