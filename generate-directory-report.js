#!/usr/bin/env node

/**
 * Valifi Project Directory Report Generator
 * Generates comprehensive markdown reports of the project structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DirectoryReporter {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.report = [];
    this.stats = {
      totalFiles: 0,
      totalDirs: 0,
      totalSize: 0,
      fileTypes: {},
      largestFiles: [],
      emptyDirs: [],
      duplicateFiles: new Map(),
      bots: [],
      components: [],
      apiEndpoints: [],
      missingFiles: [],
      issues: []
    };
  }

  generateReport() {
    this.addHeader();
    this.scanProject();
    this.analyzeStructure();
    this.checkHealth();
    this.addSummary();
    this.addDetailedAnalysis();
    this.addRecommendations();
    this.saveReport();
  }

  addHeader() {
    const now = new Date().toISOString();
    this.report.push('# Valifi FinTech Project - Directory Analysis Report');
    this.report.push(`\n> Generated on: ${now}`);
    this.report.push(`> Project Path: ${this.projectPath}`);
    this.report.push('\n---\n');
  }

  scanProject(dirPath = this.projectPath, level = 0) {
    if (level > 5) return; // Limit recursion depth

    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        
        // Skip certain directories
        if (item === 'node_modules' || item === '.git' || item === '.next' || item === 'dist') {
          return;
        }

        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            this.stats.totalDirs++;
            const subItems = fs.readdirSync(itemPath);
            
            if (subItems.length === 0) {
              this.stats.emptyDirs.push(path.relative(this.projectPath, itemPath));
            }
            
            // Check for bot modules
            if (item === 'bots') {
              this.analyzeBots(itemPath);
            }
            
            // Check for components
            if (item === 'components') {
              this.analyzeComponents(itemPath);
            }
            
            // Check for API endpoints
            if (itemPath.includes('pages') && itemPath.includes('api')) {
              this.analyzeAPI(itemPath);
            }
            
            this.scanProject(itemPath, level + 1);
          } else {
            this.stats.totalFiles++;
            this.stats.totalSize += stats.size;
            
            // Track file types
            const ext = path.extname(item) || 'no-ext';
            this.stats.fileTypes[ext] = (this.stats.fileTypes[ext] || 0) + 1;
            
            // Track large files
            if (stats.size > 1024 * 1024) { // Files larger than 1MB
              this.stats.largestFiles.push({
                path: path.relative(this.projectPath, itemPath),
                size: stats.size
              });
            }
          }
        } catch (err) {
          this.stats.issues.push(`Cannot access: ${path.relative(this.projectPath, itemPath)}`);
        }
      });
    } catch (err) {
      this.stats.issues.push(`Cannot read directory: ${path.relative(this.projectPath, dirPath)}`);
    }
  }

  analyzeBots(botsPath) {
    const botDirs = fs.readdirSync(botsPath).filter(item => {
      const itemPath = path.join(botsPath, item);
      return fs.statSync(itemPath).isDirectory();
    });

    botDirs.forEach(botDir => {
      const botPath = path.join(botsPath, botDir);
      const botFiles = fs.readdirSync(botPath);
      const mainFile = botFiles.find(f => f.endsWith('Bot.js'));
      
      this.stats.bots.push({
        name: botDir,
        hasMainFile: !!mainFile,
        fileCount: botFiles.length,
        files: botFiles
      });
    });
  }

  analyzeComponents(componentsPath) {
    const componentFiles = fs.readdirSync(componentsPath).filter(f => 
      f.endsWith('.tsx') || f.endsWith('.jsx')
    );

    componentFiles.forEach(file => {
      const filePath = path.join(componentsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').length;
      
      this.stats.components.push({
        name: file,
        lines: lines,
        hasExport: content.includes('export'),
        usesHooks: content.includes('useState') || content.includes('useEffect')
      });
    });
  }

  analyzeAPI(apiPath) {
    const apiFiles = fs.readdirSync(apiPath).filter(f => 
      f.endsWith('.js') || f.endsWith('.ts')
    );

    apiFiles.forEach(file => {
      if (file !== '[...slug].ts') {
        this.stats.apiEndpoints.push(file);
      }
    });
  }

  analyzeStructure() {
    // Sort largest files
    this.stats.largestFiles.sort((a, b) => b.size - a.size);
    this.stats.largestFiles = this.stats.largestFiles.slice(0, 10);
  }

  checkHealth() {
    // Check for required files
    const requiredFiles = [
      'package.json',
      'README.md',
      'next.config.js',
      'tsconfig.json',
      'vercel.json'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.projectPath, file);
      if (!fs.existsSync(filePath)) {
        this.stats.missingFiles.push(file);
      }
    });

    // Check package.json
    const packagePath = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Check for missing dependencies
      const requiredDeps = ['next', 'react', 'react-dom'];
      requiredDeps.forEach(dep => {
        if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
          this.stats.issues.push(`Missing required dependency: ${dep}`);
        }
      });
    }
  }

  addSummary() {
    this.report.push('## 📊 Executive Summary\n');
    
    this.report.push('### Key Metrics\n');
    this.report.push(`- **Total Files**: ${this.stats.totalFiles}`);
    this.report.push(`- **Total Directories**: ${this.stats.totalDirs}`);
    this.report.push(`- **Total Size**: ${this.formatSize(this.stats.totalSize)}`);
    this.report.push(`- **Bot Modules**: ${this.stats.bots.length}`);
    this.report.push(`- **React Components**: ${this.stats.components.length}`);
    this.report.push(`- **API Endpoints**: ${this.stats.apiEndpoints.length}`);
    
    this.report.push('\n### Project Health\n');
    
    const healthScore = this.calculateHealthScore();
    const healthEmoji = healthScore > 80 ? '✅' : healthScore > 60 ? '⚠️' : '❌';
    
    this.report.push(`**Overall Health Score**: ${healthEmoji} ${healthScore}%\n`);
    
    if (this.stats.missingFiles.length > 0) {
      this.report.push('#### ⚠️ Missing Required Files:');
      this.stats.missingFiles.forEach(file => {
        this.report.push(`- ${file}`);
      });
    }
    
    if (this.stats.issues.length > 0) {
      this.report.push('\n#### ❌ Issues Found:');
      this.stats.issues.slice(0, 5).forEach(issue => {
        this.report.push(`- ${issue}`);
      });
    }
    
    this.report.push('\n---\n');
  }

  addDetailedAnalysis() {
    this.report.push('## 🔍 Detailed Analysis\n');
    
    // File Type Distribution
    this.report.push('### File Type Distribution\n');
    this.report.push('| Extension | Count | Percentage |');
    this.report.push('|-----------|-------|------------|');
    
    const sortedTypes = Object.entries(this.stats.fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    
    sortedTypes.forEach(([ext, count]) => {
      const percentage = ((count / this.stats.totalFiles) * 100).toFixed(1);
      this.report.push(`| ${ext} | ${count} | ${percentage}% |`);
    });
    
    // Largest Files
    this.report.push('\n### 📦 Largest Files\n');
    this.report.push('| File | Size |');
    this.report.push('|------|------|');
    
    this.stats.largestFiles.forEach(file => {
      this.report.push(`| ${file.path} | ${this.formatSize(file.size)} |`);
    });
    
    // Bot Modules
    this.report.push('\n### 🤖 Bot Modules Analysis\n');
    this.report.push('| Bot Name | Status | Files |');
    this.report.push('|----------|--------|-------|');
    
    this.stats.bots.forEach(bot => {
      const status = bot.hasMainFile ? '✅ Active' : '⚠️ Missing Main';
      this.report.push(`| ${bot.name} | ${status} | ${bot.fileCount} |`);
    });
    
    // Components Analysis
    this.report.push('\n### 🧩 Component Analysis\n');
    this.report.push('| Component | Lines | Has Export | Uses Hooks |');
    this.report.push('|-----------|-------|------------|------------|');
    
    this.stats.components.slice(0, 20).forEach(comp => {
      const exportStatus = comp.hasExport ? '✅' : '❌';
      const hooksStatus = comp.usesHooks ? '✅' : '❌';
      this.report.push(`| ${comp.name} | ${comp.lines} | ${exportStatus} | ${hooksStatus} |`);
    });
    
    // Empty Directories
    if (this.stats.emptyDirs.length > 0) {
      this.report.push('\n### 📂 Empty Directories\n');
      this.stats.emptyDirs.forEach(dir => {
        this.report.push(`- ${dir}`);
      });
    }
    
    this.report.push('\n---\n');
  }

  addRecommendations() {
    this.report.push('## 💡 Recommendations\n');
    
    const recommendations = [];
    
    // Check for issues
    if (this.stats.missingFiles.length > 0) {
      recommendations.push('1. **Add Missing Files**: Create the required configuration files listed above.');
    }
    
    if (this.stats.emptyDirs.length > 5) {
      recommendations.push('2. **Clean Empty Directories**: Remove or populate empty directories to maintain clean structure.');
    }
    
    const jsFiles = this.stats.fileTypes['.js'] || 0;
    const tsFiles = (this.stats.fileTypes['.ts'] || 0) + (this.stats.fileTypes['.tsx'] || 0);
    
    if (jsFiles > tsFiles) {
      recommendations.push('3. **Consider TypeScript Migration**: Most files are JavaScript. Consider migrating to TypeScript for better type safety.');
    }
    
    if (this.stats.largestFiles.some(f => f.size > 5 * 1024 * 1024)) {
      recommendations.push('4. **Optimize Large Files**: Some files are over 5MB. Consider compression or splitting.');
    }
    
    const botsWithoutMain = this.stats.bots.filter(b => !b.hasMainFile);
    if (botsWithoutMain.length > 0) {
      recommendations.push('5. **Fix Bot Modules**: Some bot modules are missing their main files.');
    }
    
    if (this.stats.components.some(c => c.lines > 500)) {
      recommendations.push('6. **Refactor Large Components**: Some components exceed 500 lines. Consider splitting into smaller components.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ **Project structure looks good!** No major issues detected.');
    }
    
    recommendations.forEach(rec => {
      this.report.push(`\n${rec}`);
    });
    
    this.report.push('\n---\n');
  }

  calculateHealthScore() {
    let score = 100;
    
    // Deduct for missing files
    score -= this.stats.missingFiles.length * 10;
    
    // Deduct for issues
    score -= this.stats.issues.length * 5;
    
    // Deduct for empty directories
    score -= Math.min(this.stats.emptyDirs.length * 2, 10);
    
    // Deduct for bots without main files
    const botsWithoutMain = this.stats.bots.filter(b => !b.hasMainFile).length;
    score -= botsWithoutMain * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  saveReport() {
    // Add footer
    this.report.push('## 📝 Report Metadata\n');
    this.report.push(`- **Generated By**: Valifi Directory Reporter v1.0`);
    this.report.push(`- **Node Version**: ${process.version}`);
    this.report.push(`- **Platform**: ${process.platform}`);
    this.report.push(`- **Report Date**: ${new Date().toISOString()}`);
    
    const reportContent = this.report.join('\n');
    const reportPath = path.join(this.projectPath, 'DIRECTORY-REPORT.md');
    
    fs.writeFileSync(reportPath, reportContent);
    
    console.log('✅ Report generated successfully!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📊 Total items analyzed: ${this.stats.totalFiles + this.stats.totalDirs}`);
  }
}

// Run the reporter
const projectPath = __dirname;
const reporter = new DirectoryReporter(projectPath);
reporter.generateReport();