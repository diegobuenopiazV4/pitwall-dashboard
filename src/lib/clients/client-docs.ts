/**
 * Sistema de documentos do cliente.
 * Upload para Supabase Storage + leitura automatica para injetar no system prompt.
 * Bucket: client-docs/{userId}/{clientId}/{filename}
 */

import { supabase } from '../supabase/client';
import type { Client } from '../agents/types';

export interface ClientDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  url?: string;
  content?: string; // Extracted text (for short docs)
  createdAt: string;
}

const BUCKET = 'client-docs';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONTENT_LENGTH = 3000; // chars to inject in prompt

/**
 * Upload de documento para Supabase Storage.
 */
export async function uploadClientDoc(
  userId: string,
  clientId: string,
  file: File
): Promise<ClientDoc | null> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo ${file.name} excede ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const path = `${userId}/${clientId}/${Date.now()}-${file.name}`;

  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.warn('[client-docs] Upload error (offline mode?):', error.message);
      // Return in-memory stub
      const text = await tryExtractText(file);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        path,
        content: text,
        createdAt: new Date().toISOString(),
      };
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const text = await tryExtractText(file);

    return {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      path,
      url: urlData?.publicUrl,
      content: text,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[client-docs] Upload failed, using memory:', err);
    const text = await tryExtractText(file);
    return {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      path,
      content: text,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Lista documentos de um cliente.
 */
export async function listClientDocs(userId: string, clientId: string): Promise<ClientDoc[]> {
  try {
    const prefix = `${userId}/${clientId}`;
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 100 });

    if (error || !data) return [];

    return data.map((file) => {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`${prefix}/${file.name}`);
      return {
        id: file.id ?? crypto.randomUUID(),
        name: file.name,
        type: file.metadata?.mimetype ?? 'application/octet-stream',
        size: file.metadata?.size ?? 0,
        path: `${prefix}/${file.name}`,
        url: urlData?.publicUrl,
        createdAt: file.created_at ?? new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Download + extract text do doc (para injecao no prompt).
 */
export async function readDocContent(doc: ClientDoc): Promise<string> {
  if (doc.content) return doc.content.slice(0, MAX_CONTENT_LENGTH);
  if (!doc.url) return '';

  try {
    const res = await fetch(doc.url);
    if (!res.ok) return '';

    const isText =
      doc.type.startsWith('text/') ||
      doc.type === 'application/json' ||
      doc.name.endsWith('.md') ||
      doc.name.endsWith('.csv') ||
      doc.name.endsWith('.txt');

    if (isText) {
      const text = await res.text();
      return text.slice(0, MAX_CONTENT_LENGTH);
    }

    // PDF / DOCX: server-side processing ideal, mas sem isso retornamos placeholder
    return `[Documento ${doc.name} anexado, ${doc.type}. Conteudo binario requer processamento server-side.]`;
  } catch {
    return '';
  }
}

/**
 * Extrair texto de um arquivo diretamente (client-side).
 */
async function tryExtractText(file: File): Promise<string> {
  const isText =
    file.type.startsWith('text/') ||
    file.type === 'application/json' ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.txt');

  if (isText) {
    try {
      const text = await file.text();
      return text.slice(0, MAX_CONTENT_LENGTH);
    } catch {
      return '';
    }
  }

  return '';
}

/**
 * Deletar documento.
 */
export async function deleteClientDoc(doc: ClientDoc): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([doc.path]);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Gera bloco de contexto dos documentos do cliente para injetar no system prompt.
 */
export async function buildClientDocsContext(docs: ClientDoc[]): Promise<string> {
  if (docs.length === 0) return '';

  const parts: string[] = [`\n## DOCUMENTOS DO CLIENTE (${docs.length})\n`];

  for (const doc of docs.slice(0, 5)) {
    // Max 5 docs para nao estourar tokens
    const content = await readDocContent(doc);
    if (content) {
      parts.push(`### ${doc.name}\n${content}\n`);
    } else {
      parts.push(`### ${doc.name} (${doc.type}, ${Math.round(doc.size / 1024)}KB)`);
    }
  }

  return parts.join('\n');
}
