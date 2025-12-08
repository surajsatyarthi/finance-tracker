'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

type PrivacyContextType = {
  locked: boolean
  lock: () => void
  unlock: (password?: string) => boolean
  setPassword: (password: string) => Promise<boolean>
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState<boolean>(false)
  const timer = useRef<number | null>(null)

  const hashHex = async (text: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const bytes = Array.from(new Uint8Array(digest))
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const salted = (pwd: string) => {
    const email = localStorage.getItem('finance-tracker-user-email') || ''
    return `${email}|${pwd}|ft_v1_salt`
  }

  const setPassword = async (password: string) => {
    if (!password || password.length < 6) return false
    const newHash = await hashHex(salted(password))
    localStorage.setItem('finance-tracker-pass-hash', newHash)
    return true
  }

  const lock = () => {
    setLocked(true)
  }

  const unlock = (password?: string) => {
    const stored = localStorage.getItem('finance-tracker-pass-hash') || ''
    if (!stored) {
      setLocked(false)
      return true
    }
    if (!password) return false
    return hashHex(salted(password)).then(h => {
      const ok = h === stored
      setLocked(!ok ? true : false)
      return ok
    }) as unknown as boolean
  }

  /* Auto-lock disabled per user request
  const resetTimer = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLocked(true), 90_000)
  }

  useEffect(() => {
    resetTimer()
    const handler = () => resetTimer()
    window.addEventListener('mousemove', handler)
    window.addEventListener('keydown', handler)
    window.addEventListener('click', handler)
    return () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('keydown', handler)
      window.removeEventListener('click', handler)
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])
  */

  // Keep empty effect for consistency if needed, or just remove. 
  // For cleanest diff, I'll just remove the logic body but keep the functions as stubs or just remove completely.
  // Replacing the whole block with nothing is cleaner.

  return (
    <PrivacyContext.Provider value={{ locked, lock, unlock, setPassword }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext)
  if (!ctx) throw new Error('usePrivacy must be used within a PrivacyProvider')
  return ctx
}

