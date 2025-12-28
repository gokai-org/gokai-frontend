"use client";

import { useEffect, useState } from "react";

type ErrorToastProps = {
  message: string;
  onClose?: () => void;
  duration?: number; // ms
};

export default function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-6 right-6 z-50 max-w-sm rounded-lg border border-red-200 bg-white shadow-lg"
    >
      <div className="flex items-start gap-3 p-4">
        <span aria-hidden="true" className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700">
          {/* Icono de alerta */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L14.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900">Ocurrió un problema</p>
          <p className="mt-0.5 text-sm text-neutral-700">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          aria-label="Cerrar"
          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
