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
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 2.0 Flash for live detection
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Remove the data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to the format Gemini expects
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    };

    // Create a strict prompt for plant/leaf detection
    const prompt = `Analyze this image and determine:
1. If it shows a plant leaf (specifically, it could be a mango tree leaf or any plant leaf)
2. If there are multiple leaves visible (more than one leaf taking up significant space in the image)

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format, nothing else:
{"isPlant": true, "hasMultipleLeaves": false}

Rules:
- isPlant: If the image shows ANY type of plant leaf, botanical specimen, or vegetation: true, otherwise false
- hasMultipleLeaves: If there are 2 or more distinct leaves visible in the image (not just one main leaf): true, otherwise false
- The main focus should ideally be 1 single leaf - if multiple leaves are prominent, set hasMultipleLeaves to true
- Do not include any other text, explanation, or markdown formatting
- Only return the JSON object with both fields`;


    // Generate response
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    console.log('Gemini raw response (live):', text);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // If parsing fails, try to detect true/false in the response
      const lowerText = text.toLowerCase();
      parsedResponse = {
        isPlant: lowerText.includes('true') || lowerText.includes('"isplant": true'),
        hasMultipleLeaves: lowerText.includes('"hasmultipleleaves": true')
      };
    }

    // Ensure we have boolean responses
    const isPlant = parsedResponse.isPlant === true;
    const hasMultipleLeaves = parsedResponse.hasMultipleLeaves === true;

    return NextResponse.json({
      isPlant,
      hasMultipleLeaves,
      message: isPlant 
        ? (hasMultipleLeaves 
            ? 'Image contains multiple plant leaves' 
            : 'Image contains a single plant leaf')
        : 'Image does not appear to be a plant leaf',
      rawResponse: text // For debugging
    });

  } catch (error) {
    console.error('Error checking if plant (live):', error);
    return NextResponse.json(
      { 
        error: 'Failed to check if image is a plant',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
