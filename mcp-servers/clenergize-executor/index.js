import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MongoClient } from 'mongodb';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class ClenergizeExecutor {
    constructor() {
        this.mongoClient = null;
        this.projectRoot = 'C:\\Users\\ttbasil\\Desktop\\Projects\\FullStackProjects\\ClenergizeV3';
    }

    async connectMongo() {
        if (!this.mongoClient) {
            this.mongoClient = new MongoClient('mongodb://admin:localdev123@localhost:27017/?authSource=admin');
            await this.mongoClient.connect();
        }
        return this.mongoClient;
    }

    async executeCode(code, language = 'javascript') {
        // Execute code in isolated context
        if (language === 'javascript' || language === 'typescript') {
            return await this.executeNode(code);
        } else if (language === 'bash') {
            return await this.executeBash(code);
        } else if (language === 'mongodb') {
            return await this.executeMongo(code);
        }
    }

    async executeNode(code) {
        // Create temporary file
        const tmpFile = path.join(this.projectRoot, '.tmp', `exec_${Date.now()}.js`);
        await fs.writeFile(tmpFile, code);

        try {
            const { stdout, stderr } = await execAsync(`node ${tmpFile}`);
            return { success: true, output: stdout, error: stderr };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            await fs.unlink(tmpFile);
        }
    }

    async executeBash(command) {
        try {
            const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });
            return { success: true, output: stdout, error: stderr };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async executeMongo(query) {
        const client = await this.connectMongo();
        try {
            const result = await eval(`client.${query}`);
            return { success: true, result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // High-level operations
    async generateService(serviceName, port) {
        const serviceTemplate = `
// Generate NestJS service structure
const servicePath = 'NEW/${serviceName}-service';
const commands = [
  'mkdir -p ${servicePath}/src',
  'cd ${servicePath}',
  'npm init -y',
  'npm install @nestjs/core @nestjs/common @nestjs/platform-express',
  'npm install @nestjs/mongoose mongoose',
  'npm install @nestjs/jwt passport-jwt',
  'npm install class-validator class-transformer'
];
`;
        return await this.executeBash(commands.join(' && '));
    }

    async updateJiraTicket(ticketId, status) {
        // Use REST API directly instead of heavy MCP
        const jiraUpdate = {
            url: `https://basiltt.atlassian.net/rest/api/3/issue/${ticketId}/transitions`,
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from('tt.basil@gmail.com:API_TOKEN').toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: { transition: { id: status } }
        };
        // Execute via axios or fetch
    }

    async gitOperation(operation, args) {
        const gitCommands = {
            'create-branch': `git checkout -b ${args.branch}`,
            'commit': `git add . && git commit -m "${args.message}"`,
            'push': `git push origin ${args.branch}`,
            'status': 'git status',
            'pull': 'git pull origin develop'
        };
        return await this.executeBash(gitCommands[operation]);
    }
}

// Create MCP Server
const server = new Server(
    {
        name: 'clenergize-executor',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

const executor = new ClenergizeExecutor();

// Register single, powerful tool
server.setRequestHandler('tools/list', async () => ({
    tools: [
        {
            name: 'execute',
            description: 'Execute code or commands for Clenergize development',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        enum: ['code', 'bash', 'mongodb', 'generate-service', 'git', 'jira', 'docker', 'test'],
                        description: 'Type of action to execute'
                    },
                    content: {
                        type: 'string',
                        description: 'Code, command, or query to execute'
                    },
                    options: {
                        type: 'object',
                        description: 'Additional options for the action'
                    }
                },
                required: ['action', 'content']
            }
        }
    ]
}));

server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name === 'execute') {
        const { action, content, options } = request.params.arguments;

        switch (action) {
            case 'code':
                return await executor.executeCode(content, options?.language || 'javascript');

            case 'bash':
                return await executor.executeBash(content);

            case 'mongodb':
                return await executor.executeMongo(content);

            case 'generate-service':
                return await executor.generateService(content, options?.port);

            case 'git':
                return await executor.gitOperation(content, options);

            case 'jira':
                return await executor.updateJiraTicket(content, options?.status);

            case 'docker':
                return await executor.executeBash(`docker ${content}`);

            case 'test':
                return await executor.executeBash(`cd NEW/${options?.service}-service && npm test`);

            default:
                return { error: `Unknown action: ${action}` };
        }
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Clenergize MCP Executor running');
}

main().catch(console.error);