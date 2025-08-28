#!/usr/bin/env node

/**
 * PRODUCTION ENFORCEMENT SCRIPT
 * Removes all demo data and enforces production state across the entire codebase
 */

const fs = require('fs');
const path = require('path');

class ProductionEnforcer {
  constructor() {
    this.projectDir = process.cwd();
    this.filesUpdated = 0;
    this.issuesFound = [];
    this.demoPatterns = [
      /demo@/gi,
      /test@/gi,
      /mock/gi,
      /fake/gi,
      /sample/gi,
      /example@/gi,
      /simulation/gi,
      /getDemoUser/gi,
      /getMockData/gi,
      /generateFake/gi,
      /isDemo\s*[:=]\s*true/gi,
      /useMockData\s*[:=]\s*true/gi,
      /testMode\s*[:=]\s*true/gi
    ];
  }

  async enforceProduction() {
    console.log('🔒 ENFORCING PRODUCTION MODE ACROSS ENTIRE PROJECT\n');
    
    // 1. Clean bot modules
    await this.cleanBotModules();
    
    // 2. Clean components
    await this.cleanComponents();
    
    // 3. Clean API endpoints
    await this.cleanAPIEndpoints();
    
    // 4. Update configuration files
    await this.updateConfigurations();
    
    // 5. Create production validators
    await this.createValidators();
    
    // 6. Generate report
    this.generateReport();
  }

