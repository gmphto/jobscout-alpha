'use client'

import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { isAuthenticated, user, openSignInModal, signOut } = useAuth()

  const handleSignInClick = () => {
    if (isAuthenticated) {
      signOut()
    } else {
      openSignInModal()
    }
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">JobScout</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
 
          </nav>

          {/* Actions */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name?.split(' ')[0]}
                </span>
                <button 
                  onClick={handleSignInClick}
                  className="hover:bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignInClick}
                className="hover:bg-gray-100 text-gray-500 px-6 py-2 rounded-full text-sm font-semibold border border-gray-200 shadow-sm hover:shadow transition-all duration-200"
              >
                Sign in / Sign up
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 