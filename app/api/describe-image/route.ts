import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize the Gemini client
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyDY5uRPXYZuV__SThdFHxwbrBjCoCmGA4o';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Remove the data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to the format Gemini expects
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/png',
      },
    };

    // Generate content with the prompt
    const result = await model.generateContent([
      imagePart,
      'What do you see in 2 sentences.',
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error('Error describing image:', error);
    return NextResponse.json(
      { error: 'Failed to describe image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
