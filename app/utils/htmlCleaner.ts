/**
 * Utility function to clean HTML tags and entities from content
 */

export function cleanHtmlContent(content: string): string {
  if (!content || typeof content !== 'string') return content;
  
  return content
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    // Clean up extra whitespace
    .trim();
}

export function cleanContentObject<T extends Record<string, any>>(content: T): T {
  if (!content || typeof content !== 'object') return content;
  
  const cleaned = { ...content } as any;
  
  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === 'string') {
      cleaned[key] = cleanHtmlContent(value);
    }
  }
  
  return cleaned;
}