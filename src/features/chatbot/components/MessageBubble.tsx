"use client";

import type { ChatMessage } from "@/features/chatbot/types";
import { AudioPlayer } from "./AudioPlayer";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.role === "bot";
  const isAudio = Boolean(message.audioUrl && message.audioDuration);

  return (
    <div className={`mb-4 flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div className="max-w-[88%] sm:max-w-[74%]">
        {isBot && (
          <div className="mb-2 inline-flex rounded-full bg-[#993331] px-3 py-1 text-[11px] font-extrabold tracking-wide text-white">
            SEN
          </div>
        )}

        <div
          className={[
            "shadow-sm transition-all duration-300",
            isAudio
              ? [
                  "rounded-[28px] px-4 py-3",
                  isBot
                    ? "border border-gray-100 bg-white text-gray-800"
                    : "bg-gradient-to-br from-[#993331] to-[#7f2a28] text-white",
                ].join(" ")
              : [
                  "rounded-[26px] px-4 py-3.5",
                  isBot
                    ? "border border-gray-100 bg-white text-gray-800"
                    : "bg-gradient-to-br from-[#993331] to-[#7f2a28] text-white",
                ].join(" "),
          ].join(" ")}
        >
          {isAudio ? (
              <div className="w-[260px] max-w-full sm:w-[320px]">
                <AudioPlayer
                audioUrl={message.audioUrl || ""}
                duration={message.audioDuration || "00:00"}
                isUserMessage={!isBot}
                waveform={message.waveform}
              />

              <div
                className={`mt-2 text-[11px] font-medium ${
                  isBot ? "text-gray-400" : "text-white/78"
                }`}
              >
                {message.timestamp.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-[14px] leading-6 sm:text-[15px]">
                {message.content}
              </p>

              <div
                className={`mt-2 text-[11px] font-medium ${
                  isBot ? "text-gray-400" : "text-white/75"
                }`}
              >
                {message.timestamp.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}