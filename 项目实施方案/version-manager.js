#!/usr/bin/env node

/**
 * guandan-score 版本管理系统
 * 提供版本创建、回滚、调用和状态跟踪功能
 * @author Jennifer
 * @date 2024-09-21
 */

const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor() {
    this.versionsDir = path.join(__dirname, '..', 'versions');
    this.currentDir = path.join(__dirname, '..');
    this.versionInfoFile = 'version-info.json';
    this.ensureVersionsDir();
  }

  /**
   * 确保版本目录存在
   */
  ensureVersionsDir() {
    if (!fs.existsSync(this.versionsDir)) {
      fs.mkdirSync(this.versionsDir, { recursive: true });
      console.log('✅ 创建版本目录:', this.versionsDir);
    }
  }

  /**
   * 获取当前版本信息
   */
  getCurrentVersion() {
    try {
      const versionInfoPath = path.join(this.currentDir, this.versionInfoFile);
      if (fs.existsSync(versionInfoPath)) {
        return JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
      }
    } catch (error) {
      console.error('❌ 读取版本信息失败:', error.message);
    }
    return null;
  }

  /**
   * 显示当前版本
   */
  showCurrentVersion() {
    const currentVersion = this.getCurrentVersion();
    if (currentVersion) {
      console.log('📋 当前版本信息:');
      console.log(`  版本号: ${currentVersion.version}`);
      console.log(`  描述: ${currentVersion.description}`);
      console.log(`  状态: ${currentVersion.status}`);
      console.log(`  创建时间: ${currentVersion.createdAt}`);
      console.log(`  功能特性:`);
      currentVersion.features.forEach(feature => {
        console.log(`    - ${feature}`);
      });
    } else {
      console.log('⚠️  当前版本信息不可用');
    }
  }

  /**
   * 列出所有版本
   */
  listVersions() {
    if (!fs.existsSync(this.versionsDir)) {
      console.log('📋 没有找到任何版本');
      return [];
    }

    const versions = fs.readdirSync(this.versionsDir)
      .filter(item => {
        const itemPath = path.join(this.versionsDir, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .sort((a, b) => {
        return b.localeCompare(a, undefined, { numeric: true });
      });

    console.log('📋 可用版本列表:');
    versions.forEach(version => {
      const versionInfoPath = path.join(this.versionsDir, version, this.versionInfoFile);
      if (fs.existsSync(versionInfoPath)) {
        try {
          const versionInfo = JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
          const status = versionInfo.status === 'stable' ? '🟢' : 
                        versionInfo.status === 'beta' ? '🟡' : '🔵';
          console.log(`  ${status} ${version} - ${versionInfo.description}`);
        } catch (error) {
          console.log(`  ⚪ ${version} - 版本信息读取失败`);
        }
      } else {
        console.log(`  ⚪ ${version} - 无版本信息`);
      }
    });

    return versions;
  }

  /**
   * 创建新版本
   */
  createVersion(version, description, features = [], changelog = []) {
    const versionDir = path.join(this.versionsDir, version);
    
    if (fs.existsSync(versionDir)) {
      console.log('⚠️  版本已存在:', version);
      return false;
    }

    fs.mkdirSync(versionDir, { recursive: true });
    console.log('✅ 创建版本目录:', version);

    // 创建版本信息
    const versionInfo = {
      version: version,
      createdAt: new Date().toISOString(),
      author: 'Jennifer',
      description: description,
      features: features,
      dependencies: {
        '微信小程序': '>= 8.0.0'
      },
      changelog: changelog,
      status: version.includes('stable') ? 'stable' : 
              version.includes('beta') ? 'beta' : 'dev',
      rollbackSupported: true
    };

    const versionInfoPath = path.join(versionDir, this.versionInfoFile);
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    console.log('✅ 版本创建完成:', version);
    return true;
  }
}

// 命令行接口
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new VersionManager();

  switch (command) {
    case 'create':
      const version = args[1];
      const description = args[2] || '新版本';
      if (!version) {
        console.error('❌ 请指定版本号');
        process.exit(1);
      }
      manager.createVersion(version, description);
      break;

    case 'list':
      manager.listVersions();
      break;

    case 'current':
      manager.showCurrentVersion();
      break;

    default:
      console.log('📋 guandan-score 版本管理系统');
      console.log('');
      console.log('使用方法:');
      console.log('  node version-manager.js create <版本号> [描述]     - 创建新版本');
      console.log('  node version-manager.js list                       - 列出所有版本');
      console.log('  node version-manager.js current                    - 显示当前版本');
      console.log('');
      console.log('示例:');
      console.log('  node version-manager.js create v1.0.0-stable "基础核心功能版"');
      console.log('  node version-manager.js current');
      console.log('  node version-manager.js list');
  }
}

if (require.main === module) {
  main();
}

module.exports = VersionManager;
