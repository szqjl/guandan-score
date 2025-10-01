# 掼蛋计分小程序 - UI设计规范与组件库

**版本**：v1.0  
**最后更新**：2025-10-01  
**维护者**：开发团队

---

## 📋 设计原则

### 核心原则
- **简约实用**：去除冗余装饰，专注功能实现
- **一致性**：保持视觉和交互的统一性
- **渐进性**：从单机版平滑升级到多人版
- **兼容性**：确保现有功能完全保留

---

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

---

## 🧩 组件规范

### 按钮组件

#### 样式规范
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

#### 属性定义
```javascript
{
  type: 'primary' | 'secondary' | 'danger' | 'success',
  size: 'small' | 'medium' | 'large',
  disabled: Boolean,
  loading: Boolean,
  text: String
}
```

#### 使用示例
```xml
<Button 
  type="primary" 
  size="medium"
  text="创建房间"
  bindtap="onCreateRoom"
/>
```

### 卡片组件

#### 样式规范
```css
.card {
  background: var(--primary-text);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid var(--border);
}
```

#### 属性定义
```javascript
{
  title: String,
  subtitle: String,
  padding: String,
  shadow: Boolean
}
```

#### 使用示例
```xml
<Card 
  title="房间信息"
  subtitle="等待玩家加入"
  padding="20rpx"
  shadow="{{true}}"
>
  <view>房间内容</view>
</Card>
```

### 输入框组件

#### 样式规范
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

#### 属性定义
```javascript
{
  placeholder: String,
  value: String,
  type: 'text' | 'number',
  maxlength: Number,
  disabled: Boolean
}
```

#### 使用示例
```xml
<Input 
  placeholder="请输入玩家昵称"
  value="{{playerName}}"
  type="text"
  maxlength="10"
  bindinput="onNameInput"
/>
```

---

## 🎮 业务组件库

### RoomCard 房间卡片组件

#### 功能说明
- 显示房间基本信息
- 显示玩家加入状态
- 支持房间操作

#### 属性定义
```javascript
{
  roomId: String,
  roomName: String,
  playerCount: Number,
  maxPlayers: Number,
  gameMode: String,
  status: 'waiting' | 'playing' | 'finished'
}
```

#### 使用示例
```xml
<RoomCard 
  roomId="{{room.id}}"
  roomName="{{room.name}}"
  playerCount="{{room.players.length}}"
  maxPlayers="4"
  gameMode="{{room.mode}}"
  status="{{room.status}}"
  bindjoin="onJoinRoom"
  bindleave="onLeaveRoom"
/>
```

### PlayerSeat 玩家座位组件

#### 功能说明
- 显示玩家信息
- 支持玩家替换
- 显示座位状态

#### 属性定义
```javascript
{
  seatIndex: Number,
  player: Object | null,
  isHost: Boolean,
  canReplace: Boolean
}
```

#### 使用示例
```xml
<PlayerSeat 
  seatIndex="{{index}}"
  player="{{seat.player}}"
  isHost="{{seat.isHost}}"
  canReplace="{{seat.canReplace}}"
  bindreplace="onReplacePlayer"
/>
```

### ScoreDisplay 分数显示组件

#### 功能说明
- 显示队伍分数
- 支持分数动画
- 显示胜利状态

#### 属性定义
```javascript
{
  team: 'red' | 'blue',
  score: String,
  level: String,
  isWinner: Boolean,
  showAnimation: Boolean
}
```

#### 使用示例
```xml
<ScoreDisplay 
  team="red"
  score="{{redScore}}"
  level="{{redLevel}}"
  isWinner="{{redWins}}"
  showAnimation="{{true}}"
/>
```

### GameButton 游戏按钮组件

#### 功能说明
- 计分按钮
- 支持不同分值
- 按钮状态管理

#### 属性定义
```javascript
{
  team: 'red' | 'blue',
  value: Number,
  disabled: Boolean,
  showIcon: Boolean
}
```

#### 使用示例
```xml
<GameButton 
  team="red"
  value="3"
  disabled="{{!gameStarted}}"
  showIcon="{{true}}"
  bindtap="onScoreUpgrade"
/>
```

---

## 📱 页面结构规划

### 当前页面层级
```
pages/
├── index/              # 主页
├── launch/             # 启动页
├── room/               # 房间页
├── join/               # 加入页
├── history/            # 历史记录
└── team-setting/       # 队伍设置
```

### 页面导航流程
```
启动页(launch) → 主页(index)
                    ↓
         创建房间 → 房间页(room)
                    ↓
                 加入页(join) → 房间页(room)
                    ↓
               历史记录(history)
                    ↓
               队伍设置(team-setting)
```

### 页面布局规范

#### 横屏模式（主要）
```css
@media screen and (orientation: landscape) {
  .container {
    flex-direction: row;
  }
  
  .players-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
```

#### 竖屏模式（兼容）
```css
@media screen and (orientation: portrait) {
  .container {
    flex-direction: column;
  }
  
  .players-area {
    display: flex;
    flex-direction: column;
  }
}
```

---

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

---

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

---

## 🔧 组件开发规范

### 组件结构
```
components/
├── component-name/
│   ├── index.js      # 组件逻辑
│   ├── index.wxml    # 组件模板
│   ├── index.wxss    # 组件样式
│   └── index.json    # 组件配置
```

### 组件命名
- 使用PascalCase命名
- 名称要有意义，体现功能
- 避免缩写，使用完整单词

### 组件属性
- 使用camelCase命名
- 提供默认值
- 添加类型注释

### 组件事件
- 使用bind前缀
- 事件名要清晰明确
- 传递必要的数据

---

## 📚 组件使用指南

### 1. 引入组件
```json
{
  "usingComponents": {
    "Button": "/components/button/index",
    "RoomCard": "/components/room-card/index",
    "PlayerSeat": "/components/player-seat/index"
  }
}
```

### 2. 使用组件
```xml
<view class="page">
  <Button type="primary" text="创建房间" bindtap="onCreateRoom" />
  <RoomCard roomId="{{roomId}}" bindjoin="onJoinRoom" />
</view>
```

### 3. 处理事件
```javascript
Page({
  onCreateRoom() {
    // 创建房间逻辑
  },
  
  onJoinRoom(e) {
    const roomId = e.detail.roomId;
    // 加入房间逻辑
  }
});
```

---

## 📋 待开发组件

### 高优先级
- [ ] `QRCode` - 二维码生成组件
- [ ] `PlayerList` - 玩家列表组件
- [ ] `GameHistory` - 游戏历史组件

### 中优先级
- [ ] `Settings` - 设置组件
- [ ] `Profile` - 个人资料组件
- [ ] `Statistics` - 统计组件

### 低优先级
- [ ] `Animation` - 动画组件
- [ ] `Chart` - 图表组件
- [ ] `Calendar` - 日历组件

---

## 📝 更新记录

- **2025-09-28**: 初始版本，基于现有单机版设计规范
- **2025-10-01**: 合并UI组件库、UI设计规范、页面结构规划文档

