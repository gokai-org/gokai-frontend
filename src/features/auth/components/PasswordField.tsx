"use client";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
};

export function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder = "Contraseña",
  autoComplete,
}: Props) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
        {label}
      </label>

      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
          required
          autoComplete={autoComplete}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={show ? "Ocultar" : "Mostrar"}
        >
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
              <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
              <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}