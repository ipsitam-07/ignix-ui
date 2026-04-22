import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@antfu/ni', () => ({
  detect: vi.fn(),
}));

import { getPackageManager } from '../src/utils/getPackageManager';
import { detect } from '@antfu/ni';

describe('getPackageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns "pnpm" when detect() returns "pnpm"', async () => {
    vi.mocked(detect).mockResolvedValue('pnpm');
    const result = await getPackageManager();
    expect(result).toBe('pnpm');
  });

  it('returns "pnpm" when detect() returns "pnpm@6"', async () => {
    vi.mocked(detect).mockResolvedValue('pnpm@6');
    const result = await getPackageManager();
    expect(result).toBe('pnpm');
  });

  it('returns "yarn" when detect() returns "yarn@berry"', async () => {
    vi.mocked(detect).mockResolvedValue('yarn@berry');
    const result = await getPackageManager();
    expect(result).toBe('yarn');
  });

  it('returns "npm" as fallback when detect() returns null', async () => {
    vi.mocked(detect).mockResolvedValue(null as any);
    const result = await getPackageManager();
    expect(result).toBe('npm');
  });

  it('returns the detected value for other package managers like "bun"', async () => {
    vi.mocked(detect).mockResolvedValue('bun' as any);
    const result = await getPackageManager();
    expect(result).toBe('bun');
  });

  it('returns "npm" when detect() returns undefined', async () => {
    vi.mocked(detect).mockResolvedValue(undefined as any);
    const result = await getPackageManager();
    expect(result).toBe('npm');
  });
});
