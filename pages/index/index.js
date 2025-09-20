/**
 * 重构后的主页面文件
 * 使用模块化设计，大幅减少代码行数
 */

// 导入模块
const GameRules = require('../../utils/gameRules.js');
const ScoreLogic = require('../../utils/scoreLogic.js');
const GameData = require('../../utils/gameData.js');
const StorageManager = require('../../utils/storageManager.js');
const UIManager = require('../../utils/uiManager.js');
const EnvManager = require('../../utils/envManager.js');
const Helpers = require('../../utils/helpers.js');
const GameConfig = require('../../data/gameConfig.js');

Page({
  data: {
    // 核心游戏数据
    levelTexts: GameConfig.defaultSettings.initialScore,
    historyScores: [],
    rule: GameConfig.defaultSettings.rule,
    maxRounds: GameConfig.defaultSettings.maxRounds,
    rounds: 0,
    lastRounds: 0,
    canUndo: false,
    hasUserClicked: false,
    
    // 过A制相关状态
    aAttempts: GameConfig.defaultSettings.initialAAttempts,
    gameEnded: false,
    gameSavedToHistory: false,
    canRestore: false,
    
    // UI状态
    showRedIcon: false,
    showBlueIcon: false,
    showCustomToast: false,
    toastMessage: '',
    toastTeam: '',
    
    // 环境信息
    isTrial: false,
    isDevelop: false,
    envVersion: 'unknown',
    
    // 队伍信息
    redPlayers: GameConfig.teams.red.players,
    bluePlayers: GameConfig.teams.blue.players
  },

  onLoad() {
    this.initializeModules();
    this.initializeGame();
  },

  /**
   * 初始化模块
   */
  initializeModules() {
    // 初始化各个模块
    this.gameRules = new GameRules();
    this.scoreLogic = new ScoreLogic();
    this.gameData = new GameData();
    this.storageManager = new StorageManager();
    this.uiManager = new UIManager();
    this.envManager = new EnvManager();
    
    // 将模块实例添加到页面数据中，供其他方法使用
    this.setData({
      gameRules: this.gameRules,
      gameData: this.gameData,
      uiManager: this.uiManager
    });
    
    // 初始化UI管理器
    this.uiManager.init(this);
  },

  /**
   * 初始化游戏
   */
  initializeGame() {
    // 检查环境信息
    this.envManager.init(this);
    
    // 检查是否有保存的游戏数据
    const savedGameData = this.storageManager.getGameData();
    if (savedGameData) {
      this.setData({
        canRestore: true
      });
      this.uiManager.showRestoreConfirmModal(this);
    }
  },

  /**
   * 分数点击事件
   */
  onScoreClick(e) {
    if (this.data.gameEnded) return;
    
    this.scoreLogic.updateScore(this, e);
    this.checkGameEnd();
  },

  /**
   * 检查游戏是否结束
   */
  checkGameEnd() {
    const gameResult = this.gameRules.checkGameEnd(this.data);
    
    if (gameResult.isEnd) {
      this.uiManager.showGameEndModal(this, gameResult);
    } else {
      // 检查是否追不上
      const uncatchableResult = this.gameRules.checkUncatchable(this.data);
      if (uncatchableResult.isUncatchable) {
        this.uiManager.showUncatchableModal(this, uncatchableResult);
      }
    }
  },

  /**
   * 撤销最后一步
   */
  onUndo() {
    if (this.scoreLogic.undoLastScore(this)) {
      this.uiManager.showSuccess('撤销成功');
    } else {
      this.uiManager.showWarning('没有可撤销的操作');
    }
  },

  /**
   * 规则切换
   */
  onRuleChange(e) {
    const newRule = e.detail.value;
    this.gameRules.setRule(newRule);
    
    this.setData({
      rule: newRule,
      aAttempts: newRule === 'by-A' ? 
        { red: 0, blue: 0 } : 
        this.data.aAttempts
    });
    
    this.uiManager.showSuccess(`已切换到${newRule === 'by-A' ? '过A制' : '把数制'}`);
  },

  /**
   * 重置游戏
   */
  onReset() {
    this.uiManager.showResetConfirmModal(this);
  },

  /**
   * 显示历史记录
   */
  onShowHistory() {
    wx.navigateTo({
      url: '/pages/history/index'
    });
  },

  /**
   * 显示帮助
   */
  onShowHelp() {
    this.uiManager.showHelpModal(this);
  },

  /**
   * 显示反馈
   */
  onShowFeedback() {
    this.uiManager.showFeedbackModal(this);
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    return GameConfig.share;
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: GameConfig.share.title,
      query: '',
      imageUrl: GameConfig.share.imageUrl
    };
  },

  /**
   * 页面显示时保存游戏
   */
  onShow() {
    if (this.data.historyScores.length > 0 && !this.data.gameEnded) {
      this.gameData.saveCurrentGame(this);
    }
  },

  /**
   * 页面隐藏时保存游戏
   */
  onHide() {
    if (this.data.historyScores.length > 0 && !this.data.gameEnded) {
      this.gameData.saveCurrentGame(this);
    }
  },

  /**
   * 页面卸载时清理
   */
  onUnload() {
    // 清理定时器
    if (this.uiManager.toastTimer) {
      clearTimeout(this.uiManager.toastTimer);
    }
  }
});
