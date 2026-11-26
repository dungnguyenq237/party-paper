import { copyFileSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { languages } from '../assets/languages.js';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const seoFiles = Object.freeze(['robots.txt', 'sitemap.xml', 'about.html', 'privacy.html', 'contact.html', 'guide.html', 'games.html', 'charades.html', 'drawing.html', 'scavenger.html', 'conversation.html', 'trivia.html', 'scramble.html']);
const printFiles = ['index.html', 'styles.css', 'app.js', 'core.js'];
const assetNames = ['FONT-LICENSE.txt', 'OFL.txt', 'ads-config.json', 'ads.js', 'experience.js', 'favicon.svg', 'game-engine.js', 'games.js', 'i18n.js', 'interface.css', 'languages.js', 'party.woff', 'theme.js'];
export const assetFiles = Object.freeze([...assetNames.map(name => 'assets/' + name), ...languages.map(({code}) => {
  if (!/^[a-z]{2,3}$/.test(code)) throw new Error('Unsafe locale code: ' + code);
  return 'assets/i18n/' + code + '.json';
})].sort());
export const publicFiles = Object.freeze([...seoFiles, ...printFiles, ...assetFiles].sort());

function requireRegularFile(root, relative) {
  let current = root;
  for (const [i, segment] of relative.split('/').entries()) {
    current = join(current, segment);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || (i === relative.split('/').length - 1 ? !stat.isFile() : !stat.isDirectory())) {
      throw new Error('Unexpected file type: ' + relative);
    }
  }
  return current;
}

// Never follow symlinks, including directory symlinks.
export function listFiles(root) {
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()) throw new Error('Not a regular directory: ' + root);
  const result = [];
  function walk(dir, prefix = '') {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full, relative + '/');
      else if (entry.isFile()) result.push(relative);
      else throw new Error('Unexpected artifact entry: ' + relative);
    }
  }
  walk(root);
  return result.sort();
}

function assertExact(actual, expected, label) {
  const allow = new Set(expected);
  const found = new Set(actual);
  const extra = actual.filter(file => !allow.has(file));
  const missing = expected.filter(file => !found.has(file));
  if (extra.length || missing.length) throw new Error(label + ' mismatch: extra=[' + extra.join(', ') + '], missing=[' + missing.join(', ') + ']');
}

export function readAdConfig(root = repositoryRoot) {
  const config = JSON.parse(readFileSync(requireRegularFile(root, 'assets/ads-config.json'), 'utf8'));
  if (config.publisherId && !/^ca-pub-[0-9]{16}$/.test(config.publisherId)) throw new Error('Invalid publisher ID');
  if (config.enabled !== false) throw new Error('Ads activation requires a reviewed CMP integration; keep enabled=false until implemented.');
  return config;
}

export function assertLegacyAssetBoundary(root = repositoryRoot) {
  const actual = listFiles(join(root, 'assets')).map(file => 'assets/' + file);
  assertExact(actual, assetFiles, 'Legacy assets allowlist');
}

export function expectedPublicFiles(root = repositoryRoot) {
  return [...publicFiles, ...(readAdConfig(root).publisherId ? ['ads.txt'] : [])].sort();
}

export function verifyPublicArtifact(root = repositoryRoot, out = join(root, 'dist')) {
  assertExact(listFiles(out), expectedPublicFiles(root), 'Public artifact');
  for (const relative of publicFiles) {
    const source = requireRegularFile(root, relative);
    const built = requireRegularFile(out, relative);
    if (!readFileSync(source).equals(readFileSync(built))) throw new Error('Public artifact differs from source: ' + relative);
  }
  const config = readAdConfig(root);
  if (config.publisherId) {
    const expected = 'google.com, ' + config.publisherId.slice(3) + ', DIRECT, f08c47fec0942fa0\n';
    if (readFileSync(requireRegularFile(out, 'ads.txt'), 'utf8') !== expected) throw new Error('Unexpected ads.txt content');
  }
}

// The existing Render command runs posttest, then copies the maker and assets.
// Keep that compatibility stage separate: copying assets twice nests assets/assets.
export function buildPublicArtifact({ root = repositoryRoot, seoOnly = false } = {}) {
  const sourceRoot = resolve(root);
  const out = join(sourceRoot, 'dist');
  assertLegacyAssetBoundary(sourceRoot);
  const config = readAdConfig(sourceRoot);
  const selected = seoOnly ? seoFiles : publicFiles;
  // Validate all inputs before removing an existing output.
  for (const relative of publicFiles) requireRegularFile(sourceRoot, relative);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const relative of selected) {
    const destination = join(out, relative);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(requireRegularFile(sourceRoot, relative), destination);
  }
  if (config.publisherId) writeFileSync(join(out, 'ads.txt'), 'google.com, ' + config.publisherId.slice(3) + ', DIRECT, f08c47fec0942fa0\n');
  if (!seoOnly) verifyPublicArtifact(sourceRoot, out);
  return out;
}
