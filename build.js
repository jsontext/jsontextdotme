const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const distSkyboxDir = path.join(distDir, 'skybox');
const rootSkyboxDir = path.join(__dirname, 'skybox');

[distDir, distSkyboxDir, rootSkyboxDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Copy root/main page
if (fs.existsSync(path.join(__dirname, 'jsontext.me.html'))) {
  fs.copyFileSync(path.join(__dirname, 'jsontext.me.html'), path.join(__dirname, 'index.html'));
  fs.copyFileSync(path.join(__dirname, 'jsontext.me.html'), path.join(distDir, 'index.html'));
}

// Copy skybox page
if (fs.existsSync(path.join(__dirname, 'jsontext.me-skybox.html'))) {
  fs.copyFileSync(path.join(__dirname, 'jsontext.me-skybox.html'), path.join(__dirname, 'skybox.html'));
  fs.copyFileSync(path.join(__dirname, 'jsontext.me-skybox.html'), path.join(rootSkyboxDir, 'index.html'));
  fs.copyFileSync(path.join(__dirname, 'jsontext.me-skybox.html'), path.join(distDir, 'skybox.html'));
  fs.copyFileSync(path.join(__dirname, 'jsontext.me-skybox.html'), path.join(distSkyboxDir, 'index.html'));
}

console.log('Build complete: All HTML files and dist directories synced successfully.');