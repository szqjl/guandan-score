/**
 * 存储管理模块
 * 负责本地存储操作，统一存储接口
 */

class StorageManager {
  constructor() {
    this.keys = {
      gameData: 'savedGameData',
      gameHistory: 'gameHistory',
      userSettings: 'userSettings',
      appConfig: 'appConfig'
    };
  }

  /**
   * 保存数据到本地存储
   * @param {string} key - 存储键
   * @param {any} data - 要保存的数据
   * @returns {boolean} - 保存是否成功
   */
  saveToStorage(key, data) {
    try {
      wx.setStorageSync(key, data);
      return true;
    } catch (error) {
      console.error(`保存数据失败 (${key}):`, error);
      return false;
    }
  }

  /**
   * 从本地存储加载数据
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @returns {any} - 加载的数据或默认值
   */
  loadFromStorage(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key);
      return data || defaultValue;
    } catch (error) {
      console.error(`加载数据失败 (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * 删除存储数据
   * @param {string} key - 存储键
   * @returns {boolean} - 删除是否成功
   */
  removeFromStorage(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (error) {
      console.error(`删除数据失败 (${key}):`, error);
      return false;
    }
  }

  /**
   * 清空所有存储
   * @returns {boolean} - 清空是否成功
   */
  clearAllStorage() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (error) {
      console.error('清空存储失败:', error);
      return false;
    }
  }

  /**
   * 获取存储信息
   * @returns {Object} - 存储信息
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
   * 保存用户设置
   * @param {Object} settings - 用户设置
   */
  saveUserSettings(settings) {
    const currentSettings = this.loadFromStorage(this.keys.userSettings, {});
    const newSettings = { ...currentSettings, ...settings };
    return this.saveToStorage(this.keys.userSettings, newSettings);
  }

  /**
   * 获取用户设置
   * @param {string} key - 设置键
   * @param {any} defaultValue - 默认值
   * @returns {any} - 设置值
   */
  getUserSetting(key, defaultValue = null) {
    const settings = this.loadFromStorage(this.keys.userSettings, {});
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  /**
   * 保存应用配置
   * @param {Object} config - 应用配置
   */
  saveAppConfig(config) {
    const currentConfig = this.loadFromStorage(this.keys.appConfig, {});
    const newConfig = { ...currentConfig, ...config };
    return this.saveToStorage(this.keys.appConfig, newConfig);
  }

  /**
   * 获取应用配置
   * @param {string} key - 配置键
   * @param {any} defaultValue - 默认值
   * @returns {any} - 配置值
   */
  getAppConfig(key, defaultValue = null) {
    const config = this.loadFromStorage(this.keys.appConfig, {});
    return config[key] !== undefined ? config[key] : defaultValue;
  }

  /**
   * 保存游戏数据
   * @param {Object} gameData - 游戏数据
   */
  saveGameData(gameData) {
    return this.saveToStorage(this.keys.gameData, gameData);
  }

  /**
   * 获取游戏数据
   * @returns {Object|null} - 游戏数据
   */
  getGameData() {
    return this.loadFromStorage(this.keys.gameData);
  }

  /**
   * 保存游戏历史
   * @param {Array} history - 游戏历史
   */
  saveGameHistory(history) {
    return this.saveToStorage(this.keys.gameHistory, history);
  }

  /**
   * 获取游戏历史
   * @returns {Array} - 游戏历史
   */
  getGameHistory() {
    return this.loadFromStorage(this.keys.gameHistory, []);
  }

  /**
   * 添加游戏记录到历史
   * @param {Object} gameRecord - 游戏记录
   */
  addGameToHistory(gameRecord) {
    const history = this.getGameHistory();
    history.unshift(gameRecord);
    
    // 限制历史记录数量
    if (history.length > 50) {
      history.splice(50);
    }
    
    return this.saveGameHistory(history);
  }

  /**
   * 删除游戏历史记录
   * @param {number} gameId - 游戏ID
   */
  deleteGameFromHistory(gameId) {
    const history = this.getGameHistory();
    const filteredHistory = history.filter(game => game.id !== gameId);
    return this.saveGameHistory(filteredHistory);
  }

  /**
   * 清空游戏历史
   */
  clearGameHistory() {
    return this.saveToStorage(this.keys.gameHistory, []);
  }

  /**
   * 检查存储空间
   * @returns {Object} - 存储空间信息
   */
  checkStorageSpace() {
    const info = this.getStorageInfo();
    const usagePercent = (info.currentSize / info.limitSize * 100).toFixed(2);
    
    return {
      currentSize: info.currentSize,
      limitSize: info.limitSize,
      usagePercent: parseFloat(usagePercent),
      isLowSpace: info.currentSize > info.limitSize * 0.8,
      availableSize: info.limitSize - info.currentSize
    };
  }

  /**
   * 导出数据
   * @param {string} key - 存储键
   * @returns {string} - JSON字符串
   */
  exportData(key) {
    try {
      const data = this.loadFromStorage(key);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error(`导出数据失败 (${key}):`, error);
      return null;
    }
  }

  /**
   * 导入数据
   * @param {string} key - 存储键
   * @param {string} jsonData - JSON字符串
   * @returns {boolean} - 导入是否成功
   */
  importData(key, jsonData) {
    try {
      const data = JSON.parse(jsonData);
      return this.saveToStorage(key, data);
    } catch (error) {
      console.error(`导入数据失败 (${key}):`, error);
      return false;
    }
  }
}

// 导出模块
module.exports = StorageManager;
