// =====================================================
// VALIFI KINGDOM CLEANUP SYSTEM
// Removes deprecated, redundant, and unused files
// =====================================================

const fs = require('fs').promises;
const path = require('path');

class KingdomCleanup {
  constructor() {
    this.projectRoot = __dirname;
    this.backupDir = path.join(this.projectRoot, '_deprecated_backup');
    this.stats = {
      analyzed: 0,
      deprecated: 0,
      moved: 0,
      cleaned: 0,
      errors: 0
    };
    
    // Files to definitely KEEP (essential)
    this.essentialFiles = [
      // Kingdom MCP System (NEW)
      'kingdom-mcp-server.js',
      'kingdom-auto-patch.js',
      'KINGDOM-LAUNCHER.bat',
      'kingdom-dashboard.html',
      'mcp-server.json',
      'kingdom-complete-setup.sh',
      'KINGDOM-ENHANCEMENT-README.md',
      'kingdom-evolution.json',
      
      // Core configuration
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'next.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      '.eslintrc.json',
      '.gitignore',
      'render.yaml',
      
      // Main application files
      'App.tsx',
      'types.ts',
      'styles.css',
      'i18n.ts',
      'translations.ts',
      
      // Environment templates (keep one of each)
      '.env.template',
      '.env.local'
    ];
    
    // Directories to keep entirely
    this.essentialDirs = [
      'bots',           // All bot files
      'components',     // React components
      'pages',          // Next.js pages
      'lib',            // Core libraries
      'public',         // Public assets
      'migrations',     // Database migrations
      'data',           // Bot data files
      'hooks',          // React hooks
      'services',       // API services
      'src',            // Source files
      '.git',           // Git repository
      'node_modules'    // Dependencies (don't touch)
    ];
    
    // Files to deprecate (move to backup)
    this.deprecatedPatterns = [
      // Redundant batch files (we have KINGDOM-LAUNCHER.bat now)
      'AUTO-BUILD-PATCH.bat',
      'BOT-MONITOR.bat',
      'BUILD-AND-DEPLOY.bat',
      'BUILD-RUN-DEPLOY-GUIDE.md',
      'CHECK-AND-CLEAN-PORTS.bat',
      'COMPLETE-BUILD-FIX-RENDER.bat',
      'COMPREHENSIVE-FIX.bat',
      'DEPLOY-TO-RENDER.bat',
      'DEPLOY-TO-VERCEL.bat',
      'DEPLOY-VERCEL-NOW.bat',
      'DIRECTORY-MANAGER.bat',
      'ENFORCE-PRODUCTION-NOW.bat',
      'FINAL-FIX-AND-RUN.bat',
      'FIX-AND-RUN.bat',
      'FIX-BUILD-FOR-RENDER.bat',
      'FIX-NEXT-ERROR.bat',
      'FIX-NEXTJS-NOW.bat',
      'FORCE-CLEAN-START.bat',
      'GIT-SYNC-LANGGRAPH.bat',
      'INITIALIZE-VALIFI.bat',
      'LAUNCH-PRODUCTION.bat',
      'LAUNCH-VALIFI-FIXED.bat',
      'LIVING-BOT-STATUS.bat',
      'MANUAL-SETUP.bat',
      'QUICK-DEPLOY-NEON-VERCEL.bat',
      'QUICK-START.bat',
      'REMOVE-ALL-DEMO-DATA.bat',
      'RUN-COMPLETE-FIX.bat',
      'RUN-VALIFI-NOW.bat',
      'START-CLEAN.bat',
      'START-DEMO-MODE.bat',
      'TEST-BOT-INTERFACE.bat',
      'TEST-DIAGNOSTIC.bat',
      'VALIFI-AUTO-HEAL.bat',
      'VALIFI-AUTO-RUN.bat',
      'VALIFI-MASTER.bat',
      'VALIFI-MONITOR.bat',
      
      // Redundant PowerShell scripts
      'Fix-And-Launch.ps1',
      'FIX-DEPLOYMENT-ISSUES.ps1',
      'PRODUCTION-DEPLOYMENT-CHECK.ps1',
      'PRODUCTION-ORCHESTRATOR.ps1',
      'QUICK-FIX-VERCEL.ps1',
      'Start-ValifiBot.ps1',
      'VALIFI-AUTO-HEAL.ps1',
      
      // Redundant shell scripts (we have kingdom-complete-setup.sh)
      'build-and-deploy.sh',
      'deploy-fix.sh',
      'deploy-to-render.sh',
      'deploy-to-vercel.sh',
      'deploy.sh',
      'fix-database.sh',
      'fix-production.sh',
      'setup-vercel-env.sh',
      
      // Redundant fix batch files
      'emergency-fix.bat',
      'final-fix-complete.bat',
      'final-production-fix.bat',
      'fix-build-errors.bat',
      'fix-deployment.bat',
      'fix-missing-dependencies.bat',
      'fix-missing-dependencies.ps1',
      'fix-nextjs-issues.bat',
      'fix-production.bat',
      'fix-remaining-issues.bat',
      'fix-stock-staking.bat',
      'fix-vercel-deploy.bat',
      'force-add-db.bat',
      'run-neon-migrations.bat',
      'setup-database.bat',
      'setup-postgres.bat',
      'setup-vercel-env.bat',
      'start-bot.bat',
      'update-deps.bat',
      
      // Old deployment scripts
      'DEPLOY-TO-VERCEL-AUTOMATED.js',
      'deploy.bat',
      'prepare-deployment.js',
      'enforce-production.js',
      'verify-production.js',
      
      // Test files (can be in separate test directory)
      'test-connection.js',
      'test-neon-connection.js',
      'test-postgres.js',
      'test-turso.js',
      'test_script.js',
      
      // Redundant documentation (consolidated in KINGDOM-ENHANCEMENT-README.md)
      'ACCESSIBILITY-FIXES.md',
      'CHANGELOG.md',
      'COMPLETE-DIRECTORY-DOCUMENTATION.md',
      'CRITICAL-FIX-INSTRUCTIONS.md',
      'DEPENDENCY-FIX-DOCUMENTATION.md',
      'DEPLOYMENT-GUIDE-V3.md',
      'deployment-guide.md',
      'DEPLOYMENT-READY.md',
      'DEPLOYMENT_FIX.md',
      'DEPLOYMENT_GUIDE_FINAL.md',
      'DEPLOY_FINAL.md',
      'DEPLOY_NOW.md',
      'DIRECTORY-TOOLS-README.md',
      'ENHANCEMENT-COMPLETE.md',
      'env-example.md',
      'FIXES-APPLIED.md',
      'FIX-DEPLOYMENT.md',
      'INVESTMENTS-FIXED.md',
      'LANGGRAPH-INTEGRATION-GUIDE.md',
      'NEON-VERCEL-DEPLOYMENT.md',
      'PRODUCTION-FIX-COMPLETE.md',
      'PRODUCTION-MODE-ENFORCED.md',
      'PRODUCTION-STATUS.md',
      'QUICK_DEPLOY.md',
      'README_NEXTJS.md',
      'RENDER-DEPLOYMENT-GUIDE.md',
      'SETUP.md',
      'STYLING-VERIFICATION.md',
      'TODO.md',
      'TURSO-SETUP.md',
      'UPDATE-GUIDE.md',
      'VALIFI-AUTH-TROUBLESHOOTING.md',
      'VERCEL-DEPLOYMENT-INSTRUCTIONS.md',
      'VERCEL-ENV-FIX.md',
      'vercel-turso-guide.md',
      
      // Duplicate/old configuration files
      '.env.example',
      '.env.neon.template',
      '.env.production.backup',
      '.env.production.fixed',
      '.env.render',
      '.env.vercel.template',
      '.env.enhanced',
      '.env-enhanced.template',
      'vercel-fixed.json',
      'vercel.json.backup',
      'vercel.json.old',
      
      // Old HTML files
      'directory-explorer.html',
      'index.html.md',
      
      // Utility scripts that are now in kingdom system
      'generate-directory-report.js',
      'generate-jwt-tokens.bat',
      'generate-tokens.js',
      'generated-tokens.txt',
      'list-directory.js',
      'setup-env.cjs',
      'setup-env.js',
      
      // Old/duplicate files
      'auto-patch-system.js', // Replaced by kingdom-auto-patch.js
      'metadata.json',
      'sitetableofcontent.md',
      'api.md',
      'business-logic.md',
      'data-models.md',
      'schema.md'
    ];
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║         VALIFI KINGDOM CLEANUP SYSTEM                 ║');
    console.log('║         Removing Deprecated & Redundant Files         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    // Create backup directory
    await this.createBackupDirectory();
    
    // Analyze and clean files
    await this.analyzeAndClean();
    
    // Clean empty directories
    await this.cleanEmptyDirectories();
    
    // Generate cleanup report
    await this.generateReport();
    
    // Show summary
    this.showSummary();
  }

  async createBackupDirectory() {
    console.log('📁 Creating backup directory...');
    
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Create subdirectories for organization
      const subdirs = ['batch-files', 'scripts', 'docs', 'configs', 'misc'];
      for (const subdir of subdirs) {
        await fs.mkdir(path.join(this.backupDir, subdir), { recursive: true });
      }
      
      console.log(`  ✓ Created backup directory: ${this.backupDir}\n`);
    } catch (error) {
      console.error('  ❌ Failed to create backup directory:', error.message);
    }
  }

