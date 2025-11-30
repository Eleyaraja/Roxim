import { NextRequest, NextResponse } from 'next/server'
import { fetchJobs } from '@/lib/jobs-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const role = searchParams.get('role') || undefined
  const location = searchParams.get('location') || undefined
  
  try {
    const jobs = await fetchJobs(role, location)
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
