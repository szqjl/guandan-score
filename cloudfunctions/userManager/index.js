// 用户管理云函数
// 功能：用户信息管理、统计数据更新、历史记录查询

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { action, data } = event;
  const { OPENID } = cloud.getWXContext();

  console.log('用户管理云函数调用:', { action, data, OPENID });

  try {
    switch (action) {
      case 'getUserProfile':
        return await getUserProfile(OPENID);
      case 'updateUserStats':
        return await updateUserStats(data, OPENID);
      case 'getUserHistory':
        return await getUserHistory(data, OPENID);
      case 'createUser':
        return await createUser(data, OPENID);
      default:
        return {
          success: false,
          message: '未知的操作类型'
        };
    }
  } catch (error) {
    console.error('用户管理云函数错误:', error);
    return {
      success: false,
      message: '服务器错误',
      error: error.message
    };
  }
};

// 获取用户信息
async function getUserProfile(openid) {
  try {
    const userResult = await db.collection('users').doc(openid).get();
    
    if (userResult.data) {
      // 用户存在，返回用户信息
      return {
        success: true,
        data: userResult.data
      };
    } else {
      // 用户不存在，返回空数据
      return {
        success: true,
        data: null,
        message: '用户不存在，需要创建'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '获取用户信息失败',
      error: error.message
    };
  }
}

// 创建用户
async function createUser(data, openid) {
  const { nickName, avatar } = data;
  
  console.log('创建用户参数:', { nickName, avatar, openid });

  // 检查用户是否已存在
  try {
    const existingUser = await db.collection('users').doc(openid).get();
    console.log('检查现有用户:', existingUser);
    
    if (existingUser.data) {
      console.log('用户已存在，更新用户信息');
      
      // 更新用户信息（特别是头像）
      const updatedData = {
        nickName: nickName || existingUser.data.nickName,
        avatar: avatar || existingUser.data.avatar,
        updatedAt: new Date()
      };
      
      await db.collection('users').doc(openid).update({
        data: updatedData
      });
      
      return {
        success: true,
        message: '用户信息已更新',
        data: {
          ...existingUser.data,
          ...updatedData,
          _openid: openid
        }
      };
    }
  } catch (error) {
    console.log('检查用户时出错，继续创建:', error);
  }

  // 创建新用户
  const userData = {
    _openid: openid,
    nickName: nickName || '玩家',
    avatar: avatar || '',
    totalGames: 0,
    winGames: 0,
    totalScore: 0,
    avgScore: 0,
    mvpCount: 0,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    console.log('准备创建用户数据:', userData);
    const result = await db.collection('users').doc(openid).set({
      data: userData
    });
    console.log('用户创建结果:', result);

    return {
      success: true,
      message: '用户创建成功',
      data: userData
    };
  } catch (error) {
    console.error('用户创建失败:', error);
    return {
      success: false,
      message: '用户创建失败',
      error: error.message,
      details: error
    };
  }
}

// 更新用户统计数据
async function updateUserStats(data, openid) {
  const { gameResult } = data; // { isWin, score, isMVP, gameDuration }

  try {
    // 获取用户当前数据
    const userResult = await db.collection('users').doc(openid).get();
    let userData = userResult.data;

    if (!userData) {
      // 如果用户不存在，先创建
      userData = {
        _openid: openid,
        nickName: '玩家',
        avatar: '',
        totalGames: 0,
        winGames: 0,
        totalScore: 0,
        avgScore: 0,
        mvpCount: 0,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // 更新统计数据
    userData.totalGames += 1;
    userData.totalScore += gameResult.score || 0;
    userData.avgScore = userData.totalScore / userData.totalGames;
    userData.lastActiveAt = new Date();
    userData.updatedAt = new Date();

    if (gameResult.isWin) {
      userData.winGames += 1;
    }

    if (gameResult.isMVP) {
      userData.mvpCount += 1;
    }

    // 保存更新后的数据
    await db.collection('users').doc(openid).set({
      data: userData
    });

    return {
      success: true,
      message: '用户统计更新成功',
      data: userData
    };
  } catch (error) {
    return {
      success: false,
      message: '用户统计更新失败',
      error: error.message
    };
  }
}

// 获取用户历史记录
async function getUserHistory(data, openid) {
  const { limit = 20, offset = 0 } = data;

  try {
    // 查询用户参与的游戏记录
    const historyResult = await db.collection('game_records')
      .where({
        playerId: openid
      })
      .orderBy('createdAt', 'desc')
      .skip(offset)
      .limit(limit)
      .get();

    // 计算统计数据
    const userResult = await db.collection('users').doc(openid).get();
    const userStats = userResult.data || {};

    return {
      success: true,
      data: {
        records: historyResult.data,
        stats: {
          totalGames: userStats.totalGames || 0,
          winGames: userStats.winGames || 0,
          winRate: userStats.totalGames > 0 ? (userStats.winGames / userStats.totalGames * 100).toFixed(1) : 0,
          avgScore: userStats.avgScore || 0,
          mvpCount: userStats.mvpCount || 0
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: '获取历史记录失败',
      error: error.message
    };
  }
}

