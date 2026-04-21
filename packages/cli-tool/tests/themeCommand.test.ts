import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createThemesCommand } from '../src/commands/theme';
import { ThemeService } from '../src/services/ThemeService';
import { logger } from '../src/utils/logger';
import prompts from 'prompts';
import {
  setupTestMocks,
  resetTestState,
  runCommand,
  parseJsonOutput,
  exitCode,
  consoleOutput,
} from './helpers';

// --- Mocks ---
vi.mock('prompts');
vi.mock('../src/services/ThemeService');

// --- Helpers ---
const mockThemes = [
  { id: 'dark', name: 'Dark Theme', description: 'Deep dark theme' },
  { id: 'light', name: 'Light Theme', description: 'Bright light theme' },
];

setupTestMocks();

beforeEach(() => {
  resetTestState();

  vi.mocked(ThemeService).mockImplementation(
    () =>
      ({
        getAvailableThemes: vi.fn().mockResolvedValue(mockThemes),
        install: vi.fn().mockResolvedValue(undefined),
        getThemeConfig: vi.fn().mockResolvedValue({
          id: 'dark',
          name: 'Dark Theme',
          description: 'Deep dark theme',
          theme: { colors: { background: '#000' } },
        }),
        setSilent: vi.fn(),
      } as any)
  );
});

describe('theme command', () => {
  it('opens interactive menu and allows exit', async () => {
    vi.mocked(prompts).mockResolvedValue({ action: 'exit' });

    await runCommand(createThemesCommand, []);
    expect(logger.info).toHaveBeenCalledWith('Exiting theme manager.');
  });

  it('allows listing themes and returning to menu', async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'list' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createThemesCommand, []);

    const output = consoleOutput.join('\n');
    expect(output).toContain('Dark Theme');
    expect(output).toContain('Light Theme');
  });

  it('allows installing a theme', async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'install' })
      .mockResolvedValueOnce({ themeId: 'dark' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createThemesCommand, []);

    const themeServiceInstance = vi.mocked(ThemeService).mock.results[0].value;
    expect(themeServiceInstance.install).toHaveBeenCalledWith('dark');
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Theme dark installed'));
  });

  describe('machine-mode list', () => {
    it('outputs JSON list of themes', async () => {
      // themes --yes --json
      await runCommand(createThemesCommand, ['--yes', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.themes).toHaveLength(2);
    });

    it('outputs JSON error on service failure', async () => {
      vi.mocked(ThemeService).mockImplementation(
        () =>
          ({
            getAvailableThemes: vi.fn().mockRejectedValue(new Error('Service failure')),
            setSilent: vi.fn(),
          } as any)
      );

      await runCommand(createThemesCommand, ['--yes', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(false);
      expect(output.error).toBe('Service failure');
      expect(exitCode).toBe(1);
    });
  });
});
