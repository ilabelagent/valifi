/**
 * Quick JWT Token Generator
 * Run: node generate-tokens.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Generate secure random token
function generateSecureToken(length = 64) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, length);
}

// Main function
function generateTokens() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         VALIFI - SECURE TOKEN GENERATOR             ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Generate tokens
  console.log(`\n${colors.yellow}Generating secure tokens...${colors.reset}`);
  
  const tokens = {
    JWT_SECRET: generateSecureToken(64),
    JWT_REFRESH_SECRET: generateSecureToken(64),
    API_KEY: generateSecureToken(48)
  };

  console.log(`${colors.green}✓ Generated JWT_SECRET (64 characters)${colors.reset}`);
  console.log(`${colors.green}✓ Generated JWT_REFRESH_SECRET (64 characters)${colors.reset}`);
  console.log(`${colors.green}✓ Generated API_KEY (48 characters)${colors.reset}`);

  // Check for existing .env.local
  const envPath = path.join(__dirname, '.env.local');
  let existingEnv = {};
  
  if (fs.existsSync(envPath)) {
    console.log(`\n${colors.yellow}Found existing .env.local - updating JWT tokens only${colors.reset}`);
    
    // Read existing file
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    // Update JWT tokens
    const updatedLines = lines.map(line => {
      if (line.startsWith('JWT_SECRET=')) {
        return `JWT_SECRET=${tokens.JWT_SECRET}`;
      }
      if (line.startsWith('JWT_REFRESH_SECRET=')) {
        return `JWT_REFRESH_SECRET=${tokens.JWT_REFRESH_SECRET}`;
      }
      if (line.startsWith('API_KEY=')) {
        return `API_KEY=${tokens.API_KEY}`;
      }
      return line;
    });
    
    // Write updated content
    fs.writeFileSync(envPath, updatedLines.join('\n'));
    console.log(`${colors.green}✓ Updated .env.local with new tokens${colors.reset}`);
    
  } else {
    // Create new .env.local
    const envContent = `# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# JWT Configuration (Auto-generated secure tokens)
JWT_SECRET=${tokens.JWT_SECRET}
JWT_REFRESH_SECRET=${tokens.JWT_REFRESH_SECRET}

# API Configuration
API_KEY=${tokens.API_KEY}

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (Optional)
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# Environment
NODE_ENV=development

# Generated on: ${new Date().toISOString()}
# Security Note: Never commit this file to version control!`;

    fs.writeFileSync(envPath, envContent);
    console.log(`${colors.green}✓ Created .env.local with generated tokens${colors.reset}`);
  }

  // Create tokens file for easy copying
  const tokensPath = path.join(__dirname, 'generated-tokens.txt');
  const tokensContent = `VALIFI PLATFORM - GENERATED TOKENS
===================================
Generated: ${new Date().toISOString()}

Copy these values to your Vercel Environment Variables:
https://vercel.com/dashboard/[your-project]/settings/environment-variables

JWT_SECRET:
${tokens.JWT_SECRET}

JWT_REFRESH_SECRET:
${tokens.JWT_REFRESH_SECRET}

API_KEY:
${tokens.API_KEY}

===================================
VERCEL CLI COMMANDS:
===================================

Run these commands in your terminal:

vercel env add JWT_SECRET production
(Then paste: ${tokens.JWT_SECRET})

vercel env add JWT_REFRESH_SECRET production
(Then paste: ${tokens.JWT_REFRESH_SECRET})

vercel env add API_KEY production
(Then paste: ${tokens.API_KEY})

vercel env add NODE_ENV production
(Then paste: production)

===================================
REMEMBER TO ALSO SET:
===================================

vercel env add TURSO_DATABASE_URL production
(Paste your Turso database URL)

vercel env add TURSO_AUTH_TOKEN production
(Paste your Turso auth token)

===================================`;

  fs.writeFileSync(tokensPath, tokensContent);
  console.log(`${colors.green}✓ Created generated-tokens.txt${colors.reset}`);

  // Display summary
  console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════`);
  console.log('                    TOKENS GENERATED!                  ');
  console.log(`═══════════════════════════════════════════════════════${colors.reset}`);
  
  console.log(`\n${colors.bright}🔐 Generated Tokens:${colors.reset}`);
  console.log(`JWT_SECRET:        ${colors.cyan}${tokens.JWT_SECRET.substring(0, 30)}...${colors.reset}`);
  console.log(`JWT_REFRESH_SECRET: ${colors.cyan}${tokens.JWT_REFRESH_SECRET.substring(0, 30)}...${colors.reset}`);
  console.log(`API_KEY:           ${colors.cyan}${tokens.API_KEY.substring(0, 30)}...${colors.reset}`);
  
  console.log(`\n${colors.bright}📁 Files Created/Updated:${colors.reset}`);
  console.log('• .env.local - Your environment variables');
  console.log('• generated-tokens.txt - Tokens for Vercel setup');
  
  console.log(`\n${colors.bright}🚀 Next Steps:${colors.reset}`);
  console.log(`1. ${colors.yellow}Update Turso credentials in .env.local${colors.reset}`);
  console.log('   - TURSO_DATABASE_URL');
  console.log('   - TURSO_AUTH_TOKEN');
  console.log(`\n2. ${colors.cyan}Test locally:${colors.reset}`);
  console.log('   npm run dev');
  console.log(`\n3. ${colors.cyan}Deploy to Vercel:${colors.reset}`);
  console.log('   - Open generated-tokens.txt');
  console.log('   - Copy the Vercel CLI commands');
  console.log('   - Run: vercel --prod');
  
  console.log(`\n${colors.green}✅ Success! Your JWT tokens have been generated securely.${colors.reset}\n`);
}

// Run the generator
try {
  generateTokens();
} catch (error) {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
}