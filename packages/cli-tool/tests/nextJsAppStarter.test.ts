import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import * as NextJsAppStarter from '../src/services/starter-template/NextJsAppStarter';

vi.mock('fs-extra');
vi.mock('../../utils/logger');

describe('NextJsAppStarter', () => {
  const root = '/mock/root';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validateEmptyDirectory logs warning if directory is not empty', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['some-file.txt'] as any);
    await NextJsAppStarter.validateEmptyDirectory(root);
  });

  it('createNextAppPackageJson writes a valid package.json', async () => {
    await NextJsAppStarter.createNextAppPackageJson(root);
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.objectContaining({ name: 'ignix-nextjs-app' }),
      expect.anything()
    );
  });

  it('createNextAppTsconfig writes a valid tsconfig.json', async () => {
    await NextJsAppStarter.createNextAppTsconfig(root);
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('tsconfig.json'),
      expect.objectContaining({ compilerOptions: expect.anything() }),
      expect.anything()
    );
  });

  it('createNextConfig writes next.config.js', async () => {
    await NextJsAppStarter.createNextConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('next.config.js'),
      expect.stringContaining('module.exports')
    );
  });

  it('createTailwindConfig writes tailwind.config.js', async () => {
    await NextJsAppStarter.createTailwindConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('tailwind.config.js'),
      expect.stringContaining('module.exports')
    );
  });

  it('createPostCSSConfig writes postcss.config.js', async () => {
    await NextJsAppStarter.createPostCSSConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('postcss.config.js'),
      expect.stringContaining('tailwindcss')
    );
  });

  it('createESLintConfig writes .eslintrc.json', async () => {
    await NextJsAppStarter.createESLintConfig(root);
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('.eslintrc.json'),
      expect.anything(),
      expect.anything()
    );
  });

  it('createPrettierConfig writes .prettierrc and .prettierignore', async () => {
    await NextJsAppStarter.createPrettierConfig(root);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('createAppDirectory sets up app structure', async () => {
    await NextJsAppStarter.createAppDirectory(root);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledTimes(4);
  });

  it('createSrcDirectory sets up src structure', async () => {
    await NextJsAppStarter.createSrcDirectory(root);
    expect(fs.ensureDir).toHaveBeenCalledTimes(3);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('createGlobalStyles writes globals.css', async () => {
    await NextJsAppStarter.createGlobalStyles(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('globals.css'),
      expect.stringContaining('@tailwind')
    );
  });

  it('createIgnixConfig writes ignix.config.js', async () => {
    await NextJsAppStarter.createIgnixConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('ignix.config.js'),
      expect.stringContaining('registryUrl')
    );
  });

  it('createGitignore writes .gitignore', async () => {
    await NextJsAppStarter.createGitignore(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.gitignore'),
      expect.stringContaining('/node_modules')
    );
  });

  it('createReadme writes README.md', async () => {
    await NextJsAppStarter.createReadme(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('README.md'),
      expect.stringContaining('# Ignix UI')
    );
  });
});
