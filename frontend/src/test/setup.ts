import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
beforeEach(() => { localStorage.clear() })
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
}