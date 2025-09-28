# 掼蛋计分小程序 - UI设计规范

## 📋 设计原则

### 核心原则
- **简约实用**：去除冗余装饰，专注功能实现
- **一致性**：保持视觉和交互的统一性
- **渐进性**：从单机版平滑升级到多人版
- **兼容性**：确保现有功能完全保留

## 🎨 视觉规范

### 色彩体系
```css
/* 主色调 */
--primary-bg: #0B1557;        /* 深蓝背景 */
--primary-text: #FFFFFF;      /* 白色文字 */

/* 队伍色彩 */
--team-red: #FF4444;          /* 红方/东西方 */
--team-blue: #4488FF;         /* 蓝方/南北方 */
--team-green: #4CAF50;        /* 表头/成功状态 */

/* 功能色彩 */
--success: #4CAF50;           /* 成功/确认 */
--warning: #FF9800;           /* 警告/体验版 */
--error: #F44336;             /* 错误/危险 */
--info: #2196F3;              /* 信息/提示 */

/* 中性色彩 */
--text-primary: #333333;      /* 主要文字 */
--text-secondary: #666666;    /* 次要文字 */
--text-disabled: #CCCCCC;     /* 禁用文字 */
--border: #E0E0E0;            /* 边框 */
--background: #F8F8F8;        /* 背景 */
```

### 字体规范
```css
/* 字体族 */
font-family: 'Source Han Sans', 'Noto Sans CJK SC', 'PingFang SC', 
             'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', 
             Helvetica, Arial, sans-serif;

/* 字体大小 */
--font-xs: 12rpx;    /* 小号文字 */
--font-sm: 14rpx;    /* 标准文字 */
--font-md: 16rpx;    /* 中等文字 */
--font-lg: 18rpx;    /* 大号文字 */
--font-xl: 20rpx;    /* 标题文字 */
--font-xxl: 24rpx;   /* 大标题 */
--font-score: 60rpx; /* 分数显示 */
```

### 间距规范
```css
/* 间距系统 */
--space-xs: 4rpx;    /* 最小间距 */
--space-sm: 8rpx;    /* 小间距 */
--space-md: 12rpx;   /* 中等间距 */
--space-lg: 16rpx;   /* 大间距 */
--space-xl: 20rpx;   /* 超大间距 */
--space-xxl: 24rpx;  /* 最大间距 */
```

### 圆角规范
```css
/* 圆角系统 */
--radius-sm: 4rpx;   /* 小圆角 */
--radius-md: 6rpx;   /* 中等圆角 */
--radius-lg: 8rpx;   /* 大圆角 */
--radius-xl: 12rpx;  /* 超大圆角 */
--radius-round: 50%; /* 圆形 */
```

## 🧩 组件规范

### 按钮组件
```css
/* 主要按钮 */
.btn-primary {
  background: var(--team-blue);
  color: var(--primary-text);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
  font-weight: 500;
}

/* 次要按钮 */
.btn-secondary {
  background: var(--background);
  color: var(--text-primary);
  border: 1rpx solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
}

/* 危险按钮 */
.btn-danger {
  background: var(--error);
  color: var(--primary-text);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
}
```

### 卡片组件
```css
.card {
  background: var(--primary-text);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid var(--border);
}
```

### 输入框组件
```css
.input {
  background: var(--primary-text);
  border: 1rpx solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
  color: var(--text-primary);
}
```

## 📱 布局规范

### 页面结构
```
┌─────────────────────────────────────────┐
│ 品牌标识 + 环境标识 (固定顶部)            │
├─────────────────────────────────────────┤
│ 左侧导航 │ 主要内容区 │ 右侧控制面板      │
│ (固定)   │ (自适应)  │ (固定)           │
├─────────────────────────────────────────┤
│ 底部内容区 (可滚动)                      │
└─────────────────────────────────────────┘
```

### 响应式断点
```css
/* 横屏模式 (主要) */
@media screen and (orientation: landscape) {
  .container {
    flex-direction: row;
  }
}

/* 竖屏模式 (兼容) */
@media screen and (orientation: portrait) {
  .container {
    flex-direction: column;
  }
}
```

## 🎯 交互规范

### 动画效果
```css
/* 标准过渡 */
.transition {
  transition: all 0.3s ease;
}

/* 按钮点击 */
.btn:active {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 页面切换 */
.page-enter {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 状态反馈
- **成功**：绿色 + 成功图标
- **警告**：橙色 + 警告图标  
- **错误**：红色 + 错误图标
- **加载**：旋转动画 + 加载文字

## 📋 命名规范

### CSS类命名
```css
/* BEM命名法 */
.block__element--modifier

/* 示例 */
.room-card__header--active
.player-seat__avatar--empty
.score-display__number--large
```

### 组件命名
- `RoomCard` - 房间卡片
- `PlayerSeat` - 玩家座位
- `ScoreDisplay` - 分数显示
- `GameButton` - 游戏按钮

## 🔧 开发规范

### 文件结构
```
pages/
├── index/           # 主页
├── room-create/     # 房间创建
├── room-join/       # 房间加入
├── game-multi/      # 多人游戏
└── profile/         # 个人中心

components/
├── room-card/       # 房间卡片组件
├── player-seat/     # 玩家座位组件
├── score-display/   # 分数显示组件
└── game-button/     # 游戏按钮组件
```

### 数据流规范
```javascript
// 页面数据
data: {
  // 房间相关
  roomInfo: {},
  players: [],
  
  // 游戏相关  
  gameState: {},
  scores: {},
  
  // UI状态
  loading: false,
  error: null
}
```

## 📝 更新记录

- **2025-09-28**: 初始版本，基于现有单机版设计规范
- **待更新**: 多人功能相关规范补充

---

**设计规范版本**: v1.0  
**最后更新**: 2025-09-28  
**维护者**: Maius (前端开发助手)


