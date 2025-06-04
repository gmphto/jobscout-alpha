import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '../../lib/supabase-server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteClient()
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
    }
  }

  // Redirect to the main page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/`)
} 