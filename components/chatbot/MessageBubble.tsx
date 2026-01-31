'use client';

import { ChatMessage } from '@/types/chatbot';
import { AudioPlayer } from './AudioPlayer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.role === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[70%] ${isBot ? 'items-start' : 'items-end'}`}>
        {isBot && (
          <div className="inline-block px-3 py-1 bg-[#993331] rounded-full text-white font-bold text-xs mb-2">
            SEN
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-white text-gray-800 shadow-sm'
              : 'bg-[#993331] text-white'
          }`}
        >
          {message.content.type === 'text' ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content.text}
            </p>
          ) : (
            <AudioPlayer
              audioUrl={message.content.audioUrl || ''}
              duration={message.content.audioDuration || '00:00'}
              isUserMessage={!isBot}
            />
          )}
          
          <div
            className={`text-xs mt-2 ${
              isBot ? 'text-gray-400' : 'text-white/80'
            }`}
          >
            {message.timestamp.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
