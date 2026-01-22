import { NextResponse } from 'next/server'

interface HealthStatus {
  status: 'healthy' | 'degraded'
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
        provider: 'postgres',
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
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  // Check database connectivity
  try {
    const { checkHealth } = await import('@/lib/db/postgres')
    const dbHealth = await checkHealth()
    health.services.database.status = dbHealth.healthy ? 'up' : 'down'
    health.services.database.latency = dbHealth.latency
    if (dbHealth.error) {
      health.services.database.error = dbHealth.error
    }
  } catch (error: unknown) {
    health.services.database.status = 'down'
    health.services.database.error = (error as Error).message
  }

  // Determine overall health status (degraded if database is down, but still return 200)
  if (health.services.database.status === 'down') {
    health.status = 'degraded'
  } else if (
    health.services.openai.status === 'not_configured' ||
    health.services.anthropic.status === 'not_configured'
  ) {
    health.status = 'degraded'
  }

  // Always return 200 so healthcheck passes even if DB is temporarily down
  return NextResponse.json(health, { status: 200 })
}

// HEAD request for simple health check (used by load balancers)
export async function HEAD() {
  // Simple check - just return 200 if the app is running
  return new NextResponse(null, { status: 200 })
}
