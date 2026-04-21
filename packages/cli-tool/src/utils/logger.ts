import chalk from 'chalk';

export const logger = {
  _silent: false,
  setSilent(silent: boolean): void {
    this._silent = silent;
  },
  info(message: string): void {
    if (this._silent) return;
    console.log(chalk.blue(`[INFO] ${message}`));
  },
  success(message: string): void {
    if (this._silent) return;
    console.log(chalk.green(`[SUCCESS] ${message}`));
  },
  warn(message: string): void {
    if (this._silent) return;
    console.log(chalk.yellow(`[WARN] ${message}`));
  },
  error(message: string): void {
    if (this._silent) return;
    console.error(chalk.red(`[ERROR] ${message}`));
  },
};
