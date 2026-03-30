import { useEffect, useRef, useState } from "react";
import { useAITeacher } from "@/hooks/useAITeacher";

export const CVCamera = ({ onSignLanguageResult }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureIntervalRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setError(null);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied or not available");
        setIsStreaming(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  // Keyboard control for capturing with 'B' key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (isCapturing) {
          stopCapturing();
        } else if (isStreaming) {
          startCapturing();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isCapturing, isStreaming]);

  const startCapturing = () => {
    if (!isStreaming) return;
    
    console.log('Starting continuous sign capture...');
    setIsCapturing(true);
    

    captureIntervalRef.current = setInterval(async () => {
      await captureAndProcessFrame();
    }, 3000);
  };

  const stopCapturing = () => {
    console.log('Stopping sign capture...');
    setIsCapturing(false);
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const captureAndProcessFrame = async () => {
    if (!videoRef.current || isProcessing) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!canvas || !video.videoWidth) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const frameData = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = frameData.split(',')[1];
      
      console.log('Captured frame, processing...');
      
      // Process with Gemini
      await processFrameWithGemini(base64Data);
      
    } catch (err) {
      console.error('Error capturing frame:', err);
    }
  };

  const processFrameWithGemini = async (frameData) => {
    try {
      setIsProcessing(true);
      
      // Get current language setting
      const english = useAITeacher.getState().english;
      const currentLanguage = english ? 'en' : 'ta';
      
      const response = await fetch('/api/gemini-sign-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frames: [{
            frameNumber: 0,
            timestamp: Date.now(),
            data: frameData
          }],
          sessionId: new Date().toISOString().replace(/[:.]/g, '-'),
          language: currentLanguage
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Gemini API response:", result);
        if (result.text && onSignLanguageResult) {
          console.log("Detected sign:", result.text);
          onSignLanguageResult(result.text);
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
      }
    } catch (err) {
      console.error("Error processing frame with Gemini:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed top-20 right-12 z-50 bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/20">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-bold">Sign Language Camera</h3>
        <div className="flex gap-1">
          {isCapturing && (
            <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded animate-pulse">
              Capturing Signs...
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 rounded flex flex-col items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <p className="text-white text-xs font-bold text-center">Analyzing sign...</p>
          </div>
        )}
        {error ? (
          <div className="w-48 h-36 bg-gray-800 rounded flex items-center justify-center">
            <p className="text-red-400 text-xs text-center">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-48 h-36 object-cover rounded"
            />
            {isStreaming && (
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isCapturing ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <span className={`text-xs ${
                  isCapturing ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {isCapturing ? 'Capturing' : 'Live'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