  async analyzeAndClean() {
    console.log('🔍 Analyzing project files...\n');
    
    const files = await fs.readdir(this.projectRoot);
    
    for (const file of files) {
      // Skip directories for now
      const filePath = path.join(this.projectRoot, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        this.stats.analyzed++;
        
        // Check if file should be deprecated
        if (this.deprecatedPatterns.includes(file)) {
          await this.moveToBackup(file);
        }
      }
    }
    
    console.log(`\n✓ Analyzed ${this.stats.analyzed} files`);
  }

  async moveToBackup(filename) {
    const sourcePath = path.join(this.projectRoot, filename);
    
    // Determine subdirectory based on file type
    let subdir = 'misc';
    if (filename.endsWith('.bat')) subdir = 'batch-files';
    else if (filename.endsWith('.sh') || filename.endsWith('.ps1')) subdir = 'scripts';
    else if (filename.endsWith('.md')) subdir = 'docs';
    else if (filename.startsWith('.env') || filename.includes('config')) subdir = 'configs';
    
    const destPath = path.join(this.backupDir, subdir, filename);
    
    try {
      await fs.rename(sourcePath, destPath);
      console.log(`  📦 Moved: ${filename} → backup/${subdir}/`);
      this.stats.moved++;
      this.stats.deprecated++;
    } catch (error) {
      console.error(`  ❌ Failed to move ${filename}:`, error.message);
      this.stats.errors++;
    }
  }

