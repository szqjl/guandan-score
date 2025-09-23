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
    // 筛选相关
    showFilter: false,
    filterType: 'all',
    sortType: 'time',
    sortOrder: 'desc',
    isLoading: false,
    averageDuration: 0,
    // 时间筛选功能
    timeFilter: 'all', // 当前选中的时间筛选
    showCustomTimePicker: false, // 是否显示自定义时间选择器
    customStartDate: '', // 自定义开始日期
    customEndDate: '', // 自定义结束日期
    // v2.1.0 队友筛选功能
    teammateFilter: 'all', // 当前选中的队友筛选
    allTeammates: [], // 所有队友列表
    teammateStats: {}, // 队友统计信息（为v3.0预留）
    // v3.0 预留字段
    partnerFilter: 'all', // 搭档筛选（v3.0功能）
    allPartners: [], // 所有搭档组合（v3.0功能）
    // v4.0 预留字段
    personalStats: {}, // 个人详细统计（v4.0功能）
    showPersonalStats: false // 是否显示个人统计页面（v4.0功能）
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
      this.extractTeammates(fixedHistory); // v2.1.0 提取队友列表
      this.setData({
        gameHistory: fixedHistory,
        filteredHistory: fixedHistory
      });
    } catch (error) {
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
    let totalDuration = 0;
    let gamesWithDuration = 0;

    history.forEach(game => {
      if (game.winner === 'red') {
        redWins++;
      } else if (game.winner === 'blue') {
        blueWins++;
      } else if (game.winner === 'draw') {
        draws++;
      }
      
      // 计算平均时长
      if (game.duration && game.duration > 0) {
        totalDuration += game.duration;
        gamesWithDuration++;
      }
    });

    const redWinRate = totalGames > 0 ? Math.round((redWins / totalGames) * 100) : 0;
    const averageDuration = gamesWithDuration > 0 ? Math.round(totalDuration / gamesWithDuration) : 0;

    this.setData({
      totalGames,
      redWins,
      blueWins,
      draws,
      redWinRate,
      averageDuration
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

  // 切换筛选面板
  onToggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  // 筛选类型改变
  onFilterChange(e) {
    const filterType = e.currentTarget.dataset.type;
    this.setData({
      filterType: filterType
    });
    this.applyFilters();
  },

  // 排序类型改变
  onSortChange(e) {
    const sortType = e.currentTarget.dataset.type;
    let sortOrder = 'desc';
    
    // 如果点击的是当前排序类型，则切换排序顺序
    if (this.data.sortType === sortType) {
      sortOrder = this.data.sortOrder === 'desc' ? 'asc' : 'desc';
    }
    
    this.setData({
      sortType: sortType,
      sortOrder: sortOrder
    });
    this.applyFilters();
  },

  // 时间筛选功能
  onTimeFilterChange(e) {
    const timeFilter = e.currentTarget.dataset.time;
    this.setData({
      timeFilter: timeFilter,
      showCustomTimePicker: timeFilter === 'custom'
    });
    this.applyFilters();
  },

  // 自定义开始日期改变
  onCustomStartDateChange(e) {
    this.setData({
      customStartDate: e.detail.value
    });
  },

  // 自定义结束日期改变
  onCustomEndDateChange(e) {
    this.setData({
      customEndDate: e.detail.value
    });
  },

  // 应用自定义时间筛选
  onApplyCustomTime() {
    const { customStartDate, customEndDate } = this.data;
    if (!customStartDate || !customEndDate) {
      wx.showToast({
        title: '请选择开始时间和结束时间',
        icon: 'none'
      });
      return;
    }
    this.applyFilters();
  },

  // 获取时间范围
  getTimeRange(timeFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(timeFilter) {
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { start: startOfWeek, end: now };
        
      case 'lastWeek':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(today);
        endOfLastWeek.setDate(today.getDate() - today.getDay());
        return { start: startOfLastWeek, end: endOfLastWeek };
        
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: startOfMonth, end: now };
        
      case 'lastMonth':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: startOfLastMonth, end: endOfLastMonth };
        
      case 'custom':
        const { customStartDate, customEndDate } = this.data;
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null;
        
      default:
        return null;
    }
  },

  // v2.1.0 提取所有队友列表
  extractTeammates(history) {
    const teammates = new Set();
    const teammateStats = {};
    
    history.forEach(game => {
      if (game.redPlayers) {
        game.redPlayers.forEach(player => {
          teammates.add(player);
          if (!teammateStats[player]) {
            teammateStats[player] = { totalGames: 0, wins: 0, losses: 0 };
          }
          teammateStats[player].totalGames++;
          if (game.winner === 'red') {
            teammateStats[player].wins++;
          } else if (game.winner === 'blue') {
            teammateStats[player].losses++;
          }
        });
      }
      if (game.bluePlayers) {
        game.bluePlayers.forEach(player => {
          teammates.add(player);
          if (!teammateStats[player]) {
            teammateStats[player] = { totalGames: 0, wins: 0, losses: 0 };
          }
          teammateStats[player].totalGames++;
          if (game.winner === 'blue') {
            teammateStats[player].wins++;
          } else if (game.winner === 'red') {
            teammateStats[player].losses++;
          }
        });
      }
    });
    
    const allTeammates = Array.from(teammates).sort();
    this.setData({
      allTeammates: allTeammates,
      teammateStats: teammateStats
    });
    
    // v3.0 预留：提取搭档组合
    this.extractPartners(history);
  },

  // v3.0 预留：提取搭档组合
  extractPartners(history) {
    const partners = new Set();
    
    history.forEach(game => {
      if (game.redPlayers && game.redPlayers.length === 2) {
        const redPartner = game.redPlayers.sort().join(' & ');
        partners.add(redPartner);
      }
      if (game.bluePlayers && game.bluePlayers.length === 2) {
        const bluePartner = game.bluePlayers.sort().join(' & ');
        partners.add(bluePartner);
      }
    });
    
    const allPartners = Array.from(partners).sort();
    this.setData({
      allPartners: allPartners
    });
  },

  // v2.1.0 队友筛选改变
  onTeammateFilterChange(e) {
    const teammateName = e.currentTarget.dataset.teammate;
    this.setData({
      teammateFilter: teammateName
    });
    this.applyFilters();
  },

  // v2.1.0 计算队友参与次数
  getTeammateGameCount(teammateName) {
    if (teammateName === 'all') {
      return this.data.gameHistory.length;
    }
    
    return this.data.gameHistory.filter(game => {
      const redPlayers = game.redPlayers || [];
      const bluePlayers = game.bluePlayers || [];
      return redPlayers.includes(teammateName) || 
             bluePlayers.includes(teammateName);
    }).length;
  },

  // 应用筛选和排序
  applyFilters() {
    let filtered = [...this.data.gameHistory];
    
    // 应用时间筛选
    if (this.data.timeFilter !== 'all') {
      const timeRange = this.getTimeRange(this.data.timeFilter);
      if (timeRange) {
        filtered = filtered.filter(game => {
          const gameDate = new Date(game.date + ' ' + game.time);
          return gameDate >= timeRange.start && gameDate <= timeRange.end;
        });
      }
    }
    
    // 应用胜负筛选
    if (this.data.filterType !== 'all') {
      filtered = filtered.filter(game => game.winner === this.data.filterType);
    }
    
    // v2.1.0 应用队友筛选
    if (this.data.teammateFilter !== 'all') {
      filtered = filtered.filter(game => {
        const redPlayers = game.redPlayers || [];
        const bluePlayers = game.bluePlayers || [];
        return redPlayers.includes(this.data.teammateFilter) || 
               bluePlayers.includes(this.data.teammateFilter);
      });
    }
    
    // v3.0 预留：应用搭档筛选
    if (this.data.partnerFilter !== 'all') {
      filtered = filtered.filter(game => {
        const redPartner = game.redPlayers ? game.redPlayers.sort().join(' & ') : '';
        const bluePartner = game.bluePlayers ? game.bluePlayers.sort().join(' & ') : '';
        return redPartner === this.data.partnerFilter || 
               bluePartner === this.data.partnerFilter;
      });
    }
    
    // 应用排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (this.data.sortType) {
        case 'time':
          aValue = new Date(a.date + ' ' + a.time).getTime();
          bValue = new Date(b.date + ' ' + b.time).getTime();
          break;
        case 'score':
          aValue = a.finalScore.red + a.finalScore.blue;
          bValue = b.finalScore.red + b.finalScore.blue;
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        default:
          return 0;
      }
      
      if (this.data.sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
    
    this.setData({
      filteredHistory: filtered
    });
  },

  // 重置筛选
  onResetFilters() {
    this.setData({
      filterType: 'all',
      sortType: 'time',
      sortOrder: 'desc',
      timeFilter: 'all', // 重置时间筛选
      showCustomTimePicker: false, // 隐藏自定义时间选择器
      customStartDate: '', // 清空自定义开始日期
      customEndDate: '', // 清空自定义结束日期
      teammateFilter: 'all', // v2.1.0 重置队友筛选
      partnerFilter: 'all', // v3.0 预留：重置搭档筛选
      filteredHistory: this.data.gameHistory
    });
  },

  // 分享游戏记录
  onShareGame(e) {
    const index = e.currentTarget.dataset.index;
    const game = this.data.filteredHistory[index];
    
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        wx.showToast({
          title: '分享功能开发中',
          icon: 'none'
        });
      }
    });
  },

});
