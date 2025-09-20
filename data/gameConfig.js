/**
 * 游戏配置模块
 * 包含游戏常量、默认值、配置选项
 */

const GameConfig = {
  // 游戏规则配置
  rules: {
    byRounds: 'by-rounds',  // 把数制
    byA: 'by-A'             // 过A制
  },

  // 默认游戏设置
  defaultSettings: {
    rule: 'by-rounds',
    maxRounds: 10,
    initialScore: {
      red: '2',
      blue: '2'
    },
    initialAAttempts: {
      red: 0,
      blue: 0
    }
  },

  // 分数配置
  scores: {
    doubleUp: 3,      // 双上
    oneThree: 2,      // 1游3游
    oneLast: 1        // 1游末游
  },

  // 等级配置
  levels: {
    min: 2,
    max: 17,  // A3
    special: {
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
      A1: 15,
      A2: 16,
      A3: 17,
      E: 14  // E 也视为 14 级
    }
  },

  // 把数配置
  rounds: {
    min: 5,
    max: 15,
    default: 10
  },

  // 队伍配置
  teams: {
    red: {
      name: '红方',
      color: '#FF4444',
      players: ['红队1号', '红队2号']
    },
    blue: {
      name: '蓝方',
      color: '#4444FF',
      players: ['蓝队1号', '蓝队2号']
    }
  },

  // 存储键配置
  storageKeys: {
    gameData: 'savedGameData',
    gameHistory: 'gameHistory',
    userSettings: 'userSettings',
    appConfig: 'appConfig'
  },

  // 历史记录配置
  history: {
    maxRecords: 50,  // 最多保存50条记录
    autoSave: true   // 自动保存
  },

  // UI配置
  ui: {
    toastDuration: 2000,     // 提示显示时长
    loadingTimeout: 10000,   // 加载超时时间
    animationDuration: 300,  // 动画时长
    colors: {
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#5AC8FA'
    }
  },

  // 游戏结束条件
  endConditions: {
    maxRounds: 'maxRounds',    // 达到最大把数
    firstA: 'firstA',          // 首轮过A成功
    draw: 'draw',              // 双方握手言和
    failedA: 'failedA'         // 3A未过
  },

  // 获胜方类型
  winners: {
    red: 'red',
    blue: 'blue',
    draw: 'draw'
  },

  // 环境配置
  environment: {
    forceShowTrialBadge: true,  // 强制显示体验版标识
    debugMode: false,           // 调试模式
    logLevel: 'info'            // 日志级别
  },

  // 性能配置
  performance: {
    maxHistoryLength: 1000,     // 最大历史记录长度
    debounceDelay: 300,         // 防抖延迟
    throttleDelay: 100,         // 节流延迟
    cacheSize: 100              // 缓存大小
  },

  // 错误配置
  error: {
    maxRetries: 3,              // 最大重试次数
    retryDelay: 1000,           // 重试延迟
    showErrorToast: true        // 显示错误提示
  },

  // 分享配置
  share: {
    title: '扑克双上计分',
    path: '/pages/index/index',
    imageUrl: '../../images/victor.svg'
  },

  // 帮助文档
  help: {
    title: '说明文档',
    content: `扑克双上计分规则：
1. 过A规则：先过A的队伍获胜
2. 把数规则：先达到设定把数的队伍获胜
3. 双上：+3分
4. 1游3游：+2分
5. 1游末游：+1分

A1/A2/A3升级规则：
- A1：在A阶段点击1游末游或被对方点击升级按钮
- A2：在A1阶段点击1游末游或被对方点击升级按钮
- A3：在A2阶段点击1游末游或被对方点击升级按钮`
  },

  // 获取默认配置
  getDefaultConfig() {
    return {
      ...this.defaultSettings,
      teams: this.teams,
      scores: this.scores,
      levels: this.levels
    };
  },

  // 验证配置
  validateConfig(config) {
    const errors = [];
    
    if (!config.rule || !Object.values(this.rules).includes(config.rule)) {
      errors.push('无效的游戏规则');
    }
    
    if (!config.maxRounds || config.maxRounds < this.rounds.min || config.maxRounds > this.rounds.max) {
      errors.push(`最大把数必须在 ${this.rounds.min}-${this.rounds.max} 之间`);
    }
    
    if (!config.initialScore || !config.initialScore.red || !config.initialScore.blue) {
      errors.push('初始分数配置无效');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // 重置为默认配置
  resetToDefault() {
    return this.getDefaultConfig();
  }
};

// 导出模块
module.exports = GameConfig;
