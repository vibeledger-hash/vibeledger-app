#!/usr/bin/env node

/**
 * SMS Provider Setup Script
 * This script helps you configure SMS providers for real-time OTP sending
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const providers = {
  twilio: {
    name: 'Twilio (Global - $15 Free Credit)',
    vars: {
      TWILIO_ACCOUNT_SID: 'Your Twilio Account SID',
      TWILIO_AUTH_TOKEN: 'Your Twilio Auth Token',
      TWILIO_FROM_NUMBER: 'Your Twilio phone number (e.g., +1234567890)'
    },
    signup: 'https://www.twilio.com/try-twilio',
    envVar: 'SMS_PROVIDER=twilio'
  },
  aws: {
    name: 'AWS SNS (100 Free SMS/Month)',
    vars: {
      AWS_ACCESS_KEY_ID: 'Your AWS Access Key ID',
      AWS_SECRET_ACCESS_KEY: 'Your AWS Secret Access Key',
      AWS_REGION: 'AWS region (e.g., us-east-1)'
    },
    signup: 'https://aws.amazon.com/sns/',
    envVar: 'SMS_PROVIDER=aws'
  },
  textlocal: {
    name: 'TextLocal (India - Free Trial)',
    vars: {
      TEXTLOCAL_API_KEY: 'Your TextLocal API Key',
      TEXTLOCAL_SENDER: 'Your sender name (6 characters max)'
    },
    signup: 'https://www.textlocal.in/signup',
    envVar: 'SMS_PROVIDER=textlocal'
  },
  vonage: {
    name: 'Vonage/Nexmo (€2 Free Credit)',
    vars: {
      VONAGE_API_KEY: 'Your Vonage API Key',
      VONAGE_API_SECRET: 'Your Vonage API Secret',
      VONAGE_FROM: 'Sender name (optional, defaults to VibeLedger)'
    },
    signup: 'https://developer.vonage.com/sign-up',
    envVar: 'SMS_PROVIDER=vonage'
  }
};

async function setupProvider() {
  console.log('\n🚀 VibeLedger SMS Provider Setup\n');
  console.log('Choose an SMS provider to enable real-time OTP sending:\n');
  
  const providerKeys = Object.keys(providers);
  providerKeys.forEach((key, index) => {
    console.log(`${index + 1}. ${providers[key].name}`);
  });
  console.log(`${providerKeys.length + 1}. Skip setup (continue in demo mode)`);
  
  const choice = await question('\nSelect provider (1-4): ');
  const choiceIndex = parseInt(choice) - 1;
  
  if (choiceIndex >= providerKeys.length) {
    console.log('\n⚠️ Skipping SMS setup - app will run in demo mode');
    rl.close();
    return;
  }
  
  const selectedProvider = providerKeys[choiceIndex];
  const providerConfig = providers[selectedProvider];
  
  console.log(`\n📋 Setting up ${providerConfig.name}\n`);
  console.log(`📝 Sign up at: ${providerConfig.signup}\n`);
  
  const envVars = {};
  
  for (const [varName, description] of Object.entries(providerConfig.vars)) {
    const value = await question(`Enter ${description}: `);
    if (value.trim()) {
      envVars[varName] = value.trim();
    }
  }
  
  // Read existing .env or create new one
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Add or update environment variables
  for (const [varName, value] of Object.entries(envVars)) {
    const regex = new RegExp(`^${varName}=.*$`, 'm');
    const newLine = `${varName}=${value}`;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
    } else {
      envContent += envContent.endsWith('\n') ? newLine + '\n' : '\n' + newLine + '\n';
    }
  }
  
  // Add SMS_PROVIDER setting
  const providerRegex = /^SMS_PROVIDER=.*$/m;
  const providerLine = providerConfig.envVar;
  
  if (providerRegex.test(envContent)) {
    envContent = envContent.replace(providerRegex, providerLine);
  } else {
    envContent += envContent.endsWith('\n') ? providerLine + '\n' : '\n' + providerLine + '\n';
  }
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ SMS provider configured successfully!');
  console.log(`📁 Environment variables saved to: ${envPath}`);
  console.log('\n🔄 Restart your backend server to enable real SMS sending:');
  console.log('   npm run start:backend\n');
  
  rl.close();
}

if (require.main === module) {
  setupProvider().catch(console.error);
}

module.exports = { setupProvider };
