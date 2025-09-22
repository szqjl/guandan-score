// 历史记录页面
Page({
  data: {
    gameHistory: [],
    filteredHistory: [],
    totalGames: 0,
    redWins: 0,
    blueWins: 0,
    draws: 0,
    redWinRate: 0,
    showDetail: false,
    selectedGame: null,
    // 新增优化功能
    searchKeyword: '',
    filterType: 'all', // all, red, blue, draw
    sortType: 'time', // time, score, duration
    sortOrder: 'desc', // desc, asc
    showFilter: false,
    isLoading: false,
    totalDuration: 0,
    averageDuration: 0,
    longestGame: 0,
    shortestGame: 0
  },

  onLoad() {
    this.loadGameHistory();
  },

  onShow() {
    this.loadGameHistory();
  },

  // 加载游戏历史记录
  loadGameHistory() {
    this.setData({ isLoading: true });
    
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
      this.applyFiltersAndSort(fixedHistory);
      
      this.setData({
        gameHistory: fixedHistory,
        isLoading: false
      });
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  // 计算统计数据
  calculateStats(history) {
    const totalGames = history.length;
    let redWins = 0;
    let blueWins = 0;
    let draws = 0;
    let totalDuration = 0;
    let longestGame = 0;
    let shortestGame = Infinity;

    history.forEach(game => {
      if (game.winner === 'red') {
        redWins++;
      } else if (game.winner === 'blue') {
        blueWins++;
      } else if (game.winner === 'draw') {
        draws++;
      }
      
      // 计算游戏时长统计
      if (game.duration) {
        totalDuration += game.duration;
        longestGame = Math.max(longestGame, game.duration);
        shortestGame = Math.min(shortestGame, game.duration);
      }
    });

    const redWinRate = totalGames > 0 ? Math.round((redWins / totalGames) * 100) : 0;
    const averageDuration = totalGames > 0 ? Math.round(totalDuration / totalGames) : 0;
    
    // 如果没有游戏记录，最短时长设为0
    if (shortestGame === Infinity) {
      shortestGame = 0;
    }

    this.setData({
      totalGames,
      redWins,
      blueWins,
      draws,
      redWinRate,
      totalDuration,
      averageDuration,
      longestGame,
      shortestGame
    });
  },

  // 应用筛选和排序
  applyFiltersAndSort(history) {
    let filtered = [...history];
    
    // 应用搜索关键词筛选
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(game => {
        const redPlayers = game.redPlayers ? game.redPlayers.join(' ') : '';
        const bluePlayers = game.bluePlayers ? game.bluePlayers.join(' ') : '';
        return redPlayers.toLowerCase().includes(keyword) || 
               bluePlayers.toLowerCase().includes(keyword);
      });
    }
    
    // 应用胜负筛选
    if (this.data.filterType !== 'all') {
      filtered = filtered.filter(game => game.winner === this.data.filterType);
    }
    
    // 应用排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (this.data.sortType) {
        case 'time':
          aValue = new Date(a.timestamp || 0).getTime();
          bValue = new Date(b.timestamp || 0).getTime();
          break;
        case 'score':
          aValue = (a.finalScore?.red || 0) + (a.finalScore?.blue || 0);
          bValue = (b.finalScore?.red || 0) + (b.finalScore?.blue || 0);
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        default:
          aValue = new Date(a.timestamp || 0).getTime();
          bValue = new Date(b.timestamp || 0).getTime();
      }
      
      return this.data.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    this.setData({
      filteredHistory: filtered
    });
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
  },

  // 搜索按钮点击
  onSearch() {
    this.applyFiltersAndSort(this.data.gameHistory);
    wx.showToast({
      title: '搜索完成',
      icon: 'success',
      duration: 1000
    });
  },

  // 筛选功能
  onFilterChange(e) {
    const filterType = e.currentTarget.dataset.type;
    this.setData({ filterType });
    this.applyFiltersAndSort(this.data.gameHistory);
  },

  // 排序功能
  onSortChange(e) {
    const sortType = e.currentTarget.dataset.type;
    const sortOrder = this.data.sortType === sortType && this.data.sortOrder === 'desc' ? 'asc' : 'desc';
    this.setData({ sortType, sortOrder });
    this.applyFiltersAndSort(this.data.gameHistory);
  },

  // 切换筛选面板
  onToggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  // 重置筛选
  onResetFilters() {
    this.setData({
      searchKeyword: '',
      filterType: 'all',
      sortType: 'time',
      sortOrder: 'desc'
    });
    this.applyFiltersAndSort(this.data.gameHistory);
    wx.showToast({
      title: '筛选已重置',
      icon: 'success'
    });
  },

  // 查看详情
  onViewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const selectedGame = this.data.filteredHistory[index];
    
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
    const selectedGame = this.data.filteredHistory[index];
    const gameHistory = [...this.data.gameHistory];
    
    // 找到在原始数据中的索引
    const originalIndex = gameHistory.findIndex(game => game.gameId === selectedGame.gameId);
    
    if (originalIndex === -1) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${selectedGame.date} ${selectedGame.time} 的游戏记录吗？`,
      success: (res) => {
        if (res.confirm) {
          gameHistory.splice(originalIndex, 1);
          try {
            wx.setStorageSync('gameHistory', gameHistory);
            this.loadGameHistory();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
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
