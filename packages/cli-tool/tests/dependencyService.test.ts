import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DependencyService } from '../src/services/DependencyService';
import { getPackageManager } from '../src/utils/getPackageManager';
import { execa } from 'execa';

vi.mock('../src/utils/getPackageManager');
vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '' }),
}));
vi.mock('../utils/logger');

describe('DependencyService', () => {
  let service: DependencyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DependencyService();
  });

  describe('install', () => {
    it('does nothing if package list is empty', async () => {
      await service.install([], false);
      expect(execa).not.toHaveBeenCalled();
    });

    it('installs packages using pnpm add', async () => {
      vi.mocked(getPackageManager).mockResolvedValue('pnpm');

      await service.install(['lucide-react', 'clsx'], false);

      expect(execa).toHaveBeenCalledWith(
        'pnpm',
        ['add', 'lucide-react', 'clsx'],
        expect.anything()
      );
    });

    it('installs packages using npm install', async () => {
      vi.mocked(getPackageManager).mockResolvedValue('npm');

      await service.install(['lucide-react'], true);

      expect(execa).toHaveBeenCalledWith(
        'npm',
        ['install', '--save-dev', 'lucide-react'],
        expect.anything()
      );
    });

    it('installs dev dependencies using yarn add -D', async () => {
      vi.mocked(getPackageManager).mockResolvedValue('yarn');

      await service.install(['typescript'], true);

      expect(execa).toHaveBeenCalledWith('yarn', ['add', '-D', 'typescript'], expect.anything());
    });

    it('throws error when execa fails', async () => {
      vi.mocked(getPackageManager).mockResolvedValue('npm');
      vi.mocked(execa).mockRejectedValue(new Error('Process failed'));

      await expect(service.install(['some-pkg'], false)).rejects.toThrow(
        'Failed to install dependencies'
      );
    });
  });
});
