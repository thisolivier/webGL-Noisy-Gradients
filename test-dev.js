import { spawn } from 'child_process';
import { request } from 'http';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const proc = spawn('node', ['dev.js']);
  proc.stdout.setEncoding('utf8');
  await new Promise((resolve, reject) => {
    proc.stdout.on('data', d => {
      process.stdout.write(d);
      if (d.includes('Dev server running')) resolve();
    });
    proc.on('error', reject);
  });

  const html = await fetchText('http://localhost:8080/index.html');
  const js = await fetchText('http://localhost:8080/dist/bundle.js');

  try {
    new Function(js);
    console.log('Bundle parsed successfully');
  } catch (e) {
    console.error('JS parse error', e);
    process.exitCode = 1;
  }

  proc.kill();
}

main();

