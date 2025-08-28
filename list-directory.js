#!/usr/bin/env node

/**
 * Valifi Project Directory Listing Utility
 * Provides comprehensive directory analysis and listing features
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// File type icons
const icons = {
  folder: '📁',
  file: '📄',
  js: '📜',
  ts: '🔷',
  json: '📋',
  md: '📝',
  html: '🌐',
  css: '🎨',
  image: '🖼️',
  git: '🔀',
  config: '⚙️',
  lock: '🔒',
  env: '🔐',
  sql: '🗄️',
  zip: '📦',
  bat: '⚡',
  sh: '🐚'
};

// Statistics tracker
class ProjectStats {
  constructor() {
    this.totalFiles = 0;
    this.totalDirs = 0;
    this.filesByExtension = {};
    this.totalSize = 0;
    this.largestFile = { name: '', size: 0 };
    this.botModules = [];
    this.componentFiles = [];
    this.apiEndpoints = [];
  }

  addFile(filePath, stats) {
    this.totalFiles++;
    const ext = path.extname(filePath).toLowerCase() || 'no-ext';
    this.filesByExtension[ext] = (this.filesByExtension[ext] || 0) + 1;
    this.totalSize += stats.size;
    
    if (stats.size > this.largestFile.size) {
      this.largestFile = { name: filePath, size: stats.size };
    }

    // Track specific file types
    const basename = path.basename(filePath);
    const dirname = path.dirname(filePath);
    
    if (dirname.includes('bots') && basename.endsWith('Bot.js')) {
      this.botModules.push(filePath);
    }
    if (dirname.includes('components') && basename.endsWith('.tsx')) {
      this.componentFiles.push(basename);
    }
    if (dirname.includes('api') && (basename.endsWith('.js') || basename.endsWith('.ts'))) {
      this.apiEndpoints.push(basename);
    }
  }

  addDirectory() {
    this.totalDirs++;
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

  printReport() {
    console.log('\n' + colors.bright + colors.cyan + '═══════════════════════════════════════════════' + colors.reset);
    console.log(colors.bright + colors.cyan + '       VALIFI PROJECT STATISTICS REPORT' + colors.reset);
    console.log(colors.bright + colors.cyan + '═══════════════════════════════════════════════' + colors.reset);
    
    console.log('\n' + colors.yellow + '📊 General Statistics:' + colors.reset);
    console.log(`  Total Directories: ${colors.green}${this.totalDirs}${colors.reset}`);
    console.log(`  Total Files: ${colors.green}${this.totalFiles}${colors.reset}`);
    console.log(`  Total Size: ${colors.green}${this.formatSize(this.totalSize)}${colors.reset}`);
    console.log(`  Largest File: ${colors.blue}${path.basename(this.largestFile.name)}${colors.reset} (${this.formatSize(this.largestFile.size)})`);
    
    console.log('\n' + colors.yellow + '📂 File Types Distribution:' + colors.reset);
    const sortedExtensions = Object.entries(this.filesByExtension)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedExtensions.forEach(([ext, count]) => {
      const icon = this.getIconForExtension(ext);
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`  ${icon} ${ext.padEnd(10)} ${colors.green}${bar}${colors.reset} ${count}`);
    });
    
    console.log('\n' + colors.yellow + '🤖 Bot Modules Found:' + colors.reset);
    if (this.botModules.length > 0) {
      this.botModules.slice(0, 10).forEach(bot => {
        const botName = path.basename(path.dirname(bot));
        console.log(`  ${colors.magenta}✓${colors.reset} ${botName}`);
      });
      if (this.botModules.length > 10) {
        console.log(`  ${colors.dim}... and ${this.botModules.length - 10} more${colors.reset}`);
      }
    } else {
      console.log(`  ${colors.red}No bot modules found${colors.reset}`);
    }
    
    console.log('\n' + colors.yellow + '🧩 React Components:' + colors.reset);
    console.log(`  Total Components: ${colors.green}${this.componentFiles.length}${colors.reset}`);
    if (this.componentFiles.length > 0) {
      const sampleComponents = this.componentFiles.slice(0, 5);
      sampleComponents.forEach(comp => {
        console.log(`  ${colors.blue}•${colors.reset} ${comp}`);
      });
      if (this.componentFiles.length > 5) {
        console.log(`  ${colors.dim}... and ${this.componentFiles.length - 5} more${colors.reset}`);
      }
    }
    
    console.log('\n' + colors.yellow + '🔌 API Endpoints:' + colors.reset);
    console.log(`  Total API Files: ${colors.green}${this.apiEndpoints.length}${colors.reset}`);
    
    console.log('\n' + colors.cyan + '═══════════════════════════════════════════════' + colors.reset);
  }

  getIconForExtension(ext) {
    const extMap = {
      '.js': icons.js,
      '.ts': icons.ts,
      '.tsx': icons.ts,
      '.json': icons.json,
      '.md': icons.md,
      '.html': icons.html,
      '.css': icons.css,
      '.png': icons.image,
      '.jpg': icons.image,
      '.gif': icons.image,
      '.sql': icons.sql,
      '.env': icons.env,
      '.zip': icons.zip,
      '.bat': icons.bat,
      '.sh': icons.sh,
      'no-ext': icons.config
    };
    return extMap[ext] || icons.file;
  }
}

// Directory tree builder
class DirectoryTree {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.stats = new ProjectStats();
    this.ignorePatterns = [
      'node_modules',
      '.git/objects',
      '.git/logs',
      '.git/refs',
      '.git/hooks',
      'dist',
      'build',
      '.next',
      '.vercel',
      '*.log',
      '.DS_Store',
      'Thumbs.db'
    ];
  }

  shouldIgnore(filePath) {
    const relativePath = path.relative(this.rootPath, filePath);
    return this.ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(relativePath);
      }
      return relativePath.includes(pattern);
    });
  }

  buildTree(dirPath = this.rootPath, prefix = '', isLast = true) {
    if (this.shouldIgnore(dirPath)) {
      return '';
    }

    let output = '';
    const items = [];
    
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (!this.shouldIgnore(filePath)) {
          try {
            const stats = fs.statSync(filePath);
            items.push({ name: file, path: filePath, isDirectory: stats.isDirectory(), stats });
          } catch (err) {
            // Skip files that can't be accessed
          }
        }
      });
      
      // Sort: directories first, then files
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      items.forEach((item, index) => {
        const isLastItem = index === items.length - 1;
        const connector = isLastItem ? '└── ' : '├── ';
        const extension = isLastItem ? '    ' : '│   ';
        
        if (item.isDirectory) {
          this.stats.addDirectory();
          output += prefix + connector + colors.blue + icons.folder + ' ' + item.name + colors.reset + '\n';
          output += this.buildTree(item.path, prefix + extension, isLastItem);
        } else {
          this.stats.addFile(item.path, item.stats);
          const ext = path.extname(item.name).toLowerCase();
          const icon = this.stats.getIconForExtension(ext);
          const size = this.stats.formatSize(item.stats.size);
          output += prefix + connector + icon + ' ' + item.name + colors.dim + ` (${size})` + colors.reset + '\n';
        }
      });
    } catch (err) {
      output += prefix + colors.red + `Error reading directory: ${err.message}` + colors.reset + '\n';
    }
    
    return output;
  }

  printTree() {
    console.log('\n' + colors.bright + colors.green + '🌳 VALIFI PROJECT DIRECTORY TREE' + colors.reset);
    console.log(colors.green + '═══════════════════════════════════════════════' + colors.reset);
    console.log(colors.blue + icons.folder + ' ' + path.basename(this.rootPath) + colors.reset);
    console.log(this.buildTree());
  }
}

// Module analyzer
class ModuleAnalyzer {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.modules = {
      bots: [],
      components: [],
      pages: [],
      services: [],
      lib: []
    };
  }

  analyze() {
    // Analyze bot modules
    const botsPath = path.join(this.rootPath, 'bots');
    if (fs.existsSync(botsPath)) {
      const botDirs = fs.readdirSync(botsPath).filter(item => {
        const itemPath = path.join(botsPath, item);
        return fs.statSync(itemPath).isDirectory();
      });
      
      botDirs.forEach(botDir => {
        const botPath = path.join(botsPath, botDir);
        const botFiles = fs.readdirSync(botPath).filter(f => f.endsWith('.js'));
        if (botFiles.length > 0) {
          this.modules.bots.push({
            name: botDir,
            files: botFiles,
            path: botPath
          });
        }
      });
    }
    
    // Analyze components
    const componentsPath = path.join(this.rootPath, 'components');
    if (fs.existsSync(componentsPath)) {
      const componentFiles = fs.readdirSync(componentsPath).filter(f => 
        f.endsWith('.tsx') || f.endsWith('.jsx')
      );
      this.modules.components = componentFiles;
    }
    
    // Analyze pages
    const pagesPath = path.join(this.rootPath, 'pages');
    if (fs.existsSync(pagesPath)) {
      this.analyzeDirectory(pagesPath, '', (filePath, relativePath) => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
          this.modules.pages.push(relativePath);
        }
      });
    }
    
    return this.modules;
  }

  analyzeDirectory(dirPath, relativePath, callback) {
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const relPath = path.join(relativePath, item);
      
      if (fs.statSync(itemPath).isDirectory()) {
        this.analyzeDirectory(itemPath, relPath, callback);
      } else {
        callback(itemPath, relPath);
      }
    });
  }

  printAnalysis() {
    console.log('\n' + colors.bright + colors.magenta + '🔍 MODULE ANALYSIS REPORT' + colors.reset);
    console.log(colors.magenta + '═══════════════════════════════════════════════' + colors.reset);
    
    console.log('\n' + colors.yellow + '🤖 Bot Modules (' + this.modules.bots.length + ' total):' + colors.reset);
    this.modules.bots.forEach(bot => {
      console.log(`  ${colors.green}✓${colors.reset} ${bot.name}`);
      bot.files.forEach(file => {
        console.log(`    ${colors.dim}└─ ${file}${colors.reset}`);
      });
    });
    
    console.log('\n' + colors.yellow + '🧩 Components (' + this.modules.components.length + ' total):' + colors.reset);
    const sampleComponents = this.modules.components.slice(0, 10);
    sampleComponents.forEach(comp => {
      console.log(`  ${colors.blue}•${colors.reset} ${comp}`);
    });
    if (this.modules.components.length > 10) {
      console.log(`  ${colors.dim}... and ${this.modules.components.length - 10} more${colors.reset}`);
    }
    
    console.log('\n' + colors.yellow + '📄 Pages/Routes (' + this.modules.pages.length + ' total):' + colors.reset);
    const samplePages = this.modules.pages.slice(0, 10);
    samplePages.forEach(page => {
      console.log(`  ${colors.cyan}→${colors.reset} ${page}`);
    });
    if (this.modules.pages.length > 10) {
      console.log(`  ${colors.dim}... and ${this.modules.pages.length - 10} more${colors.reset}`);
    }
  }
}

// Main execution
function main() {
  const projectPath = __dirname;
  
  console.clear();
  console.log(colors.bright + colors.cyan + '╔═══════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.cyan + '║     VALIFI FINTECH PROJECT DIRECTORY TOOL     ║' + colors.reset);
  console.log(colors.bright + colors.cyan + '╚═══════════════════════════════════════════════╝' + colors.reset);
  console.log(colors.dim + `Analyzing: ${projectPath}` + colors.reset);
  
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  switch (command) {
    case 'tree':
      const tree = new DirectoryTree(projectPath);
      tree.printTree();
      tree.stats.printReport();
      break;
      
    case 'stats':
      const statsTree = new DirectoryTree(projectPath);
      statsTree.buildTree(); // Build to collect stats
      statsTree.stats.printReport();
      break;
      
    case 'modules':
      const analyzer = new ModuleAnalyzer(projectPath);
      analyzer.analyze();
      analyzer.printAnalysis();
      break;
      
    case 'simple':
      simpleList(projectPath);
      break;
      
    case 'all':
    default:
      const fullTree = new DirectoryTree(projectPath);
      fullTree.printTree();
      fullTree.stats.printReport();
      
      const moduleAnalyzer = new ModuleAnalyzer(projectPath);
      moduleAnalyzer.analyze();
      moduleAnalyzer.printAnalysis();
      break;
  }
  
  console.log('\n' + colors.dim + 'Usage: node list-directory.js [tree|stats|modules|simple|all]' + colors.reset);
}

function simpleList(dirPath, indent = '') {
  const items = fs.readdirSync(dirPath);
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      console.log(indent + colors.blue + '[DIR]  ' + item + colors.reset);
      if (!item.includes('node_modules') && !item.includes('.git')) {
        simpleList(itemPath, indent + '  ');
      }
    } else {
      const size = (stats.size / 1024).toFixed(2) + ' KB';
      console.log(indent + colors.green + '[FILE] ' + item + colors.dim + ' (' + size + ')' + colors.reset);
    }
  });
}

// Run the tool
main();