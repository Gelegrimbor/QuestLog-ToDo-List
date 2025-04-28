import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock browser globals
global.document = window.document;
global.window = window;
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
};