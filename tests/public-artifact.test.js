import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, cpSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { publicFiles, assetFiles, buildPublicArtifact, verifyPublicArtifact, listFiles, repositoryRoot } from '../scripts/public-artifact.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'party-public-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const file of publicFiles) {
    const dest = join(root, file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(join(repositoryRoot, file)));
  }
  return root;
}

test('static build emits only public files and removes stale output', t => {
  const root = fixture(t);
  mkdirSync(join(root, 'dist'));
  writeFileSync(join(root, 'dist', 'stale-secret.txt'), 'private');
  mkdirSync(join(root, 'src'));
  writeFileSync(join(root, 'src', 'secret.ts'), 'private');
  const out = buildPublicArtifact({ root });
  verifyPublicArtifact(root, out);
  assert.equal(existsSync(join(out, 'stale-secret.txt')), false);
  assert.equal(existsSync(join(out, 'src')), false);
  assert.equal(assetFiles.filter(x => x.startsWith('assets/i18n/')).length, 38);
  assert.equal(listFiles(out).length, publicFiles.length + 1);
});

test('legacy Render copy produces the identical allowlisted artifact', t => {
  const root = fixture(t);
  const out = buildPublicArtifact({ root, seoOnly: true });
  assert.equal(existsSync(join(out, 'assets')), false);
  for (const file of ['index.html', 'styles.css', 'app.js', 'core.js']) cpSync(join(root, file), join(out, file));
  cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
  verifyPublicArtifact(root, out);
});

test('unexpected assets and symlinks fail closed', t => {
  const root = fixture(t);
  const secret = join(root, 'secret.txt');
  writeFileSync(secret, 'private');
  const unexpected = join(root, 'assets', 'secret.txt');
  writeFileSync(unexpected, 'private');
  assert.throws(() => buildPublicArtifact({ root }), /allowlist/);
  rmSync(unexpected);
  symlinkSync(secret, unexpected);
  assert.throws(() => buildPublicArtifact({ root }), /Unexpected artifact entry/);
});

test('artifact verifier rejects unexpected or modified output', t => {
  const root = fixture(t);
  const out = buildPublicArtifact({ root });
  writeFileSync(join(out, 'index.html'), 'modified');
  assert.throws(() => verifyPublicArtifact(root, out), /differs/);
  buildPublicArtifact({ root });
  writeFileSync(join(out, 'secret.txt'), 'private');
  assert.throws(() => verifyPublicArtifact(root, out), /mismatch/);
});

test('disabled ads remain disabled; missing publisher omits ads.txt', t => {
  const root = fixture(t);
  const configPath = join(root, 'assets/ads-config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  config.publisherId = '';
  writeFileSync(configPath, JSON.stringify(config));
  const out = buildPublicArtifact({ root });
  assert.equal(existsSync(join(out, 'ads.txt')), false);
  config.enabled = true;
  writeFileSync(configPath, JSON.stringify(config));
  assert.throws(() => buildPublicArtifact({ root }), /Ads activation/);
});
