import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createListCommand } from '../../src/commands/list';
import { RegistryService } from '../../src/services/RegistryService';
import { ThemeService } from '../../src/services/ThemeService';
import { logger } from '../../src/utils/logger';
import {
  setupTestMocks,
  resetTestState,
  runCommand,
  parseJsonOutput,
  exitCode,
  consoleOutput,
} from '../helpers';

// --- Mocks ---
vi.mock('../../src/services/RegistryService');
vi.mock('../../src/services/ThemeService');

// --- Helpers ---
const mockComponents = [
  {
    id: 'button',
    name: 'Button',
    description: 'Button component',
    files: { main: { type: 'forms' } },
  },
  { id: 'card', name: 'Card', description: 'Card component', files: { main: { type: 'layout' } } },
];

const mockThemes = [
  { id: 'dark', name: 'Dark Theme', description: 'Deep dark theme' },
  { id: 'light', name: 'Light Theme', description: 'Bright light theme' },
];

const mockTemplates = [
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'A marketing landing page',
    files: { main: { type: 'template' } },
  },
];

setupTestMocks();

beforeEach(() => {
  resetTestState();

  vi.mocked(RegistryService).mockImplementation(
    () =>
      ({
        getAvailableComponents: vi.fn().mockResolvedValue(mockComponents),
        getAvailableTemplates: vi.fn().mockResolvedValue(mockTemplates),
        setSilent: vi.fn(),
      } as any)
  );

  vi.mocked(ThemeService).mockImplementation(
    () =>
      ({
        getAvailableThemes: vi.fn().mockResolvedValue(mockThemes),
        setSilent: vi.fn(),
      } as any)
  );
});

describe('list command', () => {
  describe('components', () => {
    it('lists all components alphabetically', async () => {
      await runCommand(createListCommand, ['component']);
      const output = consoleOutput.join('\n');
      expect(output).toContain('Button');
      expect(output).toContain('Card');
    });

    it('filters components by search query', async () => {
      await runCommand(createListCommand, ['component', '--search', 'butt']);
      const output = consoleOutput.join('\n');
      expect(output).toContain('Button');
      expect(output).not.toContain('Card');
    });

    it('filters components by category', async () => {
      await runCommand(createListCommand, ['component', '--category', 'layout']);
      const output = consoleOutput.join('\n');
      expect(output).toContain('Card');
      expect(output).not.toContain('Button');
    });

    it('warns when no components match search', async () => {
      await runCommand(createListCommand, ['component', '--search', 'xyz']);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No components found matching "xyz"')
      );
    });

    it('outputs JSON for components', async () => {
      await runCommand(createListCommand, ['component', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.components).toHaveLength(2);
      expect(output.total).toBe(2);
    });
  });

  describe('themes', () => {
    it('lists available themes', async () => {
      await runCommand(createListCommand, ['theme']);
      const output = consoleOutput.join('\n');
      expect(output).toContain('Dark Theme');
      expect(output).toContain('Light Theme');
    });

    it('outputs JSON for themes', async () => {
      await runCommand(createListCommand, ['themes', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.themes).toHaveLength(2);
      expect(output.total).toBe(2);
    });
  });

  describe('templates', () => {
    it('lists available templates', async () => {
      await runCommand(createListCommand, ['template']);
      const output = consoleOutput.join('\n');
      expect(output).toContain('Landing Page');
    });

    it('outputs JSON for templates', async () => {
      await runCommand(createListCommand, ['templates', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.templates).toHaveLength(1);
    });
  });

  it('errors on unknown namespace', async () => {
    await runCommand(createListCommand, ['widgets']);
    expect(exitCode).toBe(1);
  });

  describe('--json errors', () => {
    it('outputs JSON error for unknown namespace', async () => {
      await runCommand(createListCommand, ['widgets', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(false);
      expect(output.error).toContain('Unknown namespace');
      expect(exitCode).toBe(1);
    });

    it('handles unexpected errors with JSON output', async () => {
      vi.mocked(RegistryService).mockImplementation(
        () =>
          ({
            getAvailableComponents: vi.fn().mockRejectedValue(new Error('Fetch failed')),
            setSilent: vi.fn(),
          } as any)
      );

      await runCommand(createListCommand, ['component', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(false);
      expect(output.error).toBe('Fetch failed');
      expect(exitCode).toBe(1);
    });
  });
});
