const fs = require('fs');
const path = require('path');

console.log('DEBUG BUILD: cwd=', process.cwd());

function cat(file) {
  try {
    const p = path.resolve(process.cwd(), file);
    const s = fs.readFileSync(p, 'utf8');
    console.log('\n---- ' + file + ' ----\n');
    console.log(s.split('\n').slice(0, 200).join('\n'));
  } catch (e) {
    console.log('Could not read', file, e.message);
  }
}

function ls(dir) {
  try {
    const p = path.resolve(process.cwd(), dir);
    console.log('\nLIST ' + dir + ' :');
    const items = fs.readdirSync(p);
    items.forEach(i => console.log(' -', i));
  } catch (e) {
    console.log('Could not list', dir, e.message);
  }
}

cat('App.tsx');
ls('.');
ls('components');
cat('components/Sidebar.tsx');
cat('components/Sidebar/index.ts');

console.log('\nENV VARS (sample):', { NODE_ENV: process.env.NODE_ENV });
