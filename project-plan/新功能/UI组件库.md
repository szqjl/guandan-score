# 掼蛋计分小程序 - UI组件库

## 📚 组件概览

### 基础组件
- `Button` - 按钮组件
- `Card` - 卡片组件  
- `Input` - 输入框组件
- `Modal` - 弹窗组件
- `Toast` - 提示组件

### 业务组件
- `RoomCard` - 房间卡片
- `PlayerSeat` - 玩家座位
- `ScoreDisplay` - 分数显示
- `GameButton` - 游戏按钮
- `HistoryTable` - 历史表格

## 🧩 基础组件

### Button 按钮组件

#### 属性
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

#### 样式
```css
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn--primary {
  background: var(--team-blue);
  color: var(--primary-text);
}

.btn--secondary {
  background: var(--background);
  color: var(--text-primary);
  border: 1rpx solid var(--border);
}

.btn--danger {
  background: var(--error);
  color: var(--primary-text);
}

.btn--success {
  background: var(--success);
  color: var(--primary-text);
}
```

### Card 卡片组件

#### 属性
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

### Input 输入框组件

#### 属性
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

## 🎮 业务组件

### RoomCard 房间卡片组件

#### 功能
- 显示房间基本信息
- 显示玩家加入状态
- 支持房间操作

#### 属性
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

#### 功能
- 显示玩家信息
- 支持玩家替换
- 显示座位状态

#### 属性
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

#### 功能
- 显示队伍分数
- 支持分数动画
- 显示胜利状态

#### 属性
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

#### 功能
- 计分按钮
- 支持不同分值
- 按钮状态管理

#### 属性
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

## 📱 页面组件

### RoomCreatePage 房间创建页面

#### 布局结构
```
┌─────────────────────────────────────────┐
│ 品牌标识 + 返回按钮                      │
├─────────────────────────────────────────┤
│ 房间信息卡片                            │
│ - 房间号显示                            │
│ - 二维码展示                            │
├─────────────────────────────────────────┤
│ 玩家座位区域                            │
│ [座位1] [座位2]                         │
│ [座位3] [座位4]                         │
├─────────────────────────────────────────┤
│ 操作按钮区域                            │
│ [开始游戏] [设置] [离开房间]             │
└─────────────────────────────────────────┘
```

### RoomJoinPage 房间加入页面

#### 布局结构
```
┌─────────────────────────────────────────┐
│ 品牌标识 + 返回按钮                      │
├─────────────────────────────────────────┤
│ 扫码区域                                │
│ - 相机预览                              │
│ - 扫码提示                              │
├─────────────────────────────────────────┤
│ 手动输入区域                            │
│ - 房间号输入                            │
│ - 加入按钮                              │
└─────────────────────────────────────────┘
```

### GameMultiPage 多人游戏页面

#### 布局结构
```
┌─────────────────────────────────────────┐
│ 品牌标识 + 房间信息                      │
├─────────────────────────────────────────┤
│ 左侧导航 │ 把数显示 │ 红蓝双方 │ 右侧控制 │
│ 📊📈💬⚙️  │   VS    │ 东西方   │ 开始游戏 │
│          │         │ 南北方   │ 规则选择 │
│          │         │          │ 结束按钮 │
├─────────────────────────────────────────┤
│ 历史比分表格（可滚动）                   │
└─────────────────────────────────────────┘
```

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

## 📝 使用指南

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

**组件库版本**: v1.0  
**最后更新**: 2025-09-28  
**维护者**: Maius (前端开发助手)


