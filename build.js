const fs = require('fs');
const path = require('path');

console.log('--- Starting Production Build for Grievance Management System ---');

const srcDir = path.join(__dirname, 'complaint_system_ui');
const distDir = path.join(__dirname, 'public');

function copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log(`Copying static assets from "${srcDir}" to "${distDir}"...`);
    copyDirRecursive(srcDir, distDir);
    console.log('✅ Static frontend assets prepared successfully in /public');

    // Verify key files exist
    const keyFiles = ['index.html', 'login.html', 'dashboard.html', 'signup.html', 'verify_email.html'];
    for (const file of keyFiles) {
        if (!fs.existsSync(path.join(distDir, file))) {
            throw new Error(`Missing expected frontend entry: ${file}`);
        }
    }
    console.log('✅ Key frontend entry files verified.');

    // Ensure api directory is valid
    const apiFile = path.join(__dirname, 'api', 'index.js');
    if (!fs.existsSync(apiFile)) {
        throw new Error('Missing Vercel serverless entrypoint: api/index.js');
    }
    console.log('✅ Serverless API entrypoint verified.');

    console.log('🎉 Production build completed successfully!');
} catch (err) {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
}

