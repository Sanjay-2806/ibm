const { create } = require("zustand");
import { modelConfig } from "@/config/models";

export const teachers = ["Nanami", "Naoki"];

export const useAITeacher = create((set, get) => ({
  messages: [],
  currentMessage: null,
  teacher: teachers[0],
  setTeacher: (teacher) => {
    set(() => ({
      teacher,
      messages: get().messages.map((message) => {
        message.audioPlayer = null; // New teacher, new Voice
        return message;
      }),
    }));
  },
  classroom: "default",
  setClassroom: (classroom) => {
    set(() => ({
      classroom,
    }));
  },
  loading: false,
  furigana: true,
  setFurigana: (furigana) => {
    set(() => ({
      furigana,
    }));
  },
  english: true,
  setEnglish: (english) => {
    set(() => ({
      english,
    }));
  },
  speech: "formal",
  setSpeech: (speech) => {
    set(() => ({
      speech,
    }));
  },
  signLanguageText: "",
  setSignLanguageText: (text) => {
    console.log("Setting signLanguageText in store:", text);
    set(() => ({
      signLanguageText: text,
    }));
  },
  addSignLanguageMessage: async (text) => {
    if (!text) {
      return;
    }
    const message = {
      question: "[Sign Language Input]",
      id: get().messages.length,
      answer: {
        english: text,
        japanese: [{ word: text }],
        grammarBreakdown: []
      },
      speech: "conversation",
      isSignLanguage: true
    };
    
    set((state) => ({
      messages: [...state.messages, message],
    }));

    // Play TTS for sign language message
    get().playSignLanguageMessage(message);
  },
  generateSignLanguageSuggestions: async (message) => {
    try {
      // Call Gemini to generate sign language suggestions
      const res = await fetch('/api/gemini-sign-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.answer.english,
          language: get().english ? 'en' : 'ta'
        }),
      });
      
      const data = await res.json();
      
      // Add sign language suggestions to the message
      message.signLanguageSuggestion = data.suggestion;
    } catch (error) {
      console.error('Error generating sign language suggestions:', error);
    }
  },
  playSignLanguageMessage: async (message) => {
    try {
      set(() => ({
        currentMessage: message,
        loading: true,
      }));

      // Call TTS API (returns MP3 bytes)
      const response = await fetch('/api/lovo-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.answer.english
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error('Failed to generate speech: ' + errText);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audioPlayer = new Audio(url);
      message.audioPlayer = audioPlayer;
      message.audioPlayer.onended = () => {
        set(() => ({
          currentMessage: null,
        }));
        URL.revokeObjectURL(url);
      };

      set(() => ({
        loading: false,
        messages: get().messages.map((m) => {
          if (m.id === message.id) {
            return message;
          }
          return m;
        }),
      }));

      audioPlayer.play();
    } catch (error) {
      console.error('Error playing sign language TTS:', error);
      set(() => ({
        loading: false,
        currentMessage: null,
      }));
    }
  },
  askAI: async (question) => {
    if (!question) {
      return;
    }
    const message = {
      question,
      id: get().messages.length,
    };
    set(() => ({
      loading: true,
    }));

    const speech = get().speech;

    // Ask AI
    const res = await fetch(`/api/ai?question=${question}&speech=${speech}`);
    const data = await res.json();
    message.answer = data;
    message.speech = speech;

    set(() => ({
      currentMessage: message,
    }));

    set((state) => ({
      messages: [...state.messages, message],
      loading: false,
    }));
    
    // Also generate sign language suggestions for this message
    get().generateSignLanguageSuggestions(message);
    
    get().playMessage(message);
  },
  playMessage: async (message) => {
    set(() => ({
      currentMessage: message,
    }));

    if (!message.audioPlayer) {
      set(() => ({
        loading: true,
      }));
      
      // Get teacher voice name from config
      const teacherConfig = modelConfig.teachers[get().teacher];
      const voiceName = teacherConfig?.voiceName || get().teacher;
      
      // Get TTS - use the English text for sign language instructions
      const textToSpeak = message.answer.english || message.answer.signLanguageInstruction || '';
      const audioRes = await fetch(
        `/api/lovo-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textToSpeak,
            language: get().english ? 'en' : 'ta'
          }),
        }
      );
      if (!audioRes.ok) {
        const errText = await audioRes.text().catch(() => '');
        console.error('TTS failed:', errText);
        set(() => ({ loading: false, currentMessage: null }));
        return;
      }
      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioPlayer = new Audio(audioUrl);

      message.audioPlayer = audioPlayer;
      message.audioPlayer.onended = () => {
        set(() => ({
          currentMessage: null,
        }));
      };
      set(() => ({
        loading: false,
        messages: get().messages.map((m) => {
          if (m.id === message.id) {
            return message;
          }
          return m;
        }),
      }));
    }

    message.audioPlayer.currentTime = 0;
    message.audioPlayer.play();
  },
  stopMessage: (message) => {
    message.audioPlayer.pause();
    set(() => ({
      currentMessage: null,
    }));
  },
}));