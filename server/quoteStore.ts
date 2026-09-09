import fs from 'fs';
import path from 'path';
import { QuoteResult } from '../src/types.js';
import { CONFIG } from './config.js';

const STORE_FILE = path.resolve(CONFIG.STORAGE_DIR, 'quotes-cache.json');
const memoryQuotes: Map<string, QuoteResult> = new Map();

// Initialize from file if exists
try {
  if (fs.existsSync(STORE_FILE)) {
    const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    if (Array.isArray(data)) {
      data.forEach((q) => memoryQuotes.set(q.quoteToken, q));
    }
  }
} catch {
  // ignore cache load errors
}

function persistStore() {
  try {
    const list = Array.from(memoryQuotes.values()).slice(-200); // keep last 200
    fs.writeFileSync(STORE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export function saveQuote(quote: QuoteResult): void {
  memoryQuotes.set(quote.quoteToken, quote);
  persistStore();
}

export function getQuote(token: string): QuoteResult | null {
  if (typeof token !== 'string' || !token) return null;
  const inMemory = memoryQuotes.get(token);
  if (inMemory) return inMemory;

  // Fallback: reload from disk cache in case written by another worker/process
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        for (const q of data) {
          if (q && q.quoteToken) {
            memoryQuotes.set(q.quoteToken, q);
          }
        }
      }
    }
  } catch {
    // ignore read error
  }

  return memoryQuotes.get(token) || null;
}

export function updateQuoteStatus(token: string, status: 'active' | 'expired' | 'booked'): boolean {
  const quote = memoryQuotes.get(token);
  if (!quote) return false;
  quote.status = status;
  memoryQuotes.set(token, quote);
  persistStore();
  return true;
}

export function generateToken(): string {
  const prefix = 'JLT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${rand}`;
}
