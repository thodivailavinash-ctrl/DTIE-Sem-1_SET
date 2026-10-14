import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

/**
 * Modern fintech voice input button designed to fit snugly inside description inputs.
 * Shows glowing cyan/red ripple animation while actively listening.
 */
export default function VoiceInputButton({
  isListening = false,
  isSupported = true,
  onClick,
  title = 'Click to speak transaction description',
  className = ''
}) {
  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={isListening ? 'Listening... Click to stop' : title}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      className={`relative p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
        isListening
          ? 'bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/50 shadow-[0_0_15px_rgba(251,113,133,0.5)] animate-pulse'
          : 'text-[#94A3B8] hover:text-[#22D3EE] hover:bg-[#22D3EE]/10 active:scale-95'
      } ${className}`}
    >
      {isListening ? (
        <>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FB7185] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FB7185]"></span>
          </span>
          <Mic className="w-4 h-4 animate-bounce" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
