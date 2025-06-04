'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { z } from 'zod'
import { createClient } from '../lib/supabase-client'
import type { User } from '@supabase/auth-helpers-nextjs'

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable()
})

export const AuthContextSchema = z.object({
  isAuthenticated: z.boolean(),
  user: UserSchema.nullable(),
  isSignInModalOpen: z.boolean(),
  isLoading: z.boolean(),
  openSignInModal: z.function(),
  closeSignInModal: z.function(),
  signInWithGoogle: z.function(),
  signOut: z.function()
})

type AuthUser = z.infer<typeof UserSchema>

type AuthContextType = {
  isAuthenticated: boolean
  user: AuthUser | null
  isSignInModalOpen: boolean
  isLoading: boolean
  openSignInModal: () => void
  closeSignInModal: () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('Initial session user metadata:', session.user.user_metadata)
        
        const avatar_url = session.user.user_metadata?.avatar_url || 
                         session.user.user_metadata?.picture || 
                         null
        
        console.log('Initial session avatar URL:', avatar_url)
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          avatar_url: avatar_url
        })
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        if (session?.user) {
          console.log('User metadata:', session.user.user_metadata)
          console.log('User identities:', session.user.identities)
          
          const avatar_url = session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture || 
                           null
          
          console.log('Final avatar URL:', avatar_url)
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            avatar_url: avatar_url
          })
          setIsAuthenticated(true)
          closeSignInModal()
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const openSignInModal = () => {
    setIsSignInModalOpen(true)
  }

  const closeSignInModal = () => {
    setIsSignInModalOpen(false)
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Error signing in with Google:', error.message)
      }
    } catch (error) {
      console.error('Error during Google sign in:', error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      }
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isSignInModalOpen,
        isLoading,
        openSignInModal,
        closeSignInModal,
        signInWithGoogle,
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