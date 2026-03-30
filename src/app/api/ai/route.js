import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function GET(req) {
  const question = req.nextUrl.searchParams.get("question") || "Hello, how are you?";
  
  const prompt = `You are a sign language instructor. Convert the following text into emoji representation of sign language.

Text: "${question}"

Convert this into a sequence of emoji that represent sign language gestures. Use hand and finger emojis that visually represent the signs.

Provide a JSON object with the following format:
{
  "english": "the english phrase",
  "signLanguageEmoji": "emoji sequence representing the signs",
  "signLanguageInstruction": "brief description of the sign language gesture"
}

Emoji to use: 👋 (waving hand), 🙌 (hands up), 👉 (pointing), 👍 (thumbs up), 👌 (ok hand), ✋ (raised hand), 🤞 (crossed fingers), 🤝 (handshake), 🤙 (call me), 🤲 (palms up), 🤚 (backhand), 🖐️ (open hand), ✌️ (peace), 🤘 (rock on), etc.

Example:
{
  "english": "Hello, how are you?",
  "signLanguageEmoji": "👋👈🙌👉",
  "signLanguageInstruction": "Wave hello, point to yourself for 'are', point to the other person for 'you'"
}

Return ONLY the JSON object, no other text.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Try to parse the JSON from the response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return Response.json(JSON.parse(jsonMatch[0]));
    }
    return Response.json(JSON.parse(text));
  } catch (e) {
    console.error('Error parsing Gemini response:', e);
    console.error('Response:', text);
    return Response.json({ error: 'Failed to parse response' }, { status: 500 });
  }
}
