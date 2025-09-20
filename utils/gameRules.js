/**
 * 游戏规则模块
 * 负责等级转换、规则判断、过A制逻辑
 */

class GameRules {
  constructor() {
    this.rule = 'by-rounds'; // 默认规则：把数制
  }

  /**
   * 将等级文本转换为数字
   * @param {string} text - 等级文本
   * @returns {number} - 等级数字
   */
  textToLevel(text) {
    // 处理A加上标数字的情况，如A¹、A²、A³和E
    if (text.startsWith('A')) {
      const attemptMatch = text.match(/A(\d+)/);
      if (attemptMatch) {
        // 在把数制下，A1/A2/A3视为不同级别：A1=15, A2=16, A3=17
        const attempt = parseInt(attemptMatch[1]);
        if (this.rule === 'by-rounds') {
          return 14 + attempt;
        }
        return 14; // 过A制下所有A的尝试都视为14级
      }
      return 14;
    }
    if (text.toLowerCase() === 'e') {
      return 14; // E也视为14级，但会在UI上特殊显示
    }
    if (text === 'J') return 11;
    else if (text === 'Q') return 12;
    else if (text === 'K') return 13;
    else if (text === 'A') return 14;
    else {
      const num = parseInt(text);
      return isNaN(num) ? 2 : num;
    }
  }

  /**
   * 将等级数字转换为文本
   * @param {number} level - 等级数字
   * @returns {string} - 等级文本
   */
  levelToText(level) {
    if (level === 11) return 'J';
    else if (level === 12) return 'Q';
    else if (level === 13) return 'K';
    else if (level === 14) return 'A';
    else if (level > 14) {
      const attempt = level - 14;
      return `A${attempt}`;
    }
    else return level.toString();
  }

  /**
   * 检查游戏是否结束
   * @param {Object} gameData - 游戏数据
   * @returns {Object} - 检查结果
   */
  checkGameEnd(gameData) {
    const { levelTexts, rounds, maxRounds, rule } = gameData;
    const redLevel = this.textToLevel(levelTexts.red);
    const blueLevel = this.textToLevel(levelTexts.blue);

    // 检查是否达到最大把数
    if (rounds >= maxRounds) {
      return {
        isEnd: true,
        reason: 'maxRounds',
        winner: redLevel > blueLevel ? 'red' : blueLevel > redLevel ? 'blue' : 'draw'
      };
    }

    // 检查过A制结束条件
    if (rule === 'by-A') {
      // 首轮过A成功
      if ((redLevel >= 14 || blueLevel >= 14) && 
          (levelTexts.red === 'A' || levelTexts.blue === 'A')) {
        return {
          isEnd: true,
          reason: 'firstA',
          winner: redLevel > blueLevel ? 'red' : 'blue'
        };
      }

      // 双方握手言和
      if (levelTexts.red === 'A3' && levelTexts.blue === 'A3') {
        return {
          isEnd: true,
          reason: 'draw',
          winner: 'draw'
        };
      }

      // 3A未过
      if (levelTexts.red === 'E' || levelTexts.blue === 'E') {
        return {
          isEnd: true,
          reason: 'failedA',
          winner: levelTexts.red === 'E' ? 'blue' : 'red'
        };
      }
    }

    return { isEnd: false };
  }

  /**
   * 检查是否追不上
   * @param {Object} gameData - 游戏数据
   * @returns {Object} - 检查结果
   */
  checkUncatchable(gameData) {
    const { levelTexts, rounds, maxRounds } = gameData;
    const redLevel = this.textToLevel(levelTexts.red);
    const blueLevel = this.textToLevel(levelTexts.blue);
    const remainingRounds = maxRounds - rounds;

    // 计算最大可能追上的分数
    const maxCatchableScore = remainingRounds * 3; // 假设每把都是双上

    if (redLevel > blueLevel) {
      const gap = redLevel - blueLevel;
      if (gap > maxCatchableScore) {
        return {
          isUncatchable: true,
          leadingTeam: 'red',
          gap: gap,
          maxCatchable: maxCatchableScore
        };
      }
    } else if (blueLevel > redLevel) {
      const gap = blueLevel - redLevel;
      if (gap > maxCatchableScore) {
        return {
          isUncatchable: true,
          leadingTeam: 'blue',
          gap: gap,
          maxCatchable: maxCatchableScore
        };
      }
    }

    return { isUncatchable: false };
  }

  /**
   * 设置游戏规则
   * @param {string} rule - 规则类型
   */
  setRule(rule) {
    this.rule = rule;
  }
}

// 导出模块
module.exports = GameRules;
