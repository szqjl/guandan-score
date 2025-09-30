// pages/room/index.js
Page({
  data: {
    // 房间信息
    roomId: '',
    gameMode: 'guoA',
    gameModeText: '过A制',
    qrCodeUrl: '',

    // 比赛模式相关
    rule: 'by-rounds',
    maxRounds: 10,
    showRoundsPicker: false,
    tempMaxRounds: 10,

    // 用户信息
    userNickname: '',
    userAvatar: '',
    currentUserId: '', // 当前用户ID

    // 玩家座位（按方向组织）
    seats: {
      north: {
        playerName: '',
        avatar: '',
        isHost: false,
        seatName: '北',
        userId: '',
        isOccupied: false,
        isClickable: true,
      },
      east: {
        playerName: '',
        avatar: '',
        isHost: false,
        seatName: '东',
        userId: '',
        isOccupied: false,
        isClickable: true,
      },
      west: {
        playerName: '',
        avatar: '',
        isHost: false,
        seatName: '西',
        userId: '',
        isOccupied: false,
        isClickable: true,
      },
      south: {
        playerName: '',
        avatar: '',
        isHost: false,
        seatName: '南',
        userId: '',
        isOccupied: false,
        isClickable: true,
      },
    },

    // 玩家列表
    playersList: [],

    // 观战模式
    isSpectator: false,

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
      { value: 'baShu', text: '把数制' },
    ],
  },

  onLoad(options) {
    const { roomId, isHost, hostSeat, entryType } = options

    // 生成默认房间ID（如果没有传递）
    const defaultRoomId =
      roomId || Math.floor(1000 + Math.random() * 9000).toString()

    this.setData({
      roomId: defaultRoomId,
      isHost: isHost === 'true',
      hostSeat: hostSeat || 'east',
      entryType: entryType || 'unknown', // 进入方式：create/share/scan/unknown
      currentUserId:
        'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    })

    // 初始化玩家列表
    this.updatePlayersList()

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
      east: {
        ...seats.east,
        playerName: seats.east.playerName || seats.east.seatName,
      },
      west: {
        ...seats.west,
        playerName: seats.west.playerName || seats.west.seatName,
      },
      south: {
        ...seats.south,
        playerName: seats.south.playerName || seats.south.seatName,
      },
      north: {
        ...seats.north,
        playerName: seats.north.playerName || seats.north.seatName,
      },
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
        duration: 1500,
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
          duration: 1500,
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

    // 跳转到主页，传递队伍信息和比赛模式
    const navigateUrl = `/pages/index/index?roomId=${
      this.data.roomId
    }&teams=${JSON.stringify(teamInfo)}&isMultiMode=true&rule=${
      this.data.rule
    }&maxRounds=${this.data.maxRounds}`
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

    console.log('房间页面 - 从本地存储读取的用户信息:', {
      userId,
      userNickname,
      userAvatar
    })

    // 显示加载状态
    this.showLoadingProgress()

    if (!userId || !userNickname) {
      // 首次登录，从用户表获取用户信息
      this.loadUserFromDatabase()
    } else {
      // 已有用户信息，更新页面显示
      this.setData({
        userNickname: userNickname,
        userAvatar: userAvatar || '',
      })

      console.log('房间页面 - 设置用户头像:', userAvatar)
      console.log('房间页面 - 当前页面数据:', this.data.userAvatar)

      // 模拟加载过程，然后显示完成
      setTimeout(() => {
        this.hideLoadingProgress()
        this.showWelcomeMessage(entryType, userNickname)
      }, 1500)
    }
  },

  // 显示加载进度条
  showLoadingProgress() {
    wx.showLoading({
      title: '正在加载房间...',
      mask: true
    })
  },

  // 隐藏加载进度条
  hideLoadingProgress() {
    wx.hideLoading()
  },

  // 显示欢迎信息
  showWelcomeMessage(entryType, userNickname) {
    let welcomeMsg = ''
    switch (entryType) {
      case 'create':
        welcomeMsg = '房间已创建，开始计分吧！'
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
        welcomeMsg = userNickname ? `${userNickname}，继续游戏吧！` : '欢迎进入房间！'
    }

    wx.showToast({
      title: welcomeMsg,
      icon: 'success',
      duration: 2000,
    })
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
      },
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
      },
    })
  },

  // 从用户表加载用户信息
  loadUserFromDatabase() {
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'getUserProfile'
      },
      success: (res) => {
        console.log('从用户表获取用户信息:', res.result)
        
        if (res.result.success && res.result.data) {
          // 更新页面显示
          this.setData({
            userNickname: res.result.data.nickName,
            userAvatar: res.result.data.avatar || '',
          })
          
          // 保存到本地存储
          wx.setStorageSync('userId', res.result.data._openid)
          wx.setStorageSync('userNickname', res.result.data.nickName)
          wx.setStorageSync('userAvatar', res.result.data.avatar || '')
          
          // 隐藏加载进度条，显示欢迎信息
          setTimeout(() => {
            this.hideLoadingProgress()
            this.showWelcomeMessage(this.data.entryType, res.result.data.nickName)
          }, 1000)
        } else {
          // 用户不存在，显示设置界面
          this.showUserInfoSetup()
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        // 网络错误，显示设置界面
        this.showUserInfoSetup()
      }
    })
  },

  // 显示用户信息设置界面
  showUserInfoSetup() {
    // 设置页面数据，显示用户信息设置区域
    this.setData({
      userNickname: '',
      userAvatar: '',
      showUserInfoSetup: true
    })
    
    // 显示设置提示
    wx.showToast({
      title: '请设置您的头像和昵称',
      icon: 'none',
      duration: 3000,
    })
  },

  // 获取用户个人昵称
  getUserNickname() {
    // 不再使用已回收的wx.getUserProfile接口
    // 改为使用新的头像昵称填写能力方案
    wx.showModal({
      title: '设置个人信息',
      content: '请设置您的昵称和头像',
      confirmText: '去设置',
      cancelText: '稍后设置',
      success: (res) => {
        if (res.confirm) {
          // 用户选择去设置，显示昵称设置弹窗
          this.showNicknameConfirmModal()
        } else {
          // 用户选择稍后设置，生成随机昵称
          this.generateRandomNickname()
        }
      },
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
      },
    })
  },

  // 设置用户昵称
  setUserNickname(nickname) {
    // 手动设置昵称不生成ID，只更新昵称
    wx.setStorageSync('userNickname', nickname)

    // 检查是否有ID，如果有则记录用户档案
    const userId = wx.getStorageSync('userId')
    if (userId) {
      this.recordUserEntry(userId, nickname)
    }

    // 更新页面显示
    this.setData({
      userNickname: nickname,
    })

    wx.showToast({
      title: `欢迎，${nickname}！`,
      icon: 'success',
      duration: 2000,
    })
  },

  // 生成随机个人昵称
  generateRandomNickname() {
    const adjectives = [
      '聪明',
      '勇敢',
      '机智',
      '灵活',
      '沉稳',
      '果断',
      '敏锐',
      '精准',
    ]
    const nouns = [
      '玩家',
      '高手',
      '大师',
      '达人',
      '专家',
      '能手',
      '精英',
      '冠军',
    ]

    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNum = Math.floor(Math.random() * 999) + 1

    const nickname = randomAdjective + randomNoun + randomNum

    // 根据进入方式决定是否生成ID
    const entryType = this.data.entryType
    if (entryType === 'scan' || entryType === 'share') {
      // 扫码和分享登录时生成唯一ID
      const userId =
        'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
      wx.setStorageSync('userId', userId)

      // 记录用户进入方式和个人档案
      this.recordUserEntry(userId, nickname)
    }

    // 保存昵称
    wx.setStorageSync('userNickname', nickname)

    // 更新页面显示
    this.setData({
      userNickname: nickname,
    })

    wx.showToast({
      title: `欢迎，${nickname}！`,
      icon: 'success',
      duration: 2000,
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
      [`seats.${seat}.isClickable`]: false,
    })

    // 同步到云端
    this.updateSeatToCloud(seat, userId, userNickname)

    wx.showToast({
      title: `已选择${this.data.seats[seat].seatName}`,
      icon: 'success',
      duration: 1500,
    })
  },

  // 释放座位
  releaseSeat(seat) {
    this.setData({
      [`seats.${seat}.playerName`]: '',
      [`seats.${seat}.userId`]: '',
      [`seats.${seat}.isOccupied`]: false,
      [`seats.${seat}.isClickable`]: true,
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
      },
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
      gameModeText: selectedMode.text,
    })

    // 保存用户设置
    wx.setStorageSync('gameMode', selectedMode.value)

    wx.showToast({
      title: `已选择${selectedMode.text}`,
      icon: 'success',
      duration: 1500,
    })
  },

  // 更新座位到云端
  updateSeatToCloud(seat, userId, userNickname) {
    wx.cloud
      .callFunction({
        name: 'roomManager',
        data: {
          action: 'updateSeat',
          data: {
            roomId: this.data.roomId,
            seat: seat,
            userId: userId,
            userNickname: userNickname,
          },
        },
      })
      .catch((err) => {
        console.error('更新座位失败:', err)
      })
  },

  // 释放座位到云端
  releaseSeatToCloud(seat) {
    wx.cloud
      .callFunction({
        name: 'roomManager',
        data: {
          action: 'releaseSeat',
          data: {
            roomId: this.data.roomId,
            seat: seat,
          },
        },
      })
      .catch((err) => {
        console.error('释放座位失败:', err)
      })
  },

  // 头像加载成功
  onAvatarLoad(e) {
    console.log('头像加载成功:', e.detail)
  },

  // 头像加载失败
  onAvatarError(e) {
    console.error('头像加载失败:', e.detail)
    console.error('头像URL:', this.data.userAvatar)
    // 头像加载失败时，清空头像URL，显示默认头像
    this.setData({
      userAvatar: ''
    })
    
    // 同时清除本地存储中的无效头像
    wx.removeStorageSync('userAvatar')
    
    wx.showToast({
      title: '头像已过期，请重新选择',
      icon: 'none',
      duration: 2000,
    })
  },

  // 处理头像URL，确保在不同环境下都能正常显示
  processAvatarUrl(avatarUrl) {
    if (!avatarUrl) return ''
    
    // 判断当前是否是开发工具环境
    const isDevTool = wx.getSystemInfoSync().platform === 'devtools'
    
    console.log('环境检测:', { isDevTool, originalUrl: avatarUrl })
    
    if (isDevTool) {
      // 开发工具环境，使用 http://tmp/ 路径
      if (avatarUrl.startsWith('wxfile://')) {
        // 如果是 wxfile:// 路径，转换为 http://tmp/ 路径
        const fileName = avatarUrl.split('/').pop()
        return `http://tmp/${fileName}`
      }
      return avatarUrl
    } else {
      // 真机环境，使用 wxfile:// 路径
      if (avatarUrl.startsWith('http://tmp/')) {
        // 如果是 http://tmp/ 路径，转换为 wxfile:// 路径
        const fileName = avatarUrl.split('/').pop()
        return `wxfile://tmp_${fileName}`
      }
      return avatarUrl
    }
  },

  // 选择头像事件
  onChooseAvatar(e) {
    console.log('选择头像:', e.detail)
    const { avatarUrl } = e.detail

    // 直接保存到本地，用户无感知
    this.saveAvatarToPrivateDir(avatarUrl)
  },

  // 上传头像到云存储
  uploadAvatarToCloud(tempFilePath) {
    console.log('开始上传头像到云存储:', tempFilePath)
    
    // 生成唯一的文件名
    const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`
    const cloudPath = `avatars/${fileName}`


    // 上传到云存储
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempFilePath,
      success: (res) => {
        console.log('头像上传成功:', res)
        
        // 获取文件的永久访问链接
        wx.cloud.getTempFileURL({
          fileList: [res.fileID],
          success: (urlRes) => {
            console.log('获取永久链接成功:', urlRes)
            
            const permanentUrl = urlRes.fileList[0].tempFileURL
            
            // 更新页面显示
            this.setData({
              userAvatar: permanentUrl,
            })

            // 保存到本地存储
            wx.setStorageSync('userAvatar', permanentUrl)
            
            // 如果没有用户ID，生成一个
            const userId = wx.getStorageSync('userId')
            if (!userId) {
              const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
              wx.setStorageSync('userId', newUserId)
            }

            wx.showToast({
              title: '头像设置成功',
              icon: 'success',
              duration: 1500,
            })
          },
          fail: (err) => {
            console.error('获取永久链接失败:', err)
            
            // 即使获取永久链接失败，也使用云文件ID
            this.setData({
              userAvatar: res.fileID,
            })

            // 保存到本地存储
            wx.setStorageSync('userAvatar', res.fileID)
            
            // 如果没有用户ID，生成一个
            const userId = wx.getStorageSync('userId')
            if (!userId) {
              const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
              wx.setStorageSync('userId', newUserId)
            }

            wx.showToast({
              title: '头像设置成功',
              icon: 'success',
              duration: 1500,
            })
          }
        })
      },
      fail: (err) => {
        console.error('头像上传失败:', err)
        
        // 上传失败时，使用本地保存方案
        this.saveAvatarToPrivateDir(tempFilePath)
        
        wx.showToast({
          title: '头像上传失败，已保存到本地',
          icon: 'none',
          duration: 2000,
        })
      }
    })
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
        
        // 更新页面显示
        this.setData({
          userAvatar: savedPath,
        })

        // 保存到本地存储
        wx.setStorageSync('userAvatar', savedPath)
        
        // 如果没有用户ID，生成一个
        const userId = wx.getStorageSync('userId')
        if (!userId) {
          const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
          wx.setStorageSync('userId', newUserId)
        }

        wx.showToast({
          title: '头像设置成功',
          icon: 'success',
          duration: 1500,
        })
      },
      fail: (err) => {
        console.error('头像保存失败:', err)
        
        // 保存失败时，使用原始路径
        this.setData({
          userAvatar: tempFilePath,
        })

        // 保存到本地存储
        wx.setStorageSync('userAvatar', tempFilePath)
        
        // 如果没有用户ID，生成一个
        const userId = wx.getStorageSync('userId')
        if (!userId) {
          const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
          wx.setStorageSync('userId', newUserId)
        }

        wx.showToast({
          title: '头像设置成功',
          icon: 'success',
          duration: 1500,
        })
      }
    })
  },

  // 昵称输入事件
  onNicknameChange(e) {
    console.log('昵称输入:', e.detail.value)
    const nickname = e.detail.value.trim()

    if (nickname && nickname.length > 0) {
      // 更新页面显示
      this.setData({
        userNickname: nickname,
      })

      // 保存昵称到本地存储
      wx.setStorageSync('userNickname', nickname)
      
      // 如果没有用户ID，生成一个
      const userId = wx.getStorageSync('userId')
      if (!userId) {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
        wx.setStorageSync('userId', newUserId)
      }
      wx.showToast({
        title: `欢迎，${nickname}！`,
        icon: 'success',
        duration: 1500,
      })
    }
  },

  // 记录用户进入方式和个人档案
  recordUserEntry(userId, nickname) {
    const entryType = this.data.entryType

    // 只有主动创建、扫码和分享进入才记录个人中心
    if (
      entryType === 'create' ||
      entryType === 'share' ||
      entryType === 'scan'
    ) {
      const roomId = this.data.roomId
      const isHost = this.data.isHost

      // 构建用户档案数据
      const userProfile = {
        userId: userId,
        nickname: nickname,
        entryType: entryType, // 仅作为代码内部标记使用
        totalRooms: 1,
        hostRooms: isHost ? 1 : 0,
        joinRooms: isHost ? 0 : 1,
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
    wx.cloud
      .callFunction({
        name: 'userManager',
        data: {
          action: 'createOrUpdateUser',
          data: userProfile,
        },
      })
      .then((res) => {
        console.log('用户档案同步成功:', res)
      })
      .catch((err) => {
        console.error('用户档案同步失败:', err)
        // 失败不影响用户体验，数据已保存在本地
      })
  },

  // 更新玩家列表
  updatePlayersList() {
    const playersList = []
    const seats = this.data.seats

    // 遍历所有座位，收集玩家信息
    Object.keys(seats).forEach((seatKey) => {
      const seat = seats[seatKey]
      if (seat.isOccupied || seat.isHost) {
        playersList.push({
          userId: seat.userId || `seat_${seatKey}`,
          nickname: seat.playerName || seat.seatName,
          avatar: seat.avatar,
          seatName: seat.seatName,
          isHost: seat.isHost,
          seatKey: seatKey,
        })
      }
    })

    this.setData({
      playersList: playersList,
    })
  },

  // 踢出玩家
  onKickPlayer(e) {
    const { userId, nickname } = e.currentTarget.dataset

    wx.showModal({
      title: '确认踢出',
      content: `确定要踢出玩家"${nickname}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.kickPlayer(userId)
        }
      },
    })
  },

  // 执行踢出玩家
  kickPlayer(userId) {
    // 找到对应的座位
    const seats = this.data.seats
    let targetSeat = null

    Object.keys(seats).forEach((seatKey) => {
      if (seats[seatKey].userId === userId) {
        targetSeat = seatKey
      }
    })

    if (targetSeat) {
      // 清空座位
      this.setData({
        [`seats.${targetSeat}.playerName`]: '',
        [`seats.${targetSeat}.avatar`]: '',
        [`seats.${targetSeat}.userId`]: '',
        [`seats.${targetSeat}.isOccupied`]: false,
        [`seats.${targetSeat}.isHost`]: false,
      })

      // 更新玩家列表
      this.updatePlayersList()

      // 检查是否可以开始游戏
      this.checkCanStartGame()

      wx.showToast({
        title: '玩家已踢出',
        icon: 'success',
      })
    }
  },

  // 切换观战模式
  onToggleSpectator() {
    const isSpectator = !this.data.isSpectator

    this.setData({
      isSpectator: isSpectator,
    })

    if (isSpectator) {
      // 进入观战模式，清空当前座位
      const currentSeat = this.getCurrentUserSeat()
      if (currentSeat) {
        this.leaveSeat(currentSeat)
      }

      wx.showToast({
        title: '已进入观战模式',
        icon: 'success',
      })
    } else {
      wx.showToast({
        title: '已退出观战模式',
        icon: 'success',
      })
    }
  },

  // 获取当前用户座位
  getCurrentUserSeat() {
    const seats = this.data.seats
    const currentUserId = this.data.currentUserId

    for (let seatKey in seats) {
      if (seats[seatKey].userId === currentUserId) {
        return seatKey
      }
    }
    return null
  },

  // 离开座位
  leaveSeat(seatKey) {
    this.setData({
      [`seats.${seatKey}.playerName`]: '',
      [`seats.${seatKey}.avatar`]: '',
      [`seats.${seatKey}.userId`]: '',
      [`seats.${seatKey}.isOccupied`]: false,
      [`seats.${seatKey}.isHost`]: false,
    })

    this.updatePlayersList()
    this.checkCanStartGame()
  },

  // 处理规则选择
  onRuleChange(e) {
    const newRule = e.detail.value
    this.setData({
      rule: newRule,
    })

    wx.showToast({
      title: newRule === 'by-A' ? '已选择过A制' : '已选择把数制',
      icon: 'success',
      duration: 1500,
    })
  },

  // 显示把数选择弹窗
  onShowRoundsPicker() {
    this.setData({
      showRoundsPicker: true,
      tempMaxRounds: this.data.maxRounds,
    })
  },

  // 关闭把数选择弹窗
  onCloseRoundsPicker() {
    this.setData({
      showRoundsPicker: false,
      tempMaxRounds: this.data.maxRounds,
    })
  },

  // 选择把数
  onSelectRounds(e) {
    const value = parseInt(e.currentTarget.dataset.value)
    this.setData({
      tempMaxRounds: value,
    })
  },

  // 确认选择把数
  onConfirmRounds() {
    this.setData({
      maxRounds: this.data.tempMaxRounds,
      showRoundsPicker: false,
    })

    wx.showToast({
      title: `已设置为${this.data.tempMaxRounds}把`,
      icon: 'success',
      duration: 1500,
    })
  },
})
