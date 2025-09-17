// 历史记录页面
Page({
  data: {
    gameHistory: [],
    totalGames: 0,
    redWins: 0,
    blueWins: 0,
    draws: 0,
    redWinRate: 0,
    showDetail: false,
    selectedGame: null
  },

  onLoad() {
    this.loadGameHistory();
  },

  onShow() {
    this.loadGameHistory();
  },

  // 加载游戏历史记录
  loadGameHistory() {
    try {
      const history = wx.getStorageSync('gameHistory') || [];
      
      // 直接使用现有数据，不进行修复
      const fixedHistory = history;
      
      // 如果有数据被修复，保存回存储
      if (JSON.stringify(history) !== JSON.stringify(fixedHistory)) {
        wx.setStorageSync('gameHistory', fixedHistory);
        wx.showToast({
          title: '数据已修复',
          icon: 'success'
        });
      }
      
      this.calculateStats(fixedHistory);
      this.setData({
        gameHistory: fixedHistory
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 计算统计数据
  calculateStats(history) {
    const totalGames = history.length;
    let redWins = 0;
    let blueWins = 0;
    let draws = 0;

    history.forEach(game => {
      if (game.winner === 'red') {
        redWins++;
      } else if (game.winner === 'blue') {
        blueWins++;
      } else if (game.winner === 'draw') {
        draws++;
      }
    });

    const redWinRate = totalGames > 0 ? Math.round((redWins / totalGames) * 100) : 0;

    console.log('统计数据计算:', {
      totalGames,
      redWins,
      blueWins,
      draws,
      redWinRate
    });
    
    // 详细输出每条记录
    history.forEach((game, index) => {
      console.log(`记录${index + 1}:`, {
        winner: game.winner,
        winnerType: typeof game.winner,
        finalScoreRed: game.finalScore.red,
        finalScoreBlue: game.finalScore.blue,
        gameId: game.gameId
      });
    });

    this.setData({
      totalGames,
      redWins,
      blueWins,
      draws,
      redWinRate
    });
  },

  // 查看详情
  onViewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const selectedGame = this.data.gameHistory[index];
    
    this.setData({
      selectedGame,
      showDetail: true
    });
  },

  // 关闭详情弹窗
  onCloseDetail() {
    this.setData({
      showDetail: false,
      selectedGame: null
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止弹窗内容区域的点击事件冒泡
  },

  // 删除单条记录
  onDeleteGame(e) {
    const index = e.currentTarget.dataset.index;
    const gameHistory = [...this.data.gameHistory];
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条游戏记录吗？',
      success: (res) => {
        if (res.confirm) {
          gameHistory.splice(index, 1);
          try {
            wx.setStorageSync('gameHistory', gameHistory);
            this.loadGameHistory();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
            console.error('删除记录失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 清空所有记录
  onClearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有游戏记录吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('gameHistory');
            this.loadGameHistory();
            wx.showToast({
              title: '清空成功',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空记录失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

});
