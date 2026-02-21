const cp = require('child_process');
try {
  cp.execSync('npx tsc --noEmit --pretty false', { encoding: 'utf8', stdio: 'pipe' });
  console.log('No errors found');
} catch (e) {
  const stdout = e.stdout || '';
  const lines = stdout.split('\n').filter(l => l.includes('CreateBlogForm'));
  lines.forEach(l => console.log(l));
  console.log('Found: ' + lines.length + ' errors');
}
