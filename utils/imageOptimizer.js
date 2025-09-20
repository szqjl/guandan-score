/**
 * 微信小程序图片优化工具
 * 负责图片懒加载、预加载和缓存管理
 * @author Jennifer
 * @date 2024-09-20
 */

class ImageOptimizer {
  constructor() {
    this.imageCache = new Map(); // 图片缓存
    this.loadingImages = new Set(); // 正在加载的图片
    this.preloadQueue = []; // 预加载队列
  }

  /**
   * 图片懒加载实现
   * @param {string} imagePath - 图片路径
   * @param {Object} options - 配置选项
   * @returns {Promise} 加载结果
   */
  async lazyLoadImage(imagePath, options = {}) {
    const {
      placeholder = '../../images/placeholder.png',
      errorImage = '../../images/error.png',
      timeout = 5000
    } = options;

    // 检查缓存
    if (this.imageCache.has(imagePath)) {
      return {
        success: true,
        data: this.imageCache.get(imagePath)
      };
    }

    // 检查是否正在加载
    if (this.loadingImages.has(imagePath)) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (this.imageCache.has(imagePath)) {
            resolve({
              success: true,
              data: this.imageCache.get(imagePath)
            });
          } else if (!this.loadingImages.has(imagePath)) {
            resolve({
              success: false,
              error: '加载失败'
            });
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    // 开始加载
    this.loadingImages.add(imagePath);
    
    try {
      const result = await this.loadImageWithTimeout(imagePath, timeout);
      
      if (result.success) {
        // 缓存成功加载的图片
        this.imageCache.set(imagePath, result.data);
      }
      
      this.loadingImages.delete(imagePath);
      return result;
    } catch (error) {
      this.loadingImages.delete(imagePath);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 带超时的图片加载
   * @param {string} imagePath - 图片路径
   * @param {number} timeout - 超时时间
   * @returns {Promise} 加载结果
   */
  loadImageWithTimeout(imagePath, timeout) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          success: false,
          error: '加载超时'
        });
      }, timeout);

      // 使用小程序API加载图片
      wx.getImageInfo({
        src: imagePath,
        success: (res) => {
          clearTimeout(timer);
          resolve({
            success: true,
            data: {
              path: res.path,
              width: res.width,
              height: res.height
            }
          });
        },
        fail: (error) => {
          clearTimeout(timer);
          resolve({
            success: false,
            error: error.errMsg || '加载失败'
          });
        }
      });
    });
  }

  /**
   * 预加载图片列表
   * @param {Array} imageList - 图片路径列表
   * @param {number} concurrency - 并发数量
   */
  async preloadImages(imageList, concurrency = 3) {
    const chunks = this.chunkArray(imageList, concurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(imagePath => this.lazyLoadImage(imagePath));
      await Promise.allSettled(promises);
    }
  }

  /**
   * 数组分块处理
   * @param {Array} array - 原数组
   * @param {number} size - 块大小
   * @returns {Array} 分块后的数组
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 清理图片缓存
   * @param {number} maxSize - 最大缓存数量
   */
  clearImageCache(maxSize = 50) {
    if (this.imageCache.size > maxSize) {
      const entries = Array.from(this.imageCache.entries());
      // 删除最旧的缓存项
      const toDelete = entries.slice(0, entries.length - maxSize);
      toDelete.forEach(([key]) => {
        this.imageCache.delete(key);
      });
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      cacheSize: this.imageCache.size,
      loadingCount: this.loadingImages.size,
      preloadQueueLength: this.preloadQueue.length
    };
  }
}

module.exports = ImageOptimizer;
