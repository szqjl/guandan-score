# Memory工具数据迁移方案 - context.db文件复制

## 📋 概述

通过直接复制 `context.db` 文件实现Memory工具数据的完整迁移，这是最可靠和高效的方案。

## 🎯 方案优势

### ✅ 完整性保证
- **完整数据迁移** - 包含所有实体、关系和观察记录
- **保持数据结构** - 无需重建知识图谱
- **零数据丢失** - 100%保留原有信息
- **快速迁移** - 几分钟内完成

### ✅ 操作简单
- **单文件操作** - 只需复制一个文件
- **无需重建** - 不需要重新创建实体
- **即时生效** - 复制后立即可用
- **验证简单** - 容易检查迁移结果

## 🛠️ 详细操作步骤

### 步骤1: 定位源文件

#### Windows系统
```bash
# 当前电脑的文件位置
C:\Users\{用户名}\mcp-data\memory-keeper\context.db

# 示例路径
C:\Users\admin\mcp-data\memory-keeper\context.db
```

#### macOS系统
```bash
# 当前电脑的文件位置
/Users/{用户名}/mcp-data/memory-keeper/context.db

# 示例路径
/Users/admin/mcp-data/memory-keeper/context.db
```

#### Linux系统
```bash
# 当前电脑的文件位置
/home/{用户名}/mcp-data/memory-keeper/context.db

# 示例路径
/home/admin/mcp-data/memory-keeper/context.db
```

### 步骤2: 复制文件

#### 方法1: 手动复制
1. **找到源文件** - 在源电脑上找到 `context.db`
2. **复制文件** - 使用文件管理器复制
3. **传输到新电脑** - 通过U盘、网络等方式传输
4. **放置到目标位置** - 放到新电脑的对应路径

#### 方法2: 命令行复制
```bash
# 在源电脑上
cp /path/to/source/context.db /path/to/destination/

# 示例
cp /c/Users/admin/mcp-data/memory-keeper/context.db /media/usb/
```

#### 方法3: 网络传输
```bash
# 使用scp传输
scp /path/to/context.db user@newcomputer:/path/to/destination/

# 使用rsync同步
rsync -av /path/to/context.db user@newcomputer:/path/to/destination/
```

### 步骤3: 新电脑配置

#### 3.1 安装Memory工具
```bash
# 安装官方Memory工具
npm install -g @modelcontextprotocol/server-memory
```

#### 3.2 配置MCP
在 `~/.cursor/mcp.json` 中添加：
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

#### 3.3 创建目录结构
```bash
# 创建必要的目录
mkdir -p ~/mcp-data/memory-keeper/

# Windows
mkdir -p C:\Users\{用户名}\mcp-data\memory-keeper\
```

#### 3.4 放置数据库文件
```bash
# 将复制的context.db放到正确位置
cp /path/to/copied/context.db ~/mcp-data/memory-keeper/

# Windows
copy C:\path\to\copied\context.db C:\Users\{用户名}\mcp-data\memory-keeper\
```

### 步骤4: 验证迁移

#### 4.1 重启Cursor IDE
1. 完全关闭Cursor IDE
2. 重新启动Cursor IDE
3. 等待MCP连接建立

#### 4.2 测试Memory功能
```json
{
  "method": "tools/call",
  "params": {
    "name": "read_graph",
    "arguments": {}
  }
}
```

#### 4.3 验证数据完整性
- 检查实体数量是否正确
- 验证关系是否完整
- 确认观察记录是否保留

## 📊 当前数据概览

### 实体统计
- **总实体数**: 8个
- **实体类型**: 团队、项目、AI助手、开发项目、技术问题、文档、管理策略、迁移方案

### 关系统计
- **总关系数**: 6个
- **关系类型**: 开发、协助、技术支持、创建、协助编写

### 数据大小
- **文件大小**: 450,560 字节 (约440KB)
- **数据库类型**: SQLite 3.x
- **最后更新**: 2025年09月28日

## 🔍 验证脚本

### 完整验证脚本
```bash
#!/bin/bash
# verify_migration.sh

echo "开始验证Memory工具迁移..."

# 检查文件是否存在
if [ -f "~/mcp-data/memory-keeper/context.db" ]; then
    echo "✅ 数据库文件存在"
    echo "文件大小: $(du -h ~/mcp-data/memory-keeper/context.db | cut -f1)"
else
    echo "❌ 数据库文件不存在"
    exit 1
fi

# 检查文件权限
if [ -r "~/mcp-data/memory-keeper/context.db" ]; then
    echo "✅ 文件可读"
else
    echo "❌ 文件不可读"
    exit 1
fi

# 测试Memory工具连接
echo "测试Memory工具连接..."
RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "read_graph", "arguments": {}}}' | npx -y @modelcontextprotocol/server-memory 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Memory工具连接正常"
    echo "数据内容: $RESULT"
else
    echo "❌ Memory工具连接失败"
    exit 1
fi

echo "迁移验证完成！"
```

## 🚨 注意事项

### ⚠️ 重要提醒
1. **路径一致性** - 确保目标路径与源路径结构一致
2. **权限设置** - 确保文件有正确的读写权限
3. **备份原文件** - 迁移前备份原文件
4. **测试验证** - 迁移后必须验证数据完整性

### 🔒 安全考虑
1. **文件完整性** - 确保传输过程中文件未损坏
2. **权限管理** - 设置适当的文件权限
3. **备份策略** - 保留原文件作为备份

## 📞 故障排除

### 常见问题
1. **文件不存在** - 检查路径是否正确
2. **权限错误** - 检查文件权限设置
3. **连接失败** - 重启Cursor IDE
4. **数据不完整** - 重新复制文件

### 解决方案
1. **重新复制** - 如果数据不完整，重新复制文件
2. **检查配置** - 验证MCP配置是否正确
3. **重启服务** - 重启Cursor IDE和MCP服务

## 🎯 最佳实践

### 迁移前
1. **备份原文件** - 保留原文件作为备份
2. **记录路径** - 记录源文件和目标文件路径
3. **检查环境** - 确保新电脑环境正确

### 迁移后
1. **立即验证** - 迁移后立即验证数据
2. **测试功能** - 测试所有Memory工具功能
3. **更新文档** - 更新相关配置文档

---

**最后更新**: 2025年09月28日  
**负责人**: 掼蛋计分开发团队  
**版本**: v2.1.0  
**状态**: 用户确认方案



