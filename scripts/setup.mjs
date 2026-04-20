#!/usr/bin/env node
/**
 * Script de setup interativo para V4 PIT WALL Dashboard.
 * Gera .env.local, valida conexoes e instrui proximos passos.
 *
 * Uso: node scripts/setup.mjs
 */

import readline from 'node:readline';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const envFile = join(projectRoot, '.env.local');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const color = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

console.log(`
${color.red(color.bold('╔════════════════════════════════════════╗'))}
${color.red(color.bold('║     V4 PIT WALL - Setup Interativo     ║'))}
${color.red(color.bold('╚════════════════════════════════════════╝'))}

Este script vai ajudar voce a configurar o dashboard.
Voce precisa de:

  1. Conta Supabase (${color.blue('https://supabase.com')})
  2. Gemini API Key (${color.blue('https://ai.google.dev')})

Pressione Ctrl+C a qualquer momento para cancelar.
`);

async function main() {
  // Check if .env.local already exists
  if (existsSync(envFile)) {
    const overwrite = await ask(color.yellow('\n[!] .env.local ja existe. Sobrescrever? (y/N): '));
    if (overwrite.toLowerCase() !== 'y') {
      console.log(color.blue('\nSetup cancelado. Edite .env.local manualmente.'));
      rl.close();
      return;
    }
  }

  console.log(color.bold('\n=== Supabase ===\n'));
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Crie um novo projeto (se ainda nao tem)');
  console.log('3. Em Settings > API copie URL e anon key');

  const supabaseUrl = await ask(color.green('\nSupabase URL (https://xxx.supabase.co): '));
  const supabaseAnonKey = await ask(color.green('Supabase Anon Key (eyJ...): '));

  console.log(color.bold('\n=== Gemini API ===\n'));
  console.log('1. Acesse https://ai.google.dev');
  console.log('2. Get API Key');
  console.log('3. Create API key (num projeto Google Cloud)');

  const geminiKey = await ask(color.green('\nGemini API Key (AIza...): '));

  // Write .env.local
  const envContent = `# V4 PIT WALL - Environment Variables
# Gerado por scripts/setup.mjs em ${new Date().toISOString()}

VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}
VITE_GEMINI_API_KEY=${geminiKey.trim()}

# Opcional: para Edge Functions (server-side)
GEMINI_API_KEY=${geminiKey.trim()}
`;

  writeFileSync(envFile, envContent, 'utf-8');
  console.log(color.green(`\n[OK] .env.local criado em ${envFile}`));

  // Next steps
  console.log(color.bold('\n=== Proximos Passos ===\n'));
  console.log(color.blue('1. Execute as migrations do banco:'));
  console.log('   - Abra Supabase Dashboard > SQL Editor');
  console.log('   - Cole e execute: supabase/migrations/001_initial_schema.sql');
  console.log('   - Cole e execute: supabase/migrations/002_seed_agents.sql');
  console.log(color.blue('\n2. Habilite Auth Email:'));
  console.log('   - Authentication > Providers > Email (on)');
  console.log(color.blue('\n3. Rode o dashboard:'));
  console.log('   npm run dev');
  console.log(color.blue('\n4. Para deploy: leia docs/DEPLOY.md\n'));

  rl.close();
}

main().catch((err) => {
  console.error(color.red('\n[ERRO]'), err.message);
  rl.close();
  process.exit(1);
});
