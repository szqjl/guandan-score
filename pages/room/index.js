// pages/room/index.js
Page({
  data: {
    // 房间信息
    roomId: '',
    gameMode: 'guoA',
    gameModeText: '过A制',
    qrCodeUrl: '',
    
    // 用户信息
    userNickname: '',
    userAvatar: '',

    // 玩家座位（按方向组织）
    seats: {
      north: { playerName: '', avatar: '', isHost: false, seatName: '北', userId: '', isOccupied: false, isClickable: true },
      east: { playerName: '', avatar: '', isHost: false, seatName: '东', userId: '', isOccupied: false, isClickable: true },
      west: { playerName: '', avatar: '', isHost: false, seatName: '西', userId: '', isOccupied: false, isClickable: true },
      south: { playerName: '', avatar: '', isHost: false, seatName: '南', userId: '', isOccupied: false, isClickable: true },
    },

    // 房主信息
    isHost: true,
    hostSeat: 'east', // 房主选择的座位

    // 队伍绑定
    teams: {
      eastWest: ['east', 'west'], // 东西方队伍
      southNorth: ['south', 'north'], // 南北方队伍
    },

    // 游戏状态
    canStartGame: false,
    
    // 游戏模式选择器
    gameModeIndex: 0,
    gameModeOptions: [
      { value: 'guoA', text: '过A制' },
      { value: 'baShu', text: '把数制' }
    ],
  },

  onLoad(options) {
    const { roomId, isHost, hostSeat, entryType } = options

    this.setData({
      roomId: roomId || '123456',
      isHost: isHost === 'true',
      hostSeat: hostSeat || 'east',
      entryType: entryType || 'unknown', // 进入方式：create/share/scan/unknown
    })

    // 检查用户身份（所有进入房间的用户都需要检查）
    this.checkUserIdentity()

    // 设置房主座位
    if (this.data.isHost) {
      this.setData({
        [`seats.${this.data.hostSeat}.isHost`]: true,
      })
    }

    // 生成二维码
    this.generateQRCode()

    // 检查是否可以开始游戏
    this.checkCanStartGame()

    // 初始化座位选择逻辑
    this.initSeatSelection()

    // 单人测试：自动填充所有座位
    if (this.data.isHost) {
      this.autoFillSeats()
    }
  },

  // 生成房间二维码
  generateQRCode() {
    // 这里应该调用微信小程序码生成API
    // 暂时使用GD图标作为占位图
    this.setData({
      qrCodeUrl: '/images/GD.png',
    })
  },

  // 检查是否可以开始游戏
  checkCanStartGame() {
    const seats = this.data.seats
    const hasPlayers = Object.values(seats).some(
      (seat) => seat.playerName && seat.playerName !== ''
    )

    const canStart = hasPlayers && this.data.isHost
    console.log('检查开始游戏条件:', {
      hasPlayers,
      isHost: this.data.isHost,
      canStart,
      seats,
    })

    this.setData({
      canStartGame: canStart,
    })
  },

  // 初始化座位选择逻辑
  initSeatSelection() {
    // 设置座位点击事件
    this.setData({
      seatClickable: true,
    })
  },

  // 自动填充座位（用于单人测试）
  autoFillSeats() {
    console.log('自动填充座位')
    // 确保所有座位都有玩家名称（使用座位名称作为默认值）
    const seats = this.data.seats
    const updatedSeats = {
      ...seats,
      east: { ...seats.east, playerName: seats.east.playerName || seats.east.seatName },
      west: { ...seats.west, playerName: seats.west.playerName || seats.west.seatName },
      south: { ...seats.south, playerName: seats.south.playerName || seats.south.seatName },
      north: { ...seats.north, playerName: seats.north.playerName || seats.north.seatName },
    }

    this.setData({
      seats: updatedSeats,
    })

    // 重新检查是否可以开始游戏
    this.checkCanStartGame()

    console.log('座位自动填充完成')
  },

  // 座位点击事件
  onSeatClick(e) {
    const seat = e.currentTarget.dataset.seat
    const seatData = this.data.seats[seat]
    const currentUserId = wx.getStorageSync('userId')
    
    if (!seatData.isClickable) {
      // 座位不可点击，显示提示
      wx.showToast({
        title: '该座位已被占用',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    if (seatData.isOccupied) {
      // 座位已占用
      if (seatData.userId === currentUserId) {
        // 是当前用户占用的座位，可以更换
        this.showSeatChangeModal(seat)
      } else {
        // 其他用户占用的座位，不可选择
        wx.showToast({
          title: '该座位已被其他玩家占用',
          icon: 'none',
          duration: 1500
        })
      }
    } else {
      // 座位空着，可以选择
      this.selectSeat(seat)
    }
  },

  // 显示座位选择弹窗
  showSeatSelectionModal(targetSeat) {
    const availableSeats = []

    // 找出所有可用座位
    Object.keys(this.data.seats).forEach((seat) => {
      const seatData = this.data.seats[seat]
      if (!seatData.playerName || seatData.isHost) {
        availableSeats.push({
          seat: seat,
          name: this.getSeatDisplayName(seat),
          isOccupied: !!seatData.playerName,
        })
      }
    })

    wx.showActionSheet({
      itemList: availableSeats.map((item) =>
        item.isOccupied ? `${item.name} (已占用)` : item.name
      ),
      success: (res) => {
        const selectedSeat = availableSeats[res.tapIndex].seat
        this.handleSeatSelection(targetSeat, selectedSeat)
      },
    })
  },

  // 处理座位选择
  handleSeatSelection(fromSeat, toSeat) {
    if (fromSeat === toSeat) {
      return
    }

    // 交换座位
    const fromSeatData = { ...this.data.seats[fromSeat] }
    const toSeatData = { ...this.data.seats[toSeat] }

    this.setData({
      [`seats.${fromSeat}`]: toSeatData,
      [`seats.${toSeat}`]: fromSeatData,
    })

    // 更新房主座位信息
    if (fromSeatData.isHost) {
      this.setData({
        hostSeat: toSeat,
      })
    } else if (toSeatData.isHost) {
      this.setData({
        hostSeat: fromSeat,
      })
    }

    // 重新绑定队伍
    this.bindTeams()

    wx.showToast({
      title: '座位已调整',
      icon: 'success',
    })
  },

  // 获取座位显示名称
  getSeatDisplayName(seat) {
    const seatNames = {
      north: '北',
      east: '东',
      south: '南',
      west: '西',
    }
    return seatNames[seat] || seat
  },

  // 编辑玩家昵称
  onEditPlayer(e) {
    const seat = e.currentTarget.dataset.seat
    const currentName = this.data.seats[seat].playerName

    wx.showModal({
      title: '修改玩家昵称',
      editable: true,
      placeholderText: '请输入玩家昵称',
      content: currentName,
      success: (res) => {
        if (res.confirm && res.content) {
          this.updatePlayerName(seat, res.content)
        }
      },
    })
  },

  // 更新玩家昵称
  updatePlayerName(seat, newName) {
    this.setData({
      [`seats.${seat}.playerName`]: newName,
    })

    // 检查是否可以开始游戏
    this.checkCanStartGame()

    // 自动绑定队伍
    this.bindTeams()

    // 调用云函数更新房间信息
    wx.cloud
      .callFunction({
        name: 'roomManager',
        data: {
          action: 'updatePlayerName',
          data: {
            roomId: this.data.roomId,
            seat: seat,
            playerName: newName,
          },
        },
      })
      .catch((err) => {
        console.error('更新玩家昵称失败:', err)
      })
  },

  // 获取队伍信息
  getTeamInfo() {
    const seats = this.data.seats
    return {
      eastWest: {
        players: [seats.east.playerName, seats.west.playerName],
        teamName: '东西方',
        seats: ['east', 'west'],
      },
      southNorth: {
        players: [seats.south.playerName, seats.north.playerName],
        teamName: '南北方',
        seats: ['south', 'north'],
      },
    }
  },

  // 队伍绑定逻辑
  bindTeams() {
    const teamInfo = this.getTeamInfo()

    // 更新队伍绑定状态
    this.setData({
      teams: {
        eastWest: teamInfo.eastWest,
        southNorth: teamInfo.southNorth,
      },
    })

    // 保存队伍绑定信息到本地存储
    wx.setStorageSync('teamBinding', {
      roomId: this.data.roomId,
      teams: teamInfo,
      timestamp: new Date().getTime(),
    })

    console.log('队伍绑定完成:', teamInfo)
  },

  // 检查队伍完整性
  checkTeamIntegrity() {
    const seats = this.data.seats
    const eastWestComplete = !!(seats.east.playerName && seats.west.playerName)
    const southNorthComplete = !!(
      seats.south.playerName && seats.north.playerName
    )
    const allComplete = eastWestComplete && southNorthComplete

    console.log('队伍完整性详细检查:', {
      east: seats.east.playerName,
      west: seats.west.playerName,
      south: seats.south.playerName,
      north: seats.north.playerName,
      eastWestComplete,
      southNorthComplete,
      allComplete,
    })

    return {
      eastWest: eastWestComplete,
      southNorth: southNorthComplete,
      allComplete: allComplete,
    }
  },

  // 开始比赛
  onStartGame() {
    console.log('onStartGame 被调用')

    // 检查队伍完整性
    const teamIntegrity = this.checkTeamIntegrity()
    console.log('队伍完整性检查:', teamIntegrity)

    if (!teamIntegrity.allComplete) {
      console.log('队伍不完整，显示提示')
      wx.showModal({
        title: '队伍不完整',
        content: '请确保所有座位都有玩家或默认队友',
        showCancel: false,
        confirmText: '知道了',
      })
      return
    }

    console.log('队伍完整，开始绑定队伍')
    // 绑定队伍
    this.bindTeams()

    const teamInfo = this.getTeamInfo()
    console.log('获取队伍信息:', teamInfo)

    // 跳转到主页，传递队伍信息
    const navigateUrl = `/pages/index/index?roomId=${
      this.data.roomId
    }&teams=${JSON.stringify(teamInfo)}&isMultiMode=true`
    console.log('准备跳转到主页:', navigateUrl)

    wx.navigateTo({
      url: navigateUrl,
      success: () => {
        console.log('成功跳转到主页')
      },
      fail: (err) => {
        console.error('跳转主页失败:', err)
      },
    })
  },

  // 检查用户身份（所有进入房间的用户都需要检查）
  checkUserIdentity() {
    const userId = wx.getStorageSync('userId')
    const userNickname = wx.getStorageSync('userNickname')
    const userAvatar = wx.getStorageSync('userAvatar')
    const entryType = this.data.entryType

    if (!userId || !userNickname) {
      // 首次登录，根据进入方式生成不同的提示
      this.generateRandomNickname()
      
      // 根据进入方式显示不同提示
      let welcomeMsg = ''
      switch(entryType) {
        case 'create':
          welcomeMsg = '欢迎创建房间！'
          break
        case 'share':
          welcomeMsg = '欢迎通过分享加入！'
          break
        case 'scan':
          welcomeMsg = '欢迎扫码加入！'
          break
        case 'manual':
          welcomeMsg = '欢迎手动加入房间！'
          break
        default:
          welcomeMsg = '欢迎进入房间！'
      }
      
      setTimeout(() => {
        wx.showToast({
          title: welcomeMsg,
          icon: 'success',
          duration: 2000
        })
      }, 1000)
    } else {
      // 已有用户信息，更新页面显示
      this.setData({
        userNickname: userNickname,
        userAvatar: userAvatar || ''
      })
      
      // 显示欢迎信息
      wx.showToast({
        title: `欢迎回来，${userNickname}！`,
        icon: 'success',
        duration: 2000
      })
    }
  },

  // 显示昵称确认弹窗
  showNicknameConfirmModal() {
    wx.showModal({
      title: '您还未设置昵称',
      content: '是否同步微信昵称？',
      confirmText: '是',
      cancelText: '否',
      success: (res) => {
        if (res.confirm) {
          // 用户选择同步微信昵称，显示授权确认弹窗
          this.showWechatAuthModal()
        } else {
          // 用户选择使用随机昵称
          this.generateRandomNickname()
        }
      }
    })
  },

  // 显示昵称设置弹窗
  showWechatAuthModal() {
    console.log('showWechatAuthModal 被调用')
    wx.showModal({
      title: '设置昵称',
      content: '请选择设置昵称的方式',
      confirmText: '手动输入',
      cancelText: '随机生成',
      success: (res) => {
        if (res.confirm) {
          // 用户选择手动输入
          this.showNicknameInput()
        } else {
          // 用户选择随机生成
          this.generateRandomNickname()
        }
      }
    })
  },

  // 获取用户个人昵称
  getUserNickname() {
    wx.showLoading({
      title: '获取昵称中...',
    })

    wx.getUserProfile({
      desc: '用于建立您的个人战绩档案',
      success: (res) => {
        wx.hideLoading()
        console.log('获取微信用户信息成功:', res)
        console.log('用户昵称:', res.userInfo.nickName)
        console.log('用户头像:', res.userInfo.avatarUrl)
        
        // 根据官方文档，使用正确的字段名
        const nickname = res.userInfo.nickName || '微信用户' + Math.floor(Math.random() * 9999)
        
        console.log('最终使用的昵称:', nickname)
        
        // 生成用户ID
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
        
        // 保存用户信息
        wx.setStorageSync('userId', userId)
        wx.setStorageSync('userNickname', nickname)
        wx.setStorageSync('userAvatar', res.userInfo.avatarUrl || '')
        
        // 更新页面显示
        this.setData({
          userNickname: nickname,
          userAvatar: res.userInfo.avatarUrl || ''
        })
        
        wx.showToast({
          title: `欢迎，${nickname}！`,
          icon: 'success',
          duration: 2000
        })
      },
      fail: (err) => {
        wx.hideLoading()
        console.log('获取用户信息失败:', err)
        
        // 获取失败，使用随机昵称
        this.generateRandomNickname()
      }
    })
  },

  // 显示手动输入昵称弹窗
  showNicknameInput() {
    wx.showModal({
      title: '设置昵称',
      editable: true,
      placeholderText: '请输入您的昵称',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const nickname = res.content.trim()
          this.setUserNickname(nickname)
        } else {
          // 用户取消或输入为空，使用随机昵称
          this.generateRandomNickname()
        }
      }
    })
  },

  // 设置用户昵称
  setUserNickname(nickname) {
    // 生成用户ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    
    // 保存用户信息
    wx.setStorageSync('userId', userId)
    wx.setStorageSync('userNickname', nickname)
    
    // 记录用户进入方式和个人档案
    this.recordUserEntry(userId, nickname)
    
    // 更新页面显示
    this.setData({
      userNickname: nickname
    })
    
    wx.showToast({
      title: `欢迎，${nickname}！`,
      icon: 'success',
      duration: 2000
    })
  },

  // 生成随机个人昵称
  generateRandomNickname() {
    const adjectives = ['聪明', '勇敢', '机智', '灵活', '沉稳', '果断', '敏锐', '精准']
    const nouns = ['玩家', '高手', '大师', '达人', '专家', '能手', '精英', '冠军']
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNum = Math.floor(Math.random() * 999) + 1
    
    const nickname = randomAdjective + randomNoun + randomNum
    
    // 生成用户ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    
    // 保存用户信息
    wx.setStorageSync('userId', userId)
    wx.setStorageSync('userNickname', nickname)
    
    // 记录用户进入方式和个人档案
    this.recordUserEntry(userId, nickname)
    
    // 更新页面显示
    this.setData({
      userNickname: nickname
    })
    
    wx.showToast({
      title: `欢迎，${nickname}！`,
      icon: 'success',
      duration: 2000
    })
  },

  // 分享房间
  onShareRoom() {
    return {
      title: `掼蛋比赛房间 ${this.data.roomId}`,
      path: `/pages/room/index?roomId=${this.data.roomId}&entryType=share`,
      imageUrl: this.data.qrCodeUrl,
    }
  },

  // 离开房间
  onLeaveRoom() {
    wx.showModal({
      title: '离开房间',
      content: '确定要离开房间吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用云函数离开房间
          wx.cloud
            .callFunction({
              name: 'roomManager',
              data: {
                action: 'leaveRoom',
                data: {
                  roomId: this.data.roomId,
                },
              },
            })
            .then(() => {
              wx.navigateBack()
            })
            .catch((err) => {
              console.error('离开房间失败:', err)
              wx.navigateBack()
            })
        }
      },
    })
  },

  // 选择座位
  selectSeat(seat) {
    const userId = wx.getStorageSync('userId')
    const userNickname = wx.getStorageSync('userNickname')
    
    if (!userId || !userNickname) {
      this.checkUserIdentity()
      return
    }
    
    // 检查用户是否已经占用其他座位
    const currentSeat = this.getUserCurrentSeat(userId)
    if (currentSeat) {
      // 用户已经占用其他座位，先释放原座位
      this.releaseSeat(currentSeat)
    }
    
    // 占用新座位
    this.setData({
      [`seats.${seat}.playerName`]: userNickname,
      [`seats.${seat}.userId`]: userId,
      [`seats.${seat}.isOccupied`]: true,
      [`seats.${seat}.isClickable`]: false
    })
    
    // 同步到云端
    this.updateSeatToCloud(seat, userId, userNickname)
    
    wx.showToast({
      title: `已选择${this.data.seats[seat].seatName}`,
      icon: 'success',
      duration: 1500
    })
  },

  // 释放座位
  releaseSeat(seat) {
    this.setData({
      [`seats.${seat}.playerName`]: '',
      [`seats.${seat}.userId`]: '',
      [`seats.${seat}.isOccupied`]: false,
      [`seats.${seat}.isClickable`]: true
    })
    
    // 同步到云端
    this.releaseSeatToCloud(seat)
  },

  // 获取用户当前占用的座位
  getUserCurrentSeat(userId) {
    const seats = this.data.seats
    for (let seat in seats) {
      if (seats[seat].userId === userId) {
        return seat
      }
    }
    return null
  },

  // 显示座位更换弹窗
  showSeatChangeModal(currentSeat) {
    wx.showModal({
      title: '更换座位',
      content: `您当前在${this.data.seats[currentSeat].seatName}，是否要更换座位？`,
      success: (res) => {
        if (res.confirm) {
          // 释放当前座位
          this.releaseSeat(currentSeat)
          // 显示可用座位选择
          this.showAvailableSeats()
        }
      }
    })
  },

  // 显示可用座位选择
  showAvailableSeats() {
    const availableSeats = []
    
    Object.keys(this.data.seats).forEach((seat) => {
      if (!this.data.seats[seat].isOccupied) {
        availableSeats.push({
          seat: seat,
          name: this.data.seats[seat].seatName,
        })
      }
    })

    if (availableSeats.length === 0) {
      wx.showToast({
        title: '没有可用座位',
        icon: 'none',
      })
      return
    }

    wx.showActionSheet({
      itemList: availableSeats.map((item) => item.name),
      success: (res) => {
        const selectedSeat = availableSeats[res.tapIndex].seat
        this.selectSeat(selectedSeat)
      },
    })
  },

  // 游戏模式选择器事件
  onGameModeChange(e) {
    const index = e.detail.value
    const selectedMode = this.data.gameModeOptions[index]
    
    this.setData({
      gameModeIndex: index,
      gameMode: selectedMode.value,
      gameModeText: selectedMode.text
    })
    
    // 保存用户设置
    wx.setStorageSync('gameMode', selectedMode.value)
    
    wx.showToast({
      title: `已选择${selectedMode.text}`,
      icon: 'success',
      duration: 1500
    })
  },

  // 更新座位到云端
  updateSeatToCloud(seat, userId, userNickname) {
    wx.cloud.callFunction({
      name: 'roomManager',
      data: {
        action: 'updateSeat',
        data: {
          roomId: this.data.roomId,
          seat: seat,
          userId: userId,
          userNickname: userNickname
        }
      }
    }).catch(err => {
      console.error('更新座位失败:', err)
    })
  },

  // 释放座位到云端
  releaseSeatToCloud(seat) {
    wx.cloud.callFunction({
      name: 'roomManager',
      data: {
        action: 'releaseSeat',
        data: {
          roomId: this.data.roomId,
          seat: seat
        }
      }
    }).catch(err => {
      console.error('释放座位失败:', err)
    })
  },

  // 选择头像事件
  onChooseAvatar(e) {
    console.log('选择头像:', e.detail)
    const { avatarUrl } = e.detail
    
    // 更新页面显示
    this.setData({
      userAvatar: avatarUrl
    })
    
    // 保存到本地存储
    wx.setStorageSync('userAvatar', avatarUrl)
    
    wx.showToast({
      title: '头像设置成功',
      icon: 'success',
      duration: 1500
    })
  },

  // 昵称输入事件
  onNicknameChange(e) {
    console.log('昵称输入:', e.detail.value)
    const nickname = e.detail.value.trim()
    
    if (nickname && nickname.length > 0) {
      // 更新页面显示
      this.setData({
        userNickname: nickname
      })
      
      // 保存到本地存储
      wx.setStorageSync('userNickname', nickname)
      
      // 生成用户ID（如果还没有）
      let userId = wx.getStorageSync('userId')
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
        wx.setStorageSync('userId', userId)
      }
      
      wx.showToast({
        title: `欢迎，${nickname}！`,
        icon: 'success',
        duration: 1500
      })
    }
  },

  // 记录用户进入方式和个人档案
  recordUserEntry(userId, nickname) {
    const entryType = this.data.entryType
    
    // 只有主动创建、扫码和分享进入才记录个人中心
    if (entryType === 'create' || entryType === 'share' || entryType === 'scan') {
      const roomId = this.data.roomId
      const isHost = this.data.isHost
      
      // 构建用户档案数据
      const userProfile = {
        userId: userId,
        nickname: nickname,
        entryType: entryType, // 仅作为代码内部标记使用
        totalRooms: 1,
        hostRooms: isHost ? 1 : 0,
        joinRooms: isHost ? 0 : 1
      }
      
      // 保存到本地存储
      wx.setStorageSync('userProfile', userProfile)
      
      // 同步到云端（如果网络可用）
      this.syncUserProfileToCloud(userProfile)
      
      console.log('用户档案已记录:', userProfile)
    } else {
      console.log('手动进入，不记录个人中心')
    }
  },

  // 同步用户档案到云端
  syncUserProfileToCloud(userProfile) {
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'createOrUpdateUser',
        data: userProfile
      }
    }).then(res => {
      console.log('用户档案同步成功:', res)
    }).catch(err => {
      console.error('用户档案同步失败:', err)
      // 失败不影响用户体验，数据已保存在本地
    })
  },

  // 用户信息点击事件
  onUserInfoClick() {
    // 提示用户如何设置头像和昵称
    wx.showToast({
      title: '点击头像选择头像，点击输入框设置昵称',
      icon: 'none',
      duration: 2000
    })
  },
})
