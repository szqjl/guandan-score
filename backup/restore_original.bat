@echo off
echo 🔄 开始恢复原始代码...
echo.

echo 恢复主页面文件...
copy "index_original.js" "..\pages\index\index.js"

echo 恢复历史页面文件...
copy "history_original.js" "..\pages\history\index.js"

echo 恢复应用文件...
copy "app_original.js" "..\app.js"
copy "app_original.json" "..\app.json"

echo 恢复配置文件...
copy "project_config_original.json" "..\project.config.json"
copy "package_original.json" "..\package.json"

echo.
echo ✅ 原始代码恢复完成！
echo 📁 已删除重构后的模块文件...
echo.

echo 删除 utils 目录...
if exist "..\utils" rmdir /s /q "..\utils"

echo 删除 data 目录...
if exist "..\data" rmdir /s /q "..\data"

echo 删除重构后的文件...
if exist "..\pages\index\index_refactored.js" del "..\pages\index\index_refactored.js"

echo.
echo 🎉 回滚完成！项目已恢复到原始状态。
echo.
pause
