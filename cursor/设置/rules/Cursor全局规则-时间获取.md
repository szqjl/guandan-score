# Cursor全局规则 - 时间获取

## 📋 规则概述
本文档定义了在Cursor开发环境中获取当前时间的全局规则和最佳实践，适用于所有项目开发场景。

## 🎯 应用场景
- 📝 记录操作时间和操作历史
- 🏷️ 版本标记和时间戳生成
- 📊 日志记录和调试信息
- ⏰ 定时任务和自动化脚本开发
- 📅 项目时间线更新和里程碑记录
- 🔄 版本管理和发布记录
- 📋 文档创建和修改时间标记

## 🛠️ 获取时间的方法

### 1. Windows终端命令（推荐）
```bash
# 基本日期时间（中文格式）
date

# PowerShell获取时间
Get-Date

# 自定义格式
Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Get-Date -Format "yyyy年MM月dd日 HH:mm:ss"
Get-Date -Format "yyyyMMdd-HHmmss"
```

### 2. JavaScript/Node.js
```javascript
// 基本时间对象
new Date()

// 中文本地化时间
new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})

// ISO标准格式
new Date().toISOString()

// 自定义格式
new Date().toLocaleDateString('zh-CN')
new Date().toLocaleTimeString('zh-CN')
```

### 3. Python
```python
from datetime import datetime

# 当前时间
datetime.now()

# 格式化时间
datetime.now().strftime('%Y-%m-%d %H:%M:%S')
datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')
```

## 📝 全局使用规范

### 时间格式标准
- **标准格式**: `YYYY-MM-DD HH:mm:ss`
- **中文格式**: `YYYY年MM月DD日 HH:mm:ss`
- **ISO格式**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **文件命名**: `YYYY-MM-DD_HH-mm-ss`
- **版本标记**: `YYYYMMDD-HHmmss`

### 时区处理原则
- **默认时区**: 中国标准时间 (Asia/Shanghai)
- **UTC时间**: 需要时明确标注UTC
- **本地时间**: 优先使用本地时间
- **跨时区项目**: 明确标注时区信息

## 🔧 实际应用示例

### Git操作时间戳
```bash
# 提交信息包含时间
git commit -m "更新: $(date '+%Y-%m-%d %H:%M:%S')"

# 创建带时间戳的标签
git tag "release-$(date +%Y%m%d-%H%M%S)"
```

### 日志记录
```javascript
// 控制台日志时间戳
console.log(`[${new Date().toLocaleString('zh-CN')}] 操作完成`);

// 文件日志时间戳
const logEntry = `${new Date().toISOString()} - 用户操作记录`;
```

### 文件操作
```bash
# 创建带时间戳的备份
cp important-file.txt "backup-$(date +%Y%m%d-%H%M%S).txt"

# 创建带时间戳的目录
mkdir "archive-$(date +%Y%m%d)"
```

### 版本管理
```javascript
// 版本信息包含时间
const versionInfo = {
  version: "v2.0.7-stable",
  timestamp: new Date().toISOString(),
  buildTime: new Date().toLocaleString('zh-CN'),
  timezone: "Asia/Shanghai"
};
```

## 📋 全局最佳实践

### 1. 一致性原则
- 在同一会话中保持时间格式一致
- 优先使用标准格式便于排序和比较
- 团队协作时统一时间格式标准

### 2. 可读性原则
- 用户界面使用中文格式
- 技术文档使用标准格式
- 日志文件使用ISO格式
- 文件名使用下划线分隔格式

### 3. 时区原则
- 明确标注时区信息
- 跨时区项目使用UTC时间
- 本地项目使用本地时间
- 文档中说明时区设置

### 4. 自动化原则
- 优先使用脚本自动生成时间戳
- 避免手动输入时间信息
- 使用环境变量设置时区
- 集成到CI/CD流程中

## 🚀 自动化集成

### 环境变量设置
```bash
# 设置时区环境变量
export TZ=Asia/Shanghai

# 设置时间格式环境变量
export TIMESTAMP_FORMAT="%Y-%m-%d %H:%M:%S"
```

### 脚本模板
```bash
#!/bin/bash
# 获取当前时间戳
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "操作时间: $TIMESTAMP"
```

### 代码模板
```javascript
// 时间工具函数
function getCurrentTimestamp() {
  return new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
```

## 🔄 更新和维护

### 规则更新
- 定期检查时间格式标准
- 根据项目需求调整格式
- 保持与系统时间同步
- 记录规则变更历史

### 工具更新
- 关注系统时间工具更新
- 更新编程语言时间API
- 测试新的时间格式
- 验证时区处理准确性

## 📚 相关资源
- [MDN Date文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Python datetime文档](https://docs.python.org/3/library/datetime.html)
- [PowerShell Get-Date文档](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-date)

## 🔄 更新记录
- **创建时间**: 2025年9月27日 9:15:00
- **创建目的**: 定义Cursor环境中的全局时间获取规则
- **适用范围**: 所有Cursor开发项目和场景
- **维护责任**: 全局规则维护

---
*本文档作为Cursor全局规则，适用于所有开发场景*
