/**
 * Jason LTL Mandatory Rate Markup Engine
 * 
 * Rules:
 * - If original rate < $100 -> add random $50–70 (customer sees ~$150–170)
 * - If original rate < $500 -> add random $70–90 (customer sees ~$570–590)
 * - If original rate < $1000 -> add random $100–150
 * - If original rate < $2000 -> add random $200–300
 * - If original rate > $2600 -> add $400 (and scale similarly for higher)
 * 
 * NOTE: Markup is applied strictly server-side. Original rates are NEVER transmitted to frontend.
 */

// Simple deterministic hash for stable pricing per quoteToken + carrier
function getDeterministicRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positive = Math.abs(hash);
  return (positive % 1000) / 1000;
}

export function calculateMarkup(originalRate: number, seed?: string): number {
  const randFactor = seed ? getDeterministicRandom(seed) : Math.random();

  if (originalRate < 100) {
    // If original rate < $100 -> add random $50–70 (customer sees ~$150–170)
    const add = 50 + randFactor * (70 - 50);
    return Math.round(add * 100) / 100;
  } else if (originalRate < 500) {
    // If original rate < $500 -> add random $70–90 (customer sees ~$570–590)
    const add = 70 + randFactor * (90 - 70);
    return Math.round(add * 100) / 100;
  } else if (originalRate < 1000) {
    // If original rate < $1000 -> add random $100–150 (customer sees ~$1100–1500)
    const add = 100 + randFactor * (150 - 100);
    return Math.round(add * 100) / 100;
  } else if (originalRate < 2000) {
    // If original rate < $2000 -> add random $200–300 (customer sees ~$2200–2300)
    const add = 200 + randFactor * (300 - 200);
    return Math.round(add * 100) / 100;
  } else if (originalRate < 2600) {
    // If original rate between $2000 and $2600 -> add $300–400
    const add = 300 + randFactor * (400 - 300);
    return Math.round(add * 100) / 100;
  } else {
    // If original rate >= $2600 -> add $400 (customer sees $3000+)
    return 400.0;
  }
}

export function applyRateMarkup(originalRate: number, seedKey?: string): number {
  const markup = calculateMarkup(originalRate, seedKey);
  const markedUp = originalRate + markup;
  return Math.round(markedUp * 100) / 100;
}
