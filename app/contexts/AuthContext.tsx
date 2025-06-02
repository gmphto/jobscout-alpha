'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { z } from 'zod'

export const AuthContextSchema = z.object({
  isAuthenticated: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string()
  }).nullable(),
  isSignInModalOpen: z.boolean(),
  openSignInModal: z.function(),
  closeSignInModal: z.function(),
  signIn: z.function(),
  signOut: z.function()
})

type AuthContextType = {
  isAuthenticated: boolean
  user: { id: string; email: string; name: string } | null
  isSignInModalOpen: boolean
  openSignInModal: () => void
  closeSignInModal: () => void
  signIn: (userData: { id: string; email: string; name: string }) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  const openSignInModal = () => {
    setIsSignInModalOpen(true)
  }

  const closeSignInModal = () => {
    setIsSignInModalOpen(false)
  }

  const signIn = (userData: { id: string; email: string; name: string }) => {
    setUser(userData)
    setIsAuthenticated(true)
    closeSignInModal()
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isSignInModalOpen,
        openSignInModal,
        closeSignInModal,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 