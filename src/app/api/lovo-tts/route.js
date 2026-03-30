export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { text, language = 'en' } = await req.json();

    if (!text) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    // Normalize the text for clearer TTS output
    let cleanText;
    if (language === 'ta') {
      // For Tamil, keep Tamil characters (includes Tamil script)
      cleanText = text
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[^\u0B80-\u0BFF\u0020-\u007E\s]/gu, '')  // Keep Tamil script and basic ASCII
        .trim();
    } else {
      // For English, keep letters/numbers/spaces only
      cleanText = text
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .trim();
    }

    if (!cleanText) {
      return Response.json({ error: 'Empty text after normalization' }, { status: 400 });
    }
    // Use Python pyttsx3 to synthesize to a temporary WAV, then return bytes
    const { spawn } = await import('child_process');
    const { writeFile, readFile, unlink } = await import('fs/promises');
    const { tmpdir } = await import('os');
    const { default: path } = await import('path');

    const tempDir = tmpdir();
    const outFile = path.join(tempDir, `tts_${Date.now()}.wav`);
    const scriptPath = path.join(tempDir, `tts_${Date.now()}.py`);

    const pythonScript = `
import pyttsx3
import sys
import os

text = sys.argv[1]
language = sys.argv[2]
out_path = sys.argv[3]

try:
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    if language == 'ta':
        # try to pick a Tamil/Indian voice when available
        for v in voices:
            name = (v.name or '').lower()
            vid = (v.id or '').lower()
            if 'tamil' in name or 'tamil' in vid or 'ta-in' in vid or 'ta_in' in vid or 'indian' in name:
                engine.setProperty('voice', v.id)
                break
        engine.setProperty('rate', 140)
    else:
        for v in voices:
            name = (v.name or '').lower()
            vid = (v.id or '').lower()
            if 'english' in name or 'en_' in vid or 'en-' in vid:
                engine.setProperty('voice', v.id)
                break
        engine.setProperty('rate', 130)

    engine.save_to_file(text, out_path)
    engine.runAndWait()
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
`;

    await writeFile(scriptPath, pythonScript);

    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    await new Promise((resolve, reject) => {
      const child = spawn(pythonCommand, [scriptPath, cleanText, language, outFile]);
      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d.toString(); });
      child.on('close', (code) => {
        if (code === 0) return resolve();
        reject(new Error(stderr || 'pyttsx3 failed'));
      });
      child.on('error', (err) => reject(err));
    });

    const audioBuffer = await readFile(outFile);

    // Cleanup
    await unlink(outFile).catch(() => {});
    await unlink(scriptPath).catch(() => {});

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return Response.json({
      error: 'Failed to generate speech',
      details: error.message,
      type: error.name
    }, { status: 500 });
  }
}
