// pages/launch/index.js
Page({
  data: {
    // 页面数据
    showHelpModal: false,
    scrollTop: 0,
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

    // 检查用户是否有唯一ID
    this.checkUserIdentityForCreateRoom()
  },

  // 检查用户身份，用于创建房间
  checkUserIdentityForCreateRoom() {
    const userId = wx.getStorageSync('userId')
    
    if (!userId) {
      // 没有用户ID，显示详细的用户信息获取对话框
      this.showUserInfoModal()
    } else {
      // 已有用户ID，直接跳转
      this.navigateToCreateRoom()
    }
  },

  // 显示用户信息获取对话框
  showUserInfoModal() {
    // 显示弹窗时设置为竖屏
    wx.setPageOrientation({
      orientation: 'portrait',
      success: () => {
        console.log('页面方向已设置为竖屏')
        // 竖屏后显示更多内容的弹窗
        this.showDetailedModal()
      },
      fail: (err) => {
        console.log('设置页面方向失败:', err)
        // 如果设置失败，显示简化版弹窗
        this.showSimpleModal()
      }
    })
  },

  // 竖屏模式下的详细弹窗
  showDetailedModal() {
    wx.showModal({
      title: '扑克双上计分计分小程序申请',
      content: '获取你的昵称、头像\n头像：点击选择\n昵称：点击输入',
      confirmText: '允许',
      cancelText: '取消',
      success: (res) => {
        // 弹窗关闭后恢复横屏
        wx.setPageOrientation({
          orientation: 'landscape',
          success: () => {
            console.log('页面方向已恢复为横屏')
          },
          fail: (err) => {
            console.log('恢复页面方向失败:', err)
          }
        })

        if (res.confirm) {
          // 用户同意，跳转到房间页面让用户设置信息
          this.navigateToCreateRoom()
        } else {
          // 用户取消，显示提示
          wx.showToast({
            title: '需要用户身份才能创建房间',
            icon: 'none',
            duration: 2000,
          })
        }
      },
    })
  },

  // 简化版弹窗（备用方案）
  showSimpleModal() {
    wx.showModal({
      title: '扑克双上计分计分小程序申请',
      content: '获取你的昵称、头像\n头像: 昵称:',
      confirmText: '允许',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户同意，跳转到房间页面让用户设置信息
          this.navigateToCreateRoom()
        } else {
          // 用户取消，显示提示
          wx.showToast({
            title: '需要用户身份才能创建房间',
            icon: 'none',
            duration: 2000,
          })
        }
      },
    })
  },

  // 获取微信昵称和头像（使用新的头像昵称填写能力）
  getUserNickname() {
    // 使用新的头像昵称填写能力，不再使用已回收的wx.getUserProfile
    wx.showModal({
      title: '设置个人信息',
      content: '请设置您的昵称和头像',
      confirmText: '去设置',
      cancelText: '稍后设置',
      success: (res) => {
        if (res.confirm) {
          // 用户选择去设置，跳转到房间页面让用户手动设置
          this.navigateToCreateRoom()
        } else {
          // 用户选择稍后设置，生成随机昵称并跳转
          this.generateRandomNicknameAndNavigate()
        }
      },
    })
  },

  // 生成随机昵称并跳转
  generateRandomNicknameAndNavigate() {
    // 生成随机昵称
    const randomNickname = '玩家' + Math.floor(Math.random() * 9999)
    
    // 生成唯一用户ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    
    // 保存用户信息
    wx.setStorageSync('userId', userId)
    wx.setStorageSync('userNickname', randomNickname)
    wx.setStorageSync('userAvatar', '')
    
    // 显示提示
    wx.showToast({
      title: `欢迎，${randomNickname}！`,
      icon: 'success',
      duration: 2000,
    })
    
    // 延迟跳转
    setTimeout(() => {
      this.navigateToCreateRoom()
    }, 2000)
  },

  // 跳转到创建房间页面
  navigateToCreateRoom() {
    wx.navigateTo({
      url: '/pages/room/index?isHost=true&entryType=create',
      success: () => {
        console.log('跳转到房间创建页面成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '跳转失败',
          icon: 'error',
        })
      },
    })
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
              icon: 'error',
            })
          }
        }
      },
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

    // 直接跳转到房间页面，传递加入房间参数
    wx.navigateTo({
      url: `/pages/room/index?roomId=${roomId}&isHost=false&entryType=join`,
      success: () => {
        console.log('跳转到房间页面成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '房间不存在或已满',
          icon: 'error',
        })
      },
    })
  },

  // 快速启动按钮点击事件
  onQuickStart() {
    console.log('点击快速启动')

    // 直接跳转到主页（单机模式）
    wx.navigateTo({
      url: '/pages/index/index?mode=single',
      success: () => {
        console.log('跳转到主页成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '跳转失败',
          icon: 'error',
        })
      },
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'GD双上计分小程序',
      path: '/pages/launch/index',
      imageUrl: '/images/GD.png',
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'GD双上计分小程序 - 多人实时协作',
      imageUrl: '/images/GD.png',
    }
  },

  // 导航按钮事件处理
  onShowHistory() {
    wx.navigateTo({
      url: '/pages/history/index',
    })
  },

  onShowHelp() {
    this.setData({
      showHelpModal: true,
    })
  },

  // 关闭文档说明弹窗
  onCloseHelpModal() {
    this.setData({
      showHelpModal: false,
    })
  },

  onShowFeedback() {
    wx.showModal({
      title: '个人中心',
      content: '个人中心功能开发中，敬请期待',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  onShowSettings() {
    // 跳转到队伍设置页面
    console.log('尝试跳转到队伍设置页面')

    // 先检查页面是否存在
    const pages = getCurrentPages()
    console.log('当前页面栈:', pages.length)

    // 检查页面栈深度，如果太深则使用redirectTo
    if (pages.length >= 10) {
      console.log('页面栈太深，使用redirectTo')
      wx.redirectTo({
        url: '/pages/team-setting/index',
        success: () => {
          console.log('跳转到队伍设置页面成功')
        },
        fail: (err) => {
          console.error('跳转到队伍设置页面失败:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'error',
          })
        },
      })
    } else {
      console.log('页面栈正常，使用navigateTo')
      wx.navigateTo({
        url: '/pages/team-setting/index',
        success: () => {
          console.log('跳转到队伍设置页面成功')
        },
        fail: (err) => {
          console.error('跳转到队伍设置页面失败:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'error',
          })
        },
      })
    }
  },

  // 弹窗相关方法
  scrollToTop() {
    this.setData({
      scrollTop: 0,
    })
    console.log('返回顶部')
  },

  scrollToSection(e) {
    const section = e.currentTarget.dataset.section
    console.log('跳转到章节:', section)
    // 这里可以实现滚动到指定章节的功能
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  onImageError() {
    console.log('图片加载失败')
  },

  onImageLoad() {
    console.log('图片加载成功')
  },
})
