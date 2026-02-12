'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/features/chatbot/types';
import { MessageBubble } from '@/features/chatbot/components/MessageBubble';
import { ChatInput } from '@/features/chatbot/components/ChatInput';
import { ChatHeader } from '@/features/chatbot/components/ChatHeader';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Practiquemos los saludos básicos.\nPrimero.\nRyo (Chico) → Buenos días\n¿Puedes repetirlo? ✏️',
      timestamp: new Date('2026-01-31T09:25:00'),
    },
    {
      id: '2',
      role: 'user',
      content: 'Audio de práctica',
      audioUrl: '/audio/sample.mp3',
      audioDuration: '00:02',
      timestamp: new Date('2026-01-31T11:30:00'),
    },
    {
      id: '3',
      role: 'bot',
      content: 'Muy bien! 👍\nPequeño ajuste: pronuncia como "oya yo" con la "o"\n\nIntenta 2 → (Chica) : Buena una vocal larga: あ → ō\n¿Quieres intentar la versión formal?',
      timestamp: new Date('2026-01-31T12:58:00'),
    },
    {
      id: '4',
      role: 'user',
      content: 'Audio de práctica',
      audioUrl: '/audio/sample.mp3',
      audioDuration: '00:01',
      timestamp: new Date('2026-01-31T15:30:00'),
    },
    {
      id: '5',
      role: 'bot',
      content: 'La versión formal es:\n始めまして (Hajimemashite)\nSignifica "Muy buenas días"\n¿Quieres repetir tú? ✏️',
      timestamp: new Date('2026-01-31T12:58:00'),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    // Simular respuesta del bot
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '¡Excelente! Sigue practicando. 😊',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    
    // Simular grabación
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const audioMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: 'Audio grabado',
          audioUrl: '/audio/sample.mp3',
          audioDuration: '00:03',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, audioMessage]);
      }, 3000);
    }
  };

  return (
    <DashboardShell
      header={<ChatHeader />}
      useContainer={false}
      contentClassName="p-6"
      footer={
        <ChatInput
          onSendMessage={handleSendMessage}
          onStartRecording={handleStartRecording}
          isRecording={isRecording}
          disabled={isLoading}
        />
      }
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

    </DashboardShell>
  );
}
