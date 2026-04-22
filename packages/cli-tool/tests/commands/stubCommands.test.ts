import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../../src/utils/logger';
import { Command } from 'commander';

let consoleOutput: string[] = [];

describe('stub commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];

    vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      consoleOutput.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation(() => vi.fn());
    vi.spyOn(logger, 'warn').mockImplementation(() => vi.fn());
    vi.spyOn(logger, 'info').mockImplementation(() => vi.fn());
    vi.spyOn(logger, 'error').mockImplementation(() => vi.fn());
    vi.spyOn(logger, 'success').mockImplementation(() => vi.fn());
  });

  describe('validate command', () => {
    it('logs "Validation is coming soon!" warning', async () => {
      const { validateCommand } = await import('../../src/commands/validate');

      const program = new Command();
      program.addCommand(validateCommand);
      program.exitOverride();

      try {
        await program.parseAsync(['node', 'cli', 'validate']);
      } catch (e) {
        // Commander may throw for subcommand setup
      }

      expect(logger.warn).toHaveBeenCalledWith('Validation is coming soon!');
    });
  });

  describe('wizard command', () => {
    it('logs "Wizards are coming soon!" warning', async () => {
      const { wizardCommand } = await import('../../src/commands/wizard');

      const program = new Command();
      program.addCommand(wizardCommand);
      program.exitOverride();

      try {
        await program.parseAsync(['node', 'cli', 'wizard']);
      } catch (e) {
        // Commander may throw for subcommand setup
      }

      expect(logger.warn).toHaveBeenCalledWith('Wizards are coming soon!');
    });
  });
});
