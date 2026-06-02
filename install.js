const { execSync } = require('child_process');
const fs = require('fs');

console.log('--- ILANX CPANEL AUTO INSTALLER STARTING ---');

try {
  console.log('[1/4] Running NPM Install...');
  // --no-audit --no-fund makes it faster and uses less RAM
  execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });
  console.log('✅ NPM Install Completed');

  console.log('[2/4] Pushing Prisma Database Schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database Schema Pushed');
  
  console.log('[3/4] Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client Generated');

  console.log('[4/4] Building Next.js App for Production...');
  // Force memory limit for node to prevent cPanel OOM kills
  execSync('npx --node-options="--max-old-space-size=1024" next build', { stdio: 'inherit' });
  console.log('✅ Next.js Build Completed');

  console.log('--- ILANX CPANEL AUTO INSTALLER FINISHED ---');
  console.log('SUCCESS: You can now change your Startup file back to server.js and Restart!');

  // Prevent immediate crash of the Node app so we can see logs
  setInterval(() => {
    console.log('Install script is holding the process. Change startup file to server.js and restart.');
  }, 10000);

} catch (error) {
  console.error('❌ INSTALLATION FAILED:', error.message);
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  process.exit(1);
}
