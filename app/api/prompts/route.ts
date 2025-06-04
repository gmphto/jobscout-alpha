import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '../../lib/supabase-server'
import { ProcessPromptRequestSchema, ProcessPromptResponseSchema, ProcessPromptResponse } from '../../prompt/types'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure user exists in public.users table
    await ensureUserExists(supabase, user)

    // Check usage limits before processing
    const usageCheck = await checkUsageLimit(supabase, user.id)
    if (!usageCheck.canCreate) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          message: `You've used ${usageCheck.used}/${usageCheck.limit} prompts this month. Upgrade to Pro for unlimited prompts.`,
          usage: usageCheck,
          needsUpgrade: true
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = ProcessPromptRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { jobPost, title, company, position } = validationResult.data

    // Generate title if not provided
    const promptTitle = title || await generateTitle(jobPost, company, position)

    // Create prompt in database
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        title: promptTitle,
        content: jobPost,
        company,
        position,
        status: 'processing'
      })
      .select()
      .single()

    if (promptError || !prompt) {
      console.error('Error creating prompt:', promptError)
      return NextResponse.json(
        { error: 'Failed to create prompt' },
        { status: 500 }
      )
    }

    // Process with OpenAI
    const startTime = Date.now()
    
    try {
      const generatedContent = await processJobPost(jobPost)
      const processingTime = Date.now() - startTime

      // Store generated content in database
      const { data: content, error: contentError } = await supabase
        .from('generated_content')
        .insert({
          prompt_id: prompt.id,
          user_id: user.id,
          bullet_points: generatedContent.bullet_points,
          skills: generatedContent.skills,
          keywords: generatedContent.keywords,
          achievements: generatedContent.achievements,
          summary: generatedContent.summary,
          processing_time_ms: processingTime
        })
        .select()
        .single()

      if (contentError || !content) {
        console.error('Error storing generated content:', contentError)
        
        // Update prompt status to failed
        await supabase
          .from('prompts')
          .update({ status: 'failed' })
          .eq('id', prompt.id)
        
        return NextResponse.json(
          { error: 'Failed to store generated content' },
          { status: 500 }
        )
      }

      // Update prompt status to completed
      await supabase
        .from('prompts')
        .update({ status: 'completed' })
        .eq('id', prompt.id)

      // Get updated usage info
      const updatedUsage = await checkUsageLimit(supabase, user.id)

      // Return successful response
      const response: ProcessPromptResponse = {
        prompt_id: prompt.id,
        generated_content: {
          id: content.id,
          prompt_id: content.prompt_id,
          user_id: content.user_id,
          bullet_points: content.bullet_points,
          skills: content.skills,
          keywords: content.keywords,
          achievements: content.achievements,
          summary: content.summary,
          openai_model: content.openai_model,
          processing_time_ms: content.processing_time_ms,
          created_at: content.created_at
        },
        success: true,
        message: 'Resume content generated successfully',
        usage: updatedUsage
      }

      return NextResponse.json(response)

    } catch (openaiError) {
      console.error('OpenAI processing error:', openaiError)
      
      // Update prompt status to failed
      await supabase
        .from('prompts')
        .update({ status: 'failed' })
        .eq('id', prompt.id)
      
      return NextResponse.json(
        { error: 'Failed to process job post with AI' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Pure function to check usage limit - simplified version that counts prompts directly
async function checkUsageLimit(supabase: any, userId: string) {
  try {
    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Count prompts created this month
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
      .lt('created_at', `${getNextMonth(currentMonth)}-01T00:00:00.000Z`)
    
    if (error) {
      console.error('Error checking usage:', error)
      // Default to allowing creation if we can't check usage
      return { canCreate: true, used: 0, limit: 5 }
    }
    
    const used = prompts?.length || 0
    const limit = 5 // Free tier limit
    
    return {
      canCreate: used < limit,
      used: used,
      limit: limit
    }
  } catch (error) {
    console.error('Error in checkUsageLimit:', error)
    return { canCreate: true, used: 0, limit: 5 }
  }
}

// Pure function to get next month string
function getNextMonth(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`
}

// Pure function to ensure user exists in public.users table
async function ensureUserExists(supabase: any, user: any) {
  // Check if user exists in public.users
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  // If user doesn't exist, create them
  if (!existingUser) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.user_metadata?.avatar_url || null
      })

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      throw new Error('Failed to create user profile')
    }
  }
}

// Pure function to generate title from job post
async function generateTitle(jobPost: string, company?: string, position?: string): Promise<string> {
  if (company && position) {
    return `${position} at ${company}`
  }
  
  if (company) {
    return `Job Application for ${company}`
  }
  
  // Extract title from job post using simple heuristics
  const lines = jobPost.split('\n').filter(line => line.trim().length > 0)
  const firstLine = lines[0]?.trim()
  
  if (firstLine && firstLine.length < 100) {
    return firstLine
  }
  
  return 'Job Application'
}

// Pure function to process job post with OpenAI
async function processJobPost(jobPost: string) {
  const prompt = `
Analyze this job posting and generate tailored resume content:

JOB POSTING:
${jobPost}

Please provide a JSON response with the following structure:
{
  "bullet_points": [
    "Tailored bullet point emphasizing relevant experience #1",
    "Tailored bullet point emphasizing relevant experience #2",
    "Tailored bullet point emphasizing relevant experience #3",
    "Tailored bullet point emphasizing relevant experience #4",
    "Tailored bullet point emphasizing relevant experience #5"
  ],
  "skills": [
    "Skill 1 mentioned in job posting",
    "Skill 2 mentioned in job posting",
    "Skill 3 mentioned in job posting",
    "Additional relevant skill",
    "Additional relevant skill"
  ],
  "keywords": [
    "Important keyword from job posting",
    "Technical term from job posting",
    "Industry-specific term",
    "Action word from requirements",
    "Qualification mentioned"
  ],
  "achievements": [
    "Quantified achievement relevant to role #1",
    "Quantified achievement relevant to role #2",
    "Quantified achievement relevant to role #3"
  ],
  "summary": "A 2-3 sentence professional summary that aligns with this specific job posting, highlighting the most relevant qualifications and experience."
}

Make sure all content is:
1. Directly relevant to the job posting requirements
2. Uses keywords and terminology from the posting
3. Bullet points are action-oriented and quantifiable when possible
4. Skills match both required and preferred qualifications
5. Summary is compelling and specific to this role
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume writer and career coach. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1500
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content received from OpenAI')
  }

  try {
    const parsed = JSON.parse(content)
    return {
      bullet_points: parsed.bullet_points || [],
      skills: parsed.skills || [],
      keywords: parsed.keywords || [],
      achievements: parsed.achievements || [],
      summary: parsed.summary || null
    }
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Invalid response format from OpenAI')
  }
} 