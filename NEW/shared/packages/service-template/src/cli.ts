#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import chalk from 'chalk';

/**
 * CLI tool for generating Clenergize V3 microservices
 */

interface ServiceConfig {
  serviceName: string;
  serviceNameCapitalized: string;
  entityName: string;
  entityNameCapitalized: string;
  entityNamePlural: string;
  port: number;
  description: string;
  outputPath: string;
}

// Register Handlebars helpers
Handlebars.registerHelper('capitalize', (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('lowercase', (str: string) => {
  return str.toLowerCase();
});

const program = new Command();

program
  .name('clenergize-service')
  .description('Generate a new Clenergize V3 microservice')
  .version('1.0.0');

program
  .command('generate')
  .alias('g')
  .description('Generate a new microservice')
  .action(async () => {
    console.log(chalk.blue('\n🚀 Clenergize V3 Service Generator\n'));

    // Prompt for configuration
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'serviceName',
        message: 'Service name (kebab-case):',
        default: 'example-service',
        validate: (input) => {
          if (!/^[a-z]+(-[a-z]+)*$/.test(input)) {
            return 'Service name must be kebab-case (e.g., user-service)';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'Main entity name (singular, camelCase):',
        default: 'item',
        validate: (input) => {
          if (!/^[a-z][a-zA-Z]*$/.test(input)) {
            return 'Entity name must be camelCase (e.g., user, productItem)';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'entityNamePlural',
        message: 'Entity plural name:',
        default: (answers: any) => answers.entityName + 's',
      },
      {
        type: 'number',
        name: 'port',
        message: 'Service port:',
        default: 3000,
        validate: (input) => {
          if (input < 1024 || input > 65535) {
            return 'Port must be between 1024 and 65535';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Service description:',
        default: 'Microservice for Clenergize V3',
      },
      {
        type: 'input',
        name: 'outputPath',
        message: 'Output directory:',
        default: (answers: any) => `./NEW/${answers.serviceName}`,
      },
    ]);

    // Process answers
    const config: ServiceConfig = {
      ...answers,
      serviceNameCapitalized: capitalize(toPascalCase(answers.serviceName)),
      entityNameCapitalized: capitalize(answers.entityName),
    };

    console.log(chalk.gray('\nGenerating service with configuration:'));
    console.log(config);

    try {
      await generateService(config);
      console.log(chalk.green('\n✅ Service generated successfully!'));
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.white(`  cd ${config.outputPath}`));
      console.log(chalk.white(`  npm install`));
      console.log(chalk.white(`  npm run start:dev`));
      console.log(chalk.gray(`\nSwagger docs will be available at:`));
      console.log(chalk.white(`  http://localhost:${config.port}/api/docs`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error generating service:'), error);
      process.exit(1);
    }
  });

async function generateService(config: ServiceConfig) {
  const templatesDir = path.join(__dirname, '..', 'templates');
  const outputDir = path.resolve(config.outputPath);

  // Create output directory
  await fs.ensureDir(outputDir);

  // Define directory structure
  const directories = [
    'src',
    'src/config',
    'src/domain',
    `src/domain/${config.entityName}`,
    `src/domain/${config.entityName}/dto`,
    'src/infrastructure',
    'src/infrastructure/auth',
    'src/infrastructure/decorators',
    'src/infrastructure/filters',
    'src/infrastructure/health',
    'src/infrastructure/interceptors',
    'test',
    'test/unit',
    'test/integration',
    'test/e2e',
  ];

  // Create directories
  for (const dir of directories) {
    await fs.ensureDir(path.join(outputDir, dir));
  }

  // Template mappings
  const templates: Array<{ template: string; output: string }> = [
    { template: 'main.ts.hbs', output: 'src/main.ts' },
    { template: 'app.module.ts.hbs', output: 'src/app.module.ts' },
    {
      template: 'domain/entity.schema.ts.hbs',
      output: `src/domain/${config.entityName}/${config.entityName}.schema.ts`,
    },
    {
      template: 'domain/entity.repository.ts.hbs',
      output: `src/domain/${config.entityName}/${config.entityName}.repository.ts`,
    },
    {
      template: 'domain/entity.service.ts.hbs',
      output: `src/domain/${config.entityName}/${config.entityName}.service.ts`,
    },
    {
      template: 'domain/entity.controller.ts.hbs',
      output: `src/domain/${config.entityName}/${config.entityName}.controller.ts`,
    },
    {
      template: 'infrastructure/health/health.controller.ts.hbs',
      output: 'src/infrastructure/health/health.controller.ts',
    },
    {
      template: 'infrastructure/health/redis-health.indicator.ts.hbs',
      output: 'src/infrastructure/health/redis-health.indicator.ts',
    },
    {
      template: 'infrastructure/health/service-health.indicator.ts.hbs',
      output: 'src/infrastructure/health/service-health.indicator.ts',
    },
  ];

  // Process templates
  for (const { template, output } of templates) {
    const templatePath = path.join(templatesDir, template);
    const outputPath = path.join(outputDir, output);

    if (await fs.pathExists(templatePath)) {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const result = compiledTemplate(config);

      await fs.writeFile(outputPath, result);
      console.log(chalk.gray(`  Created: ${output}`));
    }
  }

  // Create package.json
  const packageJson = {
    name: config.serviceName,
    version: '1.0.0',
    description: config.description,
    scripts: {
      build: 'nest build',
      'start:dev': 'nest start --watch',
      'start:prod': 'node dist/main',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
      'test:e2e': 'jest --config ./test/jest-e2e.json',
      lint: 'eslint \"{src,apps,libs,test}/**/*.ts\" --fix',
    },
    dependencies: {
      '@nestjs/common': '^10.0.0',
      '@nestjs/config': '^3.0.0',
      '@nestjs/core': '^10.0.0',
      '@nestjs/mongoose': '^10.0.0',
      '@nestjs/platform-express': '^10.0.0',
      '@nestjs/swagger': '^7.0.0',
      '@nestjs/terminus': '^10.0.0',
      '@nestjs/axios': '^3.0.0',
      '@clenergize/event-bus': '^1.0.0',
      '@clenergize/correlation': '^1.0.0',
      '@clenergize/repository': '^1.0.0',
      '@clenergize/migration': '^1.0.0',
      'class-validator': '^0.14.0',
      'class-transformer': '^0.5.1',
      mongoose: '^7.5.0',
      rxjs: '^7.8.0',
    },
    devDependencies: {
      '@nestjs/cli': '^10.0.0',
      '@nestjs/testing': '^10.0.0',
      '@types/jest': '^29.5.0',
      '@types/node': '^20.0.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      eslint: '^8.42.0',
      jest: '^29.5.0',
      prettier: '^3.0.0',
      'ts-jest': '^29.1.0',
      'ts-loader': '^9.4.3',
      'ts-node': '^10.9.1',
      typescript: '^5.2.0',
    },
  };

  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, {
    spaces: 2,
  });

  // Create .env.example
  const envExample = `# Service Configuration
NODE_ENV=development
PORT=${config.port}
SERVICE_NAME=${config.serviceName}
VERSION=1.0.0

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin
DATABASE_NAME=clenergize_${config.serviceName.replace(/-/g, '_')}

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CACHE_DB=0
REDIS_PUBSUB_DB=1

# JWT Authentication
JWT_ISSUER=https://cognito.amazonaws.com
JWT_AUDIENCE=clenergize-api
JWKS_URI=https://cognito.amazonaws.com/.well-known/jwks.json

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Service URLs
IDENTITY_SERVICE_URL=http://identity-service:3001
ORGANIZATION_SERVICE_URL=http://organization-service:3002
REFERENCE_SERVICE_URL=http://reference-service:3003

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:${config.port}

# Logging
LOG_LEVEL=debug
`;

  await fs.writeFile(path.join(outputDir, '.env.example'), envExample);

  // Create Dockerfile
  const dockerfile = `FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 nodejs && \\
    adduser -S -u 1001 -G nodejs nodejs

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE ${config.port}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${config.port}/v1/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/main"]
`;

  await fs.writeFile(path.join(outputDir, 'Dockerfile'), dockerfile);

  // Create README
  const readme = `# ${config.serviceNameCapitalized}

${config.description}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run in development
npm run start:dev

# Run tests
npm test
\`\`\`

## API Documentation

Swagger documentation available at: http://localhost:${config.port}/api/docs

## Health Checks

- Basic: http://localhost:${config.port}/v1/health
- Liveness: http://localhost:${config.port}/v1/health/live
- Readiness: http://localhost:${config.port}/v1/health/ready
- Detailed: http://localhost:${config.port}/v1/health/details
- Metrics: http://localhost:${config.port}/v1/health/metrics

## Environment Variables

See \`.env.example\` for required configuration.

## Docker

\`\`\`bash
# Build image
docker build -t ${config.serviceName} .

# Run container
docker run -p ${config.port}:${config.port} --env-file .env ${config.serviceName}
\`\`\`
`;

  await fs.writeFile(path.join(outputDir, 'README.md'), readme);
}

// Utility functions
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => capitalize(word))
    .join('');
}

// Run CLI
program.parse(process.argv);