/**
 * Document exporters: convert markdown content to various formats and trigger download.
 */

export type DocumentFormat = 'md' | 'html' | 'pdf' | 'txt';

export const DOCUMENT_CATEGORIES = [
  'docs',
  'copy',
  'criativos',
  'trafego-google',
  'trafego-meta',
  'social',
  'seo',
  'crm',
  'automacao',
  'cro',
  'dados',
  'video',
  'web',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

/**
 * Sanitizes a string to be safe as a filename.
 */
export function safeFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Triggers a browser download of the given content.
 */
function download(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export markdown content as a .md file.
 */
export function exportMarkdown(content: string, filename: string): void {
  download(content, `${filename}.md`, 'text/markdown');
}

/**
 * Export content as plain text (.txt).
 */
export function exportText(content: string, filename: string): void {
  download(content, `${filename}.txt`, 'text/plain');
}

/**
 * Convert markdown to styled HTML and export.
 * Uses a minimal markdown-to-HTML conversion for simple cases.
 */
export function exportHTML(markdown: string, title: string, filename: string): void {
  const html = buildHTMLDocument(markdown, title);
  download(html, `${filename}.html`, 'text/html');
}

/**
 * Export as PDF using browser's native print-to-PDF (window.print()).
 * Opens a styled HTML preview in a new window and triggers print dialog.
 */
export function exportPDF(markdown: string, title: string): void {
  const html = buildHTMLDocument(markdown, title, true);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Permita popups para exportar como PDF');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  });
}

function buildHTMLDocument(markdown: string, title: string, forPrint = false): string {
  const body = simpleMarkdownToHTML(markdown);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 2em auto; padding: 1em; line-height: 1.6; color: #1a1a24; background: #fff; }
    h1 { font-size: 2em; color: #e63946; border-bottom: 2px solid #e63946; padding-bottom: 0.3em; margin-top: 0; }
    h2 { font-size: 1.5em; color: #1a1a24; border-bottom: 1px solid #ddd; padding-bottom: 0.2em; margin-top: 1.5em; }
    h3 { font-size: 1.2em; color: #333; margin-top: 1.2em; }
    p { margin: 0.8em 0; }
    ul, ol { margin: 0.8em 0; padding-left: 1.5em; }
    li { margin: 0.3em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.9em; }
    th, td { border: 1px solid #ddd; padding: 0.5em 0.7em; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    code { background: #f5f5f5; padding: 0.1em 0.3em; border-radius: 3px; font-family: 'SF Mono', Monaco, monospace; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 6px; overflow-x: auto; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 4px solid #e63946; margin: 1em 0; padding: 0.5em 1em; background: #faf5f6; color: #555; }
    a { color: #448aff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
    .footer { margin-top: 3em; padding-top: 1em; border-top: 1px solid #ddd; font-size: 0.8em; color: #888; text-align: center; }
    @media print {
      body { max-width: none; margin: 0; padding: 1cm; }
      .footer { position: fixed; bottom: 1cm; left: 0; right: 0; }
    }
  </style>
</head>
<body>
  ${body}
  <div class="footer">
    Gerado por V4 PIT WALL - Sistema de 16 Agentes de IA - ${new Date().toLocaleDateString('pt-BR')}
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Minimal markdown-to-HTML converter.
 * Handles headings, lists, tables, code blocks, bold/italic, links, blockquotes.
 */
function simpleMarkdownToHTML(md: string): string {
  let html = md;

  // Escape HTML first
  html = escapeHtml(html);

  // Code blocks (triple backticks)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => `<pre><code>${code.trim()}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold & italic
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');

  // Tables (basic GFM)
  html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (tableBlock) => {
    const lines = tableBlock.trim().split('\n');
    if (lines.length < 2) return tableBlock;
    const header = lines[0].split('|').map((c) => c.trim()).filter(Boolean);
    // skip separator line (index 1)
    const rows = lines.slice(2).map((l) => l.split('|').map((c) => c.trim()).filter(Boolean));
    let t = '<table><thead><tr>';
    header.forEach((h) => (t += `<th>${h}</th>`));
    t += '</tr></thead><tbody>';
    rows.forEach((r) => {
      t += '<tr>';
      r.forEach((c) => (t += `<td>${c}</td>`));
      t += '</tr>';
    });
    t += '</tbody></table>';
    return t;
  });

  // Unordered lists
  html = html.replace(/((?:^[-*] .+$\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map((l) => l.replace(/^[-*] /, ''));
    return '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map((l) => l.replace(/^\d+\. /, ''));
    return '<ol>' + items.map((i) => `<li>${i}</li>`).join('') + '</ol>';
  });

  // Paragraphs (lines that aren't wrapped in tags)
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h\d|ul|ol|pre|blockquote|table|hr)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}
