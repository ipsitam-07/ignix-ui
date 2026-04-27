import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startersCommandMonorepo,
  startersCommandNextjsApp,
  startersCommandViteReact,
} from '../../src/commands/starters';
import * as MonorepoStarter from '../../src/services/starter-template/MonorepoStarter';
import * as NextJsAppStarter from '../../src/services/starter-template/NextJsAppStarter';
import * as ViteReactStarter from '../../src/services/starter-template/ViteReactStarter';
import prompts from 'prompts';

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

vi.mock('prompts', () => ({
  default: vi.fn(),
}));

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: 'success' }),
}));

vi.mock('../../src/services/starter-template/MonorepoStarter');
vi.mock('../../src/services/starter-template/NextJsAppStarter');
vi.mock('../../src/services/starter-template/ViteReactStarter');
vi.mock('../../src/utils/logger');

describe('Starters Commands', () => {
  const originalExit = process.exit;
  const originalChdir = process.chdir;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock response for prompts
    vi.mocked(prompts).mockResolvedValue({ value: true });

    // Mock process globals
    process.exit = vi.fn() as any;
    process.chdir = vi.fn() as any;

    // Reset commander option values to avoid shared state
    (startersCommandMonorepo as any)._optionValues = {};
    (startersCommandNextjsApp as any)._optionValues = {};
    (startersCommandViteReact as any)._optionValues = {};
  });

  afterEach(() => {
    process.exit = originalExit;
    process.chdir = originalChdir;
  });

  describe('Monorepo Command', () => {
    it('successfully scaffolds a monorepo', async () => {
      await startersCommandMonorepo.parseAsync(['node', 'ignix', 'monorepo', '--yes']);

      expect(MonorepoStarter.ensureRootFiles).toHaveBeenCalled();
      expect(MonorepoStarter.ensureRootTsconfig).toHaveBeenCalled();
      expect(MonorepoStarter.scaffoldConfigPackage).toHaveBeenCalled();
      expect(MonorepoStarter.scaffoldUiPackage).toHaveBeenCalled();
      expect(MonorepoStarter.ensureTsconfigPackage).toHaveBeenCalled();
      expect(MonorepoStarter.scaffoldNextApp).toHaveBeenCalled();
      expect(MonorepoStarter.createIgnixConfig).toHaveBeenCalled();
    });

    it('aborts if confirmation is rejected', async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: false });

      // Use monorepo-starters monorepo to match the name() and command() in starters.ts
      await startersCommandMonorepo.parseAsync(['node', 'ignix', 'monorepo']);

      expect(prompts).toHaveBeenCalled();
      expect(MonorepoStarter.ensureRootFiles).not.toHaveBeenCalled();
    });
  });

  describe('NextJS App Command', () => {
    it('successfully scaffolds a NextJS app', async () => {
      await startersCommandNextjsApp.parseAsync(['node', 'ignix', 'nextjs-app', '--yes']);

      expect(NextJsAppStarter.validateEmptyDirectory).toHaveBeenCalled();
      expect(NextJsAppStarter.createNextAppPackageJson).toHaveBeenCalled();
      expect(NextJsAppStarter.createNextAppTsconfig).toHaveBeenCalled();
      expect(NextJsAppStarter.createAppDirectory).toHaveBeenCalled();
      expect(NextJsAppStarter.createIgnixConfig).toHaveBeenCalled();
    });

    it('aborts if confirmation is rejected', async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: false });

      await startersCommandNextjsApp.parseAsync(['node', 'ignix', 'nextjs-app']);

      expect(prompts).toHaveBeenCalled();
      expect(NextJsAppStarter.createNextAppPackageJson).not.toHaveBeenCalled();
    });
  });

  describe('Vite React Command', () => {
    it('successfully scaffolds a Vite React app', async () => {
      await startersCommandViteReact.parseAsync(['node', 'ignix', 'vite-react', '--yes']);

      expect(ViteReactStarter.validateEmptyDirectory).toHaveBeenCalled();
      expect(ViteReactStarter.createViteReactPackageJson).toHaveBeenCalled();
      expect(ViteReactStarter.createViteReactTsconfig).toHaveBeenCalled();
      expect(ViteReactStarter.createViteConfig).toHaveBeenCalled();
      expect(ViteReactStarter.createIgnixConfig).toHaveBeenCalled();
    });

    it('aborts if confirmation is rejected', async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: false });

      await startersCommandViteReact.parseAsync(['node', 'ignix', 'vite-react']);

      expect(prompts).toHaveBeenCalled();
      expect(ViteReactStarter.createViteReactPackageJson).not.toHaveBeenCalled();
    });
  });

  describe('Machine Mode', () => {
    it('outputs JSON in monorepo machine mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());
      await startersCommandMonorepo.parseAsync(['node', 'ignix', 'monorepo', '--json']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"success": true'));
      consoleSpy.mockRestore();
    });

    it('outputs JSON error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());
      vi.mocked(MonorepoStarter.ensureRootFiles).mockRejectedValue(new Error('Scaffold failed'));

      await startersCommandMonorepo.parseAsync(['node', 'ignix', 'monorepo', '--json']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"success": false'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Scaffold failed'));
      consoleSpy.mockRestore();
    });
  });
});
