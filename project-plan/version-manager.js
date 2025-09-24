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
   * 复制文件或目录
   */
  copyFileOrDir(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const files = fs.readdirSync(src);
      files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        this.copyFileOrDir(srcPath, destPath);
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  /**
   * 获取需要备份的文件和目录列表
   */
  getBackupItems() {
    return [
      'app.js',
      'app.json',
      'package.json',
      'project.config.json',
      'project.private.config.json',
      'sitemap.json',
      'pages',
      'images',
      'utils',
      'data',
      '把数制规则.md',
      '过A制规则.md',
      '页面标题图片要求.md'
    ];
  }

  /**
   * 创建新版本（包含完整项目文件备份）
   */
  createVersion(version, description, features = [], changelog = []) {
    const versionDir = path.join(this.versionsDir, version);
    
    if (fs.existsSync(versionDir)) {
      console.log('⚠️  版本已存在:', version);
      return false;
    }

    fs.mkdirSync(versionDir, { recursive: true });
    console.log('✅ 创建版本目录:', version);

    // 备份项目文件
    console.log('📁 开始备份项目文件...');
    const backupItems = this.getBackupItems();
    let backupCount = 0;
    
    backupItems.forEach(item => {
      const srcPath = path.join(this.currentDir, item);
      const destPath = path.join(versionDir, item);
      
      if (fs.existsSync(srcPath)) {
        try {
          this.copyFileOrDir(srcPath, destPath);
          backupCount++;
          console.log(`  ✅ 备份: ${item}`);
        } catch (error) {
          console.log(`  ❌ 备份失败: ${item} - ${error.message}`);
        }
      } else {
        console.log(`  ⚠️  文件不存在: ${item}`);
      }
    });

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
      rollbackSupported: true,
      backupCount: backupCount
    };

    const versionInfoPath = path.join(versionDir, this.versionInfoFile);
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    console.log(`✅ 版本创建完成: ${version} (备份了 ${backupCount} 个项目文件)`);
    return true;
  }

  /**
   * 完善现有版本（为只有version-info.json的版本添加完整备份）
   */
  completeVersion(version) {
    const versionDir = path.join(this.versionsDir, version);
    
    if (!fs.existsSync(versionDir)) {
      console.log('❌ 版本不存在:', version);
      return false;
    }

    // 检查是否已有完整备份
    const hasPages = fs.existsSync(path.join(versionDir, 'pages'));
    const hasApp = fs.existsSync(path.join(versionDir, 'app.js'));
    
    if (hasPages && hasApp) {
      console.log('✅ 版本已完整:', version);
      return true;
    }

    console.log(`📁 完善版本 ${version} 的项目文件备份...`);
    
    // 备份项目文件
    const backupItems = this.getBackupItems();
    let backupCount = 0;
    
    backupItems.forEach(item => {
      const srcPath = path.join(this.currentDir, item);
      const destPath = path.join(versionDir, item);
      
      if (fs.existsSync(srcPath)) {
        try {
          this.copyFileOrDir(srcPath, destPath);
          backupCount++;
          console.log(`  ✅ 备份: ${item}`);
        } catch (error) {
          console.log(`  ❌ 备份失败: ${item} - ${error.message}`);
        }
      } else {
        console.log(`  ⚠️  文件不存在: ${item}`);
      }
    });

    // 更新版本信息
    const versionInfoPath = path.join(versionDir, this.versionInfoFile);
    if (fs.existsSync(versionInfoPath)) {
      const versionInfo = JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
      versionInfo.backupCount = backupCount;
      versionInfo.completedAt = new Date().toISOString();
      fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    }

    console.log(`✅ 版本完善完成: ${version} (新增 ${backupCount} 个项目文件)`);
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

    case 'complete':
      const versionToComplete = args[1];
      if (!versionToComplete) {
        console.error('❌ 请指定要完善的版本号');
        process.exit(1);
      }
      manager.completeVersion(versionToComplete);
      break;

    case 'complete-all':
      console.log('📁 完善所有版本的完整备份...');
      const versions = manager.listVersions();
      versions.forEach(v => {
        if (v !== 'v1.1.0' && v !== 'v2.0.3') { // 跳过已有完整备份的版本
          manager.completeVersion(v);
        }
      });
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
      console.log('  node version-manager.js create <版本号> [描述]     - 创建新版本（含完整备份）');
      console.log('  node version-manager.js complete <版本号>           - 完善现有版本备份');
      console.log('  node version-manager.js complete-all               - 完善所有版本备份');
      console.log('  node version-manager.js list                       - 列出所有版本');
      console.log('  node version-manager.js current                    - 显示当前版本');
      console.log('');
      console.log('示例:');
      console.log('  node version-manager.js create v1.0.0-stable "基础核心功能版"');
      console.log('  node version-manager.js complete v1.2.0');
      console.log('  node version-manager.js complete-all');
      console.log('  node version-manager.js current');
      console.log('  node version-manager.js list');
  }
}

if (require.main === module) {
  main();
}

module.exports = VersionManager;
