import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { text, language = 'en' } = await request.json();
    
    if (!text) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const languageInstruction = language === 'ta' 
      ? 'Respond in Tamil (தமிழ்)' 
      : 'Respond in English';
    
    const prompt = `
    I want to communicate in sign language. Convert the following text into simple sign language instructions.
    
    Text: "${text}"
    
    ${languageInstruction}
    
    Provide:
    1. A brief description of the sign language gesture for this text
    2. Keep it simple (1-2 sentences maximum)
    
    Example format:
    "To sign 'Hello', wave your right hand back and forth in front of you."
    
    Return ONLY the sign language instructions, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestion = response.text().trim();

    return Response.json({ 
      suggestion,
      success: true 
    });

  } catch (error) {
    console.error('Error generating sign language suggestions:', error);
    return Response.json({ 
      error: 'Failed to generate suggestions',
      details: error.message
    }, { status: 500 });
  }
}
