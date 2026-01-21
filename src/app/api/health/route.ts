import { NextResponse } from 'next/server'
import { isUsingPostgres, isUsingSupabase } from '@/lib/db/config'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  services: {
    database: {
      status: 'up' | 'down' | 'unknown'
      provider: string
      latency?: number
      error?: string
    }
    openai: {
      status: 'configured' | 'not_configured'
    }
    anthropic: {
      status: 'configured' | 'not_configured'
    }
    stripe: {
      status: 'configured' | 'not_configured'
    }
    email: {
      status: 'configured' | 'not_configured'
    }
  }
  uptime?: number
}

const startTime = Date.now()

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: 'unknown',
        provider: isUsingPostgres() ? 'postgres' : isUsingSupabase() ? 'supabase' : 'none',
      },
      openai: {
        status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      },
      anthropic: {
        status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured',
      },
      stripe: {
        status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      },
      email: {
        status: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
      },
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  // Check database connectivity
  try {
    if (isUsingPostgres()) {
      // Check PostgreSQL directly
      const { checkHealth } = await import('@/lib/db/postgres')
      const dbHealth = await checkHealth()
      health.services.database.status = dbHealth.healthy ? 'up' : 'down'
      health.services.database.latency = dbHealth.latency
      if (dbHealth.error) {
        health.services.database.error = dbHealth.error
      }
    } else if (isUsingSupabase()) {
      // Check Supabase
      const start = Date.now()
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { error } = await supabase.from('profiles').select('id').limit(1)

      health.services.database.latency = Date.now() - start
      health.services.database.status = error ? 'down' : 'up'
      if (error) {
        health.services.database.error = error.message
      }
    }
  } catch (error: any) {
    health.services.database.status = 'down'
    health.services.database.error = error.message
  }

  // Determine overall health status
  if (health.services.database.status === 'down') {
    health.status = 'unhealthy'
  } else if (
    health.services.openai.status === 'not_configured' ||
    health.services.anthropic.status === 'not_configured'
  ) {
    health.status = 'degraded'
  }

  // Return appropriate status code
  const statusCode = health.status === 'unhealthy' ? 503 : 200

  return NextResponse.json(health, { status: statusCode })
}

// HEAD request for simple health check (used by load balancers)
export async function HEAD() {
  try {
    if (isUsingPostgres()) {
      const { checkHealth } = await import('@/lib/db/postgres')
      const dbHealth = await checkHealth()
      if (!dbHealth.healthy) {
        return new NextResponse(null, { status: 503 })
      }
    } else if (isUsingSupabase()) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { error } = await supabase.from('profiles').select('id').limit(1)
      if (error) {
        return new NextResponse(null, { status: 503 })
      }
    }
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
