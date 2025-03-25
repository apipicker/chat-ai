// build.js
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const packageJson = require('./package.json');

const version = packageJson.version;
const distDir = `dist/${version}`;

// ساخت دایرکتوری نسخه
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// افزودن کامنت نسخه
const banner = `/*! Chat Widget v${version} | MIT License */\n`;

// پردازش JavaScript
const jsCode = fs.readFileSync('src/chat-ai.js', 'utf8');
const jsResult = UglifyJS.minify(jsCode, {
  output: {
    preamble: banner
  }
});

fs.writeFileSync(`${distDir}/chat-ai.min.js`, jsResult.code);

// پردازش CSS
const cssInput = fs.readFileSync('src/chat-ai-style.css', 'utf8');
const cssResult = new CleanCSS({}).minify(cssInput);
fs.writeFileSync(`${distDir}/chat-ai-style.min.css`, banner + cssResult.styles);

// آپدیت latest symlink
try {
  fs.unlinkSync('dist/latest');
} catch (err) {}
fs.symlinkSync(version, 'dist/latest');