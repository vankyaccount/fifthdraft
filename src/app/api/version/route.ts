import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    message: 'FifthDraft API is running',
  })
}