  async cleanEmptyDirectories() {
    console.log('\n🧹 Cleaning empty directories...');
    
    const checkAndClean = async (dir) => {
      try {
        const files = await fs.readdir(dir);
        
        if (files.length === 0 && !this.essentialDirs.includes(path.basename(dir))) {
          await fs.rmdir(dir);
          console.log(`  ✓ Removed empty directory: ${path.basename(dir)}`);
          this.stats.cleaned++;
          return true;
        }
        
        // Recursively check subdirectories
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isDirectory() && !this.essentialDirs.includes(file)) {
            await checkAndClean(filePath);
          }
        }
      } catch (error) {
        // Directory might not exist or have permissions issues
      }
      
      return false;
    };
    
    // Don't clean essential directories
    const dirs = await fs.readdir(this.projectRoot);
    for (const dir of dirs) {
      const dirPath = path.join(this.projectRoot, dir);
      const stats = await fs.stat(dirPath);
      
      if (stats.isDirectory() && 
          !this.essentialDirs.includes(dir) && 
          !dir.startsWith('.') && 
          dir !== '_deprecated_backup' &&
          dir !== 'node_modules') {
        await checkAndClean(dirPath);
      }
    }
  }

  async generateReport() {
    console.log('\n📝 Generating cleanup report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      backupLocation: this.backupDir,
      deprecatedFiles: this.deprecatedPatterns.filter(f => {
        try {
          fs.access(path.join(this.backupDir, f));
          return true;
        } catch {
          return false;
        }
      }),
      keptFiles: this.essentialFiles,
      keptDirectories: this.essentialDirs
    };
    
    await fs.writeFile(
      path.join(this.projectRoot, 'cleanup-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('  ✓ Report saved to cleanup-report.json\n');
  }

  showSummary() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                  CLEANUP SUMMARY                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log(`  Files Analyzed:     ${this.stats.analyzed}`);
    console.log(`  Files Deprecated:   ${this.stats.deprecated}`);
    console.log(`  Files Moved:        ${this.stats.moved}`);
    console.log(`  Directories Cleaned: ${this.stats.cleaned}`);
    console.log(`  Errors:             ${this.stats.errors}\n`);
    
    console.log('📁 Backup Location:');
    console.log(`  ${this.backupDir}\n`);
    
    console.log('✅ Essential Files Preserved:');
    console.log('  • Kingdom MCP System (all files)');
    console.log('  • All 51+ bot files');
    console.log('  • Core configuration files');
    console.log('  • React components');
    console.log('  • Next.js pages');
    console.log('  • Database migrations\n');
    
    console.log('🎯 Next Steps:');
    console.log('  1. Review backup folder if you need any old files');
    console.log('  2. Run: KINGDOM-LAUNCHER.bat to start the system');
    console.log('  3. Delete _deprecated_backup folder when confident\n');
    
    console.log('✨ Your Valifi Kingdom is now clean and organized!');
  }
}

