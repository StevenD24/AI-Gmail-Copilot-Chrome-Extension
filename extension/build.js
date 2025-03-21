const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Copy manifest.json
fs.copyFileSync(
    path.join(__dirname, 'manifest.json'),
    path.join(distDir, 'manifest.json')
);

// Copy content.js
fs.copyFileSync(
    path.join(__dirname, 'content.js'),
    path.join(distDir, 'content.js')
);

// Copy styles.css
fs.copyFileSync(
    path.join(__dirname, 'styles.css'),
    path.join(distDir, 'styles.css')
);

// Create simple SVG icons
const summarizeIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#0078d4"/>
    <path d="M16 24H32" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 32H24" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const draftIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#0078d4"/>
    <path d="M42 30C42 31.0609 41.5786 32.0783 40.8284 32.8284C40.0783 33.5786 39.0609 34 38 34H14L6 42V10C6 8.93913 6.42143 7.92172 7.17157 7.17157C7.92172 6.42143 8.93913 6 10 6H38C39.0609 6 40.0783 6.42143 40.8284 7.17157C41.5786 7.92172 42 8.93913 42 10V30Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Save SVG files directly
fs.writeFileSync(path.join(publicDir, 'summarize-icon.svg'), summarizeIcon);
fs.writeFileSync(path.join(publicDir, 'draft-icon.svg'), draftIcon);

// Copy SVG files to dist
fs.copyFileSync(
    path.join(publicDir, 'summarize-icon.svg'),
    path.join(distDir, 'summarize-icon.svg')
);
fs.copyFileSync(
    path.join(publicDir, 'draft-icon.svg'),
    path.join(distDir, 'draft-icon.svg')
);

console.log('Build completed successfully!'); 