const { spawn } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');
const nextBin = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('🚀 Launching Next.js development server safely with direct Node injection...');
console.log(`📂 Frontend Dir: ${frontendDir}`);
console.log(`📂 Next Binary: ${nextBin}`);

// Running Node.exe directly with the Next.js script path is 100% shell-free and immune to path splitting bugs!
const devProcess = spawn('node', [nextBin, 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit'
});

devProcess.on('error', (err) => {
  console.error('❌ Failed to start Next.js dev server:', err);
});

devProcess.on('exit', (code) => {
  console.log(`🏁 Dev server process exited with code: ${code}`);
});
