'use client'

import React from 'react'
import SignInModal from './SignInModal'
import { useAuth } from '../contexts/AuthContext'

export default function GlobalSignInModal() {
  const { isSignInModalOpen, closeSignInModal, signInWithGoogle } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <SignInModal
      isOpen={isSignInModalOpen}
      onClose={closeSignInModal}
      onGoogleSignIn={handleGoogleSignIn}
    />
  )
} 