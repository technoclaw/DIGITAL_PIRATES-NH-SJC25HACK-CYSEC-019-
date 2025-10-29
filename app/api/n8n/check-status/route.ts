import { NextRequest, NextResponse } from 'next/server';
import { analysisResults } from '@/lib/analysis-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId parameter' },
        { status: 400 }
      );
    }

    // Check if the result is available in the clipboard
    const result = analysisResults.get(jobId);

    if (result) {
      // Result found - return it and clear from memory
      analysisResults.delete(jobId);
      console.log(`[Check Status] Job ${jobId} completed, returning result`);
      
      return NextResponse.json(
        {
          status: 'completed',
          result
        },
        { status: 200 }
      );
    } else {
      // Result not ready yet - signal client to continue polling
      console.log(`[Check Status] Job ${jobId} still processing`);
      
      return NextResponse.json(
        {
          status: 'processing',
          message: 'Analysis still in progress'
        },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error('[Check Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

