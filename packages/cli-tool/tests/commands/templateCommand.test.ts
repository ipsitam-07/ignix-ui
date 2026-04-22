import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTemplateCommand } from '../../src/commands/template';
import { TemplateService } from '../../src/services/TemplateService';
import { RegistryService } from '../../src/services/RegistryService';
import { logger } from '../../src/utils/logger';
import prompts from 'prompts';
import { setupTestMocks, resetTestState, runCommand, consoleOutput } from '../helpers';

// --- Mocks ---
vi.mock('prompts');
vi.mock('../../src/services/TemplateService');
vi.mock('../../src/services/RegistryService');

setupTestMocks();

const mockTemplates = [{ id: 'sidebar', name: 'Sidebar Layout', description: 'Left sidebar' }];

beforeEach(() => {
  resetTestState();

  vi.mocked(RegistryService).mockImplementation(
    () =>
      ({
        getAvailableTemplates: vi.fn().mockResolvedValue(mockTemplates),
      } as any)
  );

  vi.mocked(TemplateService).mockImplementation(
    () =>
      ({
        install: vi.fn().mockResolvedValue(undefined),
      } as any)
  );
});

describe('template command', () => {
  it('opens menu and allows exit', async () => {
    vi.mocked(prompts).mockResolvedValue({ action: 'exit' });

    await runCommand(createTemplateCommand, []);
    expect(logger.info).toHaveBeenCalledWith('Exiting template manager.');
  });

  it('allows listing templates', async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'list' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createTemplateCommand, []);

    const output = consoleOutput.join('\n');
    expect(output).toContain('Sidebar Layout');
    expect(output).toContain('Left sidebar');
  });

  it('allows installing a template', async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({ action: 'install' })
      .mockResolvedValueOnce({ templateId: 'sidebar' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCommand(createTemplateCommand, []);

    const templateServiceInstance = vi.mocked(TemplateService).mock.results[0].value;
    expect(templateServiceInstance.install).toHaveBeenCalledWith('sidebar');
  });
});
