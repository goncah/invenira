import { ConsoleLogger } from '@nestjs/common';
import dayjs from 'dayjs';
import chalk from 'chalk';

const INFO = chalk.green('[INFO ]');
const ERROR = chalk.red('[ERROR]');
const WARNING = chalk.hex('#FFA500')('[WARN ]');
const DEBUG = chalk.cyan('[DEBUG]');
const VERBOSE = chalk.cyan('[VERB ]');
const FATAL = chalk.bgRed('[FATAL]');

class InveniraLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    console.log(
      `${this.formatDate()} ${INFO} [${process.pid}] ${context}: ${message}`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    console.log(
      `${this.formatDate()} ${ERROR} [${process.pid}] ${context}: ${message}`,
      trace,
    );
  }

  warn(message: string, context?: string) {
    console.log(
      `${this.formatDate()} ${WARNING} [${process.pid}] ${context}: ${message}`,
    );
  }

  debug(message: string, context?: string) {
    console.log(
      `${this.formatDate()} ${DEBUG} [${process.pid}] ${context}: ${message}`,
    );
  }

  verbose(message: string, context?: string) {
    console.log(
      `${this.formatDate()} ${VERBOSE} [${process.pid}] ${context}: ${message}`,
    );
  }

  fatal(message: string, context?: string) {
    console.log(
      `${this.formatDate()} ${FATAL} [${process.pid}] ${context}: ${message}`,
    );
  }

  private formatDate(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
  }
}

const logger = new InveniraLogger();

export { logger };
