/**
 * 工具函数模块
 * 通用工具函数和验证函数
 */

class Helpers {
  /**
   * 格式化时间
   * @param {Date|number} date - 日期对象或时间戳
   * @param {string} format - 格式字符串
   * @returns {string} - 格式化后的时间字符串
   */
  static formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 生成唯一ID
   * @param {string} prefix - 前缀
   * @returns {string} - 唯一ID
   */
  static generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
  }

  /**
   * 验证输入
   * @param {any} value - 输入值
   * @param {string} type - 验证类型
   * @param {Object} options - 验证选项
   * @returns {Object} - 验证结果
   */
  static validateInput(value, type, options = {}) {
    const result = {
      isValid: true,
      error: null
    };

    switch (type) {
      case 'number':
        if (isNaN(value)) {
          result.isValid = false;
          result.error = '请输入有效数字';
        } else if (options.min !== undefined && value < options.min) {
          result.isValid = false;
          result.error = `数值不能小于 ${options.min}`;
        } else if (options.max !== undefined && value > options.max) {
          result.isValid = false;
          result.error = `数值不能大于 ${options.max}`;
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          result.isValid = false;
          result.error = '请输入有效字符串';
        } else if (options.minLength && value.length < options.minLength) {
          result.isValid = false;
          result.error = `长度不能少于 ${options.minLength} 个字符`;
        } else if (options.maxLength && value.length > options.maxLength) {
          result.isValid = false;
          result.error = `长度不能超过 ${options.maxLength} 个字符`;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          result.isValid = false;
          result.error = '请输入有效的邮箱地址';
        }
        break;

      case 'phone':
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
          result.isValid = false;
          result.error = '请输入有效的手机号码';
        }
        break;

      default:
        result.isValid = true;
    }

    return result;
  }

  /**
   * 深拷贝对象
   * @param {any} obj - 要拷贝的对象
   * @returns {any} - 拷贝后的对象
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }

    if (typeof obj === 'object') {
      const clonedObj = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} - 防抖后的函数
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} - 节流后的函数
   */
  static throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * 数组去重
   * @param {Array} arr - 要去重的数组
   * @param {string} key - 对象数组的去重键
   * @returns {Array} - 去重后的数组
   */
  static uniqueArray(arr, key = null) {
    if (!Array.isArray(arr)) {
      return [];
    }

    if (key) {
      const seen = new Set();
      return arr.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }

    return [...new Set(arr)];
  }

  /**
   * 对象合并
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @param {boolean} deep - 是否深合并
   * @returns {Object} - 合并后的对象
   */
  static mergeObjects(target, source, deep = false) {
    if (!deep) {
      return { ...target, ...source };
    }

    const result = { ...target };
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeObjects(result[key] || {}, source[key], true);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} - 格式化后的文件大小
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 计算两个日期之间的天数
   * @param {Date|string} date1 - 日期1
   * @param {Date|string} date2 - 日期2
   * @returns {number} - 天数差
   */
  static daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * 检查是否为移动设备
   * @returns {boolean} - 是否为移动设备
   */
  static isMobile() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      return systemInfo.platform === 'ios' || systemInfo.platform === 'android';
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取随机颜色
   * @returns {string} - 随机颜色值
   */
  static getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 安全地获取嵌套对象属性
   * @param {Object} obj - 目标对象
   * @param {string} path - 属性路径
   * @param {any} defaultValue - 默认值
   * @returns {any} - 属性值或默认值
   */
  static safeGet(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((current, key) => current[key], obj) || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * 检查网络连接状态
   * @returns {Promise<boolean>} - 是否连接网络
   */
  static async checkNetworkConnection() {
    try {
      const networkType = await new Promise((resolve, reject) => {
        wx.getNetworkType({
          success: res => resolve(res.networkType),
          fail: reject
        });
      });
      return networkType !== 'none';
    } catch (error) {
      console.error('检查网络连接失败:', error);
      return false;
    }
  }
}

// 导出模块
module.exports = Helpers;
