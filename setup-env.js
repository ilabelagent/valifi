#!/usr/bin/env node

/**
 * Valifi Platform - Environment Setup Script
 * Automatically generates secure JWT tokens and helps configure environment variables
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Generate secure random token
function generateSecureToken(length = 64) {
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
}

// Generate strong password
function generateStrongPassword(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Main setup function
async function setupEnvironment() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     VALIFI PLATFORM - ENVIRONMENT SETUP WIZARD      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  console.log(`\n${colors.blue}This wizard will help you set up your environment variables securely.${colors.reset}\n`);

  // Check for existing .env.local file
  const envPath = path.join(__dirname, '.env.local');
  const envExamplePath = path.join(__dirname, '.env.example');
  let existingEnv = {};

  if (fs.existsSync(envPath)) {
    console.log(`${colors.yellow}⚠️  Found existing .env.local file${colors.reset}`);
    const overwrite = await question('Do you want to update it? (y/n): ');
    
    if (overwrite.toLowerCase() !== 'y') {
      console.log(`${colors.yellow}Setup cancelled.${colors.reset}`);
      rl.close();
      return;
    }

    // Read existing values
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        existingEnv[key.trim()] = value.trim();
      }
    });
  }

  console.log(`\n${colors.bright}Step 1: Database Configuration${colors.reset}`);
  console.log('----------------------------------------');

  // Turso Database URL
  let tursoUrl = existingEnv.TURSO_DATABASE_URL || '';
  if (tursoUrl && !tursoUrl.includes('your-database-name')) {
    console.log(`${colors.green}✓ TURSO_DATABASE_URL already configured${colors.reset}`);
  } else {
    console.log('\nTo get your Turso database URL:');
    console.log('1. Go to: https://turso.tech/app/databases');
    console.log('2. Click on your database');
    console.log('3. Copy the database URL');
    tursoUrl = await question('\nEnter your Turso Database URL (or press Enter to skip): ');
    
    if (!tursoUrl) {
      tursoUrl = 'libsql://your-database-name.turso.io';
      console.log(`${colors.yellow}⚠️  Using placeholder URL. Update this before deployment!${colors.reset}`);
    }
  }

  // Turso Auth Token
  let tursoToken = existingEnv.TURSO_AUTH_TOKEN || '';
  if (tursoToken && !tursoToken.includes('your-turso-auth-token')) {
    console.log(`${colors.green}✓ TURSO_AUTH_TOKEN already configured${colors.reset}`);
  } else {
    console.log('\nTo get your Turso auth token:');
    console.log('1. In the same Turso dashboard page');
    console.log('2. Click "Generate Token" or "Show Token"');
    console.log('3. Copy the authentication token');
    tursoToken = await question('\nEnter your Turso Auth Token (or press Enter to skip): ');
    
    if (!tursoToken) {
      tursoToken = 'your-turso-auth-token';
      console.log(`${colors.yellow}⚠️  Using placeholder token. Update this before deployment!${colors.reset}`);
    }
  }

  console.log(`\n${colors.bright}Step 2: Security Configuration${colors.reset}`);
  console.log('----------------------------------------');

  // Generate JWT tokens
  console.log(`\n${colors.cyan}Generating secure JWT tokens...${colors.reset}`);
  
  const jwtSecret = generateSecureToken(64);
  const jwtRefreshSecret = generateSecureToken(64);
  
  console.log(`${colors.green}✓ Generated 64-character JWT_SECRET${colors.reset}`);
  console.log(`${colors.green}✓ Generated 64-character JWT_REFRESH_SECRET${colors.reset}`);

  // API Key generation
  const apiKey = generateSecureToken(48);
  console.log(`${colors.green}✓ Generated 48-character API_KEY${colors.reset}`);

  console.log(`\n${colors.bright}Step 3: OAuth Configuration (Optional)${colors.reset}`);
  console.log('----------------------------------------');

  const configureOAuth = await question('\nDo you want to configure Google/GitHub OAuth? (y/n): ');
  
  let googleClientId = '';
  let googleClientSecret = '';
  let githubClientId = '';
  let githubClientSecret = '';

  if (configureOAuth.toLowerCase() === 'y') {
    console.log('\n📌 Google OAuth Setup:');
    console.log('1. Go to: https://console.cloud.google.com/');
    console.log('2. Create/select a project');
    console.log('3. Enable Google+ API');
    console.log('4. Create OAuth 2.0 credentials');
    console.log('5. Add authorized redirect URI: https://your-app.vercel.app/api/auth/callback/google');
    
    googleClientId = await question('\nGoogle Client ID (or Enter to skip): ');
    if (googleClientId) {
      googleClientSecret = await question('Google Client Secret: ');
    }

    console.log('\n📌 GitHub OAuth Setup:');
    console.log('1. Go to: https://github.com/settings/developers');
    console.log('2. Create a new OAuth App');
    console.log('3. Set callback URL: https://your-app.vercel.app/api/auth/callback/github');
    
    githubClientId = await question('\nGitHub Client ID (or Enter to skip): ');
    if (githubClientId) {
      githubClientSecret = await question('GitHub Client Secret: ');
    }
  }

  console.log(`\n${colors.bright}Step 4: Environment Selection${colors.reset}`);
  console.log('----------------------------------------');
  
  const envChoice = await question('\nEnvironment (development/production) [development]: ');
  const nodeEnv = envChoice.toLowerCase() === 'production' ? 'production' : 'development';

  console.log(`\n${colors.bright}Step 5: Creating Configuration Files${colors.reset}`);
  console.log('----------------------------------------');

  // Create .env.local content
  const envContent = `# Turso Database Configuration
TURSO_DATABASE_URL=${tursoUrl}
TURSO_AUTH_TOKEN=${tursoToken}

# JWT Configuration (Auto-generated secure tokens)
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}

# API Configuration
API_KEY=${apiKey}

# Next.js Configuration
NEXT_PUBLIC_API_URL=${nodeEnv === 'production' ? 'https://your-app.vercel.app/api' : 'http://localhost:3000/api'}

${googleClientId ? `# Google OAuth Configuration
GOOGLE_CLIENT_ID=${googleClientId}
GOOGLE_CLIENT_SECRET=${googleClientSecret}
` : '# Google OAuth (Not configured)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
'}
${githubClientId ? `# GitHub OAuth Configuration
GITHUB_CLIENT_ID=${githubClientId}
GITHUB_CLIENT_SECRET=${githubClientSecret}
` : '# GitHub OAuth (Not configured)
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret
'}
# Environment
NODE_ENV=${nodeEnv}

# Generated on: ${new Date().toISOString()}
# Security Note: Never commit this file to version control!`;

  // Write .env.local
  fs.writeFileSync(envPath, envContent);
  console.log(`${colors.green}✓ Created .env.local${colors.reset}`);

  // Create/update .env.example with placeholders
  const exampleContent = `# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# JWT Configuration (Use setup-env.js to generate secure tokens)
JWT_SECRET=your-very-secure-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=another-very-secure-secret-min-32-characters

# API Configuration
API_KEY=your-api-key

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Environment
NODE_ENV=development`;

  fs.writeFileSync(envExamplePath, exampleContent);
  console.log(`${colors.green}✓ Updated .env.example${colors.reset}`);

  // Create .gitignore entry if not exists
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env.local')) {
      fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env.local\n.env\n');
      console.log(`${colors.green}✓ Updated .gitignore${colors.reset}`);
    }
  }

  // Generate Vercel environment variables script
  console.log(`\n${colors.bright}Step 6: Vercel Deployment Helper${colors.reset}`);
  console.log('----------------------------------------');

  const vercelEnvScript = `#!/bin/bash
# Vercel Environment Variables Setup Script
# Run this to set all environment variables in Vercel

echo "Setting Vercel environment variables..."

# Set database variables
vercel env add TURSO_DATABASE_URL production < <(echo "${tursoUrl}")
vercel env add TURSO_AUTH_TOKEN production < <(echo "${tursoToken}")

# Set JWT secrets
vercel env add JWT_SECRET production < <(echo "${jwtSecret}")
vercel env add JWT_REFRESH_SECRET production < <(echo "${jwtRefreshSecret}")

# Set API key
vercel env add API_KEY production < <(echo "${apiKey}")

# Set Node environment
vercel env add NODE_ENV production < <(echo "production")

${googleClientId ? `# Set Google OAuth
vercel env add GOOGLE_CLIENT_ID production < <(echo "${googleClientId}")
vercel env add GOOGLE_CLIENT_SECRET production < <(echo "${googleClientSecret}")
` : ''}
${githubClientId ? `# Set GitHub OAuth
vercel env add GITHUB_CLIENT_ID production < <(echo "${githubClientId}")
vercel env add GITHUB_CLIENT_SECRET production < <(echo "${githubClientSecret}")
` : ''}

echo "✓ All environment variables set!"
echo "Now run: vercel --prod"
`;

  const vercelScriptPath = path.join(__dirname, 'setup-vercel-env.sh');
  fs.writeFileSync(vercelScriptPath, vercelEnvScript);
  fs.chmodSync(vercelScriptPath, '755');
  console.log(`${colors.green}✓ Created setup-vercel-env.sh${colors.reset}`);

  // Create Windows batch version
  const vercelBatchScript = `@echo off
REM Vercel Environment Variables Setup Script (Windows)
REM Copy these commands and run them one by one in your terminal

echo Setting Vercel environment variables...
echo.
echo Run these commands one by one:
echo.
echo vercel env add TURSO_DATABASE_URL production
echo Value: ${tursoUrl}
echo.
echo vercel env add TURSO_AUTH_TOKEN production
echo Value: ${tursoToken}
echo.
echo vercel env add JWT_SECRET production
echo Value: ${jwtSecret}
echo.
echo vercel env add JWT_REFRESH_SECRET production
echo Value: ${jwtRefreshSecret}
echo.
echo vercel env add API_KEY production
echo Value: ${apiKey}
echo.
echo vercel env add NODE_ENV production
echo Value: production
${googleClientId ? `echo.
echo vercel env add GOOGLE_CLIENT_ID production
echo Value: ${googleClientId}
echo.
echo vercel env add GOOGLE_CLIENT_SECRET production
echo Value: ${googleClientSecret}
` : ''}${githubClientId ? `echo.
echo vercel env add GITHUB_CLIENT_ID production
echo Value: ${githubClientId}
echo.
echo vercel env add GITHUB_CLIENT_SECRET production
echo Value: ${githubClientSecret}
` : ''}
echo.
echo After setting all variables, run: vercel --prod
pause
`;

  const vercelBatchPath = path.join(__dirname, 'setup-vercel-env.bat');
  fs.writeFileSync(vercelBatchPath, vercelBatchScript);
  console.log(`${colors.green}✓ Created setup-vercel-env.bat${colors.reset}`);

  // Final summary
  console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════`);
  console.log('                    SETUP COMPLETE!                    ');
  console.log(`═══════════════════════════════════════════════════════${colors.reset}`);

  console.log(`\n${colors.green}✅ Environment configuration created successfully!${colors.reset}`);
  
  console.log(`\n${colors.bright}📁 Files created:${colors.reset}`);
  console.log('   • .env.local (your actual environment variables)');
  console.log('   • .env.example (template for other developers)');
  console.log('   • setup-vercel-env.sh (Linux/Mac Vercel setup)');
  console.log('   • setup-vercel-env.bat (Windows Vercel setup)');

  console.log(`\n${colors.bright}🔐 Security tokens generated:${colors.reset}`);
  console.log(`   • JWT_SECRET: ${colors.cyan}${jwtSecret.substring(0, 20)}...${colors.reset} (64 chars)`);
  console.log(`   • JWT_REFRESH_SECRET: ${colors.cyan}${jwtRefreshSecret.substring(0, 20)}...${colors.reset} (64 chars)`);
  console.log(`   • API_KEY: ${colors.cyan}${apiKey.substring(0, 20)}...${colors.reset} (48 chars)`);

  console.log(`\n${colors.bright}🚀 Next steps:${colors.reset}`);
  console.log('1. Test locally:');
  console.log(`   ${colors.cyan}npm run dev${colors.reset}`);
  console.log('\n2. Deploy to Vercel:');
  if (process.platform === 'win32') {
    console.log(`   ${colors.cyan}setup-vercel-env.bat${colors.reset} (follow the instructions)`);
  } else {
    console.log(`   ${colors.cyan}./setup-vercel-env.sh${colors.reset}`);
  }
  console.log(`   ${colors.cyan}vercel --prod${colors.reset}`);
  
  if (!tursoUrl || tursoUrl.includes('your-database-name')) {
    console.log(`\n${colors.yellow}⚠️  Remember to update TURSO_DATABASE_URL and TURSO_AUTH_TOKEN${colors.reset}`);
    console.log(`   in .env.local with your actual Turso credentials!${colors.reset}`);
  }

  console.log(`\n${colors.bright}📚 Documentation:${colors.reset}`);
  console.log('   • Turso Setup: https://docs.turso.tech/');
  console.log('   • Vercel Env Vars: https://vercel.com/docs/concepts/projects/environment-variables');
  
  console.log(`\n${colors.green}${colors.bright}Happy coding! 🎉${colors.reset}\n`);

  rl.close();
}

// Run the setup
setupEnvironment().catch(error => {
  console.error(`${colors.red}Error during setup:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});