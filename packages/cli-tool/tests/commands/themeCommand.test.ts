import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createThemesCommand } from '../../src/commands/theme';
import { ThemeService } from '../../src/services/ThemeService';
import { logger } from '../../src/utils/logger';
import prompts from 'prompts';
import path from 'path';
import {
  setupTestMocks,
  resetTestState,
  runCommand,
  parseJsonOutput,
  exitCode,
  consoleOutput,
  chdirSpy,
} from '../helpers';

// --- Mocks ---
vi.mock('prompts');
vi.mock('../../src/services/ThemeService');

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

  it('allows viewing theme info', async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'info' })
      .mockResolvedValueOnce({ themeId: 'dark' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createThemesCommand, []);

    const output = consoleOutput.join('\n');
    expect(output).toContain('Dark Theme');
    expect(output).toContain('ID: dark');
    expect(output).toContain('Theme Configuration:');
    expect(output).toContain('#000');
  });

  it('shows warning when listing with no themes available', async () => {
    vi.mocked(ThemeService).mockImplementation(
      () =>
        ({
          getAvailableThemes: vi.fn().mockResolvedValue([]),
          setSilent: vi.fn(),
        } as any)
    );

    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'list' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createThemesCommand, []);
    expect(logger.warn).toHaveBeenCalledWith('No themes available.');
  });

  it('shows warning when installing with no themes available', async () => {
    vi.mocked(ThemeService).mockImplementation(
      () =>
        ({
          getAvailableThemes: vi.fn().mockResolvedValue([]),
          setSilent: vi.fn(),
        } as any)
    );

    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'install' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createThemesCommand, []);
    expect(logger.warn).toHaveBeenCalledWith('No themes available to install.');
  });

  it('shows warning when viewing info with no themes available', async () => {
    vi.mocked(ThemeService).mockImplementation(
      () =>
        ({
          getAvailableThemes: vi.fn().mockResolvedValue([]),
          setSilent: vi.fn(),
        } as any)
    );

    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'info' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createThemesCommand, []);
    expect(logger.warn).toHaveBeenCalledWith('No themes available.');
  });

  it('respects the --cwd flag', async () => {
    vi.mocked(prompts).mockResolvedValue({ action: 'exit' });

    const targetCwd = '/tmp/custom-path';
    await runCommand(createThemesCommand, ['--cwd', targetCwd]);

    expect(chdirSpy).toHaveBeenCalledWith(path.resolve(targetCwd));
  });

  describe('machine-mode list', () => {
    it('outputs JSON list of themes', async () => {
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
