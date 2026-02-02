import { Module } from '@nestjs/common';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

// Custom format for structured JSON logging in production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Human-readable format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  nestWinstonModuleUtilities.format.nestLike('PRACTIX', {
    colors: true,
    prettyPrint: true,
    processId: true,
    appName: true,
  }),
);

@Module({
  imports: [
    WinstonModule.forRoot({
      level: isProduction ? 'info' : 'debug',
      format: isProduction ? productionFormat : developmentFormat,
      transports: [
        // Console transport - always enabled
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true,
        }),

        // File transport for errors - production only
        ...(isProduction
          ? [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
              }),
            ]
          : []),
      ],

      // Don't exit on error
      exitOnError: false,
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
