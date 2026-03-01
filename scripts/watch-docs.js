#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const colors = {
  demos: '\x1b[36m',
  vitepress: '\x1b[35m',
  reset: '\x1b[0m',
};

function log(prefix, message) {
  const color = colors[prefix] || colors.reset;
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

const demosWatch = spawn('pnpm', ['demos:watch'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

const vitepressDev = spawn('vitepress', ['dev', 'projects/docs'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  log('watch-docs', 'Shutting down...');
  demosWatch.kill();
  vitepressDev.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

demosWatch.on('error', err => {
  log('demos', `Error: ${err.message}`);
});

vitepressDev.on('error', err => {
  log('vitepress', `Error: ${err.message}`);
});

log('watch-docs', 'Starting watch mode for docs development...');
log('watch-docs', 'Press Ctrl+C to stop');
