import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMarkdownBold(text: string): string {
  // First convert bold text
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Then convert bullet points
  formatted = formatted.replace(/^\* /gm, '• ');
  formatted = formatted.replace(/^    \* /gm, '    • ');
  
  return formatted;
}
