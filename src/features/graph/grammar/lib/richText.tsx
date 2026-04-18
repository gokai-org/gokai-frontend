import type { ReactNode } from "react";

/**
 * Parses a string containing inline markup tokens and returns an array of
 * React nodes:
 *
 *  **word**  → bold emphasis  (calls more attention to a term)
 *  ++token++ → placeholder chip (e.g. S1, S2 in pattern sentences)
 *
 * Any other text is returned as a plain string fragment.
 */
export function parseRichText(text: string): ReactNode[] {
  // Matches **…** or ++…++ (non-greedy, single-line)
  const TOKEN_RE = /(\*\*(.+?)\*\*|\+\+(.+?)\+\+)/g;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    // Push the plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(
        <strong
          key={match.index}
          className="font-bold text-content-primary"
        >
          {match[2]}
        </strong>,
      );
    } else if (match[3] !== undefined) {
      // ++placeholder++
      nodes.push(
        <span
          key={match.index}
          className="inline-block rounded-md bg-accent/10 px-1.5 py-px text-[0.88em] font-bold tracking-wide text-accent"
        >
          {match[3]}
        </span>,
      );
    }

    lastIndex = TOKEN_RE.lastIndex;
  }

  // Remaining text after the last match
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * Drop-in replacement for plain text nodes that need rich inline formatting.
 * Renders inline (no wrapper element).
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  const nodes = parseRichText(text);

  // If there are no markup tokens, just return the string directly to avoid
  // creating an extra span element in the common case.
  if (nodes.length === 1 && typeof nodes[0] === "string") {
    return <>{nodes[0]}</>;
  }

  return <span className={className}>{nodes}</span>;
}
