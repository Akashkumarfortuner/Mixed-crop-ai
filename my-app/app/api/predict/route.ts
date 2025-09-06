// app/api/predict/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Get the data from the frontend's request
    const body = await req.json();

    // 2. Define the URL of your Python backend
    const flaskBackendUrl = 'http://127.0.0.1:5001/predict';

    // 3. Forward the data to the Flask backend
    const response = await fetch(flaskBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 4. Handle potential errors from the backend
    if (!response.ok) {
      console.error("Backend error:", response.status, response.statusText);
      return NextResponse.json(
        { error: 'Prediction failed on the backend.' },
        { status: response.status }
      );
    }

    // 5. Get the prediction result from the backend
    const predictionResult = await response.json();

    // 6. Send the result back to the frontend
    return NextResponse.json(predictionResult);

  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}