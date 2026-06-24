import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Dynamically resolves, merges, and overrides Tailwind CSS class names.
 * Leverages clsx for conditional class resolution and tailwind-merge to clean up conflicting utility classes.
 *
 * @param {...ClassValue[]} inputs - Arrays, objects, strings, or boolean values of class names.
 * @returns {string} The resolved space-separated string of className modifiers.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
