"use client";

type Props = {
  onClick: () => void;
};

export function GoogleLoginButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
    >
      <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.3 0 6.3 1.2 8.6 3.2l6.4-6.4C34.8 2.5 29.7 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.7 6C12.3 13.6 17.7 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.4 6.9l7 5.4c4.1-3.8 7.1-9.4 7.1-16.8z"
        />
        <path
          fill="#FBBC05"
          d="M10.3 28.9c-1-2.9-1-6 0-8.9l-7.7-6C.9 17.4 0 20.6 0 24s.9 6.6 2.6 10l7.7-6z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7-5.4c-2 1.4-4.6 2.2-8.8 2.2-6.3 0-11.7-4.1-13.7-9.8l-7.7 6C6.6 42.6 14.6 48 24 48z"
        />
      </svg>

      <span className="transition-colors duration-200 group-hover:text-neutral-900">
        Continuar con Google
      </span>
    </button>
  );
}