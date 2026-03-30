import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { frames, sessionId, language = 'en' } = await request.json();
    
    console.log('Received request:', { 
      hasFrames: !!frames, 
      frameCount: frames?.length, 
      sessionId 
    });
    
    if (!frames || frames.length === 0) {
      return Response.json({ error: 'No frames provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment');
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('API key found, initializing Gemini...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Create the prompt for sign language recognition with language support
    const languageInstruction = language === 'ta' 
      ? 'Return the response in Tamil (தமிழ்).' 
      : 'Return the response in English.';
    
    const prompt = `
    Analyze these sequential frames from a sign language video and identify the exact word or short phrase the person is signing.
    
    Focus on:
    - Hand gestures and movements across the frames
    - Facial expressions that convey meaning
    - Body language and posture changes
    - The progression of gestures from frame to frame
    
    ${languageInstruction}
    
    Return ONLY the recognized word or short phrase (1-5 words maximum).
    Do NOT add any explanation, commentary, or additional text.
    Do NOT respond in a conversational manner.
    
    Return ONLY the recognized text, nothing else.
    `;

    console.log('Sending request to Gemini with frames...');

    // Prepare the content with prompt and all frames
    const content = [prompt];
    
    // Add each frame as an image
    frames.forEach((frame, index) => {
      content.push({
        inlineData: {
          data: frame.data,
          mimeType: 'image/jpeg'
        }
      });
    });

    const result = await model.generateContent(content);

    console.log('Received response from Gemini');

    const response = await result.response;
    const text = response.text();

    console.log('Extracted text:', text);

    return Response.json({ 
      text: text.trim(),
      success: true,
      frameCount: frames.length,
      sessionId
    });

  } catch (error) {
    console.error('Error processing frames with Gemini:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return Response.json({ 
      error: 'Failed to process frames',
      details: error.message,
      type: error.name
    }, { status: 500 });
  }
}
