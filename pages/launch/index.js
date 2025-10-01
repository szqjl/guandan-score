// pages/launch/index.js
Page({
  data: {
    // 页面数据
    showHelpModal: false,
    scrollTop: 0,
    showUserInfoModal: false, // 控制用户信息设置弹窗
    showPrivacyModal: false, // 控制隐私政策弹窗
    userAvatar: '', // 用户头像
    cloudAvatarId: '', // 云文件ID
    userNickname: '', // 用户昵称
    isUploading: false, // 头像上传状态
    uploadRetryCount: 0, // 上传重试次数
    uploadTask: null, // 上传任务
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
      title: '扑克双上计分计分申请',
      content: '获取你的昵称、头像\n\n头像：点击选择 👤\n\n昵称：点击输入',
      editable: true,
      placeholderText: '请输入您的昵称',
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
          // 用户同意，显示完整的用户信息设置弹窗
          this.showUserInfoModal()
        } else {
          // 用户取消，返回启动页面（不需要额外提示）
          console.log('用户取消授权，返回启动页面')
        }
      },
    })
  },


  // 简化版弹窗（备用方案）
  showSimpleModal() {
    wx.showModal({
      title: '扑克双上计分计分申请',
      content: '获取你的昵称、头像\n头像: 昵称:',
      confirmText: '允许',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户同意，显示用户信息设置弹窗
          this.showUserInfoModal()
        } else {
          // 用户取消，返回启动页面（不需要额外提示）
          console.log('用户取消授权，返回启动页面')
        }
      },
    })
  },

  // 创建用户信息并跳转
  createUserWithInfo(userNickname) {
    // 调用云函数创建用户并保存到用户表
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'createUser',
        data: {
          nickName: userNickname.trim(),
          avatar: ''
        }
      },
      success: (res) => {
        console.log('用户创建成功:', res.result)
        
        if (res.result.success) {
          // 保存用户信息到本地存储
          wx.setStorageSync('userId', res.result.data._openid)
          wx.setStorageSync('userNickname', res.result.data.nickName)
          wx.setStorageSync('userAvatar', res.result.data.avatar)
          
          wx.showToast({
            title: `欢迎，${userNickname.trim()}！`,
            icon: 'success',
            duration: 2000,
          })

          setTimeout(() => {
            this.navigateToCreateRoom()
          }, 2000)
        } else {
          wx.showToast({
            title: '用户创建失败',
            icon: 'none',
            duration: 2000,
          })
        }
      },
      fail: (err) => {
        console.error('调用云函数失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },

  // 显示用户信息设置弹窗
  showUserInfoModal() {
    this.setData({
      showUserInfoModal: true,
      userAvatar: '',
      userNickname: '' // 不直接获取昵称，等用户点击输入框时再获取
    })
  },

  // 隐藏用户信息设置弹窗
  hideUserInfoModal() {
    // 取消正在进行的上传
    if (this.data.uploadTask) {
      this.data.uploadTask.abort()
    }
    this.setData({
      showUserInfoModal: false,
      isUploading: false
    })
  },

  // 打开隐私政策
  openPrivacyPolicy() {
    console.log('打开隐私政策')
    this.setData({
      showPrivacyModal: true
    })
  },

  // 关闭隐私政策
  closePrivacyModal() {
    console.log('关闭隐私政策')
    this.setData({
      showPrivacyModal: false
    })
  },

  // 获取微信昵称（在用户点击输入框时调用）
  getWechatNickname() {
    // 尝试从本地存储获取
    const storedNickname = wx.getStorageSync('userNickname')
    if (storedNickname) {
      this.setData({
        userNickname: storedNickname
      })
      return
    }

    // 如果没有存储的昵称，尝试获取微信昵称
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'getUserProfile'
      },
      success: (res) => {
        if (res.result.success && res.result.data && res.result.data.nickName) {
          // 获取到微信昵称
          this.setData({
            userNickname: res.result.data.nickName
          })
        } else {
          // 没有微信昵称，生成默认的
          const defaultNickname = '玩家' + Math.floor(Math.random() * 9999)
          this.setData({
            userNickname: defaultNickname
          })
        }
      },
      fail: () => {
        // 获取失败，生成默认的
        const defaultNickname = '玩家' + Math.floor(Math.random() * 9999)
        this.setData({
          userNickname: defaultNickname
        })
      }
    })
  },

  // 昵称输入框获得焦点时（用户点击输入框时）
  onNicknameFocus() {
    console.log('用户点击了昵称输入框')
    // 这时候才尝试获取微信昵称
    this.getWechatNickname()
  },

  // 选择头像事件
  onChooseAvatar(e) {
    console.log('选择头像:', e.detail)
    const { avatarUrl } = e.detail

    // 立即显示预览
    this.setData({ userAvatar: avatarUrl })

    // 压缩并上传
    this.uploadAvatar(avatarUrl)
  },

  // 上传头像
  uploadAvatar(avatarUrl) {
    console.log('压缩并上传头像')
    
    // 压缩图片
    wx.compressImage({
      src: avatarUrl,
      quality: 80,
      success: (res) => {
        console.log('压缩成功')
        this.uploadToCloud(res.tempFilePath)
      },
      fail: (err) => {
        console.log('压缩失败，上传原图:', err)
        this.uploadToCloud(avatarUrl)
      }
    })
  },

  // 上传到云存储（支持重试）
  uploadToCloud(filePath, retryCount = 0) {
    console.log(`开始上传头像（第${retryCount + 1}次）`)
    
    this.setData({ 
      isUploading: true,
      uploadRetryCount: retryCount
    })
    
    const fileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const cloudPath = `avatars/${fileName}`

    const uploadTask = wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      
      success: (res) => {
        console.log('上传成功，云文件ID:', res.fileID)
        
        this.setData({
          cloudAvatarId: res.fileID,
          isUploading: false,
          uploadRetryCount: 0
        })
      },
      
      fail: (err) => {
        console.error(`上传失败（第${retryCount + 1}次）:`, err)
        
        // 判断是否需要重试
        if (retryCount < 1) {
          console.log('1秒后自动重试')
          setTimeout(() => {
            this.uploadToCloud(filePath, retryCount + 1)
          }, 1000)
        } else {
          console.log('重试失败，将使用默认头像')
          this.setData({ 
            isUploading: false,
            uploadRetryCount: 0,
            cloudAvatarId: ''
          })
        }
      }
    })
    
    this.setData({ uploadTask })
  },

  // 保存头像到私有目录
  saveAvatarToPrivateDir(tempFilePath) {
    // 获取小程序私有目录路径
    const fs = wx.getFileSystemManager()
    const userDataPath = wx.env.USER_DATA_PATH
    const fileName = `avatar_${Date.now()}.jpg`
    const savedPath = `${userDataPath}/${fileName}`

    console.log('保存头像到私有目录:', { tempFilePath, savedPath })

    // 复制文件到私有目录
    fs.copyFile({
      srcPath: tempFilePath,
      destPath: savedPath,
      success: (res) => {
        console.log('头像保存成功:', savedPath)
        
        // 使用保存后的永久路径
        this.setData({
          userAvatar: savedPath
        })

        wx.showToast({
          title: '头像选择成功',
          icon: 'success',
          duration: 1500,
        })
      },
      fail: (err) => {
        console.error('头像保存失败:', err)
        
        // 保存失败时，使用原始路径
        this.setData({
          userAvatar: tempFilePath
        })

        wx.showToast({
          title: '头像选择成功',
          icon: 'success',
          duration: 1500,
        })
      }
    })
  },

  // 处理头像URL，确保在不同环境下都能正常显示
  processAvatarUrl(avatarUrl) {
    if (!avatarUrl) return ''
    
    // 判断当前是否是开发工具环境
    const isDevTool = wx.getSystemInfoSync().platform === 'devtools'
    
    console.log('环境检测:', { isDevTool, originalUrl: avatarUrl })
    
    // 直接返回原始路径，让微信小程序自己处理
    // 微信小程序会根据环境自动选择正确的路径格式
    return avatarUrl
  },

  // 昵称输入事件
  onNicknameChange(e) {
    console.log('昵称输入:', e.detail.value)
    this.setData({
      userNickname: e.detail.value
    })
  },

  // 表单提交处理
  onFormSubmit(e) {
    const { cloudAvatarId, isUploading } = this.data
    const nickname = e.detail.value.nickname
    
    // 验证昵称
    if (!nickname || nickname.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    // 检查头像上传状态
    if (isUploading) {
      console.log('头像正在上传，等待中')
      wx.showLoading({ title: ' ', mask: true })
      
      this.waitForUpload().then(() => {
        wx.hideLoading()
        this.submitUserInfo(nickname, this.data.cloudAvatarId)
      }).catch(() => {
        wx.hideLoading()
        this.submitUserInfo(nickname, '')
      })
      return
    }

    // 直接提交
    this.submitUserInfo(nickname, cloudAvatarId)
  },

  // 等待上传完成
  waitForUpload() {
    return new Promise((resolve, reject) => {
      let checkCount = 0
      const maxChecks = 50
      
      const timer = setInterval(() => {
        checkCount++
        
        if (!this.data.isUploading) {
          clearInterval(timer)
          if (this.data.cloudAvatarId) {
            console.log('上传完成')
            resolve()
          } else {
            console.log('上传失败')
            reject()
          }
        } else if (checkCount >= maxChecks) {
          clearInterval(timer)
          console.log('等待超时')
          reject()
        }
      }, 200)
    })
  },

  // 提交用户信息
  submitUserInfo(nickname, avatar) {
    wx.showLoading({ title: ' ', mask: true })
    
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'createUser',
        data: {
          nickName: nickname.trim(),
          avatar: avatar || ''
        }
      },
      success: (res) => {
        console.log('用户创建成功:', res.result)
        
        if (res.result.success) {
          // 保存用户信息到本地存储
          wx.setStorageSync('userId', res.result.data._openid)
          wx.setStorageSync('userNickname', res.result.data.nickName)
          wx.setStorageSync('userAvatar', res.result.data.avatar)
          
          console.log('保存到本地存储的用户信息:', {
            userId: res.result.data._openid,
            userNickname: res.result.data.nickName,
            userAvatar: res.result.data.avatar
          })
          
          wx.hideLoading()
          this.hideUserInfoModal()
          
          wx.showToast({
            title: '欢迎进入房间',
            icon: 'success',
            duration: 1000,
          })

          setTimeout(() => {
            this.navigateToCreateRoom()
          }, 1000)
        } else {
          console.error('用户创建失败:', res.result)
          wx.hideLoading()
          wx.showToast({
            title: res.result.message || '用户创建失败',
            icon: 'none',
            duration: 3000,
          })
        }
      },
      fail: (err) => {
        console.error('调用云函数失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },

  // 生成用户信息并跳转到房间页面
  generateUserInfoAndNavigate() {
    // 生成随机昵称（作为默认值）
    const randomNickname = '玩家' + Math.floor(Math.random() * 9999)
    
    // 调用云函数创建用户并保存到用户表
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'createUser',
        data: {
          nickName: randomNickname,
          avatar: ''
        }
      },
      success: (res) => {
        console.log('用户创建成功:', res.result)
        
        if (res.result.success) {
          // 保存用户信息到本地存储
          wx.setStorageSync('userId', res.result.data._openid)
          wx.setStorageSync('userNickname', res.result.data.nickName)
          wx.setStorageSync('userAvatar', res.result.data.avatar)
          
          console.log('用户信息已保存到本地:', res.result.data)
          
          // 跳转到房间页面
          this.navigateToCreateRoom()
        } else {
          wx.showToast({
            title: '用户创建失败',
            icon: 'none',
            duration: 2000,
          })
        }
      },
      fail: (err) => {
        console.error('调用云函数失败:', err)
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000,
        })
      }
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

  // 临时方法：清除用户数据（测试用）
  clearUserData() {
    wx.removeStorageSync('userId')
    wx.removeStorageSync('userNickname')
    wx.removeStorageSync('userAvatar')
    wx.showToast({
      title: '用户数据已清除',
      icon: 'success',
      duration: 2000,
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
