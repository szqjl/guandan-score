// pages/launch/index.js
Page({
  data: {
    // 页面数据
  },

  onLoad(options) {
    console.log('启动页加载完成')
    // 可以在这里添加页面初始化逻辑
  },

  onShow() {
    console.log('启动页显示')
  },

  // 创建房间按钮点击事件
  onCreateRoom() {
    console.log('点击创建房间')
    
    // 先显示提示，确认点击事件被触发
    wx.showToast({
      title: '创建房间功能',
      icon: 'success'
    })
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      // 跳转到房间页面，传递创建房间参数
      wx.navigateTo({
        url: '/pages/room/index?isHost=true&entryType=create',
        success: () => {
          console.log('跳转到房间创建页面成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '跳转失败',
            icon: 'error'
          })
        }
      })
    }, 1000)
  },

  // 加入房间按钮点击事件
  onJoinRoom() {
    console.log('点击加入房间')
    
    // 弹出输入框让用户输入房间号
    wx.showModal({
      title: '加入房间',
      editable: true,
      placeholderText: '请输入房间号',
      success: (res) => {
        if (res.confirm && res.content) {
          const roomId = res.content.trim()
          
          // 验证房间号格式
          if (this.validateRoomId(roomId)) {
            this.joinRoomWithId(roomId)
          } else {
            wx.showToast({
              title: '房间号格式不正确',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 验证房间号格式
  validateRoomId(roomId) {
    // 房间号应该是6位数字
    const roomIdRegex = /^\d{6}$/
    return roomIdRegex.test(roomId)
  },

  // 使用房间号加入房间
  joinRoomWithId(roomId) {
    console.log('加入房间号:', roomId)
    
    wx.showLoading({
      title: '加入房间中...',
      mask: true
    })

    // 模拟加入房间过程
    setTimeout(() => {
      wx.hideLoading()
      
      // 跳转到房间页面，传递加入房间参数
      wx.navigateTo({
        url: `/pages/room/index?roomId=${roomId}&isHost=false&entryType=join`,
        success: () => {
          console.log('跳转到房间页面成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '房间不存在或已满',
            icon: 'error'
          })
        }
      })
    }, 1000)
  },

  // 快速启动按钮点击事件
  onQuickStart() {
    console.log('点击快速启动')
    
    // 先显示提示，确认点击事件被触发
    wx.showToast({
      title: '快速启动功能',
      icon: 'success'
    })
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      // 跳转到主页（单机模式）
      wx.navigateTo({
        url: '/pages/index/index?mode=single',
        success: () => {
          console.log('跳转到主页成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '跳转失败',
            icon: 'error'
          })
        }
      })
    }, 1000)
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '掼蛋计分小程序',
      path: '/pages/launch/index',
      imageUrl: '/images/GD.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '掼蛋计分小程序 - 多人实时协作',
      imageUrl: '/images/GD.png'
    }
  }
})
