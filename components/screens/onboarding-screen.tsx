"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/lib/finance-context"
import { Logo } from "../logo"
import { ChevronRight } from "lucide-react"

export function OnboardingScreen() {
  const { setUser, setMonthlyIncome, setLimit, completeOnboarding } = useFinance()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [income, setIncome] = useState("")
  const [limit, setLimitVal] = useState("")

  const incomeNum = parseFloat(income.replace(/\D/g, "")) / 100 || 0
  const suggestedLimit = Math.round(incomeNum * 0.7)

  const handleIncome = (val: string) => {
    const digits = val.replace(/\D/g, "")
    const num = parseInt(digits || "0", 10)
    const formatted = (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    setIncome(formatted)
  }

  const handleLimit = (val: string) => {
    const digits = val.replace(/\D/g, "")
    const num = parseInt(digits || "0", 10)
    const formatted = (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    setLimitVal(formatted)
  }

  const handleNext = () => {
    if (step === 0 && name.trim()) setStep(1)
    else if (step === 1 && incomeNum > 0) {
      setLimitVal((suggestedLimit).toLocaleString("pt-BR", { minimumFractionDigits: 2 }))
      setStep(2)
    } else if (step === 2) {
      const limitNum = parseFloat(limit.replace(/\D/g, "")) / 100 || suggestedLimit
      setUser(name.trim())
      setMonthlyIncome(incomeNum)
      setLimit(limitNum)
      completeOnboarding()
    }
  }

  const steps = [
    { label: "Como você se chama?", hint: "Vamos personalizar tudo pra você" },
    { label: "Qual é a sua renda mensal?", hint: "Informe o valor que você costuma receber" },
    { label: "Defina seu limite de gastos", hint: "Sugestão: 70% da sua renda — boa prática financeira" },
  ]

  return (
    <div className="min-h-screen bg-[#020035] flex flex-col">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center pt-16 pb-8"
      >
        <Logo size={48} inverted showText />
      </motion.div>

      {/* Indicador de passos */}
      <div className="flex justify-center gap-2 mb-12">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 28 : 8,
              background: i === step ? "#ED4B00" : "rgba(242,243,244,0.2)",
            }}
          />
        ))}
      </div>

      {/* Conteúdo do passo */}
      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-[#F2F3F4]/60 text-sm mb-2">{steps[step].hint}</p>
            <h2 className="text-[#F2F3F4] font-sans text-2xl font-bold mb-8 leading-tight">
              {steps[step].label}
            </h2>

            {step === 0 && (
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNext()}
                placeholder="Seu nome"
                className="w-full px-0 py-3 bg-transparent border-b-2 border-[#F2F3F4]/20 focus:border-[#ED4B00] text-[#F2F3F4] text-xl placeholder:text-[#F2F3F4]/30 outline-none transition-colors"
              />
            )}

            {step === 1 && (
              <div className="relative">
                <span className="absolute left-0 top-3 text-[#F2F3F4]/50 text-lg">R$</span>
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={income}
                  onChange={e => handleIncome(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleNext()}
                  placeholder="0,00"
                  className="w-full pl-10 pr-0 py-3 bg-transparent border-b-2 border-[#F2F3F4]/20 focus:border-[#ED4B00] text-[#F2F3F4] text-2xl font-sans placeholder:text-[#F2F3F4]/30 outline-none transition-colors"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-0 top-3 text-[#F2F3F4]/50 text-lg">R$</span>
                  <input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    value={limit}
                    onChange={e => handleLimit(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleNext()}
                    placeholder={suggestedLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    className="w-full pl-10 pr-0 py-3 bg-transparent border-b-2 border-[#F2F3F4]/20 focus:border-[#ED4B00] text-[#F2F3F4] text-2xl font-sans placeholder:text-[#F2F3F4]/30 outline-none transition-colors"
                  />
                </div>
                {suggestedLimit > 0 && (
                  <button
                    onClick={() => setLimitVal(suggestedLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 }))}
                    className="text-[#ED4B00] text-sm font-medium"
                  >
                    Usar sugestão: R$ {suggestedLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botão */}
      <div className="px-6 pb-12">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={step === 0 ? !name.trim() : step === 1 ? incomeNum <= 0 : false}
          className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          style={{ background: "#ED4B00" }}
        >
          {step === 2 ? "Começar" : "Continuar"}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
