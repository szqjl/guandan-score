/**
 * 计分逻辑模块
 * 负责分数计算、历史记录管理、撤销功能
 */

class ScoreLogic {
  constructor() {
    this.history = [];
    this.currentRound = 0;
  }

  /**
   * 更新分数
   * @param {Object} page - 页面实例
   * @param {Object} event - 点击事件
   */
  updateScore(page, event) {
    const selectedTeam = event.currentTarget.dataset.team;
    const scoreIncrement = parseInt(event.currentTarget.dataset.score);
    
    const currentText = page.data.levelTexts[selectedTeam];
    const currentLevel = page.data.gameRules.textToLevel(currentText);
    const newLevel = currentLevel + scoreIncrement;
    
    // 处理过A制逻辑
    let displayText = this.calculateDisplayText(page, selectedTeam, scoreIncrement, currentText, newLevel);
    
    // 更新页面数据
    page.setData({
      [`levelTexts.${selectedTeam}`]: displayText,
      hasUserClicked: true
    });
    
    // 添加到历史记录
    this.addToHistory(page, selectedTeam, displayText);
  }

  /**
   * 计算显示文本
   * @param {Object} page - 页面实例
   * @param {string} selectedTeam - 选中的队伍
   * @param {number} scoreIncrement - 分数增量
   * @param {string} currentText - 当前文本
   * @param {number} newLevel - 新等级
   * @returns {string} - 显示文本
   */
  calculateDisplayText(page, selectedTeam, scoreIncrement, currentText, newLevel) {
    const rule = page.data.rule;
    
    if (rule === 'by-A') {
      // 过A制逻辑
      if (newLevel >= 14) {
        const currentAttempt = page.data.aAttempts[selectedTeam];
        
        if (scoreIncrement === 1 && currentAttempt < 3) {
          // 升级到下一个尝试阶段
          const nextAttempt = currentAttempt + 1;
          page.setData({
            [`aAttempts.${selectedTeam}`]: nextAttempt
          });
          return nextAttempt > 0 ? `A${nextAttempt}` : 'A';
        } else if (scoreIncrement > 1) {
          // 被对方点了升级按钮
          const otherTeam = selectedTeam === 'red' ? 'blue' : 'red';
          const otherLevel = page.data.gameRules.textToLevel(page.data.levelTexts[otherTeam]);
          
          if (otherLevel >= 14 && currentAttempt < 3) {
            const nextAttempt = currentAttempt + 1;
            page.setData({
              [`aAttempts.${selectedTeam}`]: nextAttempt
            });
            return nextAttempt > 0 ? `A${nextAttempt}` : 'A';
          }
        }
        
        // 保持当前等级显示
        return currentAttempt > 0 ? `A${currentAttempt}` : 'A';
      } else {
        // 普通等级
        return page.data.gameRules.levelToText(newLevel);
      }
    } else {
      // 把数制逻辑
      if (newLevel >= 14) {
        const currentAttempt = page.data.aAttempts[selectedTeam];
        
        if (scoreIncrement === 1 && currentAttempt < 3) {
          const nextAttempt = currentAttempt + 1;
          page.setData({
            [`aAttempts.${selectedTeam}`]: nextAttempt
          });
          return nextAttempt > 0 ? `A${nextAttempt}` : 'A';
        } else if (scoreIncrement > 1) {
          const otherTeam = selectedTeam === 'red' ? 'blue' : 'red';
          const otherLevel = page.data.gameRules.textToLevel(page.data.levelTexts[otherTeam]);
          
          if (otherLevel >= 14 && currentAttempt < 3) {
            const nextAttempt = currentAttempt + 1;
            page.setData({
              [`aAttempts.${selectedTeam}`]: nextAttempt
            });
            return nextAttempt > 0 ? `A${nextAttempt}` : 'A';
          }
        }
        
        return currentAttempt > 0 ? `A${currentAttempt}` : 'A';
      } else {
        return page.data.gameRules.levelToText(newLevel);
      }
    }
  }

  /**
   * 添加到历史记录
   * @param {Object} page - 页面实例
   * @param {string} selectedTeam - 选中的队伍
   * @param {string} displayText - 显示文本
   */
  addToHistory(page, selectedTeam, displayText) {
    const updatedScores = {
      red: selectedTeam === 'red' ? displayText : page.data.levelTexts.red,
      blue: selectedTeam === 'blue' ? displayText : page.data.levelTexts.blue
    };
    
    const currentHistory = [...page.data.historyScores];
    const index = page.data.rounds;
    const isUpdatingCurrentRound = index < currentHistory.length;
    
    if (isUpdatingCurrentRound) {
      // 更新当前把数
      currentHistory[index] = updatedScores;
    } else {
      // 新把数
      currentHistory.push(updatedScores);
      const nextRounds = page.data.rounds + 1;
      
      page.setData({
        lastRounds: page.data.rounds,
        rounds: nextRounds,
        canUndo: currentHistory.length > 0
      });
    }
    
    page.setData({
      historyScores: currentHistory,
      canUndo: currentHistory.length > 0
    });
  }

  /**
   * 撤销最后一步
   * @param {Object} page - 页面实例
   */
  undoLastScore(page) {
    const currentHistory = [...page.data.historyScores];
    
    if (currentHistory.length === 0) {
      return false;
    }
    
    // 移除最后一条记录
    currentHistory.pop();
    
    // 更新把数
    const newRounds = Math.max(0, page.data.rounds - 1);
    
    page.setData({
      historyScores: currentHistory,
      rounds: newRounds,
      canUndo: currentHistory.length > 0
    });
    
    // 恢复上一把的分数
    if (currentHistory.length > 0) {
      const lastScores = currentHistory[currentHistory.length - 1];
      page.setData({
        'levelTexts.red': lastScores.red,
        'levelTexts.blue': lastScores.blue
      });
    } else {
      // 如果没有历史记录，恢复到初始状态
      page.setData({
        'levelTexts.red': '2',
        'levelTexts.blue': '2',
        'aAttempts.red': 0,
        'aAttempts.blue': 0
      });
    }
    
    return true;
  }

  /**
   * 清空历史记录
   * @param {Object} page - 页面实例
   */
  clearHistory(page) {
    page.setData({
      historyScores: [],
      rounds: 0,
      lastRounds: 0,
      canUndo: false,
      hasUserClicked: false
    });
  }

  /**
   * 获取历史记录统计
   * @param {Object} page - 页面实例
   * @returns {Object} - 统计信息
   */
  getHistoryStats(page) {
    const history = page.data.historyScores;
    const redWins = history.filter(round => {
      const redLevel = page.data.gameRules.textToLevel(round.red);
      const blueLevel = page.data.gameRules.textToLevel(round.blue);
      return redLevel > blueLevel;
    }).length;
    
    const blueWins = history.filter(round => {
      const redLevel = page.data.gameRules.textToLevel(round.red);
      const blueLevel = page.data.gameRules.textToLevel(round.blue);
      return blueLevel > redLevel;
    }).length;
    
    const draws = history.length - redWins - blueWins;
    
    return {
      totalRounds: history.length,
      redWins,
      blueWins,
      draws,
      redWinRate: history.length > 0 ? (redWins / history.length * 100).toFixed(1) : 0,
      blueWinRate: history.length > 0 ? (blueWins / history.length * 100).toFixed(1) : 0
    };
  }
}

// 导出模块
module.exports = ScoreLogic;
