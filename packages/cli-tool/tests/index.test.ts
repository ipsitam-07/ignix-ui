import { describe, it, expect, vi } from 'vitest';
import { program } from '../src/index';

vi.mock('prompts');
vi.mock('./utils/logger');

describe('CLI Index', () => {
  it('has all base commands registered', () => {
    const commandNames = program.commands.map((cmd) => cmd.name());

    expect(commandNames).toContain('init');
    expect(commandNames).toContain('add');
    expect(commandNames).toContain('list');
    expect(commandNames).toContain('themes');
    expect(commandNames).toContain('monorepo');
    expect(commandNames).toContain('nextjs-app');
    expect(commandNames).toContain('vite-react');
    expect(commandNames).toContain('template');
    expect(commandNames).toContain('doctor');
    expect(commandNames).toContain('info');
    expect(commandNames).toContain('mcp');
  });

  it('mcp command has init and status subcommands', () => {
    const mcp = program.commands.find((cmd) => cmd.name() === 'mcp');
    expect(mcp).toBeDefined();

    const subCommands = mcp!.commands.map((cmd) => cmd.name());
    expect(subCommands).toContain('init');
    expect(subCommands).toContain('status');
  });
});
