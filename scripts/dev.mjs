import { execSync, spawn } from 'node:child_process';
import { rmSync } from 'node:fs';

function killPort(port) {
  if (process.platform !== 'win32') return;

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && pid !== '0') pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      } catch {
        // Process may already be gone.
      }
    }
  } catch {
    // No process on this port.
  }
}

killPort(3000);
killPort(3001);
rmSync('.next', { recursive: true, force: true });

console.log('Nettoyage terminé. Démarrage sur http://localhost:3000 ...\n');

const child = spawn('npx', ['next', 'dev', '--webpack', '-p', '3000'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
