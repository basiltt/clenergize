#!/usr/bin/env node

/**
 * Script to generate RSA key pair for JWT signing and verification
 * Usage: npm run generate-keys
 *
 * This will create:
 * - private.key: RSA private key for signing JWTs
 * - public.key: RSA public key for verifying JWTs
 * - .env.keys: Environment variables for the keys
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const generateKeys = () => {
  console.log('🔐 Generating RSA key pair for JWT...\n');

  // Generate RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Create keys directory
  const keysDir = path.join(__dirname, '..', 'keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Save keys to files
  const privateKeyPath = path.join(keysDir, 'private.key');
  const publicKeyPath = path.join(keysDir, 'public.key');

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  console.log('✅ Keys generated successfully:');
  console.log(`   - Private key: ${privateKeyPath}`);
  console.log(`   - Public key: ${publicKeyPath}\n`);

  // Generate JWKS format for the public key
  const publicKeyObject = crypto.createPublicKey(publicKey);
  const jwk = publicKeyObject.export({ format: 'jwk' });
  const jwks = {
    keys: [
      {
        ...jwk,
        kid: 'dev-key-' + Date.now(),
        use: 'sig',
        alg: 'RS256',
      },
    ],
  };

  // Save JWKS
  const jwksPath = path.join(keysDir, 'jwks.json');
  fs.writeFileSync(jwksPath, JSON.stringify(jwks, null, 2));
  console.log(`✅ JWKS generated: ${jwksPath}\n`);

  // Create environment variable file
  const envContent = `# JWT Keys - Generated ${new Date().toISOString()}
# Add these to your .env file or set as environment variables

# Private key for signing JWTs (keep this secret!)
JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"

# Public key for verifying JWTs
JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"

# Key ID for JWKS
JWT_KEY_ID="${jwks.keys[0].kid}"

# For production, use a proper JWKS endpoint instead:
# JWKS_URI=https://your-auth-provider.com/.well-known/jwks.json
`;

  const envPath = path.join(keysDir, '.env.keys');
  fs.writeFileSync(envPath, envContent);

  console.log('📝 Environment variables saved to:', envPath);
  console.log('   Copy the variables to your .env file\n');

  // Security warning
  console.log('⚠️  SECURITY WARNINGS:');
  console.log('   1. Never commit private keys to version control');
  console.log('   2. Add /keys to your .gitignore file');
  console.log('   3. Use proper key management (AWS KMS, HashiCorp Vault) in production');
  console.log('   4. Rotate keys regularly\n');

  // Add to .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const gitignoreContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8')
    : '';

  if (!gitignoreContent.includes('/keys')) {
    fs.appendFileSync(gitignorePath, '\n# JWT Keys (never commit!)\n/keys\n*.key\n*.pem\n');
    console.log('✅ Added /keys to .gitignore\n');
  }
};

// Run the script
try {
  generateKeys();
  console.log('🎉 Key generation complete!\n');
  console.log('Next steps:');
  console.log('1. Copy the environment variables from keys/.env.keys to your .env file');
  console.log('2. Restart your application');
  console.log('3. For production, set up a proper JWKS endpoint (AWS Cognito, Auth0, etc.)\n');
} catch (error) {
  console.error('❌ Error generating keys:', error);
  process.exit(1);
}