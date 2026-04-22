import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import * as MonorepoStarter from '../../src/services/starter-template/MonorepoStarter';

vi.mock('fs-extra');

describe('MonorepoStarter', () => {
  const root = '/mock/root';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ensureRootFiles writes pnpm-workspace.yaml and package.json', async () => {
    await MonorepoStarter.ensureRootFiles(root);
    expect(fs.writeFile).toHaveBeenCalled();
    expect(fs.writeJSON).toHaveBeenCalled();
  });

  it('ensureRootTsconfig writes base tsconfig files', async () => {
    await MonorepoStarter.ensureRootTsconfig(root);
    expect(fs.writeJSON).toHaveBeenCalledTimes(1);
  });

  it('scaffoldConfigPackage sets up config package', async () => {
    await MonorepoStarter.scaffoldConfigPackage(root);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeJSON).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('scaffoldUiPackage sets up UI package', async () => {
    await MonorepoStarter.scaffoldUiPackage(root);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeJSON).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('ensureTsconfigPackage sets up tsconfig package', async () => {
    await MonorepoStarter.ensureTsconfigPackage(root);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('scaffoldNextApp sets up nextjs app in monorepo', async () => {
    await MonorepoStarter.scaffoldNextApp(root);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeJSON).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('createIgnixConfig writes ignix.config.js', async () => {
    await MonorepoStarter.createIgnixConfig(root);
    expect(fs.writeFile).toHaveBeenCalled();
  });
});
