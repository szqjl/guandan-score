// index.js
Page({
  data: {
    levelTexts: {
      red: '2',
      blue: '2'
    },
    historyScores: [],
    rule: 'by-rounds',
    maxRounds: 10,
    rounds: 0,
    canUndo: false,
    hasUserClicked: false,
    showRedIcon: false,
    showBlueIcon: false,
    // 新增过A制相关状态
    aAttempts: {
      red: 0, // 红方尝试过A的次数（0: 未尝试, 1:A1, 2:A2, 3:A3）
      blue: 0 // 蓝方尝试过A的次数
    },
    // 游戏是否已结束
    gameEnded: false,
    // 游戏是否已开始
    gameStarted: false,
    // 游戏是否已保存到历史记录
    gameSavedToHistory: false,
    // 是否可以恢复游戏
    canRestore: false,
    // 环境信息
    isTrial: false,
    isDevelop: false,
    envVersion: 'unknown',
    // 队友信息
    redPlayers: ['东西方队1号', '东西方队2号'],
    bluePlayers: ['南北方队1号', '南北方队2号'],
    // 按钮禁用状态
    buttonDisabledStates: {
      red: { double: false, two: false, one: false },
      blue: { double: false, two: false, one: false }
    }
  },

  onShow() {
    // 每次显示页面时确保屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
      success: () => {
        console.log('屏幕常亮设置成功');
      },
      fail: (err) => {
        console.error('屏幕常亮设置失败:', err);
      }
    });
  },

  onLoad() {
    // 保持屏幕常亮，防止游戏过程中熄屏
    wx.setKeepScreenOn({
      keepScreenOn: true,
      success: () => {
        console.log('屏幕常亮设置成功');
      },
      fail: (err) => {
        console.error('屏幕常亮设置失败:', err);
      }
    });

    // 快速初始化 - 减少复杂处理和日志输出，提高启动速度
    const forceShowTrialBadge = true; // 当前设置为true，强制显示体验版标识用于测试
    
    // 从本地存储加载队员设置
    const savedSettings = wx.getStorageSync('teamSettings');
    let redPlayers = ['东西方队1号', '东西方队2号'];
    let bluePlayers = ['南北方队1号', '南北方队2号'];
    
    if (savedSettings && savedSettings.redPlayers && savedSettings.bluePlayers) {
      redPlayers = [...savedSettings.redPlayers];
      bluePlayers = [...savedSettings.bluePlayers];
    }
    
    // 直接设置默认值，避免复杂的应用实例获取和try-catch处理
    this.setData({
      isTrial: forceShowTrialBadge,
      isDevelop: false,
      envVersion: 'unknown',
      redPlayers: redPlayers,
      bluePlayers: bluePlayers
    });
    
    // 页面加载时检查是否有保存的游戏数据
    const savedGameData = wx.getStorageSync('savedGameData');
    if (savedGameData) {
      this.setData({
        canRestore: true
      });
      
      // 检查是否需要用户选择（智能提示）
      this.checkNeedUserChoice(savedGameData);
    }
    
    // 异步更新环境信息（如果后续需要使用）
    setTimeout(() => {
      try {
        const app = getApp && getApp();
        if (app && app.globalData && app.globalData.envInfo) {
          const envInfo = app.globalData.envInfo;
          this.setData({
            isTrial: forceShowTrialBadge || !!envInfo.isTrial,
            isDevelop: !!envInfo.isDevelop,
            envVersion: envInfo.envVersion || 'unknown'
          });
        }
      } catch (error) {
        // 静默处理错误
      }
    }, 100);
  },

  // 将等级文本转换为数字
  textToLevel(text) {
    // 处理A加上标数字的情况，如A¹、A²、A³和E
    if (text.startsWith('A')) {
      const attemptMatch = text.match(/A(\d+)/);
      if (attemptMatch) {
        // 在把数制下，A1/A2/A3视为不同级别：A1=15, A2=16, A3=17
        const attempt = parseInt(attemptMatch[1]);
        if (this.data.rule === 'by-rounds') {
          return 14 + attempt;
        }
        return 14; // 过A制下所有A的尝试都视为14级
      }
      return 14;
    }
    if (text === 'J') return 11;
    else if (text === 'Q') return 12;
    else if (text === 'K') return 13;
    else if (text === 'A') return 14;
    else return parseInt(text);
  },
  
  // 检查是否追不上
  checkUncatchable() {
    if (this.data.rule !== 'by-rounds') return false;
    
    const redLevel = this.textToLevel(this.data.levelTexts.red);
    const blueLevel = this.textToLevel(this.data.levelTexts.blue);
    const remainingRounds = this.data.maxRounds - this.data.rounds;
    
    // 如果已经达到最大把数，就不需要再检查追不上的情况
    if (remainingRounds <= 0) {
      return { isUncatchable: false };
    }
    
    // 每把最大可能加3分（双上）
    const maxPossibleIncrease = 3 * remainingRounds;
    
    // 检查红方是否追不上蓝方
    if (redLevel + maxPossibleIncrease < blueLevel) {
      return { isUncatchable: true, leadingTeam: 'blue' };
    }
    
    // 检查蓝方是否追不上红方
    if (blueLevel + maxPossibleIncrease < redLevel) {
      return { isUncatchable: true, leadingTeam: 'red' };
    }
    
    return { isUncatchable: false };
  },
  
  // 防抖处理变量
  lastClickTime: 0,
  debounceDelay: 500,
  
  // 按钮禁用状态
  buttonDisabledStates: {
    red: { double: false, two: false, one: false },
    blue: { double: false, two: false, one: false }
  },

  // 处理等级升级
  onLevelUpgrade(e = {}) {
    // 如果游戏还没开始，禁止点击升级按钮
    if (!this.data.gameStarted) {
      wx.showToast({
        title: '请先点击开始游戏',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const now = Date.now();
    if (now - this.lastClickTime < this.debounceDelay) {
      return; // 防抖：忽略短时间内的重复点击
    }
    this.lastClickTime = now;

    // 获取按钮信息
    const team = e.currentTarget.dataset.team;
    const value = parseInt(e.currentTarget.dataset.value);
    const buttonType = value === 3 ? 'double' : value === 2 ? 'two' : 'one';
    
    // 检查按钮是否已被禁用
    if (this.buttonDisabledStates[team][buttonType]) {
      return; // 如果按钮已禁用，直接返回
    }

    // 控制图标显示状态
    if (team === 'red') {
      // 添加新记录后更新撤销按钮状态
      this.setData({
        showRedIcon: true,
        showBlueIcon: false
      });
    } else if (team === 'blue') {
      this.setData({
        showBlueIcon: true,
        showRedIcon: false
      });
    }
    let currentLevel = 0;
    const currentText = this.data.levelTexts[team] || '2'; // 设置默认文本
    currentLevel = this.textToLevel(currentText);
    if (isNaN(currentLevel)) currentLevel = 2; // 确保currentLevel为有效数字
    let newLevel = currentLevel;
    // 使用按钮传递的数值增加分数
    const scoreIncrement = parseInt(value) || 0;
    newLevel = currentLevel + scoreIncrement;
    // 确保等级不低于2
    if (newLevel < 2) newLevel = 2;
    // 在过A制下限制等级不超过14
    if (this.data.rule === 'by-A' && newLevel > 14) newLevel = 14;
    
    // 更新当前队伍的分数
    // 将数字转换为对应的牌面显示
    let displayText = newLevel.toString();
    if (newLevel === 11) displayText = 'J';
    if (newLevel === 12) displayText = 'Q';
    if (newLevel === 13) displayText = 'K';
    
    // 处理A及以上的情况
        if (newLevel >= 14) {
          if (this.data.rule === 'by-rounds') {
            // 在把数制下，A1/A2/A3升级规则参照过A制
            // 获取当前分数文本对应的尝试次数
            let currentAttempt = 0;
            if (currentText.startsWith('A') && currentText !== 'A') {
              const attemptMatch = currentText.match(/A(\d+)/);
              if (attemptMatch) {
                currentAttempt = parseInt(attemptMatch[1]);
              }
            } else if (currentText === 'A') {
              currentAttempt = 0;
            }
            
            // 检查是否需要升级尝试次数（参照过A制规则）
            // 1. 当点了自身的1游末游、且本方处于A/A1/A2阶段
            if (scoreIncrement === 1 && currentAttempt < 3) {
              // 升级到下一个尝试阶段
              const nextAttempt = currentAttempt + 1;
              if (nextAttempt > 0) {
                displayText = `A${nextAttempt}`;
              } else {
                displayText = 'A';
              }
              // 同时更新实际等级值
              newLevel = 14 + nextAttempt;
            } else if (scoreIncrement > 1) {
              // 2. 被对方点了升级按钮（双上或1游3游），且当前处于A/A1/A2阶段
              // 检查对方是否处于A阶段
              const otherTeam = team === 'red' ? 'blue' : 'red';
              const otherLevel = this.textToLevel(this.data.levelTexts[otherTeam]);
              const otherText = this.data.levelTexts[otherTeam];
              
              let otherAttempt = 0;
              if (otherText.startsWith('A') && otherText !== 'A') {
                const attemptMatch = otherText.match(/A(\d+)/);
                if (attemptMatch) {
                  otherAttempt = parseInt(attemptMatch[1]);
                }
              } else if (otherText === 'A') {
                otherAttempt = 0;
              }
              
              // 如果对方处于A/A1/A2阶段，当前方被对方点击升级按钮，应该升级尝试次数
              if (otherLevel >= 14 && currentAttempt < 3) {
                const nextAttempt = currentAttempt + 1;
                if (nextAttempt > 0) {
                  displayText = `A${nextAttempt}`;
                } else {
                  displayText = 'A';
                }
                // 同时更新实际等级值
                newLevel = 14 + nextAttempt;
              } else {
                // 其他情况，保持当前等级显示
                if (currentAttempt > 0) {
                  displayText = `A${currentAttempt}`;
                } else {
                  displayText = 'A';
                }
              }
            } else {
              // 其他情况，保持当前等级显示
              if (currentAttempt > 0) {
                displayText = `A${currentAttempt}`;
              } else {
                displayText = 'A';
              }
            }
          } else {
            // 过A制下显示为A
            displayText = 'A';
          }
        }
    
    // 如果是过A制且升级到A1/A2/A3，更新历史记录
    if (this.data.rule === 'by-A' && displayText.startsWith('A') && displayText !== 'A') {
      this.updateHistoryWithA1(team, displayText);
    }
    
    // 设置按钮为禁用状态
    this.buttonDisabledStates[team][buttonType] = true;
    this.setData({
      [`buttonDisabledStates.${team}.${buttonType}`]: true
    });
    
    // 5秒后恢复按钮状态
    setTimeout(() => {
      this.buttonDisabledStates[team][buttonType] = false;
      // 更新页面数据以触发重新渲染
      this.setData({
        [`buttonDisabledStates.${team}.${buttonType}`]: false
      });
    }, 5000);
    
    // 将更新后的比分添加到历史记录中
    const updatedScores = {
      red: team === 'red' ? displayText : this.data.levelTexts.red,
      blue: team === 'blue' ? displayText : this.data.levelTexts.blue
    };
    
    // 获取当前历史记录数组
    // 创建历史记录副本避免直接修改原数组
    const currentHistory = [...this.data.historyScores];
    
    // 计算索引位置：数组索引从0开始，把数也从0开始计数
    const index = this.data.rounds;

    // 检查是否已经有了当前把数的记录
    const isUpdatingCurrentRound = index < currentHistory.length;
    let nextRounds = this.data.rounds; // 默认使用当前把数

    // 如果是新的一把，添加到数组中；如果是重新编辑已有的把数（修正误点击），更新对应位置
    if (isUpdatingCurrentRound) {
      // 修正误点击时，只更新对应索引的记录，不增加把数
      currentHistory[index] = updatedScores;
    } else {
      // 新把数操作，添加记录并增加把数
      currentHistory.push(updatedScores);
      nextRounds = this.data.rounds + 1;
      // 添加新记录后立即更新撤销按钮状态
      this.setData({ canUndo: currentHistory.length > 0 });
      
      // 直接更新把数，确保立即显示
      this.setData({
        lastRounds: this.data.rounds,
        rounds: nextRounds
      });
    }
    
    // 更新历史记录数组并同步撤销状态
    this.setData({
      historyScores: currentHistory,
      canUndo: currentHistory.length > 0
    });

    // 不再显示点击提示，使用按钮反馈效果代替
    
    // 检查是否达到A（过A制）
    if (this.data.rule === 'by-A') {
      // 处理过A制的核心逻辑
      const currentTeam = team;
      const otherTeam = currentTeam === 'red' ? 'blue' : 'red';
      const currentAttempt = this.data.aAttempts[currentTeam];
      const otherAttempt = this.data.aAttempts[otherTeam];
      const scoreIncrement = parseInt(value) || 0;
      
      // 检查是否刚刚达到A
      if (currentLevel < 14 && newLevel === 14 && currentAttempt === 0) {
        // 第一次达到A，显示为A，不设置尝试次数
        this.setData({
          [`aAttempts.${currentTeam}`]: 0,
          [`levelTexts.${currentTeam}`]: 'A'
        });
      } 
      // 注意：A升A1时，只有本方点击1游末游才能升级，对方点击升级按钮不能升级
      // 这个逻辑已移除，因为根据规则，A阶段被对方点击升级按钮不会升级到A1
      // 处理A阶段（aAttempts === 0）的升级逻辑
      else if (this.data.aAttempts[currentTeam] === 0 && currentLevel === 14) {
        // 处于A阶段，根据操作处理
        if (scoreIncrement >= 2) {
          // 双上(+3)或1游3游(+2)，过A成功
          wx.showModal({
            title: '本局结束',
            content: `${currentTeam === 'red' ? '恭喜红方首轮过A成功' : '恭喜蓝方首轮过A成功'}\n本局结束`,
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // 胜利后回到2继续，适用于红方和蓝方
                // 1. 先创建历史记录副本
                const updatedHistory = [...this.data.historyScores];
                // 2. 更新最后一条历史记录中的分数为'2'
                if (updatedHistory.length > 0) {
                  updatedHistory[updatedHistory.length - 1] = {
                    ...updatedHistory[updatedHistory.length - 1],
                    [currentTeam]: '2'
                  };
                }
                // 3. 同时更新当前显示的分数、尝试次数和历史记录
                this.setData({
                  [`levelTexts.${currentTeam}`]: '2',
                  [`aAttempts.${currentTeam}`]: 0,
                  historyScores: updatedHistory,
                  gameEnded: true // 标记游戏已结束
                });
                
                // 保存到历史记录
                this.saveGameToHistory();
              }
            }
          });
        } else if (scoreIncrement === 1) {
          // 1游末游，A升A2（第二次尝试）
          displayText = this.getFormattedAAttempt(2);
          this.setData({
            [`aAttempts.${currentTeam}`]: 2,
            [`levelTexts.${currentTeam}`]: displayText
          });
        } else {
          // 其他情况，保持A状态
          displayText = 'A';
        }
      }
      // 处理已经在尝试过A的情况
      else if (this.data.aAttempts[currentTeam] > 0) {
        const attempt = this.data.aAttempts[currentTeam];
        
        // 判断本轮结果
        if (scoreIncrement >= 2) {
          // 双上(+3)或1游3游(+2)，过A成功
          let successMessage = '';
          if (attempt === 0) {
            // A阶段（第一次尝试）成功
            successMessage = `${currentTeam === 'red' ? '恭喜红方首轮过A成功' : '恭喜蓝方首轮过A成功'}`;
          } else if (attempt === 1) {
            // A2阶段（第二次尝试）成功
            successMessage = `${currentTeam === 'red' ? '恭喜红方第二轮过A成功' : '恭喜蓝方第二轮过A成功'}`;
          } else if (attempt === 2) {
            // A3阶段（第三次尝试）成功
            successMessage = `${currentTeam === 'red' ? '恭喜红方第三轮过A成功' : '恭喜蓝方第三轮过A成功'}`;
          }
          
          wx.showModal({
            title: '本局结束',
            content: `${successMessage}\n本局结束`,
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  // 胜利后回到2继续，适用于红方和蓝方
                  // 1. 先创建历史记录副本
                  const updatedHistory = [...this.data.historyScores];
                  // 2. 更新最后一条历史记录中的分数为'2'
                  if (updatedHistory.length > 0) {
                    updatedHistory[updatedHistory.length - 1] = {
                      ...updatedHistory[updatedHistory.length - 1],
                      [currentTeam]: '2'
                    };
                  }
                  // 3. 同时更新当前显示的分数、尝试次数和历史记录
                  this.setData({
                    [`levelTexts.${currentTeam}`]: '2',
                    [`aAttempts.${currentTeam}`]: 0,
                    historyScores: updatedHistory,
                    gameEnded: true // 标记游戏已结束
                  });
                  
                  // 保存到历史记录
                  this.saveGameToHistory();
                }
              }
            });
        } else if (scoreIncrement === 1) {
          // 1游末游，继续打A
          if (attempt < 3) {
            // 升级到下一个尝试阶段
            const nextAttempt = attempt + 1;
            displayText = this.getFormattedAAttempt(nextAttempt);
            this.setData({
              [`aAttempts.${currentTeam}`]: nextAttempt,
              [`levelTexts.${currentTeam}`]: displayText
            });
          } else {
            // 已经是A3，第三次未过A，游戏结束
            wx.showModal({
              title: '本局结束',
              content: `非常遗憾，${currentTeam === 'red' ? '红方' : '蓝方'}3次过A未成功，游戏结束`,
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  // 保存历史数据
                  const gameData = {
                    historyScores: this.data.historyScores,
                    rounds: this.data.rounds,
                    levelTexts: this.data.levelTexts,
                    rule: this.data.rule,
                    maxRounds: this.data.maxRounds,
                    aAttempts: this.data.aAttempts,
                    teams: {
                      red: '红方',
                      blue: '蓝方'
                    },
                    timestamp: new Date().toLocaleString()
                  };
                  wx.setStorageSync('savedGameData', gameData);
                  
                  // 标记游戏已结束
                  this.setData({
                    gameEnded: true
                  });
                  
                  // 保存到历史记录
                  this.saveGameToHistory();
                  
                  wx.showToast({
                    title: '比赛记录已保存',
                    icon: 'success'
                  });
                }
              }
            });
          }
        } else if (scoreIncrement > 1) {
          // 被对方点了升级按钮（双上或1游3游），A1/A2/A3升级
          if (attempt < 3) {
            // 升级到下一个尝试阶段
            const nextAttempt = attempt + 1;
            displayText = this.getFormattedAAttempt(nextAttempt);
            this.setData({
              [`aAttempts.${currentTeam}`]: nextAttempt,
              [`levelTexts.${currentTeam}`]: displayText
            });
          } else {
            // 已经是A3，被对方点击升级按钮，游戏结束
            wx.showModal({
              title: '本局结束',
              content: `非常遗憾，${currentTeam === 'red' ? '红方' : '蓝方'}3次过A未成功，游戏结束`,
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  // 保存历史数据
                  const gameData = {
                    historyScores: this.data.historyScores,
                    rounds: this.data.rounds,
                    levelTexts: this.data.levelTexts,
                    rule: this.data.rule,
                    maxRounds: this.data.maxRounds,
                    aAttempts: this.data.aAttempts,
                    teams: {
                      red: '红方',
                      blue: '蓝方'
                    },
                    timestamp: new Date().toLocaleString()
                  };
                  wx.setStorageSync('savedGameData', gameData);
                  
                  // 标记游戏已结束
                  this.setData({
                    gameEnded: true
                  });
                  
                  // 保存到历史记录
                  this.saveGameToHistory();
                  
                  wx.showToast({
                    title: '比赛记录已保存',
                    icon: 'success'
                  });
                }
              }
            });
          }
        } else {
          // 其他情况，保持当前状态
          displayText = this.getFormattedAAttempt(attempt);
        }
      }
      
      // 处理对方队伍在A阶段的升级逻辑（被对方点击升级按钮）
      // 当对方处于A阶段且当前方点击任何升级按钮时，对方升级到A2
      if (this.data.aAttempts[otherTeam] === 0 && 
          this.data.levelTexts[otherTeam] === 'A' && 
          scoreIncrement > 0) {
        // 对方从A阶段升级到A2
        this.setData({
          [`aAttempts.${otherTeam}`]: 2,
          [`levelTexts.${otherTeam}`]: this.getFormattedAAttempt(2)
        });
        // 更新历史记录
        this.updateHistoryWithA1(otherTeam, this.getFormattedAAttempt(2));
      }
      // 处理对方队伍在A1/A2阶段的升级逻辑（被对方点击升级按钮）
      // 当对方处于A1/A2阶段且当前方点击升级按钮时，对方升级
      else if (this.data.aAttempts[otherTeam] > 0 && 
          this.data.aAttempts[otherTeam] < 3 && 
          scoreIncrement > 1) {
        const otherAttempt = this.data.aAttempts[otherTeam];
        const nextAttempt = otherAttempt + 1;
        if (nextAttempt <= 3) {
          // 对方升级到下一个尝试阶段
          this.setData({
            [`aAttempts.${otherTeam}`]: nextAttempt,
            [`levelTexts.${otherTeam}`]: this.getFormattedAAttempt(nextAttempt)
          });
          // 更新历史记录
          this.updateHistoryWithA1(otherTeam, this.getFormattedAAttempt(nextAttempt));
        } else {
          // 对方已经是A3，被点击升级按钮，游戏结束
          wx.showModal({
            title: '本局结束',
            content: `非常遗憾，${otherTeam === 'red' ? '红方' : '蓝方'}3次过A未成功，游戏结束`,
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // 保存历史数据
                const gameData = {
                  historyScores: this.data.historyScores,
                  rounds: this.data.rounds,
                  levelTexts: this.data.levelTexts,
                  rule: this.data.rule,
                  maxRounds: this.data.maxRounds,
                  aAttempts: this.data.aAttempts,
                  teams: {
                    red: '红方',
                    blue: '蓝方'
                  },
                  timestamp: new Date().toLocaleString()
                };
                wx.setStorageSync('savedGameData', gameData);
                
                // 标记游戏已结束
                this.setData({
                  gameEnded: true
                });
                
                // 保存到历史记录
                this.saveGameToHistory();
                
                wx.showToast({
                  title: '比赛记录已保存',
                  icon: 'success'
                });
              }
            }
          });
        }
      }
      
      // 处理对方队伍在A3阶段的升级逻辑（被对方点击升级按钮）
      // 当对方处于A3阶段且当前方点击任何升级按钮时，游戏结束
      else if (this.data.aAttempts[otherTeam] === 3 && 
          scoreIncrement > 0) {
        // 对方已经是A3，被点击升级按钮，游戏结束
        wx.showModal({
          title: '本局结束',
          content: `非常遗憾，${otherTeam === 'red' ? '红方' : '蓝方'}3次过A未成功，游戏结束`,
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              // 保存历史数据
              const gameData = {
                historyScores: this.data.historyScores,
                rounds: this.data.rounds,
                levelTexts: this.data.levelTexts,
                rule: this.data.rule,
                maxRounds: this.data.maxRounds,
                aAttempts: this.data.aAttempts,
                teams: {
                  red: '红方',
                  blue: '蓝方'
                },
                timestamp: new Date().toLocaleString()
              };
              wx.setStorageSync('savedGameData', gameData);
              
              // 标记游戏已结束
              this.setData({
                gameEnded: true
              });
              
              // 保存到历史记录
              this.saveGameToHistory();
              
              wx.showToast({
                title: '比赛记录已保存',
                icon: 'success'
              });
            }
          }
        });
      }
      
      // 检查是否双方都到了A3
      if (this.data.aAttempts.red === 3 && this.data.aAttempts.blue === 3) {
        wx.showModal({
          title: '本局结束',
          content: '双方握手言和，战平\n本局结束',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              // 保存历史数据
              const gameData = {
                historyScores: this.data.historyScores,
                rounds: this.data.rounds,
                levelTexts: this.data.levelTexts,
                rule: this.data.rule,
                maxRounds: this.data.maxRounds,
                aAttempts: this.data.aAttempts,
                teams: {
                  red: '红方',
                  blue: '蓝方'
                },
                timestamp: new Date().toLocaleString()
              };
              wx.setStorageSync('savedGameData', gameData);
              
              // 标记游戏已结束
              this.setData({
                gameEnded: true
              });
              
              // 保存到历史记录
              this.saveGameToHistory();
              
              wx.showToast({
                title: '比赛记录已保存',
                icon: 'success'
              });
              
              // 回到起始状态
              // 1. 先创建历史记录副本
              const updatedHistory = [...this.data.historyScores];
              // 2. 更新最后一条历史记录中的分数为'2'
              if (updatedHistory.length > 0) {
                updatedHistory[updatedHistory.length - 1] = {
                  ...updatedHistory[updatedHistory.length - 1],
                  red: '2',
                  blue: '2'
                };
              }
              // 3. 同时更新当前显示的分数、尝试次数和历史记录
              this.setData({
                levelTexts: {
                  red: '2',
                  blue: '2'
                },
                aAttempts: {
                  red: 0,
                  blue: 0
                },
                historyScores: updatedHistory,
                gameEnded: true // 标记游戏已结束
              });
            }
          }
        });
      }
    } else {
      // 先检查是否达到最大把数（把数制）
      if (this.data.rule === 'by-rounds' && nextRounds === this.data.maxRounds) {
        // 当达到最大把数时，根据比分结果显示不同的结束信息
        const redLevel = this.textToLevel(this.data.levelTexts.red);
        const blueLevel = this.textToLevel(this.data.levelTexts.blue);
        let resultText = '';
        
        if (redLevel > blueLevel) {
          resultText = `恭喜红方获胜`;
        } else if (blueLevel > redLevel) {
          resultText = `恭喜蓝方获胜`;
        } else {
          resultText = `恭喜双方战平`;
        }
        
        wx.showModal({
          title: `${this.data.maxRounds}把已到`,
          content: `${this.data.maxRounds}把已到\n本局结束\n${resultText}`,
          showCancel: false,
          confirmText: '确定',
          success: (res) => {
            if (res.confirm) {
              // 标记游戏已结束
              this.setData({
                gameEnded: true
              });
              
              // 保存到历史记录
              this.saveGameToHistory();
              
              // 不做任何清零操作，保持当前界面状态
              // 用户要求结束时保持当前界面
            }
          }
        });
    } else {
        // 未达到最大把数时，检查是否追不上了
        const uncatchableResult = this.checkUncatchable();
      if (uncatchableResult.isUncatchable) {
          wx.showModal({
            title: '追不上了',
            content: `${uncatchableResult.leadingTeam === 'red' ? '红方' : '蓝方'}领先优势过大，即使剩余把数全胜也无法追上！`,
            confirmText: '是',
            cancelText: '否',
            success: (res) => {
              if (res.confirm) {
                // 标记游戏已结束
                this.setData({
                  gameEnded: true
                });
                
                // 保存到历史记录
                this.saveGameToHistory();
                
                // 不做任何清零操作，保持当前界面状态
                // 用户要求结束时保持当前界面
              }
            }
          });
        }
      }
    }
    
    // 最后更新实时比分
    this.setData({
      [`levelTexts.${team}`]: displayText
    });
  },

  // 开始游戏
  onStartGame() {
    if (this.data.gameStarted || this.data.gameEnded) {
      return;
    }
    
    this.setData({
      gameStarted: true
    });
    
    wx.showToast({
      title: '游戏开始！',
      icon: 'success',
      duration: 1500
    });
  },

  // 处理规则选择
  onRuleChange(e) {
    // 如果游戏已经开始（游戏已开始或游戏已结束），禁止更改规则
    if (this.data.gameStarted || this.data.gameEnded) {
      wx.showToast({
        title: '请先点击开始游戏',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const newRule = e.detail.value;
    // 保存当前的分数文本
    const currentRedText = this.data.levelTexts.red;
    const currentBlueText = this.data.levelTexts.blue;
    
    // 更新规则
    this.setData({
      rule: newRule,
      // 只在从把数制切换到过A制时重置过A尝试次数
      // 从过A制切换到把数制时保留A1/A2/A3状态
      aAttempts: newRule === 'by-A' ? {
        red: 0,
        blue: 0
      } : this.data.aAttempts
    });
    
    // 如果是从过A制切换到把数制，保留A1/A2/A3状态
    if (newRule === 'by-rounds' && currentRedText.startsWith('A') && !currentRedText.startsWith('A1') && !currentRedText.startsWith('A2') && !currentRedText.startsWith('A3')) {
      // 检查当前是否有A的尝试
      const redScore = this.textToLevel(currentRedText);
      const blueScore = this.textToLevel(currentBlueText);
      
      // 根据aAttempts设置正确的A1/A2/A3格式
      this.setData({
        'levelTexts.red': redScore === 14 ? `A${this.data.aAttempts.red}` : redScore === 11 ? 'J' : redScore === 12 ? 'Q' : redScore === 13 ? 'K' : redScore.toString(),
        'levelTexts.blue': blueScore === 14 ? `A${this.data.aAttempts.blue}` : blueScore === 11 ? 'J' : blueScore === 12 ? 'Q' : blueScore === 13 ? 'K' : blueScore.toString()
      });
    } else if (newRule === 'by-A') {
      // 如果是从把数制切换到过A制，重置等级显示文本
      const redScore = this.textToLevel(this.data.levelTexts.red);
      const blueScore = this.textToLevel(this.data.levelTexts.blue);
      
      this.setData({
        'levelTexts.red': redScore === 11 ? 'J' : redScore === 12 ? 'Q' : redScore === 13 ? 'K' : redScore >= 14 ? 'A' : redScore.toString(),
        'levelTexts.blue': blueScore === 11 ? 'J' : blueScore === 12 ? 'Q' : blueScore === 13 ? 'K' : blueScore >= 14 ? 'A' : blueScore.toString()
      });
    }
  },

  // 处理最大把数变化
  onMaxRoundsChange(e) {
    const maxRounds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15][e.detail.value];
    this.setData({
      maxRounds: maxRounds
    });
  },

  // 长按历史比分，修改指定把数的比分
  onLongPressHistory(e) {
    const { index } = e.currentTarget.dataset;
    const historyItem = this.data.historyScores[index];
    
    // 显示操作菜单，让用户选择要修改的队伍
    wx.showActionSheet({
      itemList: ['修改红方分数', '修改蓝方分数'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 修改红方分数
          this.showScoreInput('red', historyItem.red, index);
        } else if (res.tapIndex === 1) {
          // 修改蓝方分数
          this.showScoreInput('blue', historyItem.blue, index);
        }
      }
    });
  },
  
  // 显示分数输入框
  showScoreInput(team, currentScore, index) {
    wx.showModal({
      title: `修改${team === 'red' ? '红方' : '蓝方'}分数`,
      content: '',
      editable: true,
      placeholderText: '请重新输入比分',
      success: (res) => {
        if (res.confirm && res.content) {
          const newScore = res.content.trim().toUpperCase();
          // 验证输入的分数是否有效
          if (this.isValidScore(newScore)) {
            this.updateHistoryScore(team, newScore, index);
          } else {
            wx.showToast({
              title: '无效的分数，请输入2-A之间的分数',
              icon: 'none'
            });
          }
        }
      }
    });
  },
  
  // 验证分数是否有效
  isValidScore(score) {
    const validScores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    // 也接受A加上标数字的格式
    return validScores.includes(score) || /^A\d+$/.test(score);
  },

  // 获取带格式的A尝试文本（如A¹、A²、A³）
  getFormattedAAttempt(attempt) {
    // 在WXML中会被渲染为上标
    return `A${attempt}`;
  },

  // 更新历史记录中的A1/A2/A3显示
  updateHistoryWithA1(team, aText) {
    const currentHistory = [...this.data.historyScores];
    const index = this.data.rounds;
    
    // 如果当前把数已有记录，更新它
    if (index < currentHistory.length) {
      currentHistory[index] = {
        ...currentHistory[index],
        [team]: aText
      };
    } else {
      // 如果是新把数，添加新记录
      const updatedScores = {
        red: team === 'red' ? aText : this.data.levelTexts.red,
        blue: team === 'blue' ? aText : this.data.levelTexts.blue
      };
      currentHistory.push(updatedScores);
    }
    
    // 更新历史记录
    this.setData({
      historyScores: currentHistory,
      canUndo: currentHistory.length > 0
    });
  },
  
  // 将等级数字转换为显示文本
  levelToText(level, team = null) {
    if (level === 11) return 'J';
    if (level === 12) return 'Q';
    if (level === 13) return 'K';
    if (level >= 14 && this.data.rule === 'by-rounds') {
      // 在把数制下，如果等级大于等于14，显示为A1/A2/A3格式
      const attempt = level - 14;
      if (attempt > 0) {
        return `A${attempt}`;
      }
      return 'A';
    }
    if (level === 14) {
      // 在过A制下的处理逻辑
      if (team && this.data.aAttempts[team] > 0) {
        return this.getFormattedAAttempt(this.data.aAttempts[team]);
      }
      return 'A';
    }
    return level.toString();
  },
  
  // 更新历史记录中的分数
  updateHistoryScore(team, newScore, index) {
    const currentHistory = [...this.data.historyScores];
    const originalItem = {...currentHistory[index]};
    const originalScore = this.textToLevel(originalItem[team]);
    const newScoreVal = this.textToLevel(newScore);
    const deltaEdit = newScoreVal - originalScore;
    
    // 如果没有分数变化，则不执行后续操作
    if (deltaEdit === 0) return;
    
    // 更新当前回合分数
    const updatedItem = {...originalItem};
    updatedItem[team] = newScore;
    currentHistory[index] = updatedItem;
    
    // 将差值应用到所有后续回合
    for (let i = index + 1; i < currentHistory.length; i++) {
      // 获取修改后的前一回合分数
      const prevScore = this.textToLevel(currentHistory[i-1][team]);
      // 获取原始当前回合与前一回合的差值
      const originalPrevScore = this.textToLevel(this.data.historyScores[i-1][team]);
      const originalCurrScore = this.textToLevel(this.data.historyScores[i][team]);
      const originalDelta = originalCurrScore - originalPrevScore;
      
      // 计算新的当前回合分数
      const newCurrScore = prevScore + originalDelta;
      
      // 创建新对象确保状态更新
      // 注意：这里需要特殊处理A加上标数字的情况
      let displayScore = this.levelToText(newCurrScore);
      
      // 检查原始历史记录中是否包含A加上标数字的格式
      const originalDisplay = this.data.historyScores[i][team];
      if (originalDisplay.startsWith('A') && originalDisplay.length > 1) {
        // 在把数制下，保持A1/A2/A3格式
        if (this.data.rule === 'by-rounds') {
          // 提取上标数字
          const attemptMatch = originalDisplay.match(/A(\d+)/);
          if (attemptMatch) {
            // 计算新的尝试次数
            const baseScore = 14;
            const newAttempt = newCurrScore - baseScore;
            if (newAttempt > 0) {
              displayScore = `A${newAttempt}`;
            } else {
              displayScore = 'A';
            }
          }
        }
        // 在过A制下，保持上标格式
        else if (this.data.rule === 'by-A') {
          // 提取上标数字
          const attemptMatch = originalDisplay.match(/A(\d+)/);
          if (attemptMatch) {
            displayScore = `A${attemptMatch[1]}`;
          }
        }
      }
      
      currentHistory[i] = {
        ...currentHistory[i],
        [team]: displayScore
      };
    }
    
    // 更新当前显示分数
    const lastRound = currentHistory[currentHistory.length - 1];
    this.setData({
      historyScores: currentHistory,
      [`levelTexts.${team}`]: lastRound[team]
    });
  },
  
  // 从指定索引重新计算分数
  recalculateScoresFrom(startIndex) {
    if (startIndex >= this.data.historyScores.length - 1) {
      return; // 已经是最后一把，不需要重新计算
    }
    
    // 从startIndex开始，重新计算每一把的分数
    const currentHistory = this.data.historyScores.map(item => ({...item})); // 创建历史记录的深拷贝
    let redScore = this.textToLevel(currentHistory[startIndex].red);
    let blueScore = this.textToLevel(currentHistory[startIndex].blue);
    
    // 从startIndex+1开始重新计算每一把的分数
    for (let i = startIndex + 1; i < currentHistory.length; i++) {
      // 计算当前轮与前一轮的差值（delta）
      const prevRed = this.textToLevel(currentHistory[i-1].red);
      const currRed = this.textToLevel(currentHistory[i].red);
      const deltaRed = currRed - prevRed;
      
      const prevBlue = this.textToLevel(currentHistory[i-1].blue);
      const currBlue = this.textToLevel(currentHistory[i].blue);
      const deltaBlue = currBlue - prevBlue;
      
      // 应用差值
      redScore += deltaRed;
      blueScore += deltaBlue;
      
      // 更新历史记录中的当前轮次分数
      // 特殊处理A加上标数字的情况
      let redDisplay = redScore.toString();
      if (redScore === 11) redDisplay = 'J';
      if (redScore === 12) redDisplay = 'Q';
      if (redScore === 13) redDisplay = 'K';
      if (redScore >= 14) {
        // 在把数制下，如果等级大于等于14，显示为A1/A2/A3格式
        if (this.data.rule === 'by-rounds') {
          const attempt = redScore - 14;
          if (attempt > 0) {
            redDisplay = `A${attempt}`;
          } else {
            redDisplay = 'A';
          }
        } else {
          // 检查原始记录中是否有A加上标数字
          const originalRed = this.data.historyScores[i].red;
          if (originalRed.startsWith('A') && originalRed.length > 1) {
            // 保留上标格式
            const attemptMatch = originalRed.match(/A(\d+)/);
            if (attemptMatch) {
              redDisplay = `A${attemptMatch[1]}`;
            }
          } else {
            redDisplay = 'A';
          }
        }
      }
      
      let blueDisplay = blueScore.toString();
      if (blueScore === 11) blueDisplay = 'J';
      if (blueScore === 12) blueDisplay = 'Q';
      if (blueScore === 13) blueDisplay = 'K';
      if (blueScore >= 14) {
        // 在把数制下，如果等级大于等于14，显示为A1/A2/A3格式
        if (this.data.rule === 'by-rounds') {
          const attempt = blueScore - 14;
          if (attempt > 0) {
            blueDisplay = `A${attempt}`;
          } else {
            blueDisplay = 'A';
          }
        } else {
          // 检查原始记录中是否有A加上标数字
          const originalBlue = this.data.historyScores[i].blue;
          if (originalBlue.startsWith('A') && originalBlue.length > 1) {
            // 保留上标格式
            const attemptMatch = originalBlue.match(/A(\d+)/);
            if (attemptMatch) {
              blueDisplay = `A${attemptMatch[1]}`;
            }
          } else {
            blueDisplay = 'A';
          }
        }
      }
      
      currentHistory[i] = {
        ...currentHistory[i],
        red: redDisplay,
        blue: blueDisplay
      };
    }
    
    // 更新最后一把的当前显示分数
    let redDisplay = this.levelToText(redScore, 'red');
    let blueDisplay = this.levelToText(blueScore, 'blue');
    
    this.setData({
      'levelTexts.red': redDisplay,
      'levelTexts.blue': blueDisplay,
      'historyScores': currentHistory
    });
  },

  // 撤销上一步操作
  undoLastStep() {
    // 检查是否已达到结束条件（游戏已结束），如果是则不允许撤销
    if (this.data.gameEnded) {
      wx.showToast({
        title: '游戏已结束，不允许撤销',
        icon: 'none'
      });
      return;
    }

    // 创建历史记录副本避免直接修改原数组
    const history = [...this.data.historyScores];
    if (history.length === 0) return;

    // 移除最后一条记录
    history.pop();
    const newRounds = history.length;
    
    // 获取上一步的分数或默认值
    const prevScores = history.length > 0 ? history[history.length - 1] : { red: '2', blue: '2' };
    
    // 分析恢复后的分数文本，更新aAttempts状态
    const newAAttempts = {
      red: this.getAttemptFromScoreText(prevScores.red),
      blue: this.getAttemptFromScoreText(prevScores.blue)
    };
    
    this.setData({
      historyScores: history,
      rounds: newRounds,
      levelTexts: {
        red: prevScores.red,
        blue: prevScores.blue
      },
      aAttempts: newAAttempts,
      canUndo: history.length > 0
    }, () => {
      // 确保按钮状态同步更新
      this.setData({ canUndo: history.length > 0 });
    });
  },
  
  // 从分数文本中提取尝试次数
  getAttemptFromScoreText(scoreText) {
    if (scoreText.startsWith('A') && scoreText.length > 1) {
      // 尝试提取A后面的数字
      const attemptMatch = scoreText.match(/A(\d+)/);
      if (attemptMatch) {
        return parseInt(attemptMatch[1]);
      }
    } else if (scoreText === 'A') {
      return 0; // 单独的A对应尝试次数0
    }
    return 0; // 其他情况默认为0
  },

  // 恢复上一局游戏
  restoreLastGame() {
    wx.showModal({
      title: '恢复游戏',
      content: '确定要恢复上一局游戏吗？当前游戏数据将被覆盖。',
      success: (res) => {
        if (res.confirm) {
          // 从本地存储获取保存的游戏数据
          const savedGameData = wx.getStorageSync('savedGameData');
          if (savedGameData) {
            // 恢复游戏状态
            this.setData({
              historyScores: savedGameData.historyScores || [],
              rounds: savedGameData.rounds || 0,
              levelTexts: savedGameData.levelTexts || { red: '2', blue: '2' },
              rule: savedGameData.rule || 'by-A',
              maxRounds: savedGameData.maxRounds || 10,
              aAttempts: savedGameData.aAttempts || { red: 0, blue: 0 },
              canUndo: (savedGameData.historyScores || []).length > 0,
              // 如果恢复的游戏已结束，标记为游戏已结束
              gameEnded: savedGameData.gameEnded || false
            });
            wx.showToast({
              title: '游戏已恢复',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '没有找到可恢复的游戏数据',
              icon: 'none'
            });
          }
        }    
      }
    });
  },

  // 结束本局
  onEndGame() {
    wx.showModal({
      title: '确认结束',
      content: '确定要结束本局游戏吗？',
      success: (res) => {
        if (res.confirm) {
            // 保存历史数据
            const gameData = {
              historyScores: this.data.historyScores,
              rounds: this.data.rounds,
              levelTexts: this.data.levelTexts,
              rule: this.data.rule,
              maxRounds: this.data.maxRounds,
              aAttempts: this.data.aAttempts,
              teams: {
                red: '红方',
                blue: '蓝方'
              },
              timestamp: new Date().toLocaleString()
            };
            wx.setStorageSync('savedGameData', gameData);
            
            // 标记游戏已结束
            this.setData({
              gameEnded: true
            });
            
            // 保存到历史记录
            this.saveGameToHistory();
            
            wx.showToast({
              title: '比赛记录已保存',
              icon: 'success'
            });
            
            // 重置游戏数据
            this.setData({
              levelTexts: {
                red: '2',
                blue: '2'
              },
              rounds: 0,
              lastRounds: 0,
              // 清空历史记录
              historyScores: [],
              // 重置点击标志
              hasUserClicked: false,
              // 重置过A尝试次数
              aAttempts: {
                red: 0,
                blue: 0
              },
              // 重置游戏状态
              gameStarted: false,
              gameEnded: false,
              gameSavedToHistory: false,
              canUndo: false,
              // 隐藏胜利图标
              showRedIcon: false,
              showBlueIcon: false
            });
        }
      }
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '扑克双上计分',
      path: '/pages/index/index',
      imageUrl: '../../images/victor.svg' // 使用已有的victor.svg作为分享图片
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '扑克双上计分',
      query: '',
      imageUrl: '../../images/victor.svg' // 使用已有的victor.svg作为分享图片
    }
  },

  // 导航按钮事件处理
  onShowHistory() {
    wx.navigateTo({
      url: '/pages/history/index'
    });
  },

  onShowHelp() {
    wx.showModal({
      title: '说明文档',
      content: '扑克双上计分规则：\n1. 过A规则：先过A的队伍获胜\n2. 把数规则：先达到设定把数的队伍获胜\n3. 双上：+3分\n4. 1游3游：+2分\n5. 1游末游：+1分',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShowFeedback() {
    wx.showModal({
      title: '反馈',
      content: '如有问题或建议，请联系开发者',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShowSettings() {
    wx.navigateTo({
      url: '/pages/team-setting/index'
    });
  },

  // 保存游戏到历史记录
  saveGameToHistory() {
    try {
      // 防止重复保存：如果游戏已结束且已保存过，则不重复保存
      if (this.data.gameEnded && this.data.gameSavedToHistory) {
        return;
      }
      
      // 检查游戏是否真正进行过：必须有历史记录或把数大于0
      const hasGameData = this.data.historyScores.length > 0 || this.data.rounds > 0;
      if (!hasGameData) {
        return;
      }
      
      // 获取现有历史记录
      const existingHistory = wx.getStorageSync('gameHistory') || [];
      
      // 确定获胜方 - 基于最终分数比较
      let winner = 'draw';
      const redLevel = this.textToLevel(this.data.levelTexts.red);
      const blueLevel = this.textToLevel(this.data.levelTexts.blue);
      
      if (redLevel > blueLevel) {
        winner = 'red';  // 红方分数更高，红方胜
      } else if (blueLevel > redLevel) {
        winner = 'blue'; // 蓝方分数更高，蓝方胜
      }
      
      // 创建游戏记录
      const now = new Date();
      const gameRecord = {
        gameId: `game_${now.getTime()}`,
        date: now.toLocaleDateString('zh-CN'),
        time: now.toLocaleTimeString('zh-CN', { hour12: false }),
        duration: this.calculateGameDuration(),
        finalScore: {
          red: this.data.levelTexts.red,
          blue: this.data.levelTexts.blue
        },
        winner: winner,
        detailedScores: [...this.data.historyScores],
        rule: this.data.rule,
        rounds: this.data.rounds,
        aAttempts: { ...this.data.aAttempts },
        redPlayers: this.data.redPlayers || ['东西方队1号', '东西方队2号'],
        bluePlayers: this.data.bluePlayers || ['南北方队1号', '南北方队2号']
      };
      
      // 添加到历史记录
      existingHistory.unshift(gameRecord); // 最新的记录放在前面
      
      // 限制历史记录数量（最多保存50局）
      if (existingHistory.length > 50) {
        existingHistory.splice(50);
      }
      
      // 保存到本地存储
      wx.setStorageSync('gameHistory', existingHistory);
      
      // 标记游戏已保存到历史记录
      this.setData({
        gameSavedToHistory: true
      });
      
    } catch (error) {
    }
  },

  // 计算游戏时长（简单实现）
  calculateGameDuration() {
    // 这里可以根据实际需要实现更精确的时长计算
    // 暂时返回一个估算值
    const rounds = this.data.rounds;
    if (rounds <= 5) return '5分钟';
    if (rounds <= 10) return '10分钟';
    if (rounds <= 15) return '15分钟';
    if (rounds <= 20) return '20分钟';
    return '25分钟';
  },

  // 页面隐藏时自动保存游戏状态
  onHide() {
    this.autoSaveGameState();
  },

  // 自动保存游戏状态
  autoSaveGameState() {
    try {
      // 检查是否有游戏进行中的数据
      const hasGameData = this.data.historyScores.length > 0 || this.data.rounds > 0;
      
      if (!hasGameData) {
        return;
      }

      // 如果游戏已经结束，不需要重复保存
      if (this.data.gameEnded) {
        return;
      }
      
      // 保存当前游戏状态
      const gameData = {
        levelTexts: this.data.levelTexts,
        historyScores: this.data.historyScores,
        rule: this.data.rule,
        maxRounds: this.data.maxRounds,
        rounds: this.data.rounds,
        aAttempts: this.data.aAttempts,
        redPlayers: this.data.redPlayers,
        bluePlayers: this.data.bluePlayers,
        timestamp: new Date().toLocaleString()
      };
      
      wx.setStorageSync('savedGameData', gameData);
      
    } catch (error) {
      // 自动保存失败，静默处理
    }
  },

  // 检查是否需要用户选择（智能提示）
  checkNeedUserChoice(savedGameData) {
    try {
      // 判断是否需要用户选择的条件：
      // 1. 有保存的游戏数据
      // 2. 游戏未结束
      // 3. 游戏有实际进度
      const needsUserChoice = savedGameData && 
                             !savedGameData.gameEnded && 
                             (savedGameData.historyScores.length > 0 || savedGameData.rounds > 0);
      
      if (!needsUserChoice) {
        return;
      }

      // 构建提示内容
      const redScore = savedGameData.levelTexts.red;
      const blueScore = savedGameData.levelTexts.blue;
      const rounds = savedGameData.rounds;
      const ruleText = savedGameData.rule === 'by-A' ? '过A制' : '把数制';
      
      const content = `检测到未完成的游戏\n\n上一局游戏：红方 ${redScore}分 vs 蓝方 ${blueScore}分（第${rounds}把）\n规则：${ruleText}\n\n请选择：`;
      
      wx.showModal({
        title: '未完成的游戏',
        content: content,
        confirmText: '继续上一局',
        cancelText: '结束上一局',
        success: (res) => {
          if (res.confirm) {
            // 用户选择继续上一局
            this.restoreLastGame();
          } else {
            // 用户选择结束上一局
            this.endPreviousGame(savedGameData);
    }
  }
});

    } catch (error) {
    }
  },

  // 结束上一局游戏
  endPreviousGame(savedGameData) {
    try {
      
      // 将上一局游戏保存到历史记录
      this.savePreviousGameToHistory(savedGameData);
      
      // 清除保存的游戏数据
      wx.removeStorageSync('savedGameData');
      
      // 重置当前游戏状态
      this.setData({
        canRestore: false,
        gameEnded: false,
        gameSavedToHistory: false
      });
      
      wx.showToast({
        title: '上一局已结束',
        icon: 'success'
      });
      
    } catch (error) {
    }
  },

  // 将上一局游戏保存到历史记录
  savePreviousGameToHistory(gameData) {
    try {
      // 判断胜负
      let winner = 'draw';
      const redLevel = this.textToLevel(gameData.levelTexts.red);
      const blueLevel = this.textToLevel(gameData.levelTexts.blue);

      if (redLevel > blueLevel) {
        winner = 'red';
      } else if (blueLevel > redLevel) {
        winner = 'blue';
      }

      // 创建游戏记录
      const now = new Date();
      const gameRecord = {
        gameId: `game_${now.getTime()}`,
        date: now.toLocaleDateString('zh-CN'),
        time: now.toLocaleTimeString('zh-CN', { hour12: false }),
        duration: this.calculateGameDurationFromRounds(gameData.rounds),
        finalScore: {
          red: gameData.levelTexts.red,
          blue: gameData.levelTexts.blue
        },
        winner: winner,
        detailedScores: gameData.historyScores || [],
        rule: gameData.rule,
        rounds: gameData.rounds,
        aAttempts: gameData.aAttempts || { red: 0, blue: 0 },
        redPlayers: gameData.redPlayers || ['东西方队1号', '东西方队2号'],
        bluePlayers: gameData.bluePlayers || ['南北方队1号', '南北方队2号']
      };

      // 保存到历史记录
      const existingHistory = wx.getStorageSync('gameHistory') || [];
      existingHistory.unshift(gameRecord);
      
      // 限制历史记录数量
      if (existingHistory.length > 50) {
        existingHistory.splice(50);
      }
      
      wx.setStorageSync('gameHistory', existingHistory);
      
    } catch (error) {
      // 保存失败，静默处理
    }
  },

  // 根据把数计算游戏时长
  calculateGameDurationFromRounds(rounds) {
    if (rounds <= 5) return '5分钟';
    if (rounds <= 10) return '10分钟';
    if (rounds <= 15) return '15分钟';
    if (rounds <= 20) return '20分钟';
    return '25分钟';
  },

});