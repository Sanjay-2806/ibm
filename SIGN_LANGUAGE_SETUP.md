# Sign Language Recognition Setup

## Environment Configuration

To use the sign language recognition feature, you need to set up your Gemini API key:

1. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Create Environment File:**
   Create a file named `.env.local` in your project root with:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## Usage

1. Click "Start Recording" to begin video capture
2. Perform your sign language gestures
3. Click "Stop Recording" to process the video
4. The recognized text will appear in the BoardSettings area

## Troubleshooting

- If you see "API key not configured" error, make sure your `.env.local` file exists and contains the correct API key
- Make sure to restart your development server after adding the environment variable
- Check that your API key is valid and has the necessary permissions
