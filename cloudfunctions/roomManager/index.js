// 房间管理云函数
// 功能：创建房间、加入房间、更新玩家信息、离开房间

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  const { OPENID } = cloud.getWXContext()

  console.log('房间管理云函数调用:', { action, data, OPENID })

  try {
    switch (action) {
      case 'createRoom':
        return await createRoom(data, OPENID)
      case 'joinRoom':
        return await joinRoom(data, OPENID)
      case 'updatePlayerName':
        return await updatePlayerName(data, OPENID)
      case 'leaveRoom':
        return await leaveRoom(data, OPENID)
      case 'getRoomInfo':
        return await getRoomInfo(data)
      default:
        return {
          success: false,
          message: '未知的操作类型',
        }
    }
  } catch (error) {
    console.error('房间管理云函数错误:', error)
    return {
      success: false,
      message: '服务器错误',
      error: error.message,
    }
  }
}

// 创建房间
async function createRoom(data, openid) {
  const { roomName, hostName, gameMode, defaultPlayerNames } = data

  // 生成6位房间号
  const roomId = generateRoomId()

  // 创建房间数据
  const roomData = {
    roomId: roomId,
    roomName: roomName || `房间${roomId}`,
    hostId: openid,
    hostName: hostName || '房主',
    gameMode: gameMode || 'guoA',
    status: 'waiting', // waiting, playing, finished
    players: [
      {
        playerId: openid,
        playerName: hostName || '房主',
        seat: 'east',
        isHost: true,
        isOnline: true,
        joinedAt: new Date(),
      },
    ],
    seats: {
      east: {
        playerName: defaultPlayerNames?.east || '旭日东升',
        playerId: openid,
        isHost: true,
      },
      west: {
        playerName: defaultPlayerNames?.west || '西风斜阳',
        playerId: null,
        isHost: false,
      },
      south: {
        playerName: defaultPlayerNames?.south || '南尊',
        playerId: null,
        isHost: false,
      },
      north: {
        playerName: defaultPlayerNames?.north || '北恋',
        playerId: null,
        isHost: false,
      },
    },
    currentScore: {
      red: 0,
      blue: 0,
      redLevel: '3',
      blueLevel: '3',
      redAAttempts: 0,
      blueAAttempts: 0,
    },
    currentRound: 0,
    scoreHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    // 尝试创建集合（如果不存在）
    try {
      await db.createCollection('rooms')
    } catch (error) {
      // 集合已存在或创建失败，继续执行
      console.log('rooms集合已存在或创建失败:', error.message)
    }

    await db.collection('rooms').doc(roomId).set({
      data: roomData,
    })

    return {
      success: true,
      message: '房间创建成功',
      data: {
        roomId: roomId,
        roomName: roomData.roomName,
        hostName: roomData.hostName,
        gameMode: roomData.gameMode,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: '房间创建失败',
      error: error.message,
    }
  }
}

// 加入房间
async function joinRoom(data, openid) {
  const { roomId, playerName } = data

  try {
    // 获取房间信息
    const roomResult = await db.collection('rooms').doc(roomId).get()
    if (!roomResult.data) {
      return {
        success: false,
        message: '房间不存在',
      }
    }

    const room = roomResult.data

    // 检查房间状态
    if (room.status !== 'waiting') {
      return {
        success: false,
        message: '房间已开始游戏，无法加入',
      }
    }

    // 检查是否已在房间中
    const existingPlayer = room.players.find((p) => p.playerId === openid)
    if (existingPlayer) {
      return {
        success: true,
        message: '已在房间中',
        data: {
          roomId: roomId,
          roomName: room.roomName,
          playerName: existingPlayer.playerName,
          seat: existingPlayer.seat,
        },
      }
    }

    // 查找空座位
    const availableSeats = Object.keys(room.seats).filter(
      (seat) => !room.seats[seat].playerId
    )
    if (availableSeats.length === 0) {
      return {
        success: false,
        message: '房间已满',
      }
    }

    // 分配座位
    const assignedSeat = availableSeats[0]

    // 更新房间数据
    const updatedRoom = {
      ...room,
      players: [
        ...room.players,
        {
          playerId: openid,
          playerName: playerName || '玩家',
          seat: assignedSeat,
          isHost: false,
          isOnline: true,
          joinedAt: new Date(),
        },
      ],
      seats: {
        ...room.seats,
        [assignedSeat]: {
          ...room.seats[assignedSeat],
          playerId: openid,
          playerName: playerName || '玩家',
        },
      },
      updatedAt: new Date(),
    }

    await db.collection('rooms').doc(roomId).update({
      data: updatedRoom,
    })

    return {
      success: true,
      message: '加入房间成功',
      data: {
        roomId: roomId,
        roomName: room.roomName,
        playerName: playerName || '玩家',
        seat: assignedSeat,
        gameMode: room.gameMode,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: '加入房间失败',
      error: error.message,
    }
  }
}

// 更新玩家昵称
async function updatePlayerName(data, openid) {
  const { roomId, seat, playerName } = data

  try {
    // 获取房间信息
    const roomResult = await db.collection('rooms').doc(roomId).get()
    if (!roomResult.data) {
      return {
        success: false,
        message: '房间不存在',
      }
    }

    const room = roomResult.data

    // 验证权限（只有房主或该座位的玩家可以修改）
    const isHost = room.hostId === openid
    const isSeatOwner = room.seats[seat]?.playerId === openid

    if (!isHost && !isSeatOwner) {
      return {
        success: false,
        message: '无权限修改该座位昵称',
      }
    }

    // 更新座位信息
    const updatedSeats = {
      ...room.seats,
      [seat]: {
        ...room.seats[seat],
        playerName: playerName,
      },
    }

    // 更新玩家列表
    const updatedPlayers = room.players.map((player) => {
      if (player.seat === seat) {
        return { ...player, playerName: playerName }
      }
      return player
    })

    await db
      .collection('rooms')
      .doc(roomId)
      .update({
        data: {
          seats: updatedSeats,
          players: updatedPlayers,
          updatedAt: new Date(),
        },
      })

    return {
      success: true,
      message: '昵称更新成功',
      data: {
        seat: seat,
        playerName: playerName,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: '昵称更新失败',
      error: error.message,
    }
  }
}

// 离开房间
async function leaveRoom(data, openid) {
  const { roomId } = data

  try {
    // 获取房间信息
    const roomResult = await db.collection('rooms').doc(roomId).get()
    if (!roomResult.data) {
      return {
        success: false,
        message: '房间不存在',
      }
    }

    const room = roomResult.data

    // 检查是否为房主
    if (room.hostId === openid) {
      // 房主离开，解散房间
      await db.collection('rooms').doc(roomId).remove()
      return {
        success: true,
        message: '房间已解散',
      }
    }

    // 普通玩家离开
    const player = room.players.find((p) => p.playerId === openid)
    if (!player) {
      return {
        success: false,
        message: '您不在该房间中',
      }
    }

    // 更新房间数据
    const updatedPlayers = room.players.filter((p) => p.playerId !== openid)
    const updatedSeats = {
      ...room.seats,
      [player.seat]: {
        ...room.seats[player.seat],
        playerId: null,
        playerName: room.seats[player.seat].playerName,
      },
    }

    await db
      .collection('rooms')
      .doc(roomId)
      .update({
        data: {
          players: updatedPlayers,
          seats: updatedSeats,
          updatedAt: new Date(),
        },
      })

    return {
      success: true,
      message: '已离开房间',
    }
  } catch (error) {
    return {
      success: false,
      message: '离开房间失败',
      error: error.message,
    }
  }
}

// 获取房间信息
async function getRoomInfo(data) {
  const { roomId } = data

  try {
    const roomResult = await db.collection('rooms').doc(roomId).get()
    if (!roomResult.data) {
      return {
        success: false,
        message: '房间不存在',
      }
    }

    return {
      success: true,
      data: roomResult.data,
    }
  } catch (error) {
    return {
      success: false,
      message: '获取房间信息失败',
      error: error.message,
    }
  }
}

// 生成6位房间号
function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
