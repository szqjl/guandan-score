const fs = require('fs');

// Chinese punctuation mapping
const punctuationMap = {
  '\uFF0C': ',',  // Chinese comma
  '\u3002': '.',  // Chinese period
  '\uFF1B': ';',  // Chinese semicolon
  '\uFF1A': ':',  // Chinese colon
  '\uFF01': '!',  // Chinese exclamation
  '\uFF1F': '?',  // Chinese question
  '\u3001': ',',  // Chinese enumeration comma
  '\uFF08': '(',  // Chinese left parenthesis
  '\uFF09': ')',  // Chinese right parenthesis
  '\u201C': '"',  // Left double quotation mark
  '\u201D': '"',  // Right double quotation mark
  '\u2018': "'",  // Left single quotation mark
  '\u2019': "'"   // Right single quotation mark
};

function fixEncoding(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace Chinese punctuation
    for (const [chinese, english] of Object.entries(punctuationMap)) {
      if (content.includes(chinese)) {
        content = content.replace(new RegExp(chinese, 'g'), english);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed file: ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Failed to fix file: ${filePath}`, error.message);
    return false;
  }
}

// Files to fix
const filesToFix = [
  'pages/index/index.js',
  'pages/index/index.wxml',
  'pages/index/index.wxss',
  'app.js'
];

console.log('Starting encoding fix...\n');

let totalFixed = 0;
filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    if (fixEncoding(file)) {
      totalFixed++;
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log(`\nFix completed! Fixed ${totalFixed} files`);
console.log('Please restart the development server to test');
