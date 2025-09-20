/**
 * 环境检测管理模块
 * 负责环境信息、版本检测
 */

class EnvManager {
  constructor() {
    this.envInfo = {
      isTrial: false,
      isDevelop: false,
      envVersion: 'unknown',
      platform: 'unknown',
      systemInfo: null
    };
  }

  /**
   * 检查环境信息
   * @param {Object} page - 页面实例
   */
  checkEnvironment(page) {
    try {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      
      // 获取应用实例
      const app = getApp();
      
      // 更新环境信息
      this.envInfo = {
        isTrial: app && app.globalData && app.globalData.envInfo ? app.globalData.envInfo.isTrial : false,
        isDevelop: app && app.globalData && app.globalData.envInfo ? app.globalData.envInfo.isDevelop : false,
        envVersion: app && app.globalData && app.globalData.envInfo ? app.globalData.envInfo.envVersion : 'unknown',
        platform: systemInfo.platform,
        systemInfo: systemInfo
      };
      
      // 更新页面数据
      if (page) {
        page.setData({
          isTrial: this.envInfo.isTrial,
          isDevelop: this.envInfo.isDevelop,
          envVersion: this.envInfo.envVersion
        });
      }
      
      return this.envInfo;
    } catch (error) {
      console.error('检查环境信息失败:', error);
      return this.envInfo;
    }
  }

  /**
   * 异步更新环境信息
   * @param {Object} page - 页面实例
   */
  updateEnvInfo(page) {
    setTimeout(() => {
      try {
        const app = getApp && getApp();
        if (app && app.globalData && app.globalData.envInfo) {
          const envInfo = app.globalData.envInfo;
          this.envInfo = {
            isTrial: !!envInfo.isTrial,
            isDevelop: !!envInfo.isDevelop,
            envVersion: envInfo.envVersion || 'unknown',
            platform: this.envInfo.platform,
            systemInfo: this.envInfo.systemInfo
          };
          
          if (page) {
            page.setData({
              isTrial: this.envInfo.isTrial,
              isDevelop: this.envInfo.isDevelop,
              envVersion: this.envInfo.envVersion
            });
          }
        }
      } catch (error) {
        console.error('更新环境信息失败:', error);
      }
    }, 100);
  }

  /**
   * 获取系统信息
   * @returns {Object} - 系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.envInfo.systemInfo = systemInfo;
      this.envInfo.platform = systemInfo.platform;
      return systemInfo;
    } catch (error) {
      console.error('获取系统信息失败:', error);
      return null;
    }
  }

  /**
   * 检查是否为开发版本
   * @returns {boolean} - 是否为开发版本
   */
  isDevelopment() {
    return this.envInfo.isDevelop;
  }

  /**
   * 检查是否为体验版本
   * @returns {boolean} - 是否为体验版本
   */
  isTrial() {
    return this.envInfo.isTrial;
  }

  /**
   * 获取环境版本
   * @returns {string} - 环境版本
   */
  getEnvVersion() {
    return this.envInfo.envVersion;
  }

  /**
   * 获取平台信息
   * @returns {string} - 平台信息
   */
  getPlatform() {
    return this.envInfo.platform;
  }

  /**
   * 检查是否需要显示体验版标识
   * @returns {boolean} - 是否需要显示
   */
  shouldShowTrialBadge() {
    // 强制显示体验版标识用于测试
    const forceShowTrialBadge = true;
    return forceShowTrialBadge || this.envInfo.isTrial;
  }

  /**
   * 获取设备信息
   * @returns {Object} - 设备信息
   */
  getDeviceInfo() {
    if (!this.envInfo.systemInfo) {
      this.getSystemInfo();
    }
    
    const systemInfo = this.envInfo.systemInfo;
    if (!systemInfo) {
      return null;
    }
    
    return {
      brand: systemInfo.brand,
      model: systemInfo.model,
      pixelRatio: systemInfo.pixelRatio,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      windowWidth: systemInfo.windowWidth,
      windowHeight: systemInfo.windowHeight,
      language: systemInfo.language,
      version: systemInfo.version,
      system: systemInfo.system,
      platform: systemInfo.platform
    };
  }

  /**
   * 检查网络状态
   * @returns {Promise} - 网络状态
   */
  checkNetworkStatus() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: (res) => {
          resolve({
            networkType: res.networkType,
            isConnected: res.networkType !== 'none'
          });
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 获取存储空间信息
   * @returns {Object} - 存储空间信息
   */
  getStorageInfo() {
    try {
      return wx.getStorageInfoSync();
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0
      };
    }
  }

  /**
   * 检查存储空间是否充足
   * @param {number} requiredSize - 需要的存储空间（KB）
   * @returns {boolean} - 是否充足
   */
  isStorageSpaceSufficient(requiredSize = 1024) {
    const storageInfo = this.getStorageInfo();
    const availableSize = storageInfo.limitSize - storageInfo.currentSize;
    return availableSize > requiredSize;
  }

  /**
   * 获取性能信息
   * @returns {Object} - 性能信息
   */
  getPerformanceInfo() {
    if (!this.envInfo.systemInfo) {
      this.getSystemInfo();
    }
    
    const systemInfo = this.envInfo.systemInfo;
    if (!systemInfo) {
      return null;
    }
    
    return {
      benchmarkLevel: systemInfo.benchmarkLevel,
      memorySize: systemInfo.memorySize,
      storageSize: systemInfo.storageSize,
      diskSize: systemInfo.diskSize
    };
  }

  /**
   * 检查是否需要性能优化
   * @returns {boolean} - 是否需要优化
   */
  needsPerformanceOptimization() {
    const perfInfo = this.getPerformanceInfo();
    if (!perfInfo) {
      return false;
    }
    
    // 根据设备性能等级判断
    const benchmarkLevel = perfInfo.benchmarkLevel;
    return benchmarkLevel < 50; // 性能等级低于50需要优化
  }

  /**
   * 初始化环境管理器
   * @param {Object} page - 页面实例
   */
  init(page) {
    // 快速初始化
    this.checkEnvironment(page);
    
    // 异步更新详细信息
    this.updateEnvInfo(page);
  }
}

// 导出模块
module.exports = EnvManager;
