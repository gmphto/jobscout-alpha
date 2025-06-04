import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '../../../lib/supabase-server'

export async function GET(request: NextRequest) {
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

    // Fetch user's prompts with generated content
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select(`
        *,
        generated_content (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (promptsError) {
      console.error('Error fetching prompts:', promptsError)
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ prompts: prompts || [] })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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