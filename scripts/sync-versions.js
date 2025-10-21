#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para sincronizar versões entre package.json, Android e iOS
 * Lê a versão do package.json e atualiza os arquivos nativos
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
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    return packageJson.version;
  } catch (error) {
    log(`❌ Erro ao ler package.json: ${error.message}`, 'red');
    process.exit(1);
  }
}

function parseVersion(version) {
  // Remove prefixos como v1.0.0
  const cleanVersion = version.replace(/^v/, '');
  
  // Extrai versão base e sufixo (alpha/beta)
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta)\.(\d+))?$/;
  const match = cleanVersion.match(versionRegex);
  
  if (!match) {
    log(`❌ Formato de versão inválido: ${version}`, 'red');
    log('   Formato esperado: x.y.z, x.y.z-alpha.n ou x.y.z-beta.n', 'yellow');
    process.exit(1);
  }
  
  const [, major, minor, patch, prerelease, prereleaseNumber] = match;
  
  return {
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
    prerelease,
    prereleaseNumber: parseInt(prereleaseNumber, 10) || 0,
    full: cleanVersion
  };
}

function generateVersionCode(version) {
  // Gera versionCode único baseado na versão
  // Formato: MMMMPPPPBBBB (Major, Minor+Patch, Build)
  const { major, minor, patch, prereleaseNumber } = version;
  
  // Para versões de produção, usar número alto para build
  const buildNumber = version.prerelease ? prereleaseNumber : 99;
  
  // Calcula o versionCode
  const versionCode = (major * 10000000) + ((minor * 100 + patch) * 10000) + buildNumber;
  
  return versionCode;
}

function updateAndroidVersion(version) {
  try {
    log('📱 Atualizando versão do Android...', 'blue');
    
    let content = fs.readFileSync(ANDROID_BUILD_GRADLE_PATH, 'utf8');
    const versionCode = generateVersionCode(version);
    
    // Atualiza versionCode
    content = content.replace(
      /versionCode\s+\d+/,
      `versionCode ${versionCode}`
    );
    
    // Atualiza versionName
    content = content.replace(
      /versionName\s+"[^"]*"/,
      `versionName "${version.full}"`
    );
    
    fs.writeFileSync(ANDROID_BUILD_GRADLE_PATH, content);
    
    log(`   ✅ versionName: "${version.full}"`, 'green');
    log(`   ✅ versionCode: ${versionCode}`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Erro ao atualizar Android: ${error.message}`, 'red');
    return false;
  }
}

function updateiOSVersion(version) {
  try {
    log('🍎 Atualizando versão do iOS...', 'blue');
    
    let content = fs.readFileSync(IOS_PROJECT_PATH, 'utf8');
    const buildNumber = generateVersionCode(version);
    
    // Atualiza MARKETING_VERSION (versão visível)
    content = content.replace(
      /MARKETING_VERSION = [^;]+;/g,
      `MARKETING_VERSION = ${version.full};`
    );
    
    // Atualiza CURRENT_PROJECT_VERSION (build number)
    content = content.replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`
    );
    
    fs.writeFileSync(IOS_PROJECT_PATH, content);
    
    log(`   ✅ MARKETING_VERSION: ${version.full}`, 'green');
    log(`   ✅ CURRENT_PROJECT_VERSION: ${buildNumber}`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Erro ao atualizar iOS: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Sincronizando versões...', 'blue');
  log('────────────────────────────', 'blue');
  
  // Lê versão do package.json
  const packageVersion = readPackageVersion();
  log(`📦 Versão do package.json: ${packageVersion}`, 'yellow');
  
  // Parse da versão
  const version = parseVersion(packageVersion);
  
  // Mostra informações da versão
  log(`📋 Informações da versão:`, 'yellow');
  log(`   • Versão base: ${version.major}.${version.minor}.${version.patch}`, 'yellow');
  if (version.prerelease) {
    log(`   • Pré-release: ${version.prerelease}.${version.prereleaseNumber}`, 'yellow');
  }
  
  log('────────────────────────────', 'blue');
  
  // Atualiza versões
  const androidSuccess = updateAndroidVersion(version);
  const iosSuccess = updateiOSVersion(version);
  
  log('────────────────────────────', 'blue');
  
  if (androidSuccess && iosSuccess) {
    log('✅ Todas as versões foram sincronizadas com sucesso!', 'green');
    log('', 'reset');
    log('📱 Próximos passos:', 'blue');
    log('   • Para Android: Build e teste o APK/AAB', 'yellow');
    log('   • Para iOS: Archive e envie para TestFlight/App Store', 'yellow');
  } else {
    log('❌ Algumas versões falharam ao sincronizar', 'red');
    process.exit(1);
  }
}

// Executa o script
if (require.main === module) {
  main();
}

module.exports = {
  parseVersion,
  generateVersionCode,
  updateAndroidVersion,
  updateiOSVersion
};
