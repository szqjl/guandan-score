const fs = require('fs');

// 中文标点符号映射
const punctuationMap = {
  '，': ',',
  '。': '.',
  '；': ';',
  '：': ':',
  '！': '!',
  '？': '?',
  '、': ',',
  '（': '(',
  '）': ')',
  '"': '"',
  '"': '"',
  ''
  ': "'
  ",
  ''
  ': "'
  "
};

function fixEncoding(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 替换中文标点符号
    for (const [chinese, english] of Object.entries(punctuationMap)) {
      if (content.includes(chinese)) {
        content = content.replace(new RegExp(chinese, 'g'), english);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复文件: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  文件无需修复: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复文件失败: ${filePath}`, error.message);
    return false;
  }
}

// 修复主要文件
const filesToFix = [
  'pages/index/index.js',
  'pages/index/index.wxml',
  'pages/index/index.wxss',
  'app.js'
];

console.log('🔧 开始修复编码问题...\n');

let totalFixed = 0;
filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    if (fixEncoding(file)) {
      totalFixed++;
    }
  } else {
    console.log(`⚠️  文件不存在: ${file}`);
  }
});

console.log(`\n🎉 修复完成！共修复了 ${totalFixed} 个文件`);
console.log('📝 建议：重新启动开发服务器测试');