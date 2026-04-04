"use client";

import React from "react";

type Props = {
  code: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onInput: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function VerificationCodeInputs({
  code,
  inputRefs,
  onInput,
  onKeyDown,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={digit}
          onChange={(e) => onInput(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          inputMode="numeric"
          maxLength={1}
          className="h-12 w-12 rounded-xl border border-border-default bg-surface-primary text-center text-lg font-semibold text-content-primary outline-none transition placeholder:text-content-muted focus:border-red-300 focus:ring-4 focus:ring-red-100"
        />
      ))}
    </div>
  );
}
