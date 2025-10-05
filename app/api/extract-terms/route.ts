import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create a comprehensive prompt for extracting technical terms
    const prompt = `Analyze the following text about mango plant diseases and extract ALL technical terms, treatments, pesticides, fungicides, and agricultural products mentioned.

TEXT:
${content}

For each term found, provide:
1. The exact term as it appears
2. A brief, clear definition (1-2 sentences max)
3. How to use it or apply it (if applicable, 1 sentence)
4. Category (pesticide, fungicide, treatment, nutrient, practice, or condition)

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown, no code blocks, no extra text
- Extract terms like: pesticide names, fungicide names, nutrients (NPK, copper, etc.), diseases, treatment methods, agricultural practices
- Include both scientific and common names if mentioned
- Keep definitions concise and practical
- If no terms are found, return {"terms": []}

Return in this exact JSON format:
{
  "terms": [
    {
      "term": "Copper fungicide",
      "definition": "A protective fungicide containing copper compounds that prevents fungal infections.",
      "usage": "Apply as foliar spray at 2-3g per liter of water during early morning or evening.",
      "category": "fungicide"
    }
  ]
}`;

    console.log('🔍 Extracting terms from content...');
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log('Gemini raw response:', text);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: text.substring(0, 200)
        },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!parsedResponse.terms || !Array.isArray(parsedResponse.terms)) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    console.log(`✅ Extracted ${parsedResponse.terms.length} terms`);

    return NextResponse.json({
      success: true,
      terms: parsedResponse.terms
    });

  } catch (error) {
    console.error('Error extracting terms:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract terms',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
