App({
  globalData: {
    envInfo: {
      isTrial: false,
      isRelease: true,
      isDevelop: false,
      envVersion: 'unknown'
    }
  },
  onLaunch() {
    console.log('掼蛋计分开始');

    // 异步环境检测，不阻塞启动过程
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
        // 静默处理错误，不输出日志
      }
    }, 0);
  }
});