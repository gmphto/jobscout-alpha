'use client'

import React from 'react'
import { z } from 'zod'

export const CommandPropsSchema = z.object({
  activeFilter: z.enum(['new', 'top', 'trending']).optional(),
  searchTerm: z.string().optional(),
  onFilterChange: z.function().optional(),
  onSearchChange: z.function().optional(),
  onCreatePrompt: z.function().optional()
})

type CommandProps = z.infer<typeof CommandPropsSchema>

export default function Command(props: CommandProps) {
  const { activeFilter = 'new', searchTerm = '', onFilterChange, onSearchChange, onCreatePrompt } = props

  const filterButtons = [
    { id: 'new', label: 'New', icon: '🕐' },
    { id: 'top', label: 'Top', icon: '📈' },
    { id: 'trending', label: 'Trending', icon: '🔥' }
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              className={`
                shadow-sm inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${activeFilter === filter.id 
                  ? 'bg-gray-100 text-gray-900 border-gray-300' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="shadow-sm block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Icon */}
        <button className="shadow-sm inline-flex items-center px-3 py-2 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
        </button>

        {/* Create Button */}
        <button
          onClick={() => onCreatePrompt?.()}
          className="shadow-sm inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold hover:shadow transition-all duration-200"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create new prompt
        </button>
      </div>
    </div>
  )
} 