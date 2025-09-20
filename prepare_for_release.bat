@echo off
echo 🚀 准备小程序发布...
echo.

echo 📁 创建发布专用目录...
mkdir release 2>nul

echo 📋 复制核心文件到发布目录...
xcopy "pages" "release\pages\" /E /I /Y
xcopy "utils" "release\utils\" /E /I /Y
xcopy "data" "release\data\" /E /I /Y
xcopy "images" "release\images\" /E /I /Y
copy "app.js" "release\app.js"
copy "app.json" "release\app.json"
copy "project.config.json" "release\project.config.json"
copy "package.json" "release\package.json"
copy "package-lock.json" "release\package-lock.json"
copy "sitemap.json" "release\sitemap.json"

echo 📄 复制文档文件...
copy "*.md" "release\" 2>nul

echo 🧹 清理发布目录中的备份文件...
if exist "release\backup" rmdir /s /q "release\backup"
if exist "release\pages\index\index_refactored.js" del "release\pages\index\index_refactored.js"

echo.
echo ✅ 发布准备完成！
echo 📁 发布文件位于: release\ 目录
echo 🚫 备份文件已排除，不会发布到线上
echo.
echo 📋 发布文件清单:
dir /s /b release | findstr /v backup
echo.
pause
