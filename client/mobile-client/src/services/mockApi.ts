import { MOCK_DELAY } from '@/src/lib/constants';

export function delay(ms?: number): Promise<void> {
  const resolved =
    ms ?? Math.floor(Math.random() * (MOCK_DELAY.max - MOCK_DELAY.min + 1)) + MOCK_DELAY.min;
  return new Promise((resolve) => setTimeout(resolve, resolved));
}

export async function simulateError(chance = 0.02): Promise<void> {
  if (Math.random() < chance) {
    await delay(300);
    throw new Error('Mock network error. Please try again.');
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
