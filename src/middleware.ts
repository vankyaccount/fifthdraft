// Rename this file to `proxy.ts` as the `middleware` convention is deprecated.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  console.log('Middleware request path:', request.nextUrl.pathname)
  try {
    console.log('Request cookies:', request.cookies.getAll())
  } catch (err) {
    console.log('Could not read request.cookies.getAll():', err)
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('Middleware user:', user)
    if (error) {
      console.error('Supabase auth error in middleware:', error.message)
      return response
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        console.log('Redirecting to /login due to missing user')
        return NextResponse.redirect(new URL('/login', request.url))
      } else {
        console.log('User authenticated, allowing access to /dashboard')
      }
    }

    // Redirect authenticated users away from auth pages (except reset-password which needs auth)
    if ((request.nextUrl.pathname.startsWith('/login') ||
         request.nextUrl.pathname.startsWith('/signup') ||
         request.nextUrl.pathname.startsWith('/forgot-password')) && user) {
      console.log('Redirecting to /dashboard for authenticated user')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // On any error, let the request through
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
}
