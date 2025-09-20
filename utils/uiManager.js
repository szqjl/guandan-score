/**
 * UI交互管理模块
 * 负责弹窗、提示、界面状态管理
 */

class UIManager {
  constructor() {
    this.toastTimer = null;
  }

  /**
   * 显示自定义提示
   * @param {Object} page - 页面实例
   * @param {string} message - 提示消息
   * @param {string} team - 队伍 ('red' | 'blue')
   * @param {number} duration - 显示时长（毫秒）
   */
  showCustomToast(page, message, team = '', duration = 2000) {
    // 清除之前的定时器
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    // 显示提示
    page.setData({
      showCustomToast: true,
      toastMessage: message,
      toastTeam: team
    });

    // 自动隐藏
    this.toastTimer = setTimeout(() => {
      page.setData({
        showCustomToast: false,
        toastMessage: '',
        toastTeam: ''
      });
    }, duration);
  }

  /**
   * 显示游戏结束弹窗
   * @param {Object} page - 页面实例
   * @param {Object} gameResult - 游戏结果
   */
  showGameEndModal(page, gameResult) {
    const { reason, winner } = gameResult;
    let title = '';
    let content = '';

    switch (reason) {
      case 'maxRounds':
        title = `${page.data.maxRounds}把已到`;
        content = `${page.data.maxRounds}把已到\n本局结束\n`;
        if (winner === 'red') {
          content += '恭喜红方获胜';
        } else if (winner === 'blue') {
          content += '恭喜蓝方获胜';
        } else {
          content += '恭喜双方战平';
        }
        break;

      case 'firstA':
        title = '首轮过A成功';
        content = `恭喜${winner === 'red' ? '红方' : '蓝方'}首轮过A成功，本局结束`;
        break;

      case 'draw':
        title = '双方握手言和';
        content = '双方握手言和，战平，本局结束';
        break;

      case 'failedA':
        title = '3A未过';
        content = `${winner === 'red' ? '蓝方' : '红方'}3A未过，遗憾失去冠军`;
        break;

      default:
        title = '游戏结束';
        content = '游戏已结束';
    }

    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          // 标记游戏已结束
          page.setData({
            gameEnded: true
          });
          
          // 保存到历史记录
          if (page.data.gameData) {
            page.data.gameData.saveGameToHistory(page);
          }
        }
      }
    });
  }

  /**
   * 显示追不上弹窗
   * @param {Object} page - 页面实例
   * @param {Object} uncatchableResult - 追不上结果
   */
  showUncatchableModal(page, uncatchableResult) {
    const { leadingTeam, gap, maxCatchable } = uncatchableResult;
    const teamName = leadingTeam === 'red' ? '红方' : '蓝方';
    
    wx.showModal({
      title: '追不上了',
      content: `${teamName}领先优势过大，即使剩余把数全胜也无法追上！\n领先${gap}分，最多只能追${maxCatchable}分`,
      confirmText: '是',
      cancelText: '否',
      success: (res) => {
        if (res.confirm) {
          // 标记游戏已结束
          page.setData({
            gameEnded: true
          });
          
          // 保存到历史记录
          if (page.data.gameData) {
            page.data.gameData.saveGameToHistory(page);
          }
        }
      }
    });
  }

  /**
   * 显示帮助弹窗
   * @param {Object} page - 页面实例
   */
  showHelpModal(page) {
    const helpContent = `扑克双上计分规则：
1. 过A规则：先过A的队伍获胜
2. 把数规则：先达到设定把数的队伍获胜
3. 双上：+3分
4. 1游3游：+2分
5. 1游末游：+1分

A1/A2/A3升级规则：
- A1：在A阶段点击1游末游或被对方点击升级按钮
- A2：在A1阶段点击1游末游或被对方点击升级按钮
- A3：在A2阶段点击1游末游或被对方点击升级按钮`;

    wx.showModal({
      title: '说明文档',
      content: helpContent,
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * 显示反馈弹窗
   * @param {Object} page - 页面实例
   */
  showFeedbackModal(page) {
    wx.showModal({
      title: '反馈',
      content: '如有问题或建议，请联系开发者\n\n联系方式：\n- 邮箱：developer@example.com\n- 微信：developer_wechat',
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * 显示确认重置弹窗
   * @param {Object} page - 页面实例
   */
  showResetConfirmModal(page) {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置当前游戏吗？\n这将清空所有分数和历史记录。',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          if (page.data.gameData) {
            page.data.gameData.resetGame(page);
          }
        }
      }
    });
  }

  /**
   * 显示恢复游戏弹窗
   * @param {Object} page - 页面实例
   */
  showRestoreConfirmModal(page) {
    wx.showModal({
      title: '恢复游戏',
      content: '检测到未完成的游戏，是否恢复？',
      confirmText: '恢复',
      cancelText: '不恢复',
      success: (res) => {
        if (res.confirm) {
          if (page.data.gameData) {
            page.data.gameData.restoreGame(page);
          }
        } else {
          // 用户选择不恢复，清除保存的游戏
          if (page.data.gameData) {
            page.data.gameData.clearSavedGame();
          }
          page.setData({
            canRestore: false
          });
        }
      }
    });
  }

  /**
   * 显示胜利图标
   * @param {Object} page - 页面实例
   * @param {string} winner - 获胜方 ('red' | 'blue')
   */
  showVictoryIcon(page, winner) {
    if (winner === 'red') {
      page.setData({
        showRedIcon: true,
        showBlueIcon: false
      });
    } else if (winner === 'blue') {
      page.setData({
        showRedIcon: false,
        showBlueIcon: true
      });
    }
  }

  /**
   * 隐藏胜利图标
   * @param {Object} page - 页面实例
   */
  hideVictoryIcons(page) {
    page.setData({
      showRedIcon: false,
      showBlueIcon: false
    });
  }

  /**
   * 显示加载提示
   * @param {string} title - 提示标题
   */
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  }

  /**
   * 隐藏加载提示
   */
  hideLoading() {
    wx.hideLoading();
  }

  /**
   * 显示成功提示
   * @param {string} title - 提示标题
   */
  showSuccess(title = '操作成功') {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  }

  /**
   * 显示错误提示
   * @param {string} title - 提示标题
   */
  showError(title = '操作失败') {
    wx.showToast({
      title: title,
      icon: 'error',
      duration: 2000
    });
  }

  /**
   * 显示警告提示
   * @param {string} title - 提示标题
   */
  showWarning(title = '请注意') {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    });
  }

  /**
   * 初始化UI管理器
   * @param {Object} page - 页面实例
   */
  init(page) {
    // 检查是否需要显示恢复游戏弹窗
    if (page.data.canRestore) {
      setTimeout(() => {
        this.showRestoreConfirmModal(page);
      }, 500);
    }
  }
}

// 导出模块
module.exports = UIManager;
