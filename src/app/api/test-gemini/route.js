import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('Testing Gemini API connection...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent("Hello, can you respond with 'API is working'?");
    const response = await result.response;
    const text = response.text();

    return Response.json({ 
      message: 'Gemini API is working',
      response: text.trim(),
      success: true 
    });

  } catch (error) {
    console.error('Error testing Gemini API:', error);
    return Response.json({ 
      error: 'Failed to test Gemini API',
      details: error.message,
      type: error.name
    }, { status: 500 });
  }
}
