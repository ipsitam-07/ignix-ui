import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { ThemeService } from '../../src/services/ThemeService';
import { loadConfig } from '../../src/utils/config';
import { logger } from '../../src/utils/logger';

vi.mock('axios');
vi.mock('fs-extra');
vi.mock('../../src/utils/config');
vi.mock('../../src/utils/logger');

const mockConfig = {
  themeUrl: 'https://example.com/themes.json',
  themesDir: 'src/themes',
};

const mockThemes = {
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    description: 'A dark theme',
    category: 'Basic',
    colors: { background: '#000' },
  },
  'neon-glow': {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'A neon theme',
    category: 'Vibrant',
    colors: { background: '#0f0' },
  },
};

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ThemeService();
    vi.mocked(loadConfig).mockResolvedValue(mockConfig as any);
  });

  describe('fetchThemes', () => {
    it('fetches and caches themes', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockThemes });

      const themes = await service.getAvailableThemes();
      expect(axios.get).toHaveBeenCalledWith(mockConfig.themeUrl);
      expect(themes).toHaveLength(2);

      await service.getAvailableThemes();
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('throws error when fetch fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));
      await expect(service.getAvailableThemes()).rejects.toThrow('Failed to fetch themes');
    });
  });

  describe('getThemeConfig', () => {
    it('returns theme details with mapped fields', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockThemes });
      const config = await service.getThemeConfig('dark');
      expect(config?.name).toBe('Dark Theme');
      expect(config?.id).toBe('dark');
      expect(config?.theme).toBeDefined();
    });

    it('returns undefined for non-existent theme', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockThemes });
      const config = await service.getThemeConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('install', () => {
    it('writes theme file with camelCase variable name', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockThemes });
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

      await service.install('neon-glow');

      expect(fs.ensureDir).toHaveBeenCalled();
      const expectedPath = path.resolve(mockConfig.themesDir, 'neon-glow.ts');

      const callArgs = vi.mocked(fs.writeFile).mock.calls[0];
      expect(callArgs[0]).toBe(expectedPath);
      expect(callArgs[1]).toContain('export const neonGlowTheme');
    });

    it('throws error if theme not found', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockThemes });
      await expect(service.install('unknown')).rejects.toThrow(
        "Theme preset 'unknown' not found in the registry."
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Theme preset 'unknown' not found in the registry."
      );
    });
  });
});
