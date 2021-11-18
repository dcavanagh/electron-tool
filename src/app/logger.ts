import {snakeCase} from 'lodash';
import winston from 'winston';

export class Logger  {
  private readonly logger: winston.Logger;

  constructor(
    private readonly context?: string,
  ) {
    this.logger = winston.createLogger({
      level: this.getLogLevel(),
      format: winston.format(info => {
        let error: Error | null = null;

        if (info instanceof Error) {
          error = info;
        } else {
          const {message} = info as {message: any};

          if (message instanceof Error) {
            error = message;
          }
        }

        let result = info;

        if (error) {
          result = {
            ...info,
            message: String(error),
            trace: error.stack,
          };
        }

        return result;
      })(),
    });

    this.logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format(info => {
          let {message} = info;

          if (info.trace && info.trace !== message) {
            message += `\n${ info.trace }`;
          }

          return {
            ...info,
            level: info.level.toUpperCase().padEnd(5),
            context: info.context.slice(0, 16).padEnd(16),
            message,
          };
        })(),
        winston.format.colorize(),
        winston.format.printf(info => (
          `${ info.level } | ${ info.context } | ${ info.message }`
        )),
      ),
    }));
  }

  public log(message: any, context?: string): void {
    this.logger.info(message, {
      context: context || this.context,
    });
  }

  public error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  public warn(message: any, context?: string): void {
    this.logger.warn(message, {
      context: context || this.context,
    });
  }

  public debug(message: any, context?: string): void {
    this.logger.debug(message, {
      context: context || this.context,
    });
  }

  public verbose(message: any, context?: string): void {
    this.logger.verbose(message, {
      context: context || this.context,
    });
  }

  private getLogLevel(): string {
    let level = process.env.LOG_LEVEL || 'info';

    if (this.context) {
      level = process.env[`LOG_LEVEL_${ snakeCase(this.context).toUpperCase() }`] || level;
    }

    return level.toLowerCase();
  }
}
