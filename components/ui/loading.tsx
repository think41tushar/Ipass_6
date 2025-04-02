"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="relative">
        {/* Outer ring (static) */}
        <div className="w-20 h-20 rounded-full border-4 border-black/20"></div>

        {/* Inner spinner (animated) */}
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[#4f1250] animate-spin"></div>
      </div>

      <div className="mt-6 text-[#f0f5f0] font-medium tracking-wide">
        <span className="inline-block min-w-[7rem] text-center">Loading{dots}</span>
      </div>

      {/* Optional Supabase-inspired pulsing glow effect */}
      <div className="absolute w-24 h-24 bg-[#3ECF8E]/20 rounded-full filter blur-xl animate-pulse"></div>
    </div>
  )
}
