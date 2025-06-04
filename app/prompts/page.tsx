'use client'

import { useAuth } from '../contexts/AuthContext'
import Catalog from '../prompt/components/catalog/Catalog'

export default function PromptsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to view your prompts
          </h1>
          <p className="text-gray-600">
            You need to be signed in to view your generated resume content.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Catalog />
    </div>
  )
} 