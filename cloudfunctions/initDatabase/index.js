// 数据库初始化云函数
// 功能：创建数据库集合和索引

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  console.log('开始初始化数据库...');

  try {
    // 创建集合
    await createCollections();
    
    // 创建索引
    await createIndexes();

    return {
      success: true,
      message: '数据库初始化完成'
    };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      message: '数据库初始化失败',
      error: error.message
    };
  }
};

// 创建数据库集合
async function createCollections() {
  const collections = ['rooms', 'users', 'game_records'];

  for (const collectionName of collections) {
    try {
      // 尝试创建集合（如果已存在会忽略）
      await db.createCollection(collectionName);
      console.log(`集合 ${collectionName} 创建成功`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`集合 ${collectionName} 已存在`);
      } else {
        console.error(`创建集合 ${collectionName} 失败:`, error);
      }
    }
  }
}

// 创建数据库索引
async function createIndexes() {
  try {
    // 为 rooms 集合创建索引
    await db.collection('rooms').createIndex({
      keys: {
        roomCode: 1
      },
      unique: true
    });
    console.log('rooms.roomCode 索引创建成功');

    await db.collection('rooms').createIndex({
      keys: {
        creatorId: 1
      }
    });
    console.log('rooms.creatorId 索引创建成功');

    await db.collection('rooms').createIndex({
      keys: {
        createdAt: -1
      }
    });
    console.log('rooms.createdAt 索引创建成功');

    // 为 users 集合创建索引
    await db.collection('users').createIndex({
      keys: {
        lastActiveAt: -1
      }
    });
    console.log('users.lastActiveAt 索引创建成功');

    // 为 game_records 集合创建索引
    await db.collection('game_records').createIndex({
      keys: {
        playerId: 1,
        createdAt: -1
      }
    });
    console.log('game_records.playerId+createdAt 索引创建成功');

    await db.collection('game_records').createIndex({
      keys: {
        roomId: 1
      }
    });
    console.log('game_records.roomId 索引创建成功');

  } catch (error) {
    console.error('创建索引失败:', error);
  }
}

