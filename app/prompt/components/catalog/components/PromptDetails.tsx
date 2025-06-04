'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { PromptSchema, GeneratedContentSchema } from '../../../types'

export const PromptDetailsPropsSchema = z.object({
  prompt: PromptSchema.extend({
    generated_content: z.array(GeneratedContentSchema).optional()
  }),
  isOpen: z.boolean(),
  onClose: z.function()
})

type PromptDetailsProps = z.infer<typeof PromptDetailsPropsSchema>

export default function PromptDetails(props: PromptDetailsProps) {
  const { prompt, isOpen, onClose } = props
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'formatted' | 'plain'>('formatted')

  const generatedContent = prompt.generated_content?.[0]

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(sectionName)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const copyAllContent = async () => {
    if (!generatedContent) return

    const allContent = `
RESUME CONTENT FOR: ${prompt.title}
${prompt.company ? `Company: ${prompt.company}` : ''}
${prompt.position ? `Position: ${prompt.position}` : ''}

${generatedContent.summary ? `PROFESSIONAL SUMMARY:
${generatedContent.summary}

` : ''}EXPERIENCE BULLET POINTS:
${generatedContent.bullet_points?.map(bullet => `• ${bullet}`).join('\n') || 'No bullet points available'}

KEY SKILLS:
${generatedContent.skills?.join(', ') || 'No skills available'}

ACHIEVEMENTS:
${generatedContent.achievements?.map(achievement => `• ${achievement}`).join('\n') || 'No achievements available'}

KEYWORDS:
${generatedContent.keywords?.join(', ') || 'No keywords available'}

Generated on: ${new Date(generatedContent.created_at).toLocaleDateString()}
Processing time: ${generatedContent.processing_time_ms ? `${(generatedContent.processing_time_ms / 1000).toFixed(1)}s` : 'N/A'}
`.trim()

    await copyToClipboard(allContent, 'all')
  }

  const downloadAsText = () => {
    if (!generatedContent) return

    const content = `RESUME CONTENT FOR: ${prompt.title}
${prompt.company ? `Company: ${prompt.company}` : ''}
${prompt.position ? `Position: ${prompt.position}` : ''}

${generatedContent.summary ? `PROFESSIONAL SUMMARY:
${generatedContent.summary}

` : ''}EXPERIENCE BULLET POINTS:
${generatedContent.bullet_points?.map(bullet => `• ${bullet}`).join('\n') || 'No bullet points available'}

KEY SKILLS:
${generatedContent.skills?.join(', ') || 'No skills available'}

ACHIEVEMENTS:
${generatedContent.achievements?.map(achievement => `• ${achievement}`).join('\n') || 'No achievements available'}

KEYWORDS:
${generatedContent.keywords?.join(', ') || 'No keywords available'}

Generated on: ${new Date(generatedContent.created_at).toLocaleDateString()}
Processing time: ${generatedContent.processing_time_ms ? `${(generatedContent.processing_time_ms / 1000).toFixed(1)}s` : 'N/A'}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume_content.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {prompt.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {prompt.company && (
                  <span><strong>Company:</strong> {prompt.company}</span>
                )}
                {prompt.position && (
                  <span><strong>Position:</strong> {prompt.position}</span>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  prompt.status === 'completed' ? 'bg-green-100 text-green-800' :
                  prompt.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  prompt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {prompt.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex rounded-md border border-gray-300">
                <button
                  onClick={() => setViewMode('formatted')}
                  className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                    viewMode === 'formatted'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setViewMode('plain')}
                  className={`px-3 py-1 text-sm font-medium rounded-r-md border-l border-gray-300 ${
                    viewMode === 'plain'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Plain Text
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Generated on {new Date(prompt.created_at).toLocaleDateString()}
              {generatedContent?.processing_time_ms && (
                <span> • Processed in {(generatedContent.processing_time_ms / 1000).toFixed(1)}s</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyAllContent}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {copiedSection === 'all' ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy All
                  </>
                )}
              </button>
              <button
                onClick={downloadAsText}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {prompt.status !== 'completed' ? (
              <div className="text-center py-12">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  prompt.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  prompt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {prompt.status === 'processing' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  )}
                  {prompt.status === 'processing' ? 'Processing with AI...' :
                   prompt.status === 'pending' ? 'Waiting to process...' :
                   'Processing failed'}
                </div>
                {prompt.status === 'failed' && (
                  <p className="mt-2 text-sm text-gray-600">
                    Please try creating the prompt again.
                  </p>
                )}
              </div>
            ) : !generatedContent ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No generated content available.</p>
              </div>
            ) : viewMode === 'formatted' ? (
              <div className="space-y-8">
                {/* Professional Summary */}
                {generatedContent.summary && (
                  <ContentSection
                    title="Professional Summary"
                    content={generatedContent.summary}
                    onCopy={() => copyToClipboard(generatedContent.summary!, 'summary')}
                    isCopied={copiedSection === 'summary'}
                    isTextContent={true}
                  />
                )}

                {/* Experience Bullet Points */}
                {generatedContent.bullet_points && generatedContent.bullet_points.length > 0 && (
                  <ContentSection
                    title="Experience Bullet Points"
                    content={generatedContent.bullet_points}
                    onCopy={() => copyToClipboard(
                      generatedContent.bullet_points!.map(bullet => `• ${bullet}`).join('\n'),
                      'bullets'
                    )}
                    isCopied={copiedSection === 'bullets'}
                    isList={true}
                  />
                )}

                {/* Achievements */}
                {generatedContent.achievements && generatedContent.achievements.length > 0 && (
                  <ContentSection
                    title="Key Achievements"
                    content={generatedContent.achievements}
                    onCopy={() => copyToClipboard(
                      generatedContent.achievements!.map(achievement => `• ${achievement}`).join('\n'),
                      'achievements'
                    )}
                    isCopied={copiedSection === 'achievements'}
                    isList={true}
                  />
                )}

                {/* Skills */}
                {generatedContent.skills && generatedContent.skills.length > 0 && (
                  <ContentSection
                    title="Key Skills"
                    content={generatedContent.skills}
                    onCopy={() => copyToClipboard(generatedContent.skills!.join(', '), 'skills')}
                    isCopied={copiedSection === 'skills'}
                    isSkillList={true}
                  />
                )}

                {/* Keywords */}
                {generatedContent.keywords && generatedContent.keywords.length > 0 && (
                  <ContentSection
                    title="Important Keywords"
                    content={generatedContent.keywords}
                    onCopy={() => copyToClipboard(generatedContent.keywords!.join(', '), 'keywords')}
                    isCopied={copiedSection === 'keywords'}
                    isSkillList={true}
                  />
                )}
              </div>
            ) : (
              // Plain text view
              <div className="bg-gray-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
{`${generatedContent.summary ? `PROFESSIONAL SUMMARY:
${generatedContent.summary}

` : ''}EXPERIENCE BULLET POINTS:
${generatedContent.bullet_points?.map(bullet => `• ${bullet}`).join('\n') || 'No bullet points available'}

KEY SKILLS:
${generatedContent.skills?.join(', ') || 'No skills available'}

ACHIEVEMENTS:
${generatedContent.achievements?.map(achievement => `• ${achievement}`).join('\n') || 'No achievements available'}

KEYWORDS:
${generatedContent.keywords?.join(', ') || 'No keywords available'}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Content section component
interface ContentSectionProps {
  title: string
  content: string | string[]
  onCopy: () => void
  isCopied: boolean
  isTextContent?: boolean
  isList?: boolean
  isSkillList?: boolean
}

function ContentSection({ title, content, onCopy, isCopied, isTextContent, isList, isSkillList }: ContentSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button
          onClick={onCopy}
          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isCopied ? (
            <>
              <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        {isTextContent && typeof content === 'string' && (
          <p className="text-gray-900 leading-relaxed">{content}</p>
        )}
        {isList && Array.isArray(content) && (
          <ul className="space-y-2">
            {content.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span className="text-gray-900">{item}</span>
              </li>
            ))}
          </ul>
        )}
        {isSkillList && Array.isArray(content) && (
          <div className="flex flex-wrap gap-2">
            {content.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 