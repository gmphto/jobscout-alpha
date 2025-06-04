'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import UsageIndicator from './UsageIndicator'

export default function Header() {
  const { isAuthenticated, user, openSignInModal, signOut } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleSignInClick = () => {
    if (isAuthenticated) {
      signOut()
    } else {
      openSignInModal()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Avatar image failed to load:', user?.avatar_url)
    // Hide the broken image and show the fallback
    const img = e.currentTarget
    const fallback = img.nextElementSibling as HTMLElement
    if (fallback) {
      img.style.display = 'none'
      fallback.style.display = 'flex'
    }
  }

  const handleImageLoad = () => {
    console.log('Avatar image loaded successfully:', user?.avatar_url)
  }

  // UserAvatar component defined inline
  const UserAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base'
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gray-200 relative`}>
        {user?.avatar_url ? (
          <>
            <img
              src={user.avatar_url}
              alt={user.name || 'User avatar'}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            <div 
              className="w-full h-full bg-blue-500 text-white font-medium items-center justify-center hidden"
              style={{ display: 'none' }}
            >
              {user.name ? getInitials(user.name) : user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-blue-500 text-white font-medium flex items-center justify-center">
            {user?.name ? getInitials(user.name) : user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    )
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

          {/* Center - Usage Indicator (for authenticated users) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center">
              <UsageIndicator size="sm" />
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {isAuthenticated && (
              <>
                <a href="/prompts" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  My Prompts
                </a>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Mobile Usage Indicator */}
            {isAuthenticated && (
              <div className="md:hidden">
                <UsageIndicator size="sm" showText={false} />
              </div>
            )}
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-3">
                    <UserAvatar size="lg" />
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.name?.split(' ')[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  {/* Dropdown arrow */}
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <UserAvatar size="lg" />
                        <div>
                          <div className="font-medium text-gray-900">{user?.name}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                      {/* Usage in dropdown for mobile */}
                      <div className="mt-3 md:hidden">
                        <UsageIndicator size="sm" />
                      </div>
                    </div>
                    <div className="py-2">
                      <a
                        href="/prompts"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        📝 My Prompts
                      </a>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          signOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}

                {/* Overlay to close dropdown */}
                {isProfileOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                )}
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