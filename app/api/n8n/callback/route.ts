import { NextRequest, NextResponse } from 'next/server';
import { analysisResults } from '@/lib/analysis-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, url, threat_score, verdict, details, timestamp } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId' },
        { status: 400 }
      );
    }

    // Store the result in the global clipboard
    analysisResults.set(jobId, {
      jobId,
      url,
      threat_score,
      verdict,
      details,
      timestamp,
      receivedAt: new Date().toISOString()
    });

    console.log(`[Callback] Received result for job ${jobId}:`, { verdict, threat_score });

    return NextResponse.json(
      { success: true, message: 'Result stored successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Callback] Error processing callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

