import React from 'react'
import { z } from 'zod'

export const DashboardPropsSchema = z.object({
  userId: z.string()
})

type DashboardProps = z.infer<typeof DashboardPropsSchema>

export default function Dashboard(props: DashboardProps) {
  const { userId } = props

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="mt-2 text-gray-600">User ID: {userId}</p>
        </div>
      </div>
    </div>
  )
} 