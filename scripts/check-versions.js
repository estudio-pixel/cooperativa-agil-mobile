#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para verificar versões atuais em todos os arquivos
 */

// Caminhos dos arquivos
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const ANDROID_BUILD_GRADLE_PATH = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
const IOS_PROJECT_PATH = path.join(__dirname, '..', 'ios', 'cooperativaagil.xcodeproj', 'project.pbxproj');

// Cores para logs
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    return packageJson.version;
  } catch (error) {
    return `❌ Erro: ${error.message}`;
  }
}

function getAndroidVersion() {
  try {
    const content = fs.readFileSync(ANDROID_BUILD_GRADLE_PATH, 'utf8');
    
    const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
    const versionNameMatch = content.match(/versionName\s+"([^"]*)"/);
    
    return {
      versionCode: versionCodeMatch ? versionCodeMatch[1] : '❌ Não encontrado',
      versionName: versionNameMatch ? versionNameMatch[1] : '❌ Não encontrado'
    };
  } catch (error) {
    return {
      versionCode: `❌ Erro: ${error.message}`,
      versionName: `❌ Erro: ${error.message}`
    };
  }
}

function getiOSVersion() {
  try {
    const content = fs.readFileSync(IOS_PROJECT_PATH, 'utf8');
    
    const marketingVersionMatches = content.match(/MARKETING_VERSION = ([^;]+);/g);
    const currentProjectVersionMatches = content.match(/CURRENT_PROJECT_VERSION = ([^;]+);/g);
    
    // Pega a primeira ocorrência
    const marketingVersion = marketingVersionMatches ? 
      marketingVersionMatches[0].match(/MARKETING_VERSION = ([^;]+);/)[1] : 
      '❌ Não encontrado';
      
    const currentProjectVersion = currentProjectVersionMatches ? 
      currentProjectVersionMatches[0].match(/CURRENT_PROJECT_VERSION = ([^;]+);/)[1] : 
      '❌ Não encontrado';
    
    return {
      marketingVersion,
      currentProjectVersion
    };
  } catch (error) {
    return {
      marketingVersion: `❌ Erro: ${error.message}`,
      currentProjectVersion: `❌ Erro: ${error.message}`
    };
  }
}

function checkVersionConsistency(packageVersion, androidVersion, iosVersion) {
  const versions = [
    packageVersion,
    androidVersion.versionName,
    iosVersion.marketingVersion
  ];
  
  const uniqueVersions = [...new Set(versions.filter(v => !v.startsWith('❌')))];
  
  if (uniqueVersions.length === 1) {
    return { consistent: true, message: 'Todas as versões estão sincronizadas! ✅' };
  } else if (uniqueVersions.length > 1) {
    return { 
      consistent: false, 
      message: 'Versões inconsistentes! Execute `npm run sync:versions` para sincronizar. ⚠️'
    };
  } else {
    return { consistent: false, message: 'Erro ao verificar versões. ❌' };
  }
}

function main() {
  log('🔍 Verificando versões atuais...', 'blue');
  log('═══════════════════════════════════════', 'blue');
  
  // Package.json
  const packageVersion = getPackageVersion();
  log('📦 Package.json:', 'cyan');
  log(`   Versão: ${packageVersion}`, 'yellow');
  log('');
  
  // Android
  const androidVersion = getAndroidVersion();
  log('📱 Android (build.gradle):', 'cyan');
  log(`   versionName: ${androidVersion.versionName}`, 'yellow');
  log(`   versionCode: ${androidVersion.versionCode}`, 'yellow');
  log('');
  
  // iOS
  const iosVersion = getiOSVersion();
  log('🍎 iOS (project.pbxproj):', 'cyan');
  log(`   MARKETING_VERSION: ${iosVersion.marketingVersion}`, 'yellow');
  log(`   CURRENT_PROJECT_VERSION: ${iosVersion.currentProjectVersion}`, 'yellow');
  log('');
  
  // Verificação de consistência
  log('═══════════════════════════════════════', 'blue');
  const consistency = checkVersionConsistency(packageVersion, androidVersion, iosVersion);
  
  if (consistency.consistent) {
    log(consistency.message, 'green');
  } else {
    log(consistency.message, 'red');
  }
  
  log('');
  log('💡 Comandos disponíveis:', 'blue');
  log('   npm run version:alpha    - Nova versão alpha', 'yellow');
  log('   npm run version:beta     - Nova versão beta', 'yellow');
  log('   npm run version:patch    - Nova versão patch', 'yellow');
  log('   npm run version:minor    - Nova versão minor', 'yellow');
  log('   npm run version:major    - Nova versão major', 'yellow');
  log('   npm run sync:versions    - Sincronizar versões', 'yellow');
}

// Executa o script
if (require.main === module) {
  main();
}

module.exports = {
  getPackageVersion,
  getAndroidVersion,
  getiOSVersion,
  checkVersionConsistency
};
