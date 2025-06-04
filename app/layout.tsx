import React from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import Header from './components/Header'
import GlobalSignInModal from './components/GlobalSignInModal'
import AuthWrapper from './components/AuthWrapper'
import { AuthProvider } from './contexts/AuthContext'

export const metadata: Metadata = {
  title: 'JobScout',
  description: 'AI-powered resume tailoring for job applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <AuthProvider>
          <AuthWrapper>
            <Header />
            {children}
            <GlobalSignInModal />
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
} 