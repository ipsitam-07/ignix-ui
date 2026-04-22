import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { RegistryService } from '../src/services/RegistryService';
import { loadConfig } from '../src/utils/config';
import { logger } from '../src/utils/logger';

vi.mock('axios');
vi.mock('../src/utils/config');
vi.mock('../src/utils/logger');

const mockConfig = {
  registryUrl: 'https://example.com/registry.json',
  themeUrl: 'https://example.com/themes.json',
  componentsDir: 'src/components/ui',
  themesDir: 'src/themes',
  templateLayoutUrl: 'https://example.com/templates.json',
  templateLayoutDir: 'src/templates',
};

const mockRegistry = {
  components: {
    button: {
      id: 'button',
      name: 'Button',
      description: 'A button component',
      files: {
        main: { path: 'components/button.tsx', type: 'component' },
      },
    },
    'landing-page': {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'A landing page template',
      files: {
        main: { path: 'templates/landing.tsx', type: 'template' },
      },
    },
  },
};

describe('RegistryService', () => {
  let service: RegistryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RegistryService();
    vi.mocked(loadConfig).mockResolvedValue(mockConfig as any);
  });

  describe('fetchRegistry', () => {
    it('fetches and caches the component registry', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });

      const components = await service.getAvailableComponents();

      expect(axios.get).toHaveBeenCalledWith(mockConfig.registryUrl);
      expect(components).toHaveLength(2);
      expect(components[0].name).toBe('Button');

      // Second call should use cache
      await service.getAvailableComponents();
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('throws an error when fetch fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      await expect(service.getAvailableComponents()).rejects.toThrow(
        'Failed to fetch component registry'
      );
      expect(logger.error).toHaveBeenCalledWith('[Registry] Component fetch failed');
    });
  });

  describe('getAvailableComponents', () => {
    it('returns all components from registry', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      const components = await service.getAvailableComponents();
      expect(components).toHaveLength(2);
    });
  });

  describe('getComponentConfig', () => {
    it('returns config for a specific component (case-insensitive)', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      const config = await service.getComponentConfig('BUTTON');
      expect(config?.name).toBe('Button');
    });

    it('returns undefined for non-existent component', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      const config = await service.getComponentConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('getAvailableTemplates', () => {
    it('returns only components of type template', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      const templates = await service.getAvailableTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe('landing-page');
    });
  });

  describe('getTemplateConfig', () => {
    it('returns config for a template by id or name', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      const config = await service.getTemplateConfig('landing-page');
      expect(config?.id).toBe('landing-page');
    });

    it('returns undefined if not found or not a template', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      const config = await service.getTemplateConfig('button'); // it's a component
      expect(config).toBeUndefined();
    });
  });

  describe('setSilent', () => {
    it('suppresses spinner output when silent is true', async () => {
      service.setSilent(true);
      vi.mocked(axios.get).mockResolvedValue({ data: mockRegistry });
      await service.getAvailableComponents();
      // ora is not mocked but we check that it doesn't crash
    });
  });
});
