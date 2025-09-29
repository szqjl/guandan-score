// pages/join/index.js
Page({
  data: {
    roomId: '',
    recentRooms: [],
  },

  onLoad(options) {
    // 检查是否有分享的房间号
    if (options.roomId) {
      this.setData({
        roomId: options.roomId,
      })
      // 自动尝试加入
      this.onJoinRoom()
    }

    // 加载最近加入的房间
    this.loadRecentRooms()
  },

  // 加载最近加入的房间
  loadRecentRooms() {
    try {
      const recentRooms = wx.getStorageSync('recentRooms') || []
      this.setData({
        recentRooms: recentRooms.slice(0, 5), // 最多显示5个
      })
    } catch (error) {
      console.error('加载最近房间失败:', error)
    }
  },

  // 保存到最近房间
  saveToRecentRooms(roomId, roomInfo) {
    try {
      let recentRooms = wx.getStorageSync('recentRooms') || []

      // 移除已存在的相同房间
      recentRooms = recentRooms.filter((room) => room.roomId !== roomId)

      // 添加到开头
      recentRooms.unshift({
        roomId: roomId,
        roomName: roomInfo.roomName || `房间${roomId}`,
        joinTime: new Date().toLocaleString(),
        status: 'waiting',
        statusText: '等待中',
      })

      // 限制数量
      if (recentRooms.length > 10) {
        recentRooms = recentRooms.slice(0, 10)
      }

      wx.setStorageSync('recentRooms', recentRooms)
      this.loadRecentRooms()
    } catch (error) {
      console.error('保存最近房间失败:', error)
    }
  },

  // 房间号输入
  onRoomIdInput(e) {
    this.setData({
      roomId: e.detail.value,
    })
  },

  // 扫码加入
  onScanQRCode() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res)

        // 解析二维码内容
        const qrContent = res.result
        const roomIdMatch = qrContent.match(/roomId=(\d{6})/)

        if (roomIdMatch) {
          const roomId = roomIdMatch[1]
          this.setData({
            roomId: roomId,
          })
          this.joinRoom(roomId)
        } else {
          wx.showToast({
            title: '无效的房间二维码',
            icon: 'error',
          })
        }
      },
      fail: (error) => {
        console.error('扫码失败:', error)
        wx.showToast({
          title: '扫码失败，请重试',
          icon: 'error',
        })
      },
    })
  },

  // 输入房间号加入
  onJoinRoom() {
    const roomId = this.data.roomId.trim()

    if (!roomId) {
      wx.showToast({
        title: '请输入房间号',
        icon: 'none',
      })
      return
    }

    if (roomId.length !== 6) {
      wx.showToast({
        title: '房间号必须是6位数字',
        icon: 'none',
      })
      return
    }

    this.joinRoom(roomId)
  },

  // 加入房间
  joinRoom(roomId) {
    wx.showLoading({
      title: '加入中...',
    })

    // 获取用户昵称
    wx.getUserProfile({
      desc: '用于显示您的昵称',
      success: (res) => {
        this.joinRoomWithNickname(roomId, res.userInfo.nickName)
      },
      fail: (err) => {
        console.log('获取用户信息失败:', err)
        // 使用默认昵称
        this.joinRoomWithNickname(roomId, '玩家')
      },
    })
  },

  // 使用昵称加入房间
  joinRoomWithNickname(roomId, nickname) {
    wx.cloud
      .callFunction({
        name: 'roomManager',
        data: {
          action: 'joinRoom',
          data: {
            roomId: roomId,
            playerName: nickname,
          },
        },
      })
      .then((res) => {
        wx.hideLoading()

        if (res.result.success) {
          // 保存到最近房间
          this.saveToRecentRooms(roomId, res.result.data)

          // 跳转到房间页面
          wx.navigateTo({
            url: `/pages/room/index?roomId=${roomId}&isHost=false&hostSeat=east`,
          })
        } else {
          wx.showToast({
            title: res.result.message || '加入失败',
            icon: 'error',
          })
        }
      })
      .catch((err) => {
        wx.hideLoading()
        console.error('加入房间失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'error',
        })
      })
  },

  // 加入最近房间
  onJoinRecentRoom(e) {
    const roomId = e.currentTarget.dataset.roomId
    this.setData({
      roomId: roomId,
    })
    this.joinRoom(roomId)
  },

  // 分享加入
  onShareJoin() {
    wx.showModal({
      title: '分享加入',
      content: '请让房主分享房间链接给您',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '掼蛋计分 - 加入房间',
      path: '/pages/join/index',
    }
  },
})
