'use client'

import React from 'react'
import SignInModal from './SignInModal'
import { useAuth } from '../contexts/AuthContext'

export default function GlobalSignInModal() {
  const { isSignInModalOpen, closeSignInModal, signIn } = useAuth()

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth integration
    console.log('Google authentication initiated')
    
    // For demo purposes, simulate successful login
    // In production, this would handle the actual OAuth flow
    signIn({
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User'
    })
  }

  return (
    <SignInModal
      isOpen={isSignInModalOpen}
      onClose={closeSignInModal}
      onGoogleSignIn={handleGoogleSignIn}
    />
  )
} 