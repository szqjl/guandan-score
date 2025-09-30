// 计分同步云函数 - 简化版本
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
  const { roomId, team, points, actionType = 'score', rule, maxRounds } = data

  console.log('updateScore 参数:', {
    roomId,
    team,
    points,
    actionType,
    operatorId,
  })

  // 获取或创建房间
  let room = await getOrCreateRoom(roomId, rule, maxRounds)

  // 更新比分逻辑
  let newScore = { ...room.currentScore }

  switch (actionType) {
    case 'score':
      if (team === 'red' || team === 'blue') {
        newScore[team] += points
        newScore[team + 'Level'] = calculateLevel(newScore[team])
      }
      break
    case 'level_up':
      if (team === 'red') {
        newScore.redAAttempts = (newScore.redAAttempts || 0) + 1
      } else if (team === 'blue') {
        newScore.blueAAttempts = (newScore.blueAAttempts || 0) + 1
      }
      break
    case 'reset':
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
    operatorName: '玩家',
  }

  // 更新房间数据
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
}

// 获取计分历史
async function getScoreHistory(data) {
  const { roomId } = data

  console.log('getScoreHistory 开始，房间ID:', roomId)

  try {
    // 获取或创建房间
    const room = await getOrCreateRoom(roomId)

    return {
      success: true,
      data: {
        scoreHistory: room.scoreHistory || [],
        currentScore: room.currentScore || {
          red: 0,
          blue: 0,
          redLevel: '2',
          blueLevel: '2',
          redAAttempts: 0,
          blueAAttempts: 0,
          rounds: 0,
          maxRounds: 10,
          rule: 'by-rounds',
        },
      },
    }
  } catch (error) {
    console.error('getScoreHistory 错误:', error)
    // 返回默认数据
    return {
      success: true,
      data: {
        scoreHistory: [],
        currentScore: {
          red: 0,
          blue: 0,
          redLevel: '2',
          blueLevel: '2',
          redAAttempts: 0,
          blueAAttempts: 0,
          rounds: 0,
          maxRounds: 10,
          rule: 'by-rounds',
        },
      },
    }
  }
}

// 重置比分
async function resetScore(data, operatorId) {
  const { roomId } = data

  // 获取或创建房间
  const room = await getOrCreateRoom(roomId)

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
    description: '比分已重置',
    timestamp: new Date(),
    operatorId: operatorId,
    operatorName: '玩家',
  }

  // 更新房间数据
  await db
    .collection('rooms')
    .doc(roomId)
    .update({
      data: {
        currentScore: resetScore,
        currentRound: 0,
        scoreHistory: [...(room.scoreHistory || []), resetRecord],
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

// 获取或创建房间
async function getOrCreateRoom(roomId, rule = 'by-rounds', maxRounds = 10) {
  // 先尝试查询房间
  try {
    const roomResult = await db.collection('rooms').doc(roomId).get()
    console.log('房间查询结果:', roomResult)

    if (roomResult.data) {
      console.log('房间存在，返回房间数据')
      return roomResult.data
    }
  } catch (queryError) {
    console.log('查询房间失败，可能是房间不存在:', queryError.message)
  }

  // 房间不存在或查询失败，尝试创建新房间
  console.log('尝试创建新房间:', roomId)
  const newRoom = {
    _id: roomId,
    createdAt: new Date(),
    currentScore: {
      red: 0,
      blue: 0,
      redLevel: '2',
      blueLevel: '2',
      redAAttempts: 0,
      blueAAttempts: 0,
      rounds: 0,
      maxRounds: maxRounds,
      rule: rule,
    },
    scoreHistory: [],
    lastUpdated: new Date(),
  }

  try {
    await db
      .collection('rooms')
      .doc(roomId)
      .set({
        data: {
          createdAt: new Date(),
          currentScore: {
            red: 0,
            blue: 0,
            redLevel: '2',
            blueLevel: '2',
            redAAttempts: 0,
            blueAAttempts: 0,
            rounds: 0,
            maxRounds: maxRounds,
            rule: rule,
          },
          scoreHistory: [],
          lastUpdated: new Date(),
        },
      })
    console.log('新房间创建成功')
    return newRoom
  } catch (createError) {
    console.error('创建房间失败:', createError.message)
    // 即使创建失败，也返回默认房间数据
    console.log('返回默认房间数据')
    return newRoom
  }
}

// 根据分数计算等级
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
