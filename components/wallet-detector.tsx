"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, X, Plus } from "lucide-react"

interface WalletDetectorProps {
  onOpenTransaction: () => void
}

export function WalletDetector({ onOpenTransaction }: WalletDetectorProps) {
  const [show, setShow] = useState(false)
  const hiddenAt = useRef<number | null>(null)
  const dismissed = useRef(false)

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now()
        dismissed.current = false
      } else {
        if (hiddenAt.current === null) return
        const elapsed = Date.now() - hiddenAt.current
        // Janela típica de uma transação Apple Pay/Pix: entre 2s e 45s
        if (elapsed >= 2000 && elapsed <= 45000 && !dismissed.current) {
          setShow(true)
        }
        hiddenAt.current = null
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  const handleConfirm = () => {
    dismissed.current = true
    setShow(false)
    onOpenTransaction()
  }

  const handleDismiss = () => {
    dismissed.current = true
    setShow(false)
  }

  // Auto-dismiss após 8 segundos
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => { dismissed.current = true; setShow(false) }, 8000)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed bottom-28 left-4 right-4 z-[500] rounded-2xl overflow-hidden"
          style={{
            background: "rgba(2,0,53,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(2,0,53,0.3)",
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Ícone */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(237,75,0,0.2)" }}
              >
                <CreditCard className="w-5 h-5" style={{ color: "#ED4B00" }} />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Acabou de pagar algo?</p>
                <p className="text-white/50 text-xs mt-0.5">
                  Registre agora enquanto está fresco.
                </p>
              </div>

              {/* Fechar */}
              <button onClick={handleDismiss} className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Botões */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
              >
                Não, obrigado
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                style={{ background: "#ED4B00", color: "white" }}
              >
                <Plus className="w-4 h-4" />
                Registrar gasto
              </button>
            </div>
          </div>

          {/* Barra de progresso auto-dismiss */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 8, ease: "linear" }}
            style={{
              height: 2,
              background: "#ED4B00",
              transformOrigin: "left",
              opacity: 0.5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
