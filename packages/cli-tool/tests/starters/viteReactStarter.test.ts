import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import * as ViteReactStarter from '../../src/services/starter-template/ViteReactStarter';

vi.mock('fs-extra');

describe('ViteReactStarter', () => {
  const root = '/mock/root';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validateEmptyDirectory checks for non-empty folders', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['existing-file.txt'] as any);
    await ViteReactStarter.validateEmptyDirectory(root);
  });

  it('createViteReactPackageJson writes package.json', async () => {
    await ViteReactStarter.createViteReactPackageJson(root);
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.objectContaining({ name: 'ignix-vite-react-app' }),
      expect.anything()
    );
  });

  it('createViteReactTsconfig writes tsconfig.json', async () => {
    await ViteReactStarter.createViteReactTsconfig(root);
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('tsconfig.json'),
      expect.anything(),
      expect.anything()
    );
  });

  it('createViteConfig writes vite.config.ts', async () => {
    await ViteReactStarter.createViteConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('vite.config.ts'),
      expect.stringContaining('defineConfig')
    );
  });

  it('createTailwindConfig writes tailwind.config.js', async () => {
    await ViteReactStarter.createTailwindConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('tailwind.config.js'),
      expect.stringContaining('export default')
    );
  });

  it('createPostCSSConfig writes postcss.config.js', async () => {
    await ViteReactStarter.createPostCSSConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('postcss.config.js'),
      expect.stringContaining('export default')
    );
  });

  it('createESLintConfig writes .eslintrc.cjs', async () => {
    await ViteReactStarter.createESLintConfig(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.eslintrc.cjs'),
      expect.anything()
    );
  });

  it('createPrettierConfig writes .prettierrc and .prettierignore', async () => {
    await ViteReactStarter.createPrettierConfig(root);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('createIndexHtml writes index.html', async () => {
    await ViteReactStarter.createIndexHtml(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.html'),
      expect.stringContaining('<!doctype html>')
    );
  });

  it('createSrcDirectory sets up src directory structure', async () => {
    await ViteReactStarter.createSrcDirectory(root);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledTimes(2); // main.tsx, App.tsx
  });

  it('createGlobalStyles writes index.css', async () => {
    await ViteReactStarter.createGlobalStyles(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.css'),
      expect.stringContaining('@tailwind')
    );
  });

  it('createIgnixConfig writes ignix.config.js', async () => {
    await ViteReactStarter.createIgnixConfig(root);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('createGitignore writes .gitignore', async () => {
    await ViteReactStarter.createGitignore(root);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('createViteEnvTypes writes vite-env.d.ts', async () => {
    await ViteReactStarter.createViteEnvTypes(root);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('vite-env.d.ts'),
      expect.anything()
    );
  });
});
