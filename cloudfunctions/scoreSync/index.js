// 计分同步云函数
// 功能：实时同步计分、更新比分、记录历史

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  const { OPENID } = cloud.getWXContext()

  console.log('计分同步云函数调用:', { action, data, OPENID })

  try {
    switch (action) {
      case 'updateScore':
        return await updateScore(data, OPENID)
      case 'getScoreHistory':
        return await getScoreHistory(data)
      case 'resetScore':
        return await resetScore(data, OPENID)
      default:
        return {
          success: false,
          message: '未知的操作类型',
        }
    }
  } catch (error) {
    console.error('计分同步云函数错误:', error)
    return {
      success: false,
      message: '服务器错误',
      error: error.message,
    }
  }
}

// 更新比分
async function updateScore(data, operatorId) {
  const { roomId, team, points, actionType = 'score' } = data

  console.log('updateScore 参数:', {
    roomId,
    team,
    points,
    actionType,
    operatorId,
  })

  // 获取房间信息
  const roomResult = await db.collection('rooms').doc(roomId).get()
  console.log('房间查询结果:', roomResult)

  if (!roomResult.data) {
    return {
      success: false,
      message: '房间不存在',
    }
  }

  const room = roomResult.data
  console.log('房间数据:', room)

  // 简化权限验证 - 暂时允许所有用户操作
  // TODO: 后续可以添加更严格的权限控制

  // 初始化比分数据（如果不存在）
  if (!room.currentScore) {
    room.currentScore = {
      red: 0,
      blue: 0,
      redLevel: '3',
      blueLevel: '3',
      redAAttempts: 0,
      blueAAttempts: 0,
    }
  }

  if (!room.scoreHistory) {
    room.scoreHistory = []
  }

  // 更新比分逻辑
  let newScore = { ...room.currentScore }

  switch (actionType) {
    case 'score':
      // 加分操作
      if (team === 'red' || team === 'blue') {
        newScore[team] += points
        // 根据分数计算等级
        newScore[team + 'Level'] = calculateLevel(newScore[team])
      }
      break

    case 'level_up':
      // 升级操作（如打过A）
      if (team === 'red') {
        newScore.redAAttempts = (newScore.redAAttempts || 0) + 1
      } else if (team === 'blue') {
        newScore.blueAAttempts = (newScore.blueAAttempts || 0) + 1
      }
      break

    case 'reset':
      // 重置比分
      newScore = {
        red: 0,
        blue: 0,
        redLevel: '3',
        blueLevel: '3',
        redAAttempts: 0,
        blueAAttempts: 0,
      }
      break
  }

  // 创建计分历史记录
  const scoreRecord = {
    round: room.currentRound || 1,
    action: actionType,
    team: team,
    points: points || 0,
    newScore: newScore,
    description: generateDescription(actionType, team, points),
    timestamp: new Date(),
    operatorId: operatorId,
    operatorName: '玩家', // 简化处理，暂时使用固定名称
  }

  // 更新房间数据
  try {
    await db
      .collection('rooms')
      .doc(roomId)
      .update({
        data: {
          currentScore: newScore,
          scoreHistory: [...(room.scoreHistory || []), scoreRecord],
          updatedAt: new Date(),
        },
      })

    console.log('房间数据更新成功')

    return {
      success: true,
      message: '比分更新成功',
      data: {
        newScore: newScore,
        scoreRecord: scoreRecord,
      },
    }
  } catch (updateError) {
    console.error('数据库更新失败:', updateError)
    return {
      success: false,
      message: '数据库更新失败',
      error: updateError.message,
    }
  }
}

// 获取计分历史
async function getScoreHistory(data) {
  const { roomId } = data

  const roomResult = await db.collection('rooms').doc(roomId).get()
  if (!roomResult.data) {
    return {
      success: false,
      message: '房间不存在',
    }
  }

  return {
    success: true,
    data: {
      scoreHistory: roomResult.data.scoreHistory,
      currentScore: roomResult.data.currentScore,
    },
  }
}

// 重置比分
async function resetScore(data, operatorId) {
  const { roomId } = data

  // 获取房间信息
  const roomResult = await db.collection('rooms').doc(roomId).get()
  if (!roomResult.data) {
    return {
      success: false,
      message: '房间不存在',
    }
  }

  const room = roomResult.data

  // 验证操作者权限（检查是否为房主）
  const isOwner = room.players.find(
    (p) => p.playerId === operatorId && p.isOwner
  )
  if (!isOwner) {
    return {
      success: false,
      message: '只有房主可以重置比分',
    }
  }

  // 重置比分
  const resetScore = {
    red: 0,
    blue: 0,
    redLevel: '3',
    blueLevel: '3',
    redAAttempts: 0,
    blueAAttempts: 0,
  }

  // 创建重置记录
  const resetRecord = {
    round: 0,
    action: 'reset',
    team: 'all',
    points: 0,
    newScore: resetScore,
    newLevel: resetScore,
    description: '比分已重置',
    timestamp: new Date(),
    operatorId: operatorId,
    operatorName: isOwner.playerName,
  }

  // 更新房间数据
  await db
    .collection('rooms')
    .doc(roomId)
    .update({
      data: {
        currentScore: resetScore,
        currentRound: 0,
        scoreHistory: [...room.scoreHistory, resetRecord],
        updatedAt: new Date(),
      },
    })

  return {
    success: true,
    message: '比分重置成功',
    data: {
      newScore: resetScore,
    },
  }
}

// 根据分数计算等级（简化版掼蛋规则）
function calculateLevel(score) {
  if (score >= 100) return 'A²'
  if (score >= 80) return 'A¹'
  if (score >= 60) return 'A'
  if (score >= 40) return 'K'
  if (score >= 20) return 'Q'
  if (score >= 10) return 'J'
  if (score >= 5) return '10'
  if (score >= 2) return '5'
  return '3'
}

// 生成操作描述
function generateDescription(actionType, team, points) {
  const teamName = team === 'red' ? '红队' : '蓝队'

  switch (actionType) {
    case 'score':
      return `${teamName}得分+${points}`
    case 'level_up':
      return `${teamName}升级`
    case 'reset':
      return '比分重置'
    default:
      return `${teamName}操作`
  }
}
