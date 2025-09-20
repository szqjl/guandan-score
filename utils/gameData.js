/**
 * 游戏数据管理模块
 * 负责游戏状态管理、数据持久化
 */

class GameData {
  constructor() {
    this.storageKey = 'savedGameData';
    this.historyKey = 'gameHistory';
  }

  /**
   * 保存游戏到历史记录
   * @param {Object} page - 页面实例
   */
  saveGameToHistory(page) {
    try {
      // 防止重复保存
      if (page.data.gameEnded && page.data.gameSavedToHistory) {
        return;
      }
      
      // 检查游戏是否真正进行过
      const hasGameData = page.data.historyScores.length > 0 || page.data.rounds > 0;
      if (!hasGameData) {
        return;
      }
      
      // 获取现有历史记录
      const existingHistory = wx.getStorageSync(this.historyKey) || [];
      
      // 确定获胜方
      let winner = 'draw';
      const redLevel = page.data.gameRules.textToLevel(page.data.levelTexts.red);
      const blueLevel = page.data.gameRules.textToLevel(page.data.levelTexts.blue);
      
      if (redLevel > blueLevel) {
        winner = 'red';
      } else if (blueLevel > redLevel) {
        winner = 'blue';
      }
      
      // 创建游戏记录
      const gameRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        rule: page.data.rule,
        maxRounds: page.data.maxRounds,
        finalScores: {
          red: page.data.levelTexts.red,
          blue: page.data.levelTexts.blue
        },
        totalRounds: page.data.rounds,
        historyScores: page.data.historyScores,
        winner: winner,
        redPlayers: page.data.redPlayers,
        bluePlayers: page.data.bluePlayers
      };
      
      // 添加到历史记录
      existingHistory.unshift(gameRecord);
      
      // 限制历史记录数量（最多保存50条）
      if (existingHistory.length > 50) {
        existingHistory.splice(50);
      }
      
      // 保存到本地存储
      wx.setStorageSync(this.historyKey, existingHistory);
      
      // 标记已保存
      page.setData({
        gameSavedToHistory: true
      });
      
      wx.showToast({
        title: '游戏已保存到历史',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('保存游戏失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  }

  /**
   * 从历史记录加载游戏
   * @param {Object} page - 页面实例
   * @param {number} gameId - 游戏ID
   */
  loadGameFromHistory(page, gameId) {
    try {
      const existingHistory = wx.getStorageSync(this.historyKey) || [];
      const gameRecord = existingHistory.find(game => game.id === gameId);
      
      if (!gameRecord) {
        wx.showToast({
          title: '游戏记录不存在',
          icon: 'error'
        });
        return false;
      }
      
      // 恢复游戏数据
      page.setData({
        rule: gameRecord.rule,
        maxRounds: gameRecord.maxRounds,
        levelTexts: gameRecord.finalScores,
        rounds: gameRecord.totalRounds,
        historyScores: gameRecord.historyScores,
        redPlayers: gameRecord.redPlayers,
        bluePlayers: gameRecord.bluePlayers,
        canUndo: gameRecord.historyScores.length > 0
      });
      
      wx.showToast({
        title: '游戏加载成功',
        icon: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('加载游戏失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      return false;
    }
  }

  /**
   * 重置游戏数据
   * @param {Object} page - 页面实例
   */
  resetGame(page) {
    page.setData({
      levelTexts: {
        red: '2',
        blue: '2'
      },
      rounds: 0,
      lastRounds: 0,
      historyScores: [],
      hasUserClicked: false,
      aAttempts: {
        red: 0,
        blue: 0
      },
      gameEnded: false,
      gameSavedToHistory: false,
      canUndo: false,
      showRedIcon: false,
      showBlueIcon: false
    });
    
    wx.showToast({
      title: '游戏已重置',
      icon: 'success'
    });
  }

  /**
   * 保存当前游戏状态
   * @param {Object} page - 页面实例
   */
  saveCurrentGame(page) {
    try {
      const gameData = {
        levelTexts: page.data.levelTexts,
        rounds: page.data.rounds,
        historyScores: page.data.historyScores,
        rule: page.data.rule,
        maxRounds: page.data.maxRounds,
        aAttempts: page.data.aAttempts,
        redPlayers: page.data.redPlayers,
        bluePlayers: page.data.bluePlayers,
        timestamp: Date.now()
      };
      
      wx.setStorageSync(this.storageKey, gameData);
      
      page.setData({
        canRestore: true
      });
      
    } catch (error) {
      console.error('保存当前游戏失败:', error);
    }
  }

  /**
   * 恢复游戏状态
   * @param {Object} page - 页面实例
   */
  restoreGame(page) {
    try {
      const savedGameData = wx.getStorageSync(this.storageKey);
      if (!savedGameData) {
        return false;
      }
      
      // 恢复游戏数据
      page.setData({
        levelTexts: savedGameData.levelTexts,
        rounds: savedGameData.rounds,
        historyScores: savedGameData.historyScores,
        rule: savedGameData.rule,
        maxRounds: savedGameData.maxRounds,
        aAttempts: savedGameData.aAttempts,
        redPlayers: savedGameData.redPlayers,
        bluePlayers: savedGameData.bluePlayers,
        canRestore: false,
        canUndo: savedGameData.historyScores.length > 0
      });
      
      wx.showToast({
        title: '游戏恢复成功',
        icon: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('恢复游戏失败:', error);
      wx.showToast({
        title: '恢复失败',
        icon: 'error'
      });
      return false;
    }
  }

  /**
   * 清除保存的游戏
   */
  clearSavedGame() {
    try {
      wx.removeStorageSync(this.storageKey);
    } catch (error) {
      console.error('清除保存游戏失败:', error);
    }
  }

  /**
   * 获取游戏历史记录
   * @returns {Array} - 历史记录列表
   */
  getGameHistory() {
    try {
      return wx.getStorageSync(this.historyKey) || [];
    } catch (error) {
      console.error('获取游戏历史失败:', error);
      return [];
    }
  }

  /**
   * 删除历史记录
   * @param {number} gameId - 游戏ID
   */
  deleteHistoryRecord(gameId) {
    try {
      const existingHistory = wx.getStorageSync(this.historyKey) || [];
      const filteredHistory = existingHistory.filter(game => game.id !== gameId);
      wx.setStorageSync(this.historyKey, filteredHistory);
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('删除历史记录失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  }

  /**
   * 清空所有历史记录
   */
  clearAllHistory() {
    try {
      wx.removeStorageSync(this.historyKey);
      wx.showToast({
        title: '历史记录已清空',
        icon: 'success'
      });
    } catch (error) {
      console.error('清空历史记录失败:', error);
      wx.showToast({
        title: '清空失败',
        icon: 'error'
      });
    }
  }
}

// 导出模块
module.exports = GameData;
