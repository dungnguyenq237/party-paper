import { buildPublicArtifact } from './public-artifact.mjs';

const output = buildPublicArtifact();
console.log('[build:static] Verified public artifact:', output);
