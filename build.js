const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const skyboxDir = path.join(distDir, 'skybox');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(skyboxDir)) {
  fs.mkdirSync(skyboxDir, { recursive: true });
}

fs.copyFileSync(path.join(__dirname, 'jsontext.me.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'jsontext.me-skybox.html'), path.join(distDir, 'skybox.html'));
fs.copyFileSync(path.join(__dirname, 'jsontext.me-skybox.html'), path.join(skyboxDir, 'index.html'));

console.log('Build completed: dist directory created.');