#!/usr/bin/env node

/**
 * VibeLedger Real-Time Deployment Manager
 * Handles environment setup, configuration validation, and deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentManager {
  constructor() {
    this.environments = ['development', 'staging', 'production'];
    this.requiredPackages = ['twilio', 'aws-sdk', 'node-fetch', 'dotenv'];
  }

  // Check if all required packages are installed
  checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const missing = this.requiredPackages.filter(pkg => !dependencies[pkg]);
      
      if (missing.length > 0) {
        console.log(`❌ Missing packages: ${missing.join(', ')}`);
        console.log('Installing missing packages...');
        execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' });
      } else {
        console.log('✅ All dependencies satisfied');
      }
    } catch (error) {
      console.error('❌ Error checking dependencies:', error.message);
    }
  }

  // Validate configuration for environment
  validateConfig(env = 'development') {
    console.log(`🔍 Validating ${env} configuration...`);
    
    const envFile = env === 'production' ? '.env.prod' : '.env';
    const envPath = path.join(__dirname, envFile);
    
    if (!fs.existsSync(envPath)) {
      console.error(`❌ Configuration file ${envFile} not found`);
      return false;
    }

    // Load and check required variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const required = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_FROM_NUMBER',
      'SMS_PROVIDER',
      'JWT_SECRET'
    ];

    const missing = required.filter(key => {
      const regex = new RegExp(`^${key}=.+$`, 'm');
      return !regex.test(envContent) || envContent.includes(`${key}=your_`);
    });

    if (missing.length > 0) {
      console.error(`❌ Missing or incomplete config: ${missing.join(', ')}`);
      return false;
    }

    console.log('✅ Configuration validation passed');
    return true;
  }

  // Test SMS functionality
  async testSMS() {
    console.log('📱 Testing SMS functionality...');
    
    try {
      execSync('npm run test:sms', { stdio: 'inherit' });
      console.log('✅ SMS test completed');
    } catch (error) {
      console.error('❌ SMS test failed');
      throw error;
    }
  }

  // Start server with specific environment
  startServer(env = 'development') {
    console.log(`🚀 Starting server in ${env} mode...`);
    
    const envVars = env === 'production' ? 'NODE_ENV=production' : 'NODE_ENV=development';
    
    try {
      execSync(`${envVars} npm run start:backend`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
    }
  }

  // Deploy to production
  async deployProduction() {
    console.log('🚀 === VibeLedger Production Deployment ===\n');
    
    try {
      // 1. Check dependencies
      this.checkDependencies();
      
      // 2. Validate production config
      if (!this.validateConfig('production')) {
        throw new Error('Production configuration validation failed');
      }
      
      // 3. Run tests
      console.log('🧪 Running production tests...');
      execSync('npm test', { stdio: 'inherit' });
      
      // 4. Test SMS in production mode
      process.env.NODE_ENV = 'production';
      await this.testSMS();
      
      // 5. Start production server
      console.log('✅ All checks passed! Starting production server...');
      this.startServer('production');
      
    } catch (error) {
      console.error('❌ Production deployment failed:', error.message);
      process.exit(1);
    }
  }

  // Setup development environment
  setupDevelopment() {
    console.log('🛠️ === VibeLedger Development Setup ===\n');
    
    try {
      // 1. Check dependencies
      this.checkDependencies();
      
      // 2. Validate dev config
      if (!this.validateConfig('development')) {
        console.log('⚠️ Development configuration incomplete');
        console.log('Run: npm run setup:sms to configure SMS providers');
      }
      
      // 3. Start development server
      console.log('✅ Development environment ready!');
      this.startServer('development');
      
    } catch (error) {
      console.error('❌ Development setup failed:', error.message);
    }
  }

  // Health check
  healthCheck() {
    console.log('🏥 === VibeLedger Health Check ===\n');
    
    try {
      const response = execSync('curl -s http://localhost:3000/health', { encoding: 'utf8' });
      const health = JSON.parse(response);
      
      console.log('✅ Server Health:', health.status);
      console.log('📊 Uptime:', health.uptime);
      console.log('💾 Memory Usage:', health.memory);
      
    } catch (error) {
      console.error('❌ Health check failed - is the server running?');
    }
  }

  // Show help
  showHelp() {
    console.log(`
🚀 VibeLedger Real-Time Deployment Manager

Commands:
  setup:dev         Setup development environment
  deploy:prod       Deploy to production
  validate [env]    Validate configuration (dev/prod)
  test:sms          Test SMS functionality
  health            Check server health
  help              Show this help

Examples:
  node deploy.js setup:dev
  node deploy.js deploy:prod
  node deploy.js validate production
  node deploy.js test:sms
  node deploy.js health
    `);
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new DeploymentManager();
  const command = process.argv[2];
  const env = process.argv[3];

  switch (command) {
    case 'setup:dev':
      manager.setupDevelopment();
      break;
    case 'deploy:prod':
      manager.deployProduction();
      break;
    case 'validate':
      manager.validateConfig(env || 'development');
      break;
    case 'test:sms':
      manager.testSMS();
      break;
    case 'health':
      manager.healthCheck();
      break;
    case 'help':
    default:
      manager.showHelp();
  }
}

module.exports = DeploymentManager;
