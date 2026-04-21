import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAddCommand } from '../src/commands/add';
import { RegistryService } from '../src/services/RegistryService';
import { ComponentService } from '../src/services/ComponentService';
import { ThemeService } from '../src/services/ThemeService';
import { TemplateService } from '../src/services/TemplateService';
import { logger } from '../src/utils/logger';
import path from 'path';
import {
  setupTestMocks,
  resetTestState,
  runCommand,
  parseJsonOutput,
  exitCode,
  chdirSpy,
} from './helpers';

// --- Mocks ---
vi.mock('prompts');
vi.mock('../src/services/ComponentService');
vi.mock('../src/services/RegistryService');
vi.mock('../src/services/ThemeService');
vi.mock('../src/services/TemplateService');

// --- Helpers ---
const mockAvailableComponents = [
  { id: 'button', name: 'Button', files: { main: { type: 'component' } } },
  { id: 'input', name: 'Input', files: { main: { type: 'component' } } },
  { id: 'card', name: 'Card', files: { main: { type: 'component' } } },
];

const mockAvailableThemes = [
  { id: 'dark', name: 'Dark Theme' },
  { id: 'light', name: 'Light Theme' },
];

const mockAvailableTemplates = [
  { id: 'landing', name: 'Landing Page' },
  { id: 'dashboard', name: 'Dashboard' },
];

setupTestMocks();

beforeEach(() => {
  resetTestState();

  vi.mocked(RegistryService).mockImplementation(
    () =>
      ({
        getAvailableComponents: vi.fn().mockResolvedValue(mockAvailableComponents),
        getAvailableTemplates: vi.fn().mockResolvedValue(mockAvailableTemplates),
        setSilent: vi.fn(),
      } as any)
  );

  vi.mocked(ComponentService).mockImplementation(
    () => ({ install: vi.fn().mockResolvedValue(['icon', 'ripple']), setSilent: vi.fn() } as any)
  );

  vi.mocked(ThemeService).mockImplementation(
    () =>
      ({
        getAvailableThemes: vi.fn().mockResolvedValue(mockAvailableThemes),
        install: vi.fn().mockResolvedValue(undefined),
        setSilent: vi.fn(),
      } as any)
  );

  vi.mocked(TemplateService).mockImplementation(
    () => ({ install: vi.fn().mockResolvedValue(undefined), setSilent: vi.fn() } as any)
  );
});

describe('add command', () => {
  describe('components', () => {
    it('installs a component by name', async () => {
      await runCommand(createAddCommand, ['component', 'button', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.installed).toContain('button');
      expect(output.dependencies).toEqual(expect.arrayContaining(['icon', 'ripple']));
    });
  });

  describe('themes', () => {
    it('installs a theme by name', async () => {
      await runCommand(createAddCommand, ['theme', 'dark']);

      const themeServiceInstance = vi.mocked(ThemeService).mock.results[0].value;
      expect(themeServiceInstance.install).toHaveBeenCalledWith('dark');
    });

    it('outputs valid JSON for themes', async () => {
      await runCommand(createAddCommand, ['theme', 'dark', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.installed).toContain('dark');
    });
  });

  describe('templates', () => {
    it('installs a template by name', async () => {
      await runCommand(createAddCommand, ['template', 'landing']);

      const templateServiceInstance = vi.mocked(TemplateService).mock.results[0].value;
      expect(templateServiceInstance.install).toHaveBeenCalledWith('landing');
    });

    it('outputs valid JSON for templates', async () => {
      await runCommand(createAddCommand, ['template', 'landing', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.installed).toContain('landing');
    });
  });

  describe('unknown namespace', () => {
    it('logs an error and exits 1', async () => {
      await runCommand(createAddCommand, ['widget']);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Unknown namespace: 'widget'")
      );
      expect(exitCode).toBe(1);
    });
  });

  describe('--cwd flag', () => {
    it('changes cwd and restores it after execution', async () => {
      const targetCwd = '/tmp/project';
      await runCommand(createAddCommand, ['component', 'button', '--cwd', targetCwd]);

      expect(chdirSpy).toHaveBeenCalledWith(path.resolve(targetCwd));
    });
  });

  describe('error handling', () => {
    it('catches service errors and exits 1 in human mode', async () => {
      vi.mocked(ComponentService).mockImplementation(
        () =>
          ({
            install: vi.fn().mockRejectedValue(new Error('Install failed')),
            setSilent: vi.fn(),
          } as any)
      );

      await runCommand(createAddCommand, ['component', 'button']);
      expect(logger.error).toHaveBeenCalledWith('Install failed');
      expect(exitCode).toBe(1);
    });

    it('outputs JSON error and exits 1 in JSON mode', async () => {
      vi.mocked(ComponentService).mockImplementation(
        () =>
          ({
            install: vi.fn().mockRejectedValue(new Error('Install failed')),
            setSilent: vi.fn(),
          } as any)
      );

      await runCommand(createAddCommand, ['component', 'button', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(false);
      expect(output.error).toBe('Install failed');
      expect(exitCode).toBe(1);
    });
  });
});
