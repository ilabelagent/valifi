// Valifi Production Verification Script
// Checks for any remaining demo data and verifies production readiness

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ProductionVerifier {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.successes = [];
        this.criticalIssues = [];
    }

    async verify() {
        console.log('\n========================================');
        console.log('   VALIFI PRODUCTION VERIFICATION');
        console.log('========================================\n');

        // Run all verification checks
        await this.checkEnvironment();
        await this.checkDemoData();
        await this.checkSecuritySettings();
        await this.checkDatabaseConfig();
        await this.checkDependencies();
        await this.checkProductionFiles();
        await this.checkAPIEndpoints();
        
        // Generate report
        this.generateReport();
    }

    async checkEnvironment() {
        console.log('Checking environment configuration...');
        
        try {
            const envContent = await fs.readFile('.env', 'utf8');
            
            // Check NODE_ENV
            if (!envContent.includes('NODE_ENV=production')) {
                this.criticalIssues.push('NODE_ENV is not set to production');
            } else {
                this.successes.push('NODE_ENV is set to production');
            }
            
            // Check demo mode
            if (envContent.includes('ENABLE_DEMO_MODE=true')) {
                this.criticalIssues.push('Demo mode is still enabled!');
            } else {
                this.successes.push('Demo mode is disabled');
            }
            
            // Check for demo credentials
            if (envContent.includes('demo@') || envContent.includes('DEMO_')) {
                this.criticalIssues.push('Demo credentials found in .env file');
            } else {
                this.successes.push('No demo credentials in environment');
            }
            
            // Check security keys
            if (!envContent.includes('JWT_SECRET=') || envContent.includes('JWT_SECRET=changeme')) {
                this.criticalIssues.push('JWT_SECRET is not properly configured');
            } else {
                this.successes.push('JWT_SECRET is configured');
            }
            
            // Check database URL
            if (!envContent.includes('DATABASE_URL=')) {
                this.criticalIssues.push('DATABASE_URL is not configured');
            } else {
                this.successes.push('Database URL is configured');
            }
            
        } catch (error) {
            this.criticalIssues.push('.env file not found');
        }
    }

    async checkDemoData() {
        console.log('Checking for demo data in codebase...');
        
        const filesToCheck = [
            'App.tsx',
            'components/SignInModal.tsx',
            'components/LandingPage.tsx',
            'services/api.ts',
            'services/auth.ts'
        ];
        
        for (const file of filesToCheck) {
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for demo references
                const demoPatterns = [
                    /demo@valifi\.local/gi,
                    /test@/gi,
                    /DEMO_USER/gi,
                    /DEMO_PASSWORD/gi,
                    /mockData/gi,
                    /fakeUser/gi,
                    /testCredentials/gi
                ];
                
                for (const pattern of demoPatterns) {
                    if (pattern.test(content)) {
                        this.issues.push(`Demo reference found in ${file}: ${pattern}`);
                    }
                }
                
            } catch (error) {
                // File doesn't exist, skip
            }
        }
        
        if (this.issues.length === 0) {
            this.successes.push('No demo data found in code');
        }
    }

    async checkSecuritySettings() {
        console.log('Checking security configuration...');
        
        try {
            const nextConfig = await fs.readFile('next.config.js', 'utf8');
            
            // Check security headers
            if (nextConfig.includes('Strict-Transport-Security')) {
                this.successes.push('Security headers configured');
            } else {
                this.warnings.push('Security headers not fully configured');
            }
            
            // Check production optimizations
            if (nextConfig.includes('removeConsole')) {
                this.successes.push('Console removal in production enabled');
            } else {
                this.warnings.push('Console logs not removed in production');
            }
            
        } catch (error) {
            this.warnings.push('next.config.js not found or invalid');
        }
    }

    async checkDatabaseConfig() {
        console.log('Checking database configuration...');
        
        try {
            // Check if migrations exist
            const migrations = await fs.readdir('migrations');
            if (migrations.length > 0) {
                this.successes.push(`Found ${migrations.length} database migrations`);
            } else {
                this.warnings.push('No database migrations found');
            }
            
            // Check for clean script
            if (migrations.includes('999_clean_demo_data.sql')) {
                this.successes.push('Demo data cleanup script exists');
            } else {
                this.warnings.push('Demo cleanup script not found');
            }
            
        } catch (error) {
            this.warnings.push('Migrations directory not found');
        }
        
        // Test database connection
        try {
            execSync('docker ps | grep postgres', { encoding: 'utf8' });
            this.successes.push('PostgreSQL container is running');
        } catch {
            this.warnings.push('PostgreSQL container not running');
        }
    }

    async checkDependencies() {
        console.log('Checking dependencies...');
        
        try {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            
            // Check for production dependencies
            const requiredDeps = ['bcryptjs', 'jsonwebtoken', 'pg', 'next'];
            const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
            
            if (missingDeps.length === 0) {
                this.successes.push('All required dependencies installed');
            } else {
                this.issues.push(`Missing dependencies: ${missingDeps.join(', ')}`);
            }
            
            // Check for demo/test dependencies
            const demoDeps = ['faker', 'mock-data', 'demo-'];
            const foundDemoDeps = Object.keys(packageJson.dependencies || {})
                .filter(dep => demoDeps.some(demo => dep.includes(demo)));
            
            if (foundDemoDeps.length > 0) {
                this.warnings.push(`Demo dependencies found: ${foundDemoDeps.join(', ')}`);
            }
            
        } catch (error) {
            this.criticalIssues.push('package.json not found or invalid');
        }
    }

    async checkProductionFiles() {
        console.log('Checking production files...');
        
        const requiredFiles = [
            '.env',
            'next.config.js',
            'docker-compose.production.yml',
            'START-PRODUCTION.bat'
        ];
        
        const missingFiles = [];
        
        for (const file of requiredFiles) {
            try {
                await fs.access(file);
                this.successes.push(`✓ ${file} exists`);
            } catch {
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length > 0) {
            this.issues.push(`Missing files: ${missingFiles.join(', ')}`);
        }
        
        // Check for demo files that should be removed
        const demoFiles = [
            'START-DEMO-MODE.bat',
            'data/demo-users.json',
            'data/mock-data.json'
        ];
        
        const existingDemoFiles = [];
        
        for (const file of demoFiles) {
            try {
                await fs.access(file);
                existingDemoFiles.push(file);
            } catch {
                // Good, file doesn't exist
            }
        }
        
        if (existingDemoFiles.length > 0) {
            this.issues.push(`Demo files still exist: ${existingDemoFiles.join(', ')}`);
        } else {
            this.successes.push('No demo files found');
        }
    }

    async checkAPIEndpoints() {
        console.log('Checking API endpoints...');
        
        const apiDir = 'pages/api';
        
        try {
            const apiFiles = await this.getAllFiles(apiDir);
            
            for (const file of apiFiles) {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for demo mode checks
                if (!content.includes('ENABLE_DEMO_MODE')) {
                    this.warnings.push(`API endpoint ${file} doesn't check demo mode`);
                }
                
                // Check for authentication
                if (!content.includes('verifyToken') && !content.includes('authenticate')) {
                    this.warnings.push(`API endpoint ${file} may lack authentication`);
                }
            }
            
        } catch (error) {
            // API directory might not exist
        }
    }

    async getAllFiles(dir) {
        const files = [];
        
        try {
            const items = await fs.readdir(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    files.push(...await this.getAllFiles(fullPath));
                } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        } catch {
            // Directory doesn't exist
        }
        
        return files;
    }

    generateReport() {
        console.log('\n========================================');
        console.log('   VERIFICATION REPORT');
        console.log('========================================\n');
        
        // Critical Issues (must fix)
        if (this.criticalIssues.length > 0) {
            console.log('❌ CRITICAL ISSUES (Must Fix):');
            this.criticalIssues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
            console.log('');
        }
        
        // Issues (should fix)
        if (this.issues.length > 0) {
            console.log('⚠️  ISSUES (Should Fix):');
            this.issues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
            console.log('');
        }
        
        // Warnings (consider fixing)
        if (this.warnings.length > 0) {
            console.log('⚡ WARNINGS (Consider):');
            this.warnings.forEach(warning => {
                console.log(`   - ${warning}`);
            });
            console.log('');
        }
        
        // Successes
        if (this.successes.length > 0) {
            console.log('✅ VERIFIED:');
            this.successes.forEach(success => {
                console.log(`   - ${success}`);
            });
            console.log('');
        }
        
        // Overall Status
        console.log('========================================');
        if (this.criticalIssues.length === 0 && this.issues.length === 0) {
            console.log('🎉 PRODUCTION READY!');
            console.log('Your Valifi installation is ready for production use.');
        } else if (this.criticalIssues.length > 0) {
            console.log('❌ NOT READY FOR PRODUCTION');
            console.log(`Fix ${this.criticalIssues.length} critical issues before proceeding.`);
        } else {
            console.log('⚠️  MOSTLY READY');
            console.log(`Fix ${this.issues.length} issues for optimal production setup.`);
        }
        console.log('========================================\n');
        
        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            criticalIssues: this.criticalIssues,
            issues: this.issues,
            warnings: this.warnings,
            successes: this.successes,
            productionReady: this.criticalIssues.length === 0 && this.issues.length === 0
        };
        
        fs.writeFile('production-verification.json', JSON.stringify(report, null, 2))
            .then(() => console.log('Report saved to production-verification.json'))
            .catch(err => console.error('Failed to save report:', err));
    }
}

// Run verification
const verifier = new ProductionVerifier();
verifier.verify().catch(console.error);
