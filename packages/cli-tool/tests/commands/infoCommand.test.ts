import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInfoCommand } from '../../src/commands/info';
import { RegistryService } from '../../src/services/RegistryService';
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

// --- Helpers ---
const mockAvailableComponents = [
  {
    id: 'button',
    name: 'Button',
    description: 'A simple button component',
    files: {
      main: { path: 'src/components/ui/button.tsx' },
    },
    dependencies: ['lucide-react', 'clsx'],
  },
  {
    id: 'input',
    name: 'Input',
    description: 'A text input component',
    files: {
      main: { path: 'src/components/ui/input.tsx' },
    },
  },
];

setupTestMocks();

beforeEach(() => {
  resetTestState();

  vi.mocked(RegistryService).mockImplementation(
    () =>
      ({
        getAvailableComponents: vi.fn().mockResolvedValue(mockAvailableComponents),
        setSilent: vi.fn(),
      } as any)
  );
});

describe('info command', () => {
  it('displays information for a valid component', async () => {
    await runCommand(createInfoCommand, ['button']);

    const output = consoleOutput.join('\n');
    expect(output).toContain('Button');
    expect(output).toContain('A simple button component');
    expect(output).toContain('ID: button');
    expect(output).toContain('src/components/ui/button.tsx');
    expect(output).toContain('lucide-react');
  });

  it('is case-insensitive for component names', async () => {
    await runCommand(createInfoCommand, ['BUTTON']);

    const output = consoleOutput.join('\n');
    expect(output).toContain('Button');
  });

  it('errors when component is not found', async () => {
    await runCommand(createInfoCommand, ['nonexistent']);
    expect(exitCode).toBe(1);
  });

  describe('--json flag', () => {
    it('outputs valid JSON for a valid component', async () => {
      await runCommand(createInfoCommand, ['button', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.component.id).toBe('button');
      expect(output.component.name).toBe('Button');
    });

    it('outputs JSON error and exits 1 when component not found', async () => {
      await runCommand(createInfoCommand, ['ghost', '--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(false);
      expect(output.error).toContain('not found');
      expect(exitCode).toBe(1);
    });

    it('silences logger in JSON mode', async () => {
      await runCommand(createInfoCommand, ['button', '--json']);
      expect(logger.setSilent).toHaveBeenCalledWith(true);
    });
  });

  it('handles service errors gracefully', async () => {
    vi.mocked(RegistryService).mockImplementation(
      () =>
        ({
          getAvailableComponents: vi.fn().mockRejectedValue(new Error('Registry failure')),
          setSilent: vi.fn(),
        } as any)
    );

    await runCommand(createInfoCommand, ['button']);
    expect(exitCode).toBe(1);
  });
});
