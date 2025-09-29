# Memory迁移方法

## 📋 **概述**
本文档说明如何在不同电脑间迁移Memory知识图谱数据。

## 📁 **文件位置**
Memory数据文件位置：
```
Windows: C:\Users\[用户名]\mcp-data\memory-keeper\context.db
macOS: ~/mcp-data/memory-keeper/context.db
Linux: ~/mcp-data/memory-keeper/context.db
```

**注意**：实际位置可能在 `mcp-data/memory-keeper/` 目录下，而不是 `.cursor/` 目录。

## 🔄 **迁移步骤**

### **方法1：直接复制文件**
1. **源电脑**：
   - 找到 `context.db` 文件
   - 复制到U盘或云盘

2. **目标电脑**：
   - 安装Cursor IDE
   - 将 `context.db` 文件复制到对应位置
   - 重启Cursor IDE

### **方法2：通过Cursor设置**
1. **导出**：
   - 打开Cursor IDE
   - 设置 → Memory → 导出数据
   - 保存为 `memory_backup.json`

2. **导入**：
   - 在新电脑安装Cursor IDE
   - 设置 → Memory → 导入数据
   - 选择 `memory_backup.json` 文件

## ⚠️ **注意事项**
- 确保Cursor IDE版本兼容
- 迁移前备份原有数据
- 重启IDE后数据生效

## 🔍 **验证迁移**
迁移完成后，可以通过以下方式验证：
- 询问AI关于项目的问题
- 检查是否保留之前的对话记忆
- 确认知识图谱数据完整

## 📞 **问题解决**
如果迁移失败：
1. 检查文件路径是否正确
2. 确认Cursor IDE版本
3. 重新启动IDE
4. 联系技术支持

---
**创建时间**：2025年1月  
**适用版本**：Cursor IDE 最新版本
