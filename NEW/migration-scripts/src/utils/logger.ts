import winston from 'winston';
import chalk from 'chalk';

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${chalk.gray(timestamp)} [${level}] ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += `\n${chalk.gray(JSON.stringify(metadata, null, 2))}`;
  }

  return msg;
});

const logger = winston.createLogger({
  level: process.env.MIGRATION_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        customFormat
      )
    }),
    new winston.transports.File({
      filename: 'logs/migration-error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/migration.log',
      maxsize: 10485760,
      maxFiles: 10
    })
  ]
});

export default logger;

// Helper functions for structured logging
export const logMigrationStart = (serviceName: string) => {
  logger.info(chalk.bold.cyan(`\n${'='.repeat(80)}`));
  logger.info(chalk.bold.cyan(`  Starting ${serviceName} Migration`));
  logger.info(chalk.bold.cyan(`${'='.repeat(80)}\n`));
};

export const logMigrationComplete = (serviceName: string, stats: any) => {
  logger.info(chalk.bold.green(`\n${'='.repeat(80)}`));
  logger.info(chalk.bold.green(`  ${serviceName} Migration Complete`));
  logger.info(chalk.bold.green(`${'='.repeat(80)}`));
  logger.info(chalk.green('Statistics:'), stats);
  logger.info('');
};

export const logMigrationError = (serviceName: string, error: Error) => {
  logger.error(chalk.bold.red(`\n${'='.repeat(80)}`));
  logger.error(chalk.bold.red(`  ${serviceName} Migration Failed`));
  logger.error(chalk.bold.red(`${'='.repeat(80)}`));
  logger.error(chalk.red('Error:'), error.message);
  logger.error(chalk.red('Stack:'), error.stack);
  logger.error('');
};

export const logProgress = (current: number, total: number, message: string) => {
  const percentage = ((current / total) * 100).toFixed(1);
  logger.info(`[${current}/${total}] (${percentage}%) - ${message}`);
};
