import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Check if backend is available
    let backendHealthy = false;
    try {
      const healthCheck = await fetch(`${PYTHON_API_URL}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      backendHealthy = healthCheck.ok;
    } catch (e) {
      console.error('Backend health check failed:', e);
    }

    if (!backendHealthy) {
      return NextResponse.json(
        { 
          error: 'Python backend is not running',
          details: `Cannot connect to backend at ${PYTHON_API_URL}. Please start the backend server.`,
          backend_available: false,
          instructions: 'Run: cd backend && ./start_backend.sh'
        },
        { status: 503 }
      );
    }

    // Forward the request to Python backend
    const response = await fetch(`${PYTHON_API_URL}/predict-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(`Backend returned error: ${response.status} - ${text}`);
      }
      throw new Error(errorData.detail || 'Failed to predict disease');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error predicting disease:', error);
    return NextResponse.json(
      { 
        error: 'Failed to predict disease', 
        details: error instanceof Error ? error.message : 'Unknown error',
        backend_available: false 
      },
      { status: 500 }
    );
  }
}