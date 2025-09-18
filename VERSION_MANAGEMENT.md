# 掼蛋计分小程序 - 版本管理文档

## 项目概述
掼蛋计分小程序，支持过A制和把数制两种计分规则，包含历史记录功能。

## 远程仓库信息
- **GitHub仓库**: https://github.com/szqjl/guandan-score
- **克隆命令**: `git clone https://github.com/szqjl/guandan-score.git`
- **推送命令**: `git push origin master`
- **拉取命令**: `git pull origin master`

## 版本历史

### v1.0.4 - 远程仓库集成版本 (当前版本)
**提交哈希**: `da885e8`  
**日期**: 2024年当前日期  
**状态**: ✅ 最新版本

#### 主要功能
- ✅ 集成GitHub远程仓库
- ✅ 支持多设备代码同步
- ✅ 完整的版本控制功能
- ✅ 包含所有历史版本

#### 技术细节
- 远程仓库: https://github.com/szqjl/guandan-score
- 支持跨设备回退功能
- 自动备份到云端

#### 回退指令
```bash
# 回退到此版本
git reset --hard da885e8
```

---

### v1.0.3 - 表格宽度优化版本
**提交哈希**: `3eaa1e9`  
**日期**: 2024年当前日期  
**状态**: ✅ 稳定版本

#### 主要功能
- ✅ 蓝方数据显示修复
- ✅ 滚动条位置调整（在蓝方数据下方有适当间距）
- ✅ 表格与红方蓝方双上按钮对齐
- ✅ 表格宽度精确调整，不超出按钮范围
- ✅ 向左右各扩大8rpx，达到最佳显示效果

#### 技术细节
- 表格宽度: `calc(100% - 384rpx)`
- 最小宽度: 416rpx
- 最大宽度: 516rpx
- 可滚动容器最小宽度: 376rpx
- 可滚动容器最大宽度: 476rpx

#### 回退指令
```bash
# 回退到此版本
git reset --hard 3eaa1e9
```

---

### v1.0.2 - 代码清理版本
**提交哈希**: `2b80837`  
**状态**: 历史版本

#### 主要功能
- 删除未使用图片
- 清理调试信息
- 优化代码结构

#### 回退指令
```bash
git reset --hard 2b80837
```

---

### v1.0.1 - 基础功能版本
**提交哈希**: `0575a80`  
**状态**: 历史版本

#### 主要功能
- 完成扑克双上计分小程序开发
- 包含历史记录页面
- 智能提示系统
- 自定义Toast提示等功能

#### 回退指令
```bash
git reset --hard 0575a80
```

---

## 快速回退指南

### 在其他电脑上使用回退功能

#### 1. 克隆仓库到新电脑
```bash
git clone https://github.com/szqjl/guandan-score.git
cd guandan-score
```

#### 2. 回退到指定版本
```bash
# 回退到最新版本（推荐）
git reset --hard da885e8

# 回退到表格优化版本
git reset --hard 3eaa1e9

# 回退到代码清理版本
git reset --hard 2b80837

# 回退到基础功能版本
git reset --hard 0575a80
```

#### 3. 查看所有版本
```bash
git log --oneline
```

#### 4. 同步最新代码
```bash
git pull origin master
```

## 重要文件说明

### 核心文件
- `pages/index/index.wxss` - 主页样式（包含表格优化）
- `pages/index/index.js` - 主页逻辑
- `pages/index/index.wxml` - 主页结构
- `pages/history/index.*` - 历史记录页面

### 配置文件
- `app.json` - 小程序配置
- `project.config.json` - 项目配置
- `.gitignore` - Git忽略文件

## 开发注意事项

1. **每次重要修改后都要提交并推送**
   ```bash
   git add .
   git commit -m "描述修改内容"
   git push origin master
   ```

2. **创建功能分支进行开发**
   ```bash
   git checkout -b feature/新功能名称
   ```

3. **测试完成后合并到主分支并推送**
   ```bash
   git checkout master
   git merge feature/新功能名称
   git push origin master
   ```

4. **多设备开发时先拉取最新代码**
   ```bash
   git pull origin master
   ```

## 当前版本特点

- ✅ 表格显示完美，蓝方数据正常
- ✅ 滚动条位置正确
- ✅ 表格与按钮区域良好对齐
- ✅ 响应式布局，适配不同屏幕尺寸
- ✅ 代码结构清晰，易于维护
- ✅ 支持多设备同步开发
- ✅ 完整的版本控制功能
- ✅ 云端自动备份

## 多设备使用指南

### 在新电脑上开始开发
1. 克隆仓库：`git clone https://github.com/szqjl/guandan-score.git`
2. 进入目录：`cd guandan-score`
3. 开始开发

### 在现有电脑上同步最新代码
1. 拉取最新代码：`git pull origin master`
2. 继续开发

### 推送代码到云端
1. 提交更改：`git add . && git commit -m "描述"`
2. 推送到云端：`git push origin master`

---
**最后更新**: 2024年当前日期  
**维护者**: 开发团队  
**远程仓库**: https://github.com/szqjl/guandan-score
