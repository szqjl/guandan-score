// pages/team-setting/index.js
Page({
  data: {
    redPlayers: ['东西方队1号', '东西方队2号'],
    bluePlayers: ['南北方队1号', '南北方队2号'],

    // 新增功能
    defaultGameMode: 'guoA', // 默认比赛模式
  },

  onLoad() {
    // 优先从本地存储获取上次保存的设置信息
    const savedSettings = wx.getStorageSync('userSettings')
    if (savedSettings) {
      this.setData({
        redPlayers: savedSettings.redPlayers || ['东西方队1号', '东西方队2号'],
        bluePlayers: savedSettings.bluePlayers || [
          '南北方队1号',
          '南北方队2号',
        ],
        defaultGameMode: savedSettings.defaultGameMode || 'guoA',
      })
    } else {
      // 如果本地存储没有，则从主页获取当前队员信息
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.data.redPlayers) {
        this.setData({
          redPlayers: [...prevPage.data.redPlayers],
          bluePlayers: [...prevPage.data.bluePlayers],
        })
      }
    }
  },

  // 红队队员1输入
  onRedPlayer1Input(e) {
    this.setData({
      'redPlayers[0]': e.detail.value,
    })
  },

  // 红队队员2输入
  onRedPlayer2Input(e) {
    this.setData({
      'redPlayers[1]': e.detail.value,
    })
  },

  // 蓝队队员1输入
  onBluePlayer1Input(e) {
    this.setData({
      'bluePlayers[0]': e.detail.value,
    })
  },

  // 蓝队队员2输入
  onBluePlayer2Input(e) {
    this.setData({
      'bluePlayers[1]': e.detail.value,
    })
  },

  // 比赛模式选择
  onGameModeChange(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      defaultGameMode: mode,
    })
  },


  // 保存设置
  onSaveSettings() {
    // 验证输入
    if (
      !this.data.redPlayers[0] ||
      !this.data.redPlayers[1] ||
      !this.data.bluePlayers[0] ||
      !this.data.bluePlayers[1]
    ) {
      wx.showToast({
        title: '请填写完整队员信息',
        icon: 'none',
      })
      return
    }

    // 保存到本地存储（用于下次打开页面时显示）
    wx.setStorageSync('userSettings', {
      redPlayers: this.data.redPlayers,
      bluePlayers: this.data.bluePlayers,
      defaultGameMode: this.data.defaultGameMode,
    })

    // 更新主页数据
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData({
        redPlayers: [...this.data.redPlayers],
        bluePlayers: [...this.data.bluePlayers],
      })
    }

    wx.showToast({
      title: '保存成功',
      icon: 'success',
    })

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 重置为默认
  onReset() {
    wx.showModal({
      title: '重置确认',
      content: '确定要重置为默认设置吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            redPlayers: ['东西方队1号', '东西方队2号'],
            bluePlayers: ['南北方队1号', '南北方队2号'],
            defaultGameMode: 'guoA',
          })
          // 同时清除本地存储的保存设置
          wx.removeStorageSync('userSettings')
        }
      },
    })
  },
})
