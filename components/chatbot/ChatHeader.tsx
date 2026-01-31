'use client';

export function ChatHeader() {
  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 relative">
      <div className="flex items-center gap-4">
        {/* Avatar del bot */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#993331] flex items-center justify-center shadow-md">
            <svg
              className="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Casco de Samurai (Kabuto) */}
              <path d="M12 2L3 6v4c0 1.5.5 3 1.5 4.5L12 22l7.5-7.5C20.5 13 21 11.5 21 10V6l-9-4z" />
              <path d="M12 2v6M8 8l4-2 4 2M6 10l6 4 6-4" opacity="0.7" />
            </svg>
          </div>
          {/* Indicador en línea */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* Información del bot */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#993331]">
                Sensei AI
              </h1>
              <span 
                className="text-sm font-bold text-[#993331]" 
                style={{ 
                  writingMode: 'vertical-rl', 
                  textOrientation: 'upright',
                  letterSpacing: '0.25em',
                  lineHeight: '1'
                }}
              >
                先生
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Tu asistente de japonés</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Badge de estado */}
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          En línea
        </span>
        
        {/* Botón de menú */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" style={{ marginLeft: '-140px' }} />
    </header>
  );
}
