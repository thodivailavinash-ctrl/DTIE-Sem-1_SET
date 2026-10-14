import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom React hook for Voice-to-Text input using the browser's Web Speech API (SpeechRecognition).
 * Works across modern Chrome, Edge, Safari, and other Chromium browsers.
 * Handles microphone permissions, real-time speech transcription, listening state, and fallbacks.
 *
 * @param {Object} options
 * @param {Function} options.onTranscript - Callback when a speech transcript chunk or final text is received
 * @param {string} [options.language='en-IN'] - BCP 47 language tag (default Indian English 'en-IN', also recognizes en-US)
 */
export function useVoiceInput({ onTranscript, language = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Capture phrase and finish cleanly
      recognition.interimResults = true; // Show interim words as user speaks
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          currentTranscript += item[0].transcript;
        }

        const trimmed = currentTranscript.trim();
        if (trimmed) {
          setTranscript(trimmed);
          if (typeof onTranscript === 'function') {
            onTranscript(trimmed);
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          toast.info('No speech detected. Please try speaking again.');
        } else if (event.error !== 'aborted') {
          toast.error(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup abort error
        }
      }
    };
  }, [language, onTranscript]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      // If already started, restart
      console.warn('Recognition start caught error, retrying:', err.message);
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 150);
      } catch (retryErr) {
        // ignore
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
}
