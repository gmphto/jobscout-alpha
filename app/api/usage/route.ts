import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '../../lib/supabase-server'

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

    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Count prompts created this month
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
      .lt('created_at', `${getNextMonth(currentMonth)}-01T00:00:00.000Z`)
    
    if (error) {
      console.error('Error checking usage:', error)
      return NextResponse.json(
        { error: 'Failed to check usage' },
        { status: 500 }
      )
    }
    
    const used = prompts?.length || 0
    const limit = 5 // Free tier limit
    
    return NextResponse.json({
      prompts_used: used,
      prompts_limit: limit,
      can_create_prompt: used < limit,
      remaining: Math.max(0, limit - used)
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Pure function to get next month string
function getNextMonth(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`
} 