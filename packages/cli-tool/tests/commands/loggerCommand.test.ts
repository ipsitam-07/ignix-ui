import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import chalk from 'chalk';

describe('logger', () => {
  let logSpy: any;
  let errorSpy: any;
  let logger: typeof import('../../src/utils/logger').logger;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../../src/utils/logger');
    logger = mod.logger;
    logger._silent = false;

    logSpy = vi.spyOn(console, 'log').mockImplementation(() => vi.fn());
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info()', () => {
    it('logs an info message with chalk.blue formatting', () => {
      logger.info('hello world');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(chalk.blue('[INFO] hello world'));
    });

    it('is suppressed when silent mode is on', () => {
      logger.setSilent(true);
      logger.info('should not appear');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('success()', () => {
    it('logs a success message with chalk.green formatting', () => {
      logger.success('done');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(chalk.green('[SUCCESS] done'));
    });

    it('is suppressed when silent mode is on', () => {
      logger.setSilent(true);
      logger.success('should not appear');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn()', () => {
    it('logs a warning message with chalk.yellow formatting', () => {
      logger.warn('be careful');
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(chalk.yellow('[WARN] be careful'));
    });

    it('is suppressed when silent mode is on', () => {
      logger.setSilent(true);
      logger.warn('should not appear');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('error()', () => {
    it('logs an error message with chalk.red formatting to stderr', () => {
      logger.error('something broke');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(chalk.red('[ERROR] something broke'));
    });

    it('is suppressed when silent mode is on', () => {
      logger.setSilent(true);
      logger.error('should not appear');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('setSilent()', () => {
    it('enables silent mode', () => {
      logger.setSilent(true);
      expect(logger._silent).toBe(true);
    });

    it('disables silent mode', () => {
      logger.setSilent(true);
      logger.setSilent(false);
      expect(logger._silent).toBe(false);
    });

    it('re-enables output after being turned off', () => {
      logger.setSilent(true);
      logger.info('hidden');
      expect(logSpy).not.toHaveBeenCalled();

      logger.setSilent(false);
      logger.info('visible');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });
});
