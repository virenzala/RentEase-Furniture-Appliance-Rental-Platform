const { spawnSync } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');
const nextBin = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('🚀 Running Next.js compilation safely with direct Node injection...');
console.log(`📂 Frontend Dir: ${frontendDir}`);
console.log(`📂 Next Binary: ${nextBin}`);

// Running Node.exe directly with the Next.js script path is 100% shell-free and immune to path splitting bugs!
const result = spawnSync('node', [nextBin, 'build'], {
  cwd: frontendDir,
  stdio: 'inherit'
});

console.log(`🏁 Build process completed with exit code: ${result.status}`);
process.exit(result.status || 0);
