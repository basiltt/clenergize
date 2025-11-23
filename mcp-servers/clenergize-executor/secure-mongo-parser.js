/**
 * Secure MongoDB Query Parser
 *
 * This module provides a SAFE alternative to eval() and new Function()
 * for executing MongoDB queries. It uses a parser-based approach that
 * only allows whitelisted operations.
 *
 * Security features:
 * - No code execution (no eval, no Function constructor)
 * - Whitelist of allowed operations
 * - Parameterized queries
 * - Input sanitization
 */

export class SecureMongoParser {
    constructor(client) {
        this.client = client;

        // Allowed database operations
        this.allowedOperations = new Set([
            'find', 'findOne', 'insertOne', 'insertMany',
            'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
            'aggregate', 'countDocuments', 'distinct',
            'createIndex', 'dropIndex', 'stats', 'listCollections'
        ]);

        // Allowed projection/filter operators
        this.allowedOperators = new Set([
            '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
            '$in', '$nin', '$exists', '$type',
            '$and', '$or', '$not',
            '$set', '$unset', '$inc', '$push', '$pull',
            '$match', '$project', '$limit', '$skip', '$sort'
        ]);
    }

    /**
     * Parse and execute a MongoDB query string safely
     * @param {string} queryString - The query to parse and execute
     * @returns {Promise<any>} Query result
     */
    async execute(queryString) {
        // Parse the query string into components
        const parsed = this.parseQuery(queryString);

        // Execute based on the parsed structure
        return await this.executeP arsed(parsed);
    }

    /**
     * Parse a query string into a safe structure
     * @param {string} queryString - Query like "db('test').collection('users').find({status: 'active'})"
     * @returns {object} Parsed query structure
     */
    parseQuery(queryString) {
        // Remove whitespace
        const cleaned = queryString.trim();

        // Extract database name
        const dbMatch = cleaned.match(/^db\(['"]([^'"]+)['"]\)/);
        if (!dbMatch) {
            throw new Error('Query must start with db("database_name")');
        }
        const dbName = dbMatch[1];

        // Validate database name (alphanumeric and underscore only)
        if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
            throw new Error('Invalid database name. Use only letters, numbers, and underscores.');
        }

        // Extract collection name
        const collMatch = cleaned.match(/\.collection\(['"]([^'"]+)['"]\)/);
        if (!collMatch) {
            throw new Error('Query must specify collection with .collection("name")');
        }
        const collectionName = collMatch[1];

        // Validate collection name
        if (!/^[a-zA-Z0-9_]+$/.test(collectionName)) {
            throw new Error('Invalid collection name. Use only letters, numbers, and underscores.');
        }

        // Extract operation and arguments
        const operationMatch = cleaned.match(/\.([a-zA-Z]+)\((.*)\)$/);
        if (!operationMatch) {
            throw new Error('Query must end with an operation like .find()');
        }

        const operation = operationMatch[1];
        const argsString = operationMatch[2];

        // Validate operation
        if (!this.allowedOperations.has(operation)) {
            throw new Error(`Operation "${operation}" is not allowed. Allowed: ${Array.from(this.allowedOperations).join(', ')}`);
        }

        // Parse arguments safely (without eval!)
        const args = this.parseArguments(argsString, operation);

