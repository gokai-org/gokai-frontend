import type { ChatMessage } from "@/features/chatbot/types";

export const initialMockMessages: ChatMessage[] = [
  {
    id: "1",
    role: "bot",
    content:
      "Practiquemos los saludos básicos.\n\nおはよう (Ohayō) → Buenos días.\n¿Quieres intentar escribirlo o pronunciarlo?",
    timestamp: new Date("2026-01-31T09:25:00"),
  },
  {
    id: "2",
    role: "user",
    content: "Audio de práctica",
    audioUrl: "/audio/sample.mp3",
    audioDuration: "00:02",
    timestamp: new Date("2026-01-31T11:30:00"),
  },
  {
    id: "3",
    role: "bot",
    content:
      "¡Muy bien! 👍\nPequeño ajuste: pronuncia la vocal larga con más duración.\n\nIntenta ahora la versión formal:\nはじめまして (Hajimemashite)",
    timestamp: new Date("2026-01-31T12:58:00"),
  },
];

export const mockBotReplies = [
  "¡Bien hecho! Seguimos con la siguiente práctica. 😊",
  "Muy bien. Intenta repetirlo con una pronunciación un poco más natural.",
  "Correcto. Ahora prueba usarlo en una frase corta.",
  "Buen avance. También puedes practicar la versión formal.",
  "Vas muy bien. ¿Quieres continuar con vocabulario relacionado?",
];
