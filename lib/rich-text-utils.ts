/**
 * Utility functions for handling RichTextField content from Django backend
 */

export function getRichTextContent(data: string | null | undefined): string {
  if (!data) return '';
  
  let content = data;
  
  // Decode HTML entities to render proper text
  if (content && content.includes('&')) {
    content = content
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™');
  }
  
  // Remove HTML tags for plain text display
  content = content.replace(/<[^>]*>/g, '');
  
  return content;
}

export function getRichTextHTML(data: string | null | undefined): { __html: string } {
  let content = data || '';
  
  // Decode HTML entities to render proper HTML
  if (content && content.includes('&')) {
    content = content
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™');
  }
  
  return { __html: content };
}