  async cleanBotModules() {
    console.log('📦 Cleaning bot modules...');
    
    const botsDir = path.join(this.projectDir, 'bots');
    if (!fs.existsSync(botsDir)) return;
    
    const botDirs = fs.readdirSync(botsDir).filter(item => {
      const itemPath = path.join(botsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    for (const botDir of botDirs) {
      const botPath = path.join(botsDir, botDir);
      const botFiles = fs.readdirSync(botPath).filter(f => f.endsWith('.js'));
      
      for (const file of botFiles) {
        const filePath = path.join(botPath, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;
        
        // Remove demo code
        this.demoPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.issuesFound.push(`Demo pattern found in ${filePath}`);
            content = content.replace(pattern, '');
          }
        });
        
        // Ensure extends ProductionKingdomBot
        if (content.includes('extends KingdomBot')) {
          content = content.replace(
            'extends KingdomBot',
            'extends ProductionKingdomBot'
          );
          
          // Add import if not present
          if (!content.includes('ProductionKingdomBot')) {
            content = `const ProductionKingdomBot = require('../../lib/core/ProductionKingdomBot');\n${content}`;
          }
        }
        
        // Remove any simulation methods
        content = content.replace(/simulate\w+\([^}]*\}/gs, '');
        content = content.replace(/getMock\w+\([^}]*\}/gs, '');
        content = content.replace(/getDemo\w+\([^}]*\}/gs, '');
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          this.filesUpdated++;
          console.log(`  ✓ Updated ${file}`);
        }
      }
    }
  }

  async cleanComponents() {
    console.log('\n🧩 Cleaning React components...');
    
    const componentsDir = path.join(this.projectDir, 'components');
    if (!fs.existsSync(componentsDir)) return;
    
    const componentFiles = fs.readdirSync(componentsDir).filter(f => 
      f.endsWith('.tsx') || f.endsWith('.jsx')
    );
    
    for (const file of componentFiles) {
      const filePath = path.join(componentsDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      let originalContent = content;
      
      // Remove demo credentials
      content = content.replace(/demo@[\w.-]+\.[a-z]+/gi, '');
      content = content.replace(/password:\s*['"`]demo\w*['"`]/gi, "password: ''");
      content = content.replace(/email:\s*['"`]demo@[\w.-]+\.[a-z]+['"`]/gi, "email: ''");
      
      // Remove mock data imports
      content = content.replace(/import.*mock.*from.*['"`].*mock.*['"`];?/gi, '');
      content = content.replace(/import.*demo.*from.*['"`].*demo.*['"`];?/gi, '');
      
      // Remove demo user suggestions
      content = content.replace(/Demo credentials:.*?<\/\w+>/gs, '');
      content = content.replace(/Use demo@.*?to sign in/gi, '');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.filesUpdated++;
        console.log(`  ✓ Cleaned ${file}`);
      }
    }
  }

  async cleanAPIEndpoints() {
    console.log('\n🔌 Cleaning API endpoints...');
    
    const apiDir = path.join(this.projectDir, 'pages', 'api');
    if (!fs.existsSync(apiDir)) return;
    
    const cleanApiFile = (filePath) => {
      if (!fs.existsSync(filePath)) return;
      
      let content = fs.readFileSync(filePath, 'utf-8');
      let originalContent = content;
      
      // Add production check at the beginning
      if (!content.includes('DISABLE_DEMO_MODE')) {
        const productionCheck = `
// Production mode enforcement
if (process.env.DISABLE_DEMO_MODE === 'true') {
  // No demo operations allowed
  if (req.body?.demo || req.query?.demo) {
    return res.status(403).json({ 
      success: false, 
      message: 'Demo mode is disabled' 
    });
  }
}
`;
        
        // Insert after imports
        const importEnd = content.lastIndexOf('import');
        if (importEnd > -1) {
          const lineEnd = content.indexOf('\n', importEnd);
          content = content.slice(0, lineEnd + 1) + productionCheck + content.slice(lineEnd + 1);
        }
      }
      
      // Remove any hardcoded demo responses
      content = content.replace(/if\s*\([^)]*demo[^)]*\)\s*{[^}]+return[^}]+demo[^}]+}/gi, '');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.filesUpdated++;
        console.log(`  ✓ Secured ${path.basename(filePath)}`);
      }
    };
    
    // Clean all API files
    const walkApiDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkApiDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
          cleanApiFile(filePath);
        }
      });
    };
    
    walkApiDir(apiDir);
  }

  async updateConfigurations() {
    console.log('\n⚙️ Updating configuration files...');
    
    // Update next.config.js
    const nextConfigPath = path.join(this.projectDir, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      let content = fs.readFileSync(nextConfigPath, 'utf-8');
      
      if (!content.includes('DISABLE_DEMO_MODE')) {
        content = content.replace(
          'const nextConfig = {',
          `const nextConfig = {
  env: {
    DISABLE_DEMO_MODE: 'true',
    REQUIRE_DATABASE: 'true',
    ENFORCE_PRODUCTION: 'true'
  },`
        );
        
        fs.writeFileSync(nextConfigPath, content);
        this.filesUpdated++;
        console.log('  ✓ Updated next.config.js');
      }
    }
    
    // Create .env.production if not exists
    const envProdPath = path.join(this.projectDir, '.env.production');
    if (!fs.existsSync(envProdPath)) {
      const envContent = `# Production Environment
NODE_ENV=production
DISABLE_DEMO_MODE=true
REQUIRE_DATABASE=true
ENFORCE_PRODUCTION=true

# Database (Required)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Security (Required - Generate new values)
JWT_SECRET=${this.generateSecret(64)}
JWT_REFRESH_SECRET=${this.generateSecret(64)}

# API Configuration
NEXT_PUBLIC_API_URL=/api
`;
      
      fs.writeFileSync(envProdPath, envContent);
      console.log('  ✓ Created .env.production');
    }
  }

  async createValidators() {
    console.log('\n🛡️ Creating production validators...');
    
    // Create request validator middleware
    const validatorContent = `// Production Request Validator
export function validateProductionRequest(req, res, next) {
  // Check for demo/test indicators
  const body = JSON.stringify(req.body || {});
  const query = JSON.stringify(req.query || {});
  
  const prohibited = ['demo', 'test', 'mock', 'fake', 'sample'];
  const combined = (body + query).toLowerCase();
  
  for (const word of prohibited) {
    if (combined.includes(word)) {
      return res.status(403).json({
        success: false,
        message: 'Production mode: Test/Demo operations not allowed'
      });
    }
  }
  
  // Require authentication for all non-health endpoints
  if (!req.url.includes('/health') && !req.url.includes('/auth')) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
  }
  
  next();
}`;
    
    const middlewarePath = path.join(this.projectDir, 'lib', 'middleware', 'production-validator.js');
    const middlewareDir = path.dirname(middlewarePath);
    
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }
    
    fs.writeFileSync(middlewarePath, validatorContent);
    console.log('  ✓ Created production validator middleware');
  }

  generateSecret(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION ENFORCEMENT REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Files Updated: ${this.filesUpdated}`);
    
    if (this.issuesFound.length > 0) {
      console.log(`\n⚠️ Issues Found and Fixed: ${this.issuesFound.length}`);
      this.issuesFound.slice(0, 10).forEach(issue => {
        console.log(`  - ${issue}`);
      });
      if (this.issuesFound.length > 10) {
        console.log(`  ... and ${this.issuesFound.length - 10} more`);
      }
    } else {
      console.log('\n✅ No demo/test code found - already in production mode');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Set environment variables in .env.local or .env.production');
    console.log('2. Configure your database (Turso)');
    console.log('3. Run: npm run build');
    console.log('4. Start: NODE_ENV=production npm start');
    
    console.log('\n🔒 Production mode enforcement complete!');
    console.log('All demo users, mock data, and simulation features have been removed.');
    console.log('='.repeat(60));
  }
}

// Run the enforcer
const enforcer = new ProductionEnforcer();
enforcer.enforceProduction().catch(error => {
  console.error('Production enforcement failed:', error);
  process.exit(1);
});