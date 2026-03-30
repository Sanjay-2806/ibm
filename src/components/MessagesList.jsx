import { useAITeacher } from "@/hooks/useAITeacher";
import { useEffect, useRef, useState } from "react";

export const MessagesList = () => {
  const messages = useAITeacher((state) => state.messages);
  const playMessage = useAITeacher((state) => state.playMessage);
  const { currentMessage } = useAITeacher();
  const english = useAITeacher((state) => state.english);
  const furigana = useAITeacher((state) => state.furigana);
  const classroom = useAITeacher((state) => state.classroom);

  const container = useRef();
  const [playingSign, setPlayingSign] = useState(null);
  const audioRef = useRef(null);

  // Function to play sign language audio
  const playSignLanguageAudio = async (text, messageId) => {
    if (playingSign === messageId) {
      // Stop if already playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingSign(null);
      return;
    }
    setPlayingSign(messageId);
    try {
      const response = await fetch('/api/lovo-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: english ? 'en' : 'ta'
        }),
      });
      if (response.ok) {
        const audio = new Audio();
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audio.src = url;
        audioRef.current = audio;
        audio.onended = () => {
          setPlayingSign(null);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } else {
        setPlayingSign(null);
        console.error('Failed to generate audio');
      }
    } catch (error) {
      setPlayingSign(null);
      console.error('Error playing audio:', error);
    }
  };

  useEffect(() => {
    container.current.scrollTo({
      top: container.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const renderEnglish = (englishText) => (
    <>
      {english && (
        <p className="text-4xl inline-block px-2 rounded-sm font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-300/90 to-white/90">
          {englishText}
        </p>
      )}
    </>
  );

  const renderJapanese = (japanese) => (
    <p className="text-white font-bold text-4xl mt-2 font-jp flex flex-wrap gap-1">
      {japanese.map((word, i) => (
        <span key={i} className="flex flex-col justify-end items-center">
          {furigana && word.reading && (
            <span className="text-2xl text-white/65">{word.reading}</span>
          )}
          {word.word}
        </span>
      ))}
    </p>
  );

  return (
    <div
      className={`${
        classroom === "default"
          ? "w-[1288px] h-[676px]"
          : "w-[2528px] h-[856px]"
      } p-8 overflow-y-auto flex flex-col space-y-8 bg-transparent opacity-80 relative`}
      ref={container}
    >
      {messages.length === 0 && (
        <div className="h-full w-full grid place-content-center text-center">
          <h2 className="text-8xl font-bold text-white/90 italic">
            <br />
            Bridge Talk
          </h2>
          <h3 className="text-8xl font-bold font-jp text-white-600/90 italic">
            AI powered sign language translator
          </h3>
        </div>
      )}
      {messages.map((message, i) => (
        <div key={i}>
          <div className="flex">
            <div className="flex-grow">
              <div className="flex items-center gap-3">
                {message.isSignLanguage ? (
                  <p className="text-4xl inline-block px-2 rounded-sm font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-300/90 to-white/90">
                    {message.answer.english}
                  </p>
                ) : (
                  <>
                    <span
                      className={`text-white/90 text-2xl font-bold uppercase px-3 py-1 rounded-full  ${
                        message.speech === "formal"
                          ? "bg-indigo-600"
                          : "bg-teal-600"
                      }`}
                    >
                      {message.speech}
                    </span>
                    {renderEnglish(message.answer.english)}
                  </>
                )}
              </div>

              {!message.isSignLanguage && message.answer.signLanguageEmoji && (
                <div className="mt-3 p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                  <p className="text-purple-200 text-sm font-bold mb-2">Sign Language:</p>
                  <p className="text-purple-100 text-6xl mb-3 text-center">{message.answer.signLanguageEmoji}</p>
                  {message.answer.signLanguageInstruction && (
                    <p className="text-purple-200 text-sm text-center italic">{message.answer.signLanguageInstruction}</p>
                  )}
                </div>
              )}
            </div>
            {!message.isSignLanguage && currentMessage === message ? (
              <button
                className="text-white/65"
                onClick={() => stopMessage(message)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                  />
                </svg>
              </button>
            ) : !message.isSignLanguage ? (
              <button
                className="text-white/65"
                onClick={() => playMessage(message)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  />
                </svg>
              </button>
            ) : null}
          </div>
          {message.isSignLanguage && (
            <div className="flex justify-end mt-3">
              <button
                className="text-white/65 hover:text-white transition-colors"
                onClick={() => playSignLanguageAudio(message.answer.english, message.id)}
                title="Play audio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
