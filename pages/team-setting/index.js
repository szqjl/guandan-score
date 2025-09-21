// pages/team-setting/index.js
Page({
  data: {
    redPlayers: ['东西方1号', '东西方2号'],
    bluePlayers: ['南北方1号', '南北方2号']
  },

  onLoad() {
    // 优先从本地存储获取上次保存的队员信息
    const savedSettings = wx.getStorageSync('teamSettings');
    if (savedSettings && savedSettings.redPlayers && savedSettings.bluePlayers) {
      this.setData({
        redPlayers: [...savedSettings.redPlayers],
        bluePlayers: [...savedSettings.bluePlayers]
      });
    } else {
      // 如果本地存储没有，则从主页获取当前队员信息
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.data.redPlayers) {
        this.setData({
          redPlayers: [...prevPage.data.redPlayers],
          bluePlayers: [...prevPage.data.bluePlayers]
        });
      }
    }
  },


  // 红队队员1输入
  onRedPlayer1Input(e) {
    this.setData({
      'redPlayers[0]': e.detail.value
    });
  },

  // 红队队员2输入
  onRedPlayer2Input(e) {
    this.setData({
      'redPlayers[1]': e.detail.value
    });
  },

  // 蓝队队员1输入
  onBluePlayer1Input(e) {
    this.setData({
      'bluePlayers[0]': e.detail.value
    });
  },

  // 蓝队队员2输入
  onBluePlayer2Input(e) {
    this.setData({
      'bluePlayers[1]': e.detail.value
    });
  },

  // 保存设置
  onSaveSettings() {
    // 验证输入
    if (!this.data.redPlayers[0] || !this.data.redPlayers[1] || 
        !this.data.bluePlayers[0] || !this.data.bluePlayers[1]) {
      wx.showToast({
        title: '请填写完整队员信息',
        icon: 'none'
      });
      return;
    }

    // 保存到本地存储（用于下次打开页面时显示）
    wx.setStorageSync('teamSettings', {
      redPlayers: this.data.redPlayers,
      bluePlayers: this.data.bluePlayers
    });

    // 更新主页数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        redPlayers: [...this.data.redPlayers],
        bluePlayers: [...this.data.bluePlayers]
      });
    }

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 重置为默认
  onReset() {
    wx.showModal({
      title: '重置确认',
      content: '确定要重置为默认队员名称吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
              redPlayers: ['东西方1号', '东西方2号'],
              bluePlayers: ['南北方1号', '南北方2号']
          });
          // 同时清除本地存储的保存设置
          wx.removeStorageSync('teamSettings');
        }
      }
    });
  }
});