        return {
            database: dbName,
            collection: collectionName,
            operation,
            arguments: args
        };
    }

    /**
     * Parse operation arguments safely
     * @param {string} argsString - Arguments as string
     * @param {string} operation - The operation being performed
     * @returns {array} Parsed arguments
     */
    parseArguments(argsString, operation) {
        if (!argsString || argsString.trim() === '') {
            return [];
        }

        try {
            // For safety, we only parse JSON-like structures
            // Convert single quotes to double quotes for JSON compatibility
            const jsonString = argsString
                .replace(/'/g, '"')
                .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

            // Attempt to parse as JSON
            const parsed = JSON.parse(`[${jsonString}]`);

            // Validate the parsed arguments
            this.validateArguments(parsed, operation);

            return parsed;
        } catch (error) {
            // If JSON parsing fails, try to handle simple cases
            if (argsString === '{}') return [{}];
            if (argsString === '[]') return [[]];

            throw new Error(`Invalid arguments for ${operation}: ${error.message}`);
        }
    }

    /**
     * Validate operation arguments for safety
     * @param {array} args - Parsed arguments
     * @param {string} operation - The operation being performed
     */
    validateArguments(args, operation) {
        // Check each argument
        for (const arg of args) {
            this.validateValue(arg);
        }

        // Operation-specific validation
        switch (operation) {
            case 'find':
            case 'findOne':
                if (args.length > 2) {
                    throw new Error(`${operation} accepts at most 2 arguments (filter, options)`);
                }
                break;

            case 'insertOne':
                if (args.length !== 1 || typeof args[0] !== 'object') {
                    throw new Error('insertOne requires exactly 1 document object');
                }
                break;

            case 'insertMany':
                if (args.length !== 1 || !Array.isArray(args[0])) {
                    throw new Error('insertMany requires exactly 1 array of documents');
                }
                break;

            case 'updateOne':
            case 'updateMany':
                if (args.length < 2 || args.length > 3) {
                    throw new Error(`${operation} requires 2-3 arguments (filter, update, options)`);
                }
                break;

            case 'deleteOne':
            case 'deleteMany':
                if (args.length < 1 || args.length > 2) {
                    throw new Error(`${operation} requires 1-2 arguments (filter, options)`);
                }
                break;
        }
    }

    /**
     * Recursively validate a value for safety
     * @param {any} value - Value to validate
     */
    validateValue(value) {
        if (value === null || value === undefined) {
            return;
        }

        const type = typeof value;

        // Allow primitives
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            for (const item of value) {
                this.validateValue(item);
            }
            return;
        }

        // Handle objects
        if (type === 'object') {
            for (const [key, val] of Object.entries(value)) {
                // Check for dangerous keys
                if (key.startsWith('$')) {
                    if (!this.allowedOperators.has(key)) {
                        throw new Error(`Operator "${key}" is not allowed`);
                    }
                }

                // Block potential code execution vectors
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    throw new Error(`Dangerous key "${key}" is not allowed`);
                }

                // Recursively validate the value
                this.validateValue(val);
            }
            return;
        }

        // Block functions and other dangerous types
        throw new Error(`Value type "${type}" is not allowed in queries`);
    }

    /**
     * Execute a parsed query structure
     * @param {object} parsed - Parsed query structure
     * @returns {Promise<any>} Query result
     */
    async executeParsed(parsed) {
        const db = this.client.db(parsed.database);
        const collection = db.collection(parsed.collection);

        // Execute the operation with the parsed arguments
        const operation = collection[parsed.operation];
        if (typeof operation !== 'function') {
            throw new Error(`Operation "${parsed.operation}" is not available`);
        }

        // Execute with apply to spread arguments
        const result = await operation.apply(collection, parsed.arguments);

        // Handle cursor results
        if (result && typeof result.toArray === 'function') {
            return await result.toArray();
        }

        return result;
    }
}

/**
 * Example usage:
 *
 * const parser = new SecureMongoParser(mongoClient);
 *
 * // Safe queries:
 * await parser.execute('db("test").collection("users").find({})');
 * await parser.execute('db("test").collection("users").findOne({_id: "123"})');
 * await parser.execute('db("test").collection("users").insertOne({name: "John", age: 30})');
 * await parser.execute('db("test").collection("users").updateOne({_id: "123"}, {$set: {status: "active"}})');
 *
 * // These would be blocked:
 * // await parser.execute('require("fs")'); // Blocked: doesn't match pattern
 * // await parser.execute('db("test").collection("users").find({$where: "..."})'); // Blocked: $where not allowed
 * // await parser.execute('db("test").collection("users").find({__proto__: {...}})'); // Blocked: dangerous key
 */