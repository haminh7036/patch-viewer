import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'output');
const HOST = '127.0.0.1';
const PORT = 5173;
const URL = `http://${HOST}:${PORT}/?runTest=1`;

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function waitForPort(port, host, timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function tryConnect() {
      const s = net.createConnection(port, host);
      s.on('connect', () => {
        s.destroy();
        resolve(true);
      });
      s.on('error', () => {
        s.destroy();
        if (Date.now() - start > timeout) return reject(new Error('timeout'));
        setTimeout(tryConnect, 200);
      });
    })();
  });
}

async function run() {
  ensureOutputDir();
  let startedServer = false;
  let dev;

  try {
    // Check if port is already listening
    try {
      await waitForPort(PORT, HOST, 500);
      console.log('Dev server already running');
    } catch (e) {
      console.log('Starting dev server...');
      startedServer = true;
      dev = spawn('npm', ['run', 'dev', '--', '--host'], { stdio: 'inherit' });
    }

    // Wait for server to be ready
    await waitForPort(PORT, HOST, 20000);
    console.log('Dev server is ready — running Playwright screenshot');

    const outPng = path.join(OUTPUT_DIR, 'mobile-test.png');
    const cmd = `npx playwright screenshot "${URL}" "${outPng}" --device "iPhone 13" --timeout 30000`;

    await new Promise((res, rej) => {
      exec(cmd, { env: process.env }, (err, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        if (err) return rej(err);
        res();
      });
    });

    const result = { url: URL, screenshot: 'mobile-test.png', timestamp: new Date().toISOString() };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'result.json'), JSON.stringify(result, null, 2));
    console.log('Test complete. Outputs written to', OUTPUT_DIR);
  } catch (err) {
    console.error('Test failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    if (startedServer && dev) {
      try {
        dev.kill();
        console.log('Stopped dev server');
      } catch (e) {
        // ignore
      }
    }
  }
}

run();
