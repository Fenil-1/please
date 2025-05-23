"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import type { UserData } from "../lib/sheets"

function getInitials(name: string) {
  if (!name) return "?"
  const parts = name.split(/[^a-zA-Z0-9]/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase()
}

const googleColors = [
  "#4285F4", // blue
  "#EA4335", // red
  "#FBBC05", // yellow
  "#34A853", // green
  "#A142F4", // purple
]

function getColorForIndex(index: number) {
  return googleColors[index % googleColors.length]
}

export default function LiveSignups({ lastSignups }: { lastSignups: UserData[] }) {
  // Animation: show one card at a time, then next, then next, looping
  const [visibleIndex, setVisibleIndex] = useState(0)
  useEffect(() => {
    if (!lastSignups || lastSignups.length === 0) return
    const timer = setTimeout(() => {
      setVisibleIndex((prev) => (prev + 1) % lastSignups.length)
    }, 3000) // Slower animation: 3 seconds per card
    return () => clearTimeout(timer)
  }, [visibleIndex, lastSignups])

  if (!lastSignups || lastSignups.length === 0) {
    return <div className="text-gray-400">No recent signups yet.</div>
  }
  return (
    <div className="relative flex flex-col items-center w-full min-h-[160px]" style={{perspective:1200}}>
      {lastSignups.map((user, i) => (
        <AnimatedSignupCard
          key={user.username}
          user={user}
          index={i}
          isVisible={i === visibleIndex}
        />
      ))}
    </div>
  )
}

function AnimatedSignupCard({ user, index, isVisible }: { user: UserData, index: number, isVisible: boolean }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    if (isVisible && cardRef.current) {
      cardRef.current.animate([
        { opacity: 0, transform: "translateY(40px) scale(0.95)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ], {
        duration: 600,
        easing: "cubic-bezier(.4,2,.6,1)",
        fill: "forwards"
      })
    }
  }, [isVisible])

  const initials = getInitials(user.username)
  const bgColor = getColorForIndex(index)

  return (
    <Link
      ref={cardRef}
      href={`/${user.username}`}
      target="_blank"
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-700 cursor-pointer group absolute left-0 right-0 mx-auto ${isVisible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
      style={{
        width: "min(340px,90%)",
        transition: "opacity 0.7s cubic-bezier(.4,2,.6,1), transform 0.7s cubic-bezier(.4,2,.6,1)",
      }}
      tabIndex={isVisible ? 0 : -1}
    >
      <span
        className="flex items-center justify-center rounded-full text-white font-bold text-lg shadow"
        style={{
          width: 44,
          height: 44,
          background: bgColor,
          border: "2.5px solid #fff",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
          fontFamily: "inherit"
        }}
      >
        {initials}
      </span>
      <span className="font-semibold text-gray-700 text-lg group-hover:text-blue-700 transition-colors duration-200">{user.username} made a Sheetzu</span>
    </Link>
  )
}
