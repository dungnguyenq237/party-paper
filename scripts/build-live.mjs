import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { repositoryRoot, verifyPublicArtifact } from './public-artifact.mjs';

const compiler = join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const output = join(repositoryRoot, '.build');
rmSync(output, { recursive: true, force: true });
try {
  for (const config of ['tsconfig.client.json', 'tsconfig.server.json']) {
    const result = spawnSync(process.execPath, [compiler, '-p', config], { cwd: repositoryRoot, stdio: 'inherit' });
    if (result.error || result.status !== 0) throw result.error ?? new Error('TypeScript build failed: ' + config);
  }
  verifyPublicArtifact();
} catch (error) {
  rmSync(output, { recursive: true, force: true });
  throw error;
}
console.log('[build:live] Client/server compilation isolated outside dist; live routes disabled.');
