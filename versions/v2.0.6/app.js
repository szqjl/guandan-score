App({
  globalData: {
    envInfo: {
      isTrial: false,
      isRelease: true,
      isDevelop: false,
      envVersion: 'unknown'
    },
    cloudEnv: 'cloud1-7g6djekx51d5a8fc' // 云开发环境ID
  },
  onLaunch() {
    console.log('掼蛋计分开始');

    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV, // 使用动态环境ID
        traceUser: true,
      });
      console.log('云开发初始化成功，使用动态环境ID');
    } else {
      console.error('云开发初始化失败：请确保基础库版本 >= 2.2.3 或已在开发者工具中开通云开发');
    }

    // 异步环境检测,不阻塞启动过程
    setTimeout(() => {
      try {
        const accountInfo = wx.getAccountInfoSync();
        if (accountInfo && accountInfo.miniprogram) {
          const envVersion = accountInfo.miniprogram.envVersion || 'unknown';
          this.globalData.envInfo = {
            isTrial: envVersion === 'trial',
            isRelease: envVersion === 'release',
            isDevelop: envVersion === 'develop',
            envVersion: envVersion
          };
        }
      } catch (error) {
        // 静默处理错误,不输出日志
      }
    }, 0);
  }
});