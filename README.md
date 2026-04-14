# SignBridge - AI Powered Sign Language Translator

A 3D interactive sign language translator with AI-powered recognition and emoji-based sign language guidance.

## Features

- 🎥 **CV Camera**: Real-time sign language recognition using Gemini AI
- 🤖 **AI Teacher**: 3D animated teachers for interactive learning
- 📱 **Emoji Signs**: Visual sign language representation using emoji sequences
- 🌍 **Multi-language**: Support for English and Tamil
- 🔊 **Text-to-Speech**: Audio feedback for recognized signs
- 🎨 **3D Environment**: Immersive classroom experience

## Deployment to Cloudflare Pages

### Method 1: Deploy via Cloudflare Dashboard

1. **Prepare your repository:**
   - Push your code to GitHub/GitLab
   - Ensure `GEMINI_API_KEY` is available

2. **Deploy to Cloudflare Pages:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Pages → Create a project
   - Connect your Git repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Build output directory**: `.next`
     - **Root directory**: `/`

3. **Set environment variables:**
   - In Cloudflare Pages settings, add:
     - `GEMINI_API_KEY`: Your Google Gemini API key

4. **Deploy:**
   - Click "Save and Deploy"
   - Your app will be available at `https://your-project-name.pages.dev`

### Method 2: Deploy via Wrangler CLI

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy:**
   ```bash
   wrangler pages deploy .next
   ```

## Important Notes

### ⚠️ Limitations on Cloudflare Pages

- **Python TTS**: The current Python TTS (`pyttsx3`) won't work on Cloudflare Pages
- **Alternative**: Consider using cloud TTS services like:
  - Google Cloud Text-to-Speech
  - Azure Cognitive Services Speech
  - Amazon Polly

### 🔧 Required Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key for AI features

### 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/                    # Sign language emoji generation
│   │   ├── gemini-sign-language/  # CV camera recognition
│   │   ├── gemini-sign-suggestions/ # Text to sign suggestions
│   │   └── lovo-tts/             # Text-to-speech (Python)
│   └── page.js                   # Main page
├── components/
│   ├── CVCamera.jsx              # Camera component
│   ├── MessagesList.jsx          # Message display
│   ├── BoardSettings.jsx         # UI controls
│   └── Experience.jsx            # 3D scene
└── hooks/
    └── useAITeacher.js           # State management
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   # Create .env.local
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Install Python TTS (for local development):**
   ```bash
   pip install pyttsx3
   ```

## Usage

1. **Sign Language Recognition:**
   - Click the camera button or press 'B' to start recording
   - Perform sign language gestures
   - AI will recognize and display the text

2. **Text to Sign Language:**
   - Type a message in the input box
   - AI will generate emoji sequences showing how to sign it

3. **Language Selection:**
   - Toggle between English and Tamil
   - Affects both recognition and audio output

## Tech Stack

- **Frontend**: Next.js, React Three Fiber, Tailwind CSS
- **AI**: Google Gemini API
- **3D**: Three.js, React Three Drei
- **State**: Zustand
- **TTS**: Python pyttsx3 (local), Cloud TTS (production)

## License

MIT License - Feel free to use and modify for your projects.# ibm