// Add restore functionality
class RestoreFromBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '_deprecated_backup');
    this.projectRoot = __dirname;
  }

  async restore(filename) {
    // Find file in backup
    const subdirs = ['batch-files', 'scripts', 'docs', 'configs', 'misc'];
    
    for (const subdir of subdirs) {
      const sourcePath = path.join(this.backupDir, subdir, filename);
      
      try {
        await fs.access(sourcePath);
        const destPath = path.join(this.projectRoot, filename);
        
        await fs.rename(sourcePath, destPath);
        console.log(`✓ Restored: ${filename}`);
        return true;
      } catch {
        // File not in this subdirectory
      }
    }
    
    console.log(`❌ File not found in backup: ${filename}`);
    return false;
  }

  async listBackup() {
    console.log('\n📦 Files in backup:\n');
    
    const subdirs = ['batch-files', 'scripts', 'docs', 'configs', 'misc'];
    
    for (const subdir of subdirs) {
      const dirPath = path.join(this.backupDir, subdir);
      
      try {
        const files = await fs.readdir(dirPath);
        if (files.length > 0) {
          console.log(`  ${subdir}:`);
          files.forEach(file => console.log(`    - ${file}`));
        }
      } catch {
        // Directory doesn't exist
      }
    }
  }
}

// Command line interface
const args = process.argv.slice(2);

if (args[0] === 'restore') {
  // Restore a specific file
  const restorer = new RestoreFromBackup();
  if (args[1]) {
    restorer.restore(args[1]);
  } else {
    console.log('Usage: node kingdom-cleanup.js restore <filename>');
    restorer.listBackup();
  }
} else if (args[0] === 'list') {
  // List backup contents
  const restorer = new RestoreFromBackup();
  restorer.listBackup();
} else {
  // Run cleanup
  const cleaner = new KingdomCleanup();
  cleaner.run().catch(console.error);
}
