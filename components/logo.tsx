interface LogoProps {
  size?: number
  inverted?: boolean
  showText?: boolean
}

export function Logo({ size = 40, inverted = false, showText = true }: LogoProps) {
  const color = inverted ? "#F2F3F4" : "#020035"
  const accent = "#ED4B00"

  return (
    <div className="flex items-center gap-2.5">
      {/* Símbolo: duas setas em ciclo */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Seta superior — entrada */}
        <path
          d="M8 14 C8 8 14 4 20 4 C26 4 32 8 32 14"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="32,10 36,15 28,16" fill={color} />

        {/* Seta inferior — saída */}
        <path
          d="M32 26 C32 32 26 36 20 36 C14 36 8 32 8 26"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="8,30 4,25 12,24" fill={accent} />
      </svg>

      {showText && (
        <span
          className="font-sans font-bold tracking-tight"
          style={{
            fontSize: size * 0.7,
            color,
            letterSpacing: "0.04em",
          }}
        >
          FLUXO
        </span>
      )}
    </div>
  )
}
