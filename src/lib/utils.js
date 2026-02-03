// Simple utility to merge class names, similar to shadcn's `cn`.
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

