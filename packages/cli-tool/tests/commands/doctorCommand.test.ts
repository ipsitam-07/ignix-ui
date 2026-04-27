import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDoctorCommand } from '../../src/commands/doctor';
import fs from 'fs-extra';
import {
  setupTestMocks,
  resetTestState,
  runCommand,
  parseJsonOutput,
  exitCode,
  consoleOutput,
} from '../helpers';

// --- Mocks ---
vi.mock('fs-extra');
setupTestMocks();

beforeEach(() => {
  resetTestState();

  // Default mocks
  vi.mocked(fs.readJson).mockResolvedValue({
    dependencies: { react: '18.0.0' },
    devDependencies: { tailwindcss: '3.0.0', typescript: '5.0.0' },
  });
  (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
});

describe('doctor command', () => {
  it('reports compatibility when all checks pass', async () => {
    await runCommand(createDoctorCommand, []);
    const output = consoleOutput.join('\n');
    expect(output).toContain('Your project is compatible!');
    expect(output).toContain('✅ Node.js');
    expect(output).toContain('✅ React');
    expect(output).toContain('✅ Tailwind CSS');
    expect(output).toContain('✅ TypeScript');
    expect(output).toContain('✅ ignix.config.js');
  });

  it('reports issues when Node version is too old', async () => {
    const originalVersion = process.version;
    Object.defineProperty(process, 'version', { value: 'v14.0.0', configurable: true });

    await runCommand(createDoctorCommand, []);
    const output = consoleOutput.join('\n');
    expect(output).toContain('❌ Node.js: v14.0.0');
    expect(output).toContain('❌ Some issues need attention');

    Object.defineProperty(process, 'version', { value: originalVersion, configurable: true });
  });

  it('reports issues when React is missing or too old', async () => {
    vi.mocked(fs.readJson).mockResolvedValue({
      dependencies: { react: '16.0.0' },
    });

    await runCommand(createDoctorCommand, []);
    const output = consoleOutput.join('\n');
    expect(output).toContain('❌ React');
  });

  it('reports issues when Tailwind is missing', async () => {
    vi.mocked(fs.readJson).mockResolvedValue({
      dependencies: { react: '18.0.0' },
      devDependencies: {},
    });

    await runCommand(createDoctorCommand, []);
    const output = consoleOutput.join('\n');
    expect(output).toContain('❌ Tailwind CSS');
  });

  it('reports issues when ignix.config.js is missing', async () => {
    (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);

    await runCommand(createDoctorCommand, []);
    const output = consoleOutput.join('\n');
    expect(output).toContain('❌ ignix.config.js');
  });

  describe('--json flag', () => {
    it('outputs valid JSON report', async () => {
      await runCommand(createDoctorCommand, ['--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(true);
      expect(output.checks).toBeDefined();
      expect(output.compatible).toBe(true);
    });

    it('outputs failure JSON and exits 1 on errors', async () => {
      vi.mocked(fs.readJson).mockImplementation(() => {
        throw new Error('FS Error');
      });

      await runCommand(createDoctorCommand, ['--json']);

      const output = parseJsonOutput();
      expect(output.success).toBe(false);
      expect(output.error).toBe('FS Error');
      expect(exitCode).toBe(1);
    });
  });
});
