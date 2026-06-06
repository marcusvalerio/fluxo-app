"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "../logo"
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"

type AuthView = "login" | "signup" | "forgot" | "check-email"

export function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [view, setView] = useState<AuthView>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordStrength = (p: string) => {
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength = passwordStrength(password)
  const strengthLabel = ["Muito fraca", "Fraca", "Média", "Boa", "Forte"][strength]
  const strengthColor = ["#EF4444", "#ED4B00", "#d97706", "#16a34a", "#15803d"][strength]

  const handleSubmit = async () => {
    setError(null)
    if (!email || !password) { setError("Preencha todos os campos."); return }

    if (view === "signup") {
      if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return }
      if (password !== confirmPassword) { setError("As senhas não coincidem."); return }
      if (strength < 2) { setError("Escolha uma senha mais forte."); return }
    }

    setLoading(true)
    const { error } = view === "login"
      ? await signIn(email, password)
      : await signUp(email, password)
    setLoading(false)

    if (error) {
      const msgs: Record<string, string> = {
        "Invalid login credentials": "Email ou senha incorretos.",
        "Email not confirmed": "Confirme seu email antes de entrar.",
        "User already registered": "Este email já está cadastrado.",
      }
      setError(msgs[error] || error)
    } else if (view === "signup") {
      setView("check-email")
    }
  }

  const handleForgot = async () => {
    if (!email) { setError("Informe seu email."); return }
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) { setError(error) } else { setView("check-email") }
  }

  const inputClass = "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { background: "rgba(2,0,53,0.05)", color: "#020035", border: "1.5px solid rgba(2,0,53,0.1)" }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F2F3F4" }}>
      {/* Header */}
      <div className="flex justify-center pt-16 pb-8">
        <Logo size={44} showText />
      </div>

      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">

          {/* CHECK EMAIL */}
          {view === "check-email" && (
            <motion.div key="check" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center pt-8"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(22,163,74,0.1)" }}>
                <CheckCircle className="w-8 h-8" style={{ color: "#16a34a" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#020035" }}>Verifique seu email</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(2,0,53,0.5)" }}>
                Enviamos um link para <span className="font-semibold" style={{ color: "#020035" }}>{email}</span>.
                {" "}Clique nele para {view === "check-email" && password ? "ativar sua conta" : "redefinir sua senha"}.
              </p>
              <button onClick={() => setView("login")} className="text-sm font-semibold" style={{ color: "#ED4B00" }}>
                Voltar para o login
              </button>
            </motion.div>
          )}

          {/* ESQUECI A SENHA */}
          {view === "forgot" && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setView("login")} className="flex items-center gap-1.5 mb-6 text-sm font-medium" style={{ color: "rgba(2,0,53,0.5)" }}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#020035" }}>Recuperar senha</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(2,0,53,0.5)" }}>Informe seu email e enviaremos um link de redefinição.</p>

              <div className="mb-4">
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.4)" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" className={inputClass} style={inputStyle} />
              </div>

              {error && <p className="text-xs mb-3 font-medium" style={{ color: "#ED4B00" }}>{error}</p>}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleForgot} disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50"
                style={{ background: "#ED4B00" }}>
                {loading ? "Enviando..." : "Enviar link"}
              </motion.button>
            </motion.div>
          )}

          {/* LOGIN / CADASTRO */}
          {(view === "login" || view === "signup") && (
            <motion.div key={view} initial={{ opacity: 0, x: view === "signup" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#020035" }}>
                {view === "login" ? "Bem-vindo de volta." : "Criar conta"}
              </h2>
              <p className="text-sm mb-6" style={{ color: "rgba(2,0,53,0.5)" }}>
                {view === "login" ? "Entre para acessar seus dados." : "Seus dados ficam seguros e sincronizados."}
              </p>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.4)" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" className={inputClass} style={inputStyle} />
              </div>

              {/* Senha */}
              <div className="mb-2">
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.4)" }}>Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && view === "login" && handleSubmit()}
                    placeholder={view === "signup" ? "Mínimo 8 caracteres" : "Sua senha"}
                    className={inputClass} style={{ ...inputStyle, paddingRight: 48 }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "rgba(2,0,53,0.3)" }} /> : <Eye className="w-4 h-4" style={{ color: "rgba(2,0,53,0.3)" }} />}
                  </button>
                </div>
              </div>

              {/* Força da senha */}
              {view === "signup" && password.length > 0 && (
                <div className="mb-3">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i < strength ? strengthColor : "rgba(2,0,53,0.1)" }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}

              {/* Confirmar senha */}
              {view === "signup" && (
                <div className="mb-4">
                  <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(2,0,53,0.4)" }}>Confirmar senha</label>
                  <input type={showPassword ? "text" : "password"} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="Repita a senha"
                    className={inputClass}
                    style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== password ? "#ED4B00" : "rgba(2,0,53,0.1)" }}
                  />
                </div>
              )}

              {/* Esqueci a senha */}
              {view === "login" && (
                <button onClick={() => { setView("forgot"); setError(null) }}
                  className="text-xs font-medium mb-4 block" style={{ color: "rgba(2,0,53,0.4)" }}>
                  Esqueceu a senha?
                </button>
              )}

              {error && <p className="text-xs mb-3 font-medium" style={{ color: "#ED4B00" }}>{error}</p>}

              {/* Botão principal */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white mb-4 disabled:opacity-50"
                style={{ background: "#ED4B00" }}>
                {loading ? "Aguarde..." : view === "login" ? "Entrar" : "Criar conta"}
              </motion.button>

              {/* Alternar entre login e cadastro */}
              <p className="text-center text-sm" style={{ color: "rgba(2,0,53,0.5)" }}>
                {view === "login" ? "Não tem conta? " : "Já tem conta? "}
                <button onClick={() => { setView(view === "login" ? "signup" : "login"); setError(null) }}
                  className="font-bold" style={{ color: "#020035" }}>
                  {view === "login" ? "Criar agora" : "Entrar"}
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs pb-8 px-6" style={{ color: "rgba(2,0,53,0.25)" }}>
        Seus dados são criptografados e protegidos.
      </p>
    </div>
  )
}
