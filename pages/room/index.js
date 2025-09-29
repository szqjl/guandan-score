// pages/room/index.js
Page({
  data: {
    // 房间信息
    roomId: '',
    gameMode: 'guoA',
    gameModeText: '过A制',
    qrCodeUrl: '',

    // 玩家座位（按方向组织）
    seats: {
      north: { playerName: '北恋', avatar: '', isHost: false },
      east: { playerName: '旭日东升', avatar: '', isHost: false },
      west: { playerName: '西风斜阳', avatar: '', isHost: false },
      south: { playerName: '南尊', avatar: '', isHost: false },
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
  },

  onLoad(options) {
    const { roomId, isHost, hostSeat } = options

    this.setData({
      roomId: roomId || '123456',
      isHost: isHost === 'true',
      hostSeat: hostSeat || 'east',
    })

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
    // 确保所有座位都有玩家名称
    const seats = this.data.seats
    const updatedSeats = {
      ...seats,
      east: { ...seats.east, playerName: seats.east.playerName || '旭日东升' },
      west: { ...seats.west, playerName: seats.west.playerName || '西风斜阳' },
      south: { ...seats.south, playerName: seats.south.playerName || '南尊' },
      north: { ...seats.north, playerName: seats.north.playerName || '北恋' },
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

    // 如果座位已有玩家且不是房主，不允许点击
    if (seatData.playerName && !seatData.isHost) {
      return
    }

    // 如果点击的是房主座位，不允许更换
    if (seatData.isHost) {
      wx.showToast({
        title: '房主座位不可更换',
        icon: 'none',
      })
      return
    }

    // 显示座位选择弹窗
    this.showSeatSelectionModal(seat)
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
      north: '北座',
      east: '东座',
      south: '南座',
      west: '西座',
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

  // 分享房间
  onShareRoom() {
    return {
      title: `掼蛋比赛房间 ${this.data.roomId}`,
      path: `/pages/room/index?roomId=${this.data.roomId}`,
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
})
