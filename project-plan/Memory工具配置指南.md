# Memory工具配置指南

## 📋 概述

本指南详细说明如何在新电脑上配置Memory工具，实现知识图谱的迁移和同步。

## 🎯 目标

- 在新电脑上快速配置Memory工具
- 重建掼蛋项目的知识图谱
- 确保开发环境的一致性

## 🛠️ 配置步骤

### 步骤1: 安装Node.js环境

确保新电脑已安装Node.js (推荐版本 16+)

```bash
# 检查Node.js版本
node --version
npm --version
```

### 步骤2: 安装Memory工具

```bash
# 全局安装官方Memory工具
npm install -g @modelcontextprotocol/server-memory

# 验证安装
npx -y @modelcontextprotocol/server-memory --help
```

### 步骤3: 配置Cursor MCP

在 `~/.cursor/mcp.json` 文件中添加Memory配置：

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

**Windows路径**: `C:\Users\{用户名}\.cursor\mcp.json`
**macOS路径**: `~/.cursor/mcp.json`
**Linux路径**: `~/.cursor/mcp.json`

### 步骤4: 重启Cursor IDE

1. 完全关闭Cursor IDE
2. 重新启动Cursor IDE
3. 验证MCP连接状态

### 步骤5: 重建知识图谱

使用以下命令重建掼蛋项目的知识图谱：

#### 5.1 创建核心实体

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_entities",
    "arguments": {
      "entities": [
        {
          "name": "掼蛋计分开发团队",
          "entityType": "团队",
          "observations": [
            "负责掼蛋小程序开发",
            "使用Cursor IDE",
            "配置MCP工具"
          ]
        },
        {
          "name": "掼蛋小程序",
          "entityType": "项目",
          "observations": [
            "微信小程序",
            "计分功能",
            "多人实时对战",
            "v2.1.0版本"
          ]
        },
        {
          "name": "Maius",
          "entityType": "AI助手",
          "observations": [
            "Cursor IDE助手",
            "帮助开发掼蛋小程序",
            "配置MCP工具",
            "提供技术支持"
          ]
        }
      ]
    }
  }
}
```

#### 5.2 创建关系

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_relations",
    "arguments": {
      "relations": [
        {
          "from": "掼蛋计分开发团队",
          "to": "掼蛋小程序",
          "relationType": "开发"
        },
        {
          "from": "Maius",
          "to": "掼蛋计分开发团队",
          "relationType": "协助"
        },
        {
          "from": "掼蛋小程序",
          "to": "Maius",
          "relationType": "技术支持"
        }
      ]
    }
  }
}
```

## 🔍 验证配置

### 测试Memory工具功能

1. **搜索测试**
```json
{
  "method": "tools/call",
  "params": {
    "name": "search_nodes",
    "arguments": {
      "query": "掼蛋"
    }
  }
}
```

2. **读取图谱**
```json
{
  "method": "tools/call",
  "params": {
    "name": "read_graph",
    "arguments": {}
  }
}
```

## 📊 完整知识图谱数据

### 当前实体列表

1. **掼蛋计分开发团队** (团队)
   - 负责掼蛋小程序开发
   - 使用Cursor IDE
   - 配置MCP工具

2. **掼蛋小程序** (项目)
   - 微信小程序
   - 计分功能
   - 多人实时对战
   - v2.1.0版本

3. **Maius** (AI助手)
   - Cursor IDE助手
   - 帮助开发掼蛋小程序
   - 配置MCP工具
   - 提供技术支持

4. **Maius AI助手** (AI助手)
   - Cursor IDE的AI编程助手
   - 帮助掼蛋小程序开发
   - 配置MCP工具
   - 提供技术支持和代码建议
   - 能够直接调用Memory工具

5. **掼蛋项目开发** (开发项目)
   - 微信小程序项目
   - 实时计分功能
   - 多人对战模式
   - 当前版本v2.1.0
   - 使用MCP工具进行知识管理

6. **Memory工具多设备配置** (技术问题)
   - Memory工具是本地存储
   - 每台电脑需要独立配置
   - 知识图谱不会自动同步
   - 需要手动迁移或重新配置
   - 用户确认配置方案很好
   - 需要为新电脑准备配置指南
   - Maius可以提供技术支持

### 当前关系列表

1. 掼蛋计分开发团队 → 掼蛋小程序 (开发)
2. Maius → 掼蛋计分开发团队 (协助)
3. 掼蛋小程序 → Maius (技术支持)
4. Maius AI助手 → 掼蛋项目开发 (协助开发)
5. 掼蛋项目开发 → Maius AI助手 (技术支持对象)

## 🚨 常见问题

### Q1: Memory工具无法启动
**解决方案**:
- 检查Node.js版本是否兼容
- 重新安装Memory工具
- 检查网络连接

### Q2: Cursor无法连接MCP
**解决方案**:
- 检查mcp.json文件格式
- 重启Cursor IDE
- 查看Cursor日志

### Q3: 知识图谱为空
**解决方案**:
- 按照步骤5重建知识图谱
- 检查MCP连接状态
- 验证工具调用权限

## 📝 维护建议

1. **定期备份**: 导出知识图谱数据
2. **版本同步**: 保持所有电脑的配置一致
3. **文档更新**: 及时更新项目相关信息
4. **测试验证**: 定期测试Memory工具功能

## 📞 技术支持

如遇到问题，可以：
1. 查看Cursor IDE日志
2. 检查MCP服务器状态
3. 联系Maius获取技术支持

---

**最后更新**: 2025年09月28日  
**负责人**: 掼蛋计分开发团队  
**版本**: v2.1.0